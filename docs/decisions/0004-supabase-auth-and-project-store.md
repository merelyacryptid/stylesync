# ADR 0004: Supabase Auth and Postgres for the MVP

## Status

Accepted

## Decision

Use Supabase Auth for email/password accounts and Supabase Postgres for authenticated user profiles, projects, and saved looks. Enforce user ownership through Row Level Security. The anonymous user's first project remains in browser local storage until it is explicitly migrated after authentication.

## Consequences

The web app needs only public Supabase URL and anon-key configuration. Never expose the Supabase service-role key to the browser. The migration is manually applied in the Supabase SQL Editor for the first course-project setup; later it can be managed through the Supabase CLI.
