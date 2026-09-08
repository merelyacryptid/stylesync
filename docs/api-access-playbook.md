# API and affiliate approval playbook

This is a product/commercial checklist, not legal advice. Verify current terms with each retailer before implementation or launch.

## 1. Prepare the application materials

- A public landing page (or staging URL) explaining that StyleSync curates India womenswear and sends users to retailers to buy.
- Privacy policy, terms, support email, and clear affiliate disclosure.
- A short product-data diagram: what we display, which fields are cached, refresh intervals, and that users complete purchases on the retailer website.
- A product sample and the exact technical requirements: product image use, deep linking, price/stock/size variants, and permitted caching.

## 2. Amazon India: Associates then Creators API

1. Join the Amazon India Associates program with the StyleSync site/app details.
2. Build the required disclosures and qualifying outbound experience.
3. In Associates Central, register as a Creators API developer, create the client credentials, and implement its OAuth client-credentials authentication flow. Do not start a new PA-API 5 integration; Amazon's current Creators API documentation says PA-API is deprecated.
4. Implement the API strictly within its license: use approved links/data, honour refresh and attribution requirements, and do not treat its results as a reusable unrestricted image catalog.
5. Drive qualifying traffic and sales through the approved links. Amazon's initial Associates review occurs after at least three qualifying sales within 180 days; the reviewed site must be public, recent, and original.
6. Ask Amazon support in writing whether our outfit-board image composition is permitted under the current license before enabling it publicly.

Amazon confirms that an open Associates account and compliance with its program and API license are prerequisites for API use.

## 3. Flipkart: Affiliate registration then API access

1. Register for the Flipkart Affiliate Program and submit the StyleSync web property for review.
2. Request/enable API credentials in the affiliate dashboard and confirm the API is available for the intended account and category.
3. Use product and offer endpoints only after confirming the response includes the fields we need.
4. Confirm display, attribution, data-refresh, and deep-link rules with affiliate support before launch.

Flipkart describes its affiliate APIs as access to product and offer information for registered affiliates and notes that the APIs are currently in beta.

## 4. Myntra, AJIO, Savana, NEWME, and other fashion retailers

1. Find the retailer's current affiliate/partner application or approach its partnerships/business-development contact. For Myntra and AJIO, first check approved affiliate networks such as Cuelinks; for Savana and NEWME, do not assume an API exists—request one directly.
2. Submit the StyleSync landing page, company details, audience (India womenswear), traffic plan, and a short demo or screenshots.
3. Ask a specific question: “Do you provide a product feed/API with image-display rights, price, availability, and size variants for an AI outfit-curation web app?”
4. Ask for an explicit license to: display the supplied product image, transform/crop it into an outfit-board composition, cache it for an agreed period, and use a retailer-approved deep link.
5. Save written answers, account approval, and the agreement/terms version in an integration record before building an adapter.
6. If only link conversion is approved, use it for outbound tracking—not as permission to copy catalog images or scrape pages.

## What to send in a support request

> StyleSync is an India-focused womenswear discovery site. We curate complete looks and redirect customers to your product page to complete purchases. Please confirm whether your affiliate program permits displaying your approved product image, title, price and availability in an outfit collage; the permitted refresh/caching rules; and whether a product feed/API includes per-size stock information.

## Approval tracker

Maintain one row per retailer with: application URL, owner, status, agreement URL/version, permitted fields, image/derivative-work permission, allowed cache time, refresh cadence, supported sizes/stock, test credentials, and launch approval date. Do not ship an adapter until every required field is confirmed.
