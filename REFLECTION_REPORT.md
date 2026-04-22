# Reflection Report: SE 4900 Learning Sprint 4

## Repository Link

Forked repository: https://github.com/akraa/SE4900_simple-nodejs-mongodb-user-register-web-app

## Overview

This learning sprint was a practical introduction to building an AI-enhanced CI/CD pipeline around a small Node.js, Express, MongoDB, and EJS application. My work covered four connected activities: getting the application running with Docker, adding a GitHub Actions workflow, integrating AI-based pull request review, and creating a Jest quality gate with AI-assisted test generation. I also used AI as a debugging assistant when reasoning about failing CI and Docker build logs.

What stood out most was that AI was most useful when the task was concrete and bounded. It helped quickly draft tests, explain workflow problems, and narrow debugging effort. At the same time, it was clear that the model was not a substitute for engineering judgment. I still had to compare its suggestions against the actual repository files, confirm assumptions, and rerun the pipeline to verify that the proposed fixes really worked.

## What I Implemented

For the local setup, I used the provided Docker-based approach with a `Dockerfile` and `docker-compose.yml` to run the web application and MongoDB together. For CI, I configured a GitHub Actions workflow that reacts to pull requests and separates the pipeline into distinct stages. The first stage performs AI code review, the second stage runs Jest tests as a quality gate, and the third stage builds the Docker image. Structuring the pipeline this way made the process easier to reason about because each job had a single responsibility.

For testing, I added Jest and Supertest and focused on the `POST /add` route. The resulting tests cover the main success path, duplicate-user style failures, and missing-field behavior. The tests mock the `User` model so they run without a live database, which makes them appropriate for CI. This was an important part of the sprint because it turned AI-generated test ideas into an enforceable merge gate instead of leaving them as informal suggestions.

## Example of an Outdated Script Problem and How AI Helped

One useful example came from the setup scripts themselves. The sample `docker-compose.yml` uses the environment variable `MONGODB_URI`, but this application reads the database connection string from `DB_URL` in `main.js`. That is the kind of mismatch that is easy to miss when following tutorial-style instructions, especially when those instructions were written for a slightly different version of the app.

I used AI by giving it the relevant context: the startup behavior, the compose environment section, and the code in `main.js` that initializes Mongoose. Instead of asking a broad question like “why is Docker not working?”, I asked the model to compare the runtime configuration against the application bootstrap and identify the most likely cause of a MongoDB connection failure. The answer was useful because it focused on one concrete mismatch: the container was setting `MONGODB_URI`, while the application expected `DB_URL`. The fix was straightforward: either rename the variable in `docker-compose.yml` to `DB_URL` or update the application to read `MONGODB_URI` consistently.

This was a good example of how AI helped with an outdated script issue. The AI did not solve the problem by magic; it accelerated the comparison between configuration and code. The real value came from using the model as a fast debugging partner instead of treating it like an oracle.

## Did the AI Hallucinate or Give Bad Suggestions?

Yes, in small but important ways. The most common problem was that the AI sometimes produced plausible suggestions that did not fully match this repository. For example, a generic testing prompt can lead the model to suggest validations or fields that are common in registration systems, such as passwords, even though this application’s current add-user flow is based on name, email, phone, and image upload. That kind of answer is not completely irrational, but it is still wrong for the codebase in front of me.

I also saw that AI can over-suggest. In code review or debugging mode it may produce several possible causes when the assignment really asks for a single root cause. That makes the output look thorough, but it can slow down debugging if the extra ideas are not grounded in the actual logs or files.

Because of that, I treated AI output as a draft for inspection. If a suggestion did not line up with the route implementation, workflow file, or test behavior, I discarded it. The sprint reinforced that hallucinations are manageable, but only if the developer verifies everything against the repository.

## How Prompt Engineering Helped

Prompt engineering made a measurable difference. The more specific the prompt, the better the answer. The weakest outputs came from broad prompts like “write tests for this app” or “why did CI fail?” Those prompts invited generic answers. The stronger outputs came from prompts that included role, scope, constraints, and success criteria.

For test generation, a much better prompt was to tell the model that it was acting as a QA engineer for a Node.js application, then specify the exact target to test, require Jest, require model mocking with `jest.mock()`, and list the scenarios that had to be covered. That produced test code much closer to what I actually needed. For build-log analysis, the “senior DevOps engineer” framing plus the instruction to find the single root cause kept the answer focused and made the explanation more actionable.

This sprint showed me that prompt engineering is not just about wording. It is about reducing ambiguity. When I gave the AI the exact file, route, behavior, and constraints, the output became noticeably more accurate and required less cleanup.

## AI for Build Log Analysis

The build-log exercise was one of the clearest demonstrations of AI’s value in CI/CD work. When a Docker build fails, the raw logs can be noisy, especially for someone still learning how each layer executes. Giving the model the full error output and asking for the single root cause produced a concise explanation of what failed and why. In a Docker context, that kind of targeted interpretation is valuable because it helps separate the real issue from unrelated output above or below it.

What mattered here was not just that the AI named the failure, but that it translated the log into an exact fix. That shortens the time between failure and correction. However, the exercise also showed the limit: the AI can interpret the log, but it cannot prove the fix without a new CI run. Verification still belongs to the developer and the pipeline.

## Is the Developer Becoming an “AI Orchestrator”?

I agree with that idea, but only if “orchestrator” is understood correctly. The developer is not becoming a passive consumer of generated code. The developer is becoming the person who frames the task, chooses the right AI tool, supplies the right context, challenges weak output, and integrates the result into a real engineering workflow.

This sprint made that role shift very visible. AI was useful for generating a first draft of tests, reviewing pull requests, and interpreting logs, but none of those outputs were valuable until I verified them against the project and turned them into working pipeline behavior. In other words, AI increased my speed, but it also increased the importance of judgment. I had to be precise about prompts, critical about results, and disciplined about validation.

My conclusion is that the developer role is becoming more orchestration-heavy, but not less technical. If anything, good use of AI requires stronger technical thinking because the developer must continuously separate likely answers from correct ones.

## Final Reflection

Overall, this sprint was useful because it connected software testing, CI/CD, and AI into one workflow instead of treating them as separate topics. The main lesson I took away is that AI is most effective when it is embedded into disciplined engineering practices: clear prompts, narrow tasks, mocked tests, explicit CI gates, and real validation after every change. Used that way, AI becomes a force multiplier. Used carelessly, it becomes another source of noise.

That balance is what made the sprint valuable. I did not just use AI to generate code. I used it to review, test, debug, and explain, while still retaining responsibility for whether the final pipeline actually worked.
