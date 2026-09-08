# ADR 0002: India womenswear MVP and catalog-data strategy

## Status

Accepted for MVP

## Context

The first audience is women shopping in India through a web application. Outfit generation requires structured data, images, price, availability, and size variants. Retailer access terms and data quality vary materially.

## Decision

1. Scope the MVP to India, INR, Indian sizing, and womenswear.
2. Use a small editorially curated, manually verified catalog of real retailer products for the first working product experience. Each listing must retain its retailer attribution and direct outbound URL.
3. Add live data only through approved retailer/affiliate APIs or contractually permitted feeds. Begin with Amazon India Product Advertising API and Flipkart Affiliate API after account access is confirmed.
4. Use an affiliate-link provider such as Cuelinks for supported merchants when commercial tracking is needed; do not assume it provides full product attributes or per-size availability.
5. Do not launch browser scraping as the catalog-data source. It may be evaluated later only with retailer permission and a documented compliance review.

## Consequences

The first demo has stable boards, predictable size filtering, and no dependency on external rate limits. It will not initially have full marketplace breadth or real-time size/price accuracy across all retailers. Every product will retain `source_updated_at` and the UI will label unavailable or stale listings clearly. We also need permission/terms validation for displayed retailer images and product details before public launch.

The initial manual-verification shortlist is Myntra, AJIO, Amazon Fashion India, Flipkart Fashion, Savana, and NEWME. It covers all womenswear categories, while early curation prioritizes items that can form a complete look.
