# StyleSync agent guide

## Keep this file current

Any agent making a material project decision must update this file in the same change. This includes product scope, architecture, dependency choices, data-source policy, authentication flow, UI direction, schemas, and deployment decisions. Link to the relevant ADR or documentation when one exists.

## Current product decisions

- Product: StyleSync, an AI outfit-curation workspace.
- MVP market: India only; currency is INR.
- MVP platform: responsive web application only.
- MVP audience: womenswear.
- Interaction model: Pinterest-editorial, image-led discovery and outfit boards.
- UI implementation: original desktop-first Next.js experience, with a warm editorial palette, playful collage treatment, and responsive mobile layouts. Do not copy provided third-party/reference UI code verbatim.
- Authentication: guests can create one project; require sign-in to save, share, revisit, or purchase a look.
- Guest projects: store locally first and migrate explicitly to an authenticated account.
- Auth and database: use Supabase Auth (email/password) and Supabase Postgres. Apply `infra/supabase/migrations/20260907_001_auth_and_projects.sql` and `20260907_002_profile_preferences.sql`; user-owned tables must keep Row Level Security enabled. See `docs/decisions/0004-supabase-auth-and-project-store.md`.

## Catalog and retailer policy

- Start with 40–60 manually verified real-retailer products, with outbound retailer links. Initial retailer shortlist: Myntra, AJIO, Amazon Fashion India, Flipkart Fashion, Savana, and NEWME.
- Cover all womenswear categories; prioritize the categories that complete an outfit in early curation (apparel, footwear, bags, jewelry, and accessories).
- Keep `source_updated_at`; show stale/unavailable status rather than presenting product data as real time.
- Prefer approved retailer APIs, affiliate feeds, and licensed data. Amazon new integrations use Creators API; do not start new PA-API 5 work. Do not scrape retailers or reuse images without explicit permission and documented terms review.
- Affiliate link conversion does not itself grant permission to display product images or catalog details.
- Product pricing uses ISO currency codes and integer minor units; never use floats for money.
- Course-demo catalog: use clearly fictional product records and placeholder images in `apps/web/data/demo-catalog.ts`; do not represent them as live retailer listings.

## Repository layout

- `apps/web`: Next.js frontend and outfit-canvas experience.
- `services/api`: FastAPI API and curation orchestration.
- `services/workers`: catalog ingestion and asynchronous processing.
- `packages/contracts`: versioned schemas and product fixtures.
- `infra`: Supabase migrations/configuration and local container configuration.
- `docs/decisions`: architecture decision records.

## Reference documents

- `docs/architecture.md`
- `docs/product-data-options.md`
- `docs/api-access-playbook.md`
- `docs/aggregation-patterns.md`
- `docs/decisions/0001-monorepo-layout.md`
- `docs/decisions/0002-mvp-market-and-data-strategy.md`
- `docs/decisions/0003-guest-first-pinterest-experience.md`
- `docs/decisions/0004-supabase-auth-and-project-store.md`
