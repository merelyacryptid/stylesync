# StyleSync

I got tired of curating outfits online and I realised I'd rather have someone else do it for me. 4 free. :))))))

StyleSync is an AI-powered outfit-curation workspace. A user creates a named project, provides event, budget, size, and style constraints, then explores purchasable outfit boards built from a normalized product catalog.

## Repository layout

```text
apps/
  web/                 Next.js user interface and outfit canvas
services/
  api/                 FastAPI application and recommendation API
  workers/             Catalog ingestion and image-processing jobs
packages/
  contracts/           Shared API schemas and product fixtures
infra/
  supabase/            Database migrations and local Supabase configuration
  docker/              Container definitions and compose configuration
docs/                  Product, architecture, and decision records
```

## MVP scope

The initial build is an India-only, web-only womenswear product. It will support onboarding, style/size profiles, fashion projects, a seeded catalog, budget-aware outfit curation, and a visual outfit board. Live retailer data, background removal, price monitoring, and learned personalization are later integrations behind explicit interfaces.

## Getting started

Prerequisites will be finalized after the initial architecture decisions. Each app and service includes its own README and environment template. Do not commit populated `.env` files.

## Working agreements

- Treat retailer data ingestion as a compliance-sensitive integration: prefer licensed feeds, official APIs, affiliate networks, or written approval before production collection.
- Currency is stored as ISO code plus integer minor units (for example, `249000` paise for INR 2,490.00) to avoid floating-point pricing errors.
- Product and recommendation payloads use versioned shared contracts.
