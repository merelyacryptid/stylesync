# Supabase setup

1. Create a free project at [Supabase](https://supabase.com/dashboard).
2. In **Project Settings → API**, copy the project URL and **anon** key.
3. Copy `apps/web/.env.local.example` to `apps/web/.env.local`, then insert those two values. Keep this file private.
4. In **SQL Editor**, paste and run `infra/supabase/migrations/20260907_001_auth_and_projects.sql`.
5. In **Authentication → Providers → Email**, enable email/password. For a simple course demo, you may turn off “Confirm email”; otherwise confirm the link Supabase sends after registering.
6. In **Authentication → URL Configuration**, add `http://localhost:3000` as a redirect URL for local development.
7. Restart `npm run dev`. Create an account through the StyleSync sign-in dialog.

## What is stored

- `profiles`: one profile per Supabase account.
- `projects`: a user's style projects, with budget stored as integer paise.
- `saved_looks`: saved outfit-board metadata and item IDs.

All three tables have Row Level Security enabled. A signed-in user can only access their own records.
