# Web application

The first StyleSync prototype is a Next.js + TypeScript frontend with hand-authored CSS. It implements an original, Pinterest-editorial interpretation of the product flow:

- Guest-first project creation with a name, budget, prompt, and selected vibes.
- AI-look feed represented by curated concept boards.
- Mix-and-match outfit board with interactive item swapping and budget feedback.
- A sign-in gate when a guest saves or shops a look.

## Run locally

```powershell
cd apps/web
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Authentication and database

StyleSync uses Supabase Auth and Postgres. Follow [the setup guide](../../docs/supabase-setup.md), copy `.env.local.example` to `.env.local`, and add the two public values from your Supabase project. Never add the service-role key to this frontend.

The product image URLs in this prototype are visual placeholders. Replace them with assets from an approved retailer feed before any public deployment.

## Demo catalog

`data/demo-catalog.ts` is the local catalog for the course prototype. It contains fictional products with fields that mirror the intended API: ID, category, price, size availability, retailer label, update time, source URL, and style tags. Add a record there before wiring a real catalog source.

## Next milestone

Replace the in-memory project and product data with the versioned contract/API, then introduce authentication and a real canvas library.
