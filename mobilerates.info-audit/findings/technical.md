# Technical SEO and sitemap audit — 2026-10-28

## Scope and method
Read-only review of Next.js public routes, Express list/detail services, metadata/indexing helpers and public HTTPS responses. Installed Claude SEO sitemap discovery verified sitemap.xml (HTTP 200, valid urlset, declared in robots). A bounded breadth-first crawl follows sitemap and internal links, respects robots, uses five workers with one-second delay, and captures compact results in ../crawl-data.json. Comparison detail URLs are excluded because normal page rendering triggers comparison tracking. Faceted combinations are bounded to avoid crawl traps. Live results describe the deployment before local changes; they do not prove deployment of fixes.

## Confirmed findings

- **High — Comparison pages serialize excessive product data.** Three successfully crawled single-selection comparison pages exceed 3.7MB uncompressed HTML. `app/compare/page.tsx` requests `getPhones("limit=all")` and passes records to the client. Requests for three other comparison selections timed out after 25 seconds; this is a measurement limitation, not a proven 5xx. Trim selector records to fields actually used or load options incrementally; recheck response size and all selector behavior.
- **Medium — Query comparison states are indexable.** `/compare?phone=samsung-galaxy-s26-ultra` serves index,follow and canonical `/compare`. Canonical consolidates duplication, but noindex on tool query states provides explicit treatment of non-editorial pages. Preserve useful clean comparison landing pages and canonical pair redirects.
- **Medium — Collection JSON-LD descriptions contain literal JSX source.** `phones/page.tsx`, `earbuds/page.tsx`, and `vehicles/page.tsx` use strings such as `Explore $<CurrencyText text={title} />`. Replace with real interpolated text. Root agent implementing.
- **Medium — Empty archives can be indexed.** `/news` metadata remains indexable despite zero eligible published stories; comparisons archives also index empty data. Conditional noindex should match sitemap inclusion and visible inventory. Root agent implementing.
- **Medium — Brand sitemap eligibility differed from brand metadata.** Sitemap combined released and upcoming phones when deciding whether a brand landing page was indexable. Brand metadata checks default released-only list. Fixed locally in `frontend/app/sitemap.ts` (regression check passed using the real transpiled module with released/upcoming API fixtures): retain released group for brand eligibility while still including individually approved upcoming products. Depends on existing backend release-date filter; verify upcoming-only approved brand is excluded and released-approved brand retained.
- **Low — Security header hygiene.** Public homepage has no HSTS, X-Content-Type-Options, X-Frame-Options or Referrer-Policy header. Add appropriate baseline headers after checking embedding needs; these are security improvements, not a claim of direct ranking gains.

## Verified working

- HTTP apex and HTTPS www each issue one 301 redirect to HTTPS apex.
- robots.txt HTTP200 allows public site and declares working sitemap; protected/API paths excluded.
- Sitemap contains nine unique HTTPS URLs: five primary directories/home plus four published informational/legal pages. No fabricated lastmod on static URLs; CMS records retain modification timestamps.
- All nine sitemap URLs returned HTTP200 in successful compressed crawl.
- Unknown slug `/seo-audit-missing-page-20261028` and out-of-range `/phones?page=999999` return real HTTP404.
- Legacy `/earbuds/example-phone` returns HTTP308 to `/example-phone`.
- Public listing pagination uses crawlable anchors and self-referencing page canonicals; filtered listing URLs are noindex,follow.
- Product noindex is intentional explicit editorial approval (`seo.is_indexable === true`), matched by sitemap. Do not mass-enable without reviewing content; database writes outside scope.
- Successful HTML pages inspected so far have one H1, descriptions and parseable JSON-LD; final totals in crawl-data.json.

## Limits and monitoring
No Search Console evidence of actual Google indexing/canonical choice was available. No field Core Web Vitals measured here. Score only observed checks; no global technical score inferred from an incomplete crawl. Review Search Console excluded/indexed counts after deployment and editorial approvals; validate sitemap-to-page robots agreement after future product releases. Recheck comparison HTML size and request timeouts after payload reduction. Recheck unknown/page-range HTTP404 after framework changes.

## Final crawl counts

500 URLs attempted; 497 completed with HTTP200; 0 confirmed HTTP errors; 3 comparison-page transfer timeouts. 534 discovered URLs remain beyond the skill cap. All completed pages have a title, description, canonical and exactly one H1; all detected JSON-LD blocks parse. 470 successful pages have noindex, chiefly the explicit product approval policy and facets. See crawl-summary.json and crawl-data.json for exact URLs.

## Owner-confirmed indexing policy and Search Console context

The owner explicitly confirmed that product noindex is intentional and plans to approve ten products per day. The reported 605 Search Console exclusions by noindex are therefore an editorial rollout state, not an SEO defect to remove. Preserve both the metadata gate and sitemap gate. Approval makes a URL eligible; it does not guarantee Google indexing or an immediate Search Console count change.

Owner-provided Search Console counts also show four Not found (404), three alternate pages with proper canonical, two redirects, and four crawled-currently-not-indexed URLs. Counts alone do not identify a repair: exact URLs and current responses are required. Alternate canonical and redirected URLs can be intentional; the live crawl found no confirmed internal HTTP errors. Root agent is requesting exact affected URLs. No production approvals or records were changed.

Durable regression coverage added in `frontend/tests/sitemap.test.mjs`, executing the real transpiled sitemap and editorial helper with fixture API responses: explicit product approval, ten-per-day approval changes and revocation, multi-page product collection, unpublished/noindexed CMS exclusion, upcoming brand consistency, and errors rejecting generation instead of returning a partial sitemap.
