# ADR 0001: Monorepo layout

## Status

Accepted

## Context

StyleSync needs a TypeScript web client, Python APIs/workers, shared payload definitions, and database infrastructure. Keeping these in separate repositories at MVP stage would slow coordinated changes.

## Decision

Use a lightweight monorepo with `apps`, `services`, `packages`, `infra`, and `docs` at the root. Deployment boundaries remain independent.

## Consequences

We can version API contracts and documentation alongside both applications. Tooling is intentionally not chosen yet; the next decision will select package management, Python dependency management, and local orchestration.
