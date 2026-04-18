# Project Guidelines

## Code Style
- Use CommonJS modules and the existing 2-space indentation style.
- Keep route handlers, model definitions, and EJS views aligned with the current naming patterns in `main.js`, `routes/routes.js`, `models/users.js`, and `views/`.
- Prefer small, focused changes over broad refactors.

## Architecture
- `main.js` is the application bootstrap: it configures Express, connects Mongoose, sets middleware, and mounts the router.
- `routes/routes.js` owns the user CRUD flow, search, sorting, pagination, and upload handling.
- `models/users.js` defines the user schema used throughout the app.
- `views/` contains the EJS pages and shared layout partials.
- Use the repo docs for context instead of duplicating them: see [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [uploads/README.md](uploads/README.md).

## Build and Test
- Install dependencies with `npm install`.
- Start development with `npm start` or `npm run dev`.
- Start production mode with `npm run prod`.
- `npm test` is currently a placeholder and does not run real tests.

## Conventions
- The application reads its MongoDB connection string from `DB_URL` in `main.js`; keep new docs and changes consistent with that variable name.
- Uploaded images are stored under `uploads/` and are served statically from that directory.
- When changing image upload behavior, update the form field name, route handling, and filesystem path together.
- The project currently relies on manual verification; do not assume an automated test harness exists.