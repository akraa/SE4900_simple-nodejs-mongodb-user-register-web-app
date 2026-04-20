# Reflection Report: AI-Assisted Development Experience

## Brief Discussion of My Experience

My experience using AI in this project has been productive, but it worked best when paired with careful verification. AI helped me move faster on setup and debugging tasks such as Dockerization, CI workflow creation, and troubleshooting build failures. The biggest lesson was that AI is strongest as a collaborator for iteration, not an infallible source of truth.

In practical terms, AI was useful for three things: generating a first draft quickly, identifying likely causes from logs, and proposing minimal fixes. I still had to verify each suggestion against the repository’s actual configuration and runtime behavior. When I treated AI output as a hypothesis and validated it through logs and reruns, the workflow was efficient and reliable.

## Example of an Outdated Script/Action Problem and AI-Based Solution

One concrete issue involved Docker Compose commands. Some older guides and examples still use `docker-compose` (v1 style), while newer environments use `docker compose` (v2 plugin style). That mismatch can cause confusion or command errors depending on the machine.

I used AI to compare the expected command style with the environment configuration and to propose the correct command path. From there, I aligned the run instructions and Compose settings with the current environment. While troubleshooting, another real build blocker appeared in the Dockerfile:

`RUN this-command-should-fail`

AI helped isolate that this was the hard failure (exit code 127, command not found), not the npm warning lines. The minimal fix was to remove that invalid `RUN` line. After that, the image build path was clean again.

This was a good example of AI speeding up triage: identify signal in noisy logs, focus on the true blocking step, and apply the smallest valid patch.

## Did the AI Hallucinate or Provide Bad Suggestions?

Yes, occasionally. The most common issues were:

1. Suggestions that were technically plausible but mismatched this repository’s exact configuration.
2. Recommendations that were too generic and did not account for current branch state or existing files.
3. Advice that focused on warnings rather than the actual failure point.

For example, it is easy for AI to over-prioritize npm deprecation warnings in build output, even when the immediate failure is a missing shell command. This did not make AI useless; it meant I needed to ground decisions in logs, file contents, and reproducible commands.

## How Prompt Engineering Improved the Answers

Prompt engineering made a major difference. I got better results when prompts included:

1. Exact command output and error logs.
2. Clear success criteria (for example, “make `docker build` pass with minimal change”).
3. Repository-specific constraints (file names, env var names, branch context).
4. Explicit scope limits (avoid refactors, patch only the failing part).

When prompts were vague (for example, “Docker is broken”), responses were broad and less actionable. When prompts were concrete (“build fails at Dockerfile step [5/6], fix only root cause”), the AI response became precise, faster to validate, and easier to trust.

## Is the Developer Role Becoming an “AI Orchestrator”?

I agree, with an important caveat: orchestration does not reduce responsibility. It changes where effort goes.

I spend less time writing every first draft from scratch and more time on:

1. Framing the problem clearly.
2. Directing AI toward the right scope.
3. Verifying behavior with logs, tests, and workflow runs.
4. Deciding what should and should not be merged.

So yes, the developer is increasingly an AI orchestrator, but still the accountable engineer. AI improves speed and coverage; the developer still owns correctness, security, maintainability, and final judgment.
