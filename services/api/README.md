# API service

FastAPI backend for StyleSync, backed by Supabase Postgres.

## Setup

```bash
cd services/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL / SUPABASE_* from `supabase status`
```

## Apply schema + seed catalog

```bash
supabase start                                   # from repo root, if not already running
supabase db push                                 # applies infra/supabase/migrations/0001_init.sql
cd services/api
python -m scripts.seed_products                  # loads fixtures/products.json
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Docs at `http://localhost:8000/docs`.

## Auth model

- **Guest**: send header `X-Guest-Token: <client-generated-uuid>` (generate once, store in
  localStorage). Guests get exactly one project.
- **Signed in**: send `Authorization: Bearer <supabase-access-token>`. After sign-in, call
  `POST /api/v1/projects/migrate` with the old guest token to attach the guest project to the
  account.

## Endpoints (v1)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/catalog/products` | Browse seeded catalog, optional `?category=`. |
| POST | `/api/v1/projects` | Create a project (guest or authenticated). |
| GET | `/api/v1/projects` | List the caller's own projects. |
| POST | `/api/v1/projects/migrate` | Attach guest project(s) to the now-authenticated user. |
| POST | `/api/v1/projects/{id}/curations/generate` | Run the budget-aware knapsack curator, returns N boards. |
| GET | `/api/v1/projects/{id}/curations` | List saved boards/custom mixes for a project. |
| POST | `/api/v1/projects/{id}/curations/custom-mix` | Save a Mix-n-Match Studio selection. |
| POST | `/api/v1/projects/{id}/curations/{curation_id}/mark-bought` | "Curated & Bought" flow. |

## What's intentionally deferred past tonight's MVP

Per `docs/decisions/0002-mvp-market-and-data-strategy.md`, no scraper adapters are implemented —
the catalog is the seeded fixture set. Compatibility scoring is a lightweight keyword-overlap
heuristic (not CLIP embeddings), and there's no cross-platform price-match alert engine yet. Both
are drop-in replacements for `score_product` / `generate_boards` in
`app/services/recommendation.py` once real data sources are approved.
