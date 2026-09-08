# ADR 0003: Guest-first, Pinterest-editorial MVP

## Status

Accepted for MVP

## Decision

Visitors may select vibes and create one project without an account. Require sign-in only when they try to save, share, revisit, or purchase a curated look. The visual direction is Pinterest-editorial: image-led inspiration, masonry discovery, generous imagery, lightweight controls, and outfit boards as the primary unit of interaction.

## Consequences

Guest data will be stored in browser-local storage until conversion. The API must support an anonymous project token and an explicit migration path that attaches the project to the newly authenticated user. We should avoid collecting unnecessary personal data before sign-in.
