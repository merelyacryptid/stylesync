# How established fashion aggregators source product data

## Finding

Public documentation points to a partner-feed/API model, not a strategy of unapproved retail-site scraping.

| Example | Publicly documented approach | Relevance to StyleSync |
| --- | --- | --- |
| Lyst | Its partner material describes partner onboarding, API access, and a connected product feed. Its size requirements state that products without qualifying size data are not visible when users apply a size filter. | Fashion-specific reference for our product/variant/size schema. |
| ShopStyle Collective | Its API retrieves product, brand, retailer, and category data through a keyed REST API. | Reference for a normalized discovery API delivered to approved clients. |
| Google Merchant Center | Merchants submit structured product data with stable image URLs. It defines image and variant requirements, including correct variant imagery. | Reference schema and quality bar; Google is not a general third-party feed StyleSync can simply consume. |

## Product-media pattern

In a permitted feed/API arrangement, the retailer/merchant supplies a stable product identifier, product/variant data, primary and additional image URLs, destination URL, price, and availability. The aggregator consumes the permitted fields, normalizes them, refreshes them on the agreed schedule, and sends the shopper to the retailer. It does not need to retrieve or reverse-engineer the retailer page on every user request.

For StyleSync, retain the retailer URL and attribution; cache only for the allowed duration; use the exact variant image for a colour variant; and get written confirmation that product images can be displayed and transformed into an outfit-board layout.

## Why unapproved scraping is a poor production strategy

1. **Terms and permission.** AJIO expressly prohibits bots/scraping, data-mining, product-listing collection, and creating a database featuring parts of its platform. Myntra's published terms likewise prohibit page scraping, robots, copying/monitoring content, and commercial reuse of its protected images and content without written consent.
2. **Image rights.** A product image is normally copyright-protected retailer/brand or licensor content. Downloading it, storing it, background-removing it, and arranging it in a commercial collage are separate uses that need permission; an outbound link alone is not enough.
3. **Data correctness.** Prices, promotions, delivery fees, and in-stock sizes change frequently. Page extraction commonly misses variant-specific stock and can make a “within budget / available in your size” claim inaccurate.
4. **Reliability and scale.** Retail sites change page structure, add rate limits and anti-bot protections, or block traffic. Each change can silently degrade recommendations and needs ongoing monitoring.
5. **Brand and partnership risk.** A feed/API relationship gives clear attribution, allowed cache time, and support. Scraping creates a brittle dependency and can jeopardize an affiliate or direct partnership.

## Sources consulted on 2026-08-19

- Lyst: <https://www.lyst.com/partners/> and <https://lystpartnersupporthelp.zendesk.com/hc/en-us/articles/16222676413340-WHERE-CAN-I-FIND-THE-LYST-FEED-REQUIREMENTS>
- ShopStyle: <https://help.shopstylecollective.com/hc/en-us/articles/115000843946-About-the-ShopStyle-API>
- Google Merchant Center: <https://support.google.com/merchants/answer/6324350>
- AJIO terms: <https://www.ajio.com/help/termsAndCondition?isAppsFlag=true>
- Myntra terms: <https://www.myntraglobal.com/pages/terms-of-use>
