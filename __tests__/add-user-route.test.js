const express = require('express');
const request = require('supertest');

jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => next())
  }));
  multer.diskStorage = jest.fn(() => ({}));
  return multer;
});

jest.mock('../models/users', () => {
  const User = jest.fn(function(data) {
    this.save = User.__saveMock;
    Object.assign(this, data);
  });
  User.__saveMock = jest.fn();
  return User;
});

const User = require('../models/users');
const router = require('../routes/routes');

const createApp = () => {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = {};
    const originalRedirect = res.redirect.bind(res);
    res.redirect = (url) => {
      if (req.session.message) {
        res.set('x-session-message-type', req.session.message.type);
        res.set('x-session-message', req.session.message.message);
      }
      return originalRedirect(url);
    };
    next();
  });
  app.use(router);
  return app;
};

describe('POST /add', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    User.__saveMock.mockReset();
    app = createApp();
  });

  it('creates a new user successfully', async () => {
    User.__saveMock.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/add')
      .type('form')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        phone: '5551234567'
      });

    expect(User).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com',
      phone: '5551234567',
      image: 'user_unknown.png'
    });
    expect(User.__saveMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/broken-gate');
    expect(res.headers['x-session-message-type']).toBe('success');
    expect(res.headers['x-session-message']).toBe('User added successfully');
  });

  it('handles duplicate user errors', async () => {
    User.__saveMock.mockRejectedValueOnce(new Error('E11000 duplicate key error'));

    const res = await request(app)
      .post('/add')
      .type('form')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        phone: '5551234567'
      });

    expect(User.__saveMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
    expect(res.headers['x-session-message-type']).toBe('danger');
    expect(res.headers['x-session-message']).toContain('E11000');
  });

  it('handles missing required fields', async () => {
    User.__saveMock.mockRejectedValueOnce(new Error('Path `email` is required.'));

    const res = await request(app)
      .post('/add')
      .type('form')
      .send({
        name: 'Alice',
        phone: '5551234567'
      });

    expect(User).toHaveBeenCalledWith({
      name: 'Alice',
      email: undefined,
      phone: '5551234567',
      image: 'user_unknown.png'
    });
    expect(User.__saveMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
    expect(res.headers['x-session-message-type']).toBe('danger');
    expect(res.headers['x-session-message']).toContain('required');
  });
});
