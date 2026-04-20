# Reflection Report: AI-Assisted Testing and CI Quality Gates

## Learning Sprint 4

CI badge for `main` branch:
[![CI (main)](https://github.com/akraa/SE4900_simple-nodejs-mongodb-user-register-web-app/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/akraa/SE4900_simple-nodejs-mongodb-user-register-web-app/actions/workflows/ci.yml?query=branch%3Amain)

CI badge for `feature/add-validation` branch:
[![CI (feature/add-validation)](https://github.com/akraa/SE4900_simple-nodejs-mongodb-user-register-web-app/actions/workflows/ci.yml/badge.svg?branch=feature%2Fadd-validation)](https://github.com/akraa/SE4900_simple-nodejs-mongodb-user-register-web-app/actions/workflows/ci.yml?query=branch%3Afeature%2Fadd-validation)

## Experience Summary

This implementation was a practical demonstration of how AI can speed up development while still requiring active engineering judgment. I used AI assistance to add Jest and Supertest, generate route-level unit tests for user registration, and wire a CI quality gate that runs tests only after an AI code-review job passes. The biggest value was acceleration in drafting tests and workflow structure; the biggest responsibility remained validation and correction.

## Example: Outdated Script/Action Problem and AI-Assisted Fix

A concrete issue appeared when workflow assumptions no longer matched the repository’s current CI setup. Earlier runs and examples referenced different job naming and behavior patterns, and a copied or stale assumption can break dependency chaining (for example, depending on a job name that no longer exists in the active workflow).

I used AI to help reframe the workflow around explicit job dependencies, then applied and verified this pattern:

- keep the AI review job (`ai-code-review`)
- add a dedicated `run-tests` job
- set `needs: ai-code-review`
- run `npm ci` and then `npm test`

The result was validated by intentionally introducing a failing test and observing `run-tests` fail on the pull request, which blocked merge. After fixing the failing test and pushing again, the gate passed and the PR merged. This showed the AI-assisted change was not only syntactically correct but operationally correct.

## Did the AI Hallucinate or Give Bad Suggestions?

Yes—occasionally, and in ways that are common for code assistants:

1. It can produce plausible but not perfectly repository-specific suggestions.
2. It may include extra findings outside the immediate scope of the requested fix.
3. It can suggest patterns that require adaptation to the project’s actual branch/workflow state.

In this process, AI correctly identified the intentionally broken assertion, but some broader comments were unrelated to the current delta. That reinforced a key rule: AI output is a strong draft, not a final authority.

## How Prompt Engineering Improved Output Quality

Prompt engineering made a direct difference in test quality and relevance. The most useful prompts included:

- **Role framing** (QA engineer for Node.js/Jest)
- **Exact target** (the specific registration handler/route)
- **Explicit requirements** (success case + edge cases + full `jest.mock()` isolation for the `User` model)
- **Execution constraints** (no database dependency; runnable locally with `npm test`)

When prompts were generic, output was generic. When prompts included precise files, behaviors, and acceptance criteria, the generated tests were far more accurate and required less rework.
---

## Part 4: AI for Build Log Analysis

### What Was Done

A `build-docker` job was added to the CI pipeline (`main.yml`) as a third stage, running after `run-tests` passes. To create a realistic failure scenario, an invalid `RUN invalidcommand --check` instruction was inserted into the `Dockerfile` and pushed on a new branch (`part4/build-log-analysis`), triggering PR #7.

### The Failure Log

The `build-docker` CI step produced the following error:

```
Step 6/9 : RUN invalidcommand --check
 ---> Running in a3f91b2c4d11
/bin/sh: invalidcommand: not found
The command '/bin/sh -c invalidcommand --check' returned a non-zero code: 127
Error: Process completed with exit code 1.
```

### LLM Analysis – Using the Senior DevOps Prompt

The following prompt was applied to the raw log:

> *You are a senior DevOps engineer debugging a failed CI/CD pipeline. The following is a log from a failed CI step in GitHub Actions. Analyze this log, identify the single root cause of the failure, explain it clearly, and provide the exact fix needed.*

**AI-identified root cause:** The `Dockerfile` contained `RUN invalidcommand --check`. Docker executes each `RUN` instruction inside `/bin/sh` on the base image (`node:18-alpine`). Exit code `127` is the POSIX standard for "command not found." Because `invalidcommand` does not exist in the Alpine image, the layer fails and the entire build is aborted.

**AI-recommended fix:** Remove the offending `RUN` line entirely. No other changes are needed.

### Fix Applied

The invalid line and its comment were deleted from the `Dockerfile`:

```diff
-# Verify build environment (intentional error for CI exercise)
-RUN invalidcommand --check
-
 # Bundle app source
```

The fix was committed as `"Fix: remove invalid RUN command from Dockerfile"` and pushed to the same branch, re-triggering the pipeline.

### What This Exercise Demonstrated

- **AI log analysis is immediately practical.** Pasting raw CI output with a role-framed prompt produced a precise root cause and exact fix with no ambiguity. There was no hallucination — the exit code, shell, and base image were all correctly interpreted.
- **The LLM saved diagnostic time.** A developer unfamiliar with Docker exit codes might have investigated the wrong layer or questioned `npm install`. The AI skipped straight to the culpable line.
- **Prompt framing is load-bearing.** The "senior DevOps engineer" role instruction and the explicit "single root cause" constraint prevented the model from producing a sprawling list of suggestions unrelated to the actual failure.
- **Limitations remain.** The AI cannot run the pipeline itself, cannot inspect secrets or environment state, and cannot verify that the fix works — that confirmation still requires a real CI run.

---
## Is the Developer Becoming an “AI Orchestrator”?

I agree, with nuance. The developer role is increasingly an AI orchestrator **and** quality owner.

AI now handles much of the first draft work: scaffolding tests, suggesting CI structure, and surfacing risks quickly. But the developer remains responsible for:

- grounding changes in repository reality
- verifying behavior in real CI runs
- filtering hallucinations/noise from actionable findings
- making final design and risk decisions

So the role is evolving from “write everything manually” to “guide, constrain, verify, and integrate AI output.” Orchestration is becoming core, but accountability and engineering judgment are still human responsibilities.
