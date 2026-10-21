# SEO migration audit — 13 October 2026

Target origin: https://mobilerates.info
UI brand: Mobile Rates. Search titles and descriptions omit the site brand.

## 1. Domain and URLs — code complete

- Canonicals, social URLs, schema URLs and sitemap URLs use the new origin.
- Phones, earbuds and vehicles use /{product-slug}.
- Legacy price/region routes and old nested product routes redirect permanently.
- Old-host and www-host redirects are configured in the frontend. The old domain must still reach this application for these redirects to run.
- Brand pages use /brands/{slug}.
- Existing product slugs must be unique across product types and must not collide with application routes. The sitemap detects duplicate product slugs instead of silently emitting the wrong product URL.

## 2. Sitemap and indexing — code complete

- Paginated retrieval replaces the 1,000-phone limit.
- Coverage includes phones, earbuds, vehicles, published CMS pages, published news, brand listings and valid saved comparisons.
- Backend list projections expose indexing flags and real updatedAt timestamps.
- Noindex products and unpublished CMS records are excluded.
- Unknown modification dates are omitted. Page views no longer change product content timestamps.
- Normal pagination is crawlable and self-canonical. Invalid/out-of-range pages return 404; empty product collections are noindex. Filter/sort combinations are crawlable with noindex so crawlers can read the exclusion.
- Search and account/admin pages are excluded from indexing.
- API failures throw instead of returning a fake missing/empty product collection.
- A single sitemap is limited to 50,000 URLs. The code rejects a larger result; split into sitemap files before that threshold.

## 3. Structured data and content — code fixes complete; editorial review required

- Unknown retailer availability is omitted; known stock states are mapped explicitly.
- Invalid retailer prices/URLs are excluded from offer totals.
- Generic site graphics are no longer presented as product photographs.
- Review aggregates require a valid five-star average and a positive integer review count. Vehicle editorial scores are not presented as customer review averages.
- Hidden phone FAQ markup was removed. Vehicle FAQ markup corresponds to visible FAQs.
- Video markup is omitted until actual upload dates are available.
- Nonexistent search action was removed. JSON-LD escapes HTML delimiters.
- Recognizable internal generation notes are suppressed in product description views without changing saved source content.
- Review every imported/generated description, rating source, specification, price and retailer link in the admin editor. Unsupported earbud Bluetooth, water-resistance and driver defaults were removed. Numeric validation does not establish factual accuracy or review authenticity. Database content has not been bulk rewritten.

## 4. Error pages, feedback and links — code complete

- 404 page explains missing/moved addresses and provides working browse links.
- Service failures show retry guidance, with a separate root-layout error fallback.
- Accessible success/error notifications persist during navigation.
- Article/page/category saves and deletes, product moderation/deletes, team updates and advertisement saves/deletes have visible feedback.
- Public CMS slug routes only resolve published records. Admin draft lists and ID reads require authentication.
- Footer, login policy links and HTML sitemap CMS links are sourced from published records instead of assuming records exist.
- Source-level literal-link route checks pass. Database-driven product links and external retailer URLs still require a live crawl.

## 5. Deployment and external checks — outstanding

1. Configure DNS, hosting/reverse proxy and a valid TLS certificate for mobilerates.info and www.mobilerates.info. A live curl check failed hostname validation for mobilerates.info. The certificate presented is for foxzil.com. No certificate validation was bypassed.
2. Deploy backend and frontend changes together. Set NEXT_PUBLIC_API_URL to the actual new API endpoint before building (normally https://mobilerates.info/api). The local .env is ignored by Git.
3. Verify HTTPS pages, API, robots.txt and sitemap.xml return successful responses. Check old URLs redirect to the equivalent new URL, with no loops, homepage-only redirects or soft 404s.
4. Crawl all sitemap URLs and inspect rendered canonicals, robots directives, images, internal links and structured data. Confirm removed products return genuine 404s and temporary outages are not cached as removals. Streaming can affect HTTP status after headers are sent.
5. Add/verify the new Search Console domain property, submit the sitemap and use Change of Address where applicable. Keep old-domain redirects for at least one year.
6. Inspect Manual Actions and Security Issues for both domains, Page Indexing, Crawl Stats, and Performance around the traffic collapse. No penalty has been confirmed or ruled out.

## Validation

- TypeScript and scoped lint checks passed during implementation.
- Temporary regression checks cover pagination/indexing, content guards, offers, JSON-LD escaping, and sitemap retrieval beyond 1,000 products.
- Source literal-link checks found no missing application route targets after fixes.
- Production compilation and TypeScript stages pass. Full prerendering fails because the new API domain presents a foxzil.com TLS certificate (ERR_TLS_CERT_ALTNAME_INVALID). A successful deployment build must be confirmed after hosting/TLS is corrected.

## Primary guidance

- Site moves: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Noindex requires crawl access: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Accurate sitemap lastmod: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- URL/canonical guidance: https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites
- Structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies

## Deployment update — 14 October 2026

The previous TLS/build blocker is resolved. Mobile Rates is deployed at https://mobilerates.info from /root/mobile-deployment on the authorized server.

- Separate Compose project `mobilerates`, with localhost ports 3002 (frontend) and 5002 (backend), restart policies, resource limits, log rotation and health checks.
- Dedicated Nginx virtual host, valid Let's Encrypt certificate, HTTP-to-HTTPS redirect and renewal reload hook.
- Full Docker production build passes. The 404 navigation has its required Suspense boundary.
- Product route loading fallback was removed so missing products can return HTTP 404 before streaming. Missing products and invalid pagination were verified as 404 live.
- Homepage, API, robots.txt and sitemap.xml return HTTP 200. A sampled product emits noindex metadata. Account routes have noindex response headers.
- Existing Zozo, Foxzil, n8n and Qadam service checks pass. Their original containers and Nginx site configurations were preserved.
- `www.mobilerates.info` still requires a DNS record before its HTTPS certificate/redirect can be configured.
- Search Console diagnosis and editorial verification remain outstanding; deployment does not establish that the previous traffic drop was a penalty.
