# Architecture overview

```text
Next.js web app
      |
FastAPI API ---- PostgreSQL + pgvector (Supabase)
      |                    |
      |                    +-- Supabase Storage / object storage
      |
worker queue ---- catalog adapters / image processing / price checks
```

## Bounded components

| Component | Responsibility |
| --- | --- |
| `apps/web` | Onboarding, project dashboard, curation browsing, and Mix-n-Match canvas. |
| `services/api` | Authentication boundary, validation, project and catalog APIs, curation orchestration. |
| `services/workers` | Asynchronous catalog ingestion, image cutouts, embedding creation, and price checks. |
| `packages/contracts` | Language-neutral API schemas, fixtures, and API-version notes. |
| `infra/supabase` | PostgreSQL/pgvector schema migrations and row-level security policies. |

## Initial integration seams

- `CatalogSource` obtains normalized product records from a permitted source.
- `ImageProcessor` provides cutouts or a safe fallback to original images.
- `RecommendationEngine` produces explainable, budget-aware outfit candidates.
- `PriceComparisonProvider` searches approved sources for exact or similar alternatives.

These seams let the MVP run on fixtures before external integrations are selected.
