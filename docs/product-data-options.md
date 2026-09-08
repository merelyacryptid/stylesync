# India womenswear product-data options

| Option | Data quality for StyleSync | Launch speed | Commercial / compliance risk | Recommendation |
| --- | --- | --- | --- | --- |
| Curated seed catalog | Excellent schema, images, and size variants because we control it; not live | Fastest | Low | **Use for the MVP.** |
| Direct retailer / affiliate APIs | Potentially live product, price, and offer data; varies by retailer | Medium | Low after approval | **Add selectively.** Start with Amazon India and Flipkart. |
| Affiliate-network tooling | Strong for campaign discovery, tracked links, offers, and reporting; catalog depth varies | Fast | Low after approval | Use as a monetization/link layer, not the only catalog source. |
| Licensed product-feed/data partner | Can offer broad normalized coverage if a suitable India-fashion vendor is found | Medium | Medium: contract and cost | Evaluate after validating product demand. |
| Browser scraping | Can appear broad, but size/stock and anti-bot breakage create unreliable recommendations | Fast prototype, slow to maintain | High | Do not use for MVP or production without written approval. |

## Recommended sequence

1. Start with 40–60 hand-curated, manually verified women's products across all womenswear categories. Include dresses, tops, bottoms, co-ords, outerwear, ethnic wear, footwear, bags, jewelry, hair accessories, eyewear, and other accessories; prioritize outfit-completing categories first.
2. Model each sellable size as a variant; use a visible `last verified` timestamp and safe fallback when a listing is stale.
3. Apply to Amazon India Associates / Product Advertising API and Flipkart Affiliate Program. Keep adapters separate so permissions and rate limits cannot affect the core curation flow.
4. Add Cuelinks only for its available merchant campaigns and link conversion; validate its merchant-specific product-feed access separately.
5. Expand retailer by retailer after confirming field coverage: image-display rights, deep links, price, availability, size variants, refresh interval, and permitted caching.

## What we need from an approved source

- Stable product ID, title, brand, category, product URL, and image-display permission.
- Current price, currency, discount, shipping estimate, and update time.
- Per-variant size and availability information for accurate filtering.
- Allowed storage duration, refresh requirements, attribution, and outbound-link rules.
- A contract/API that permits StyleSync's AI-generated visual boards.
