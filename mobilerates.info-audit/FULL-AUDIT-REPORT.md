# Mobile Rates SEO audit and fixes

Audit date: 28 October 2026. Domain: https://mobilerates.info. Business: product comparison/specifications publisher.

## Outcome
The repository now contains fixes for confirmed technical, metadata, structured-data, content-trust and usability defects. **These changes are local; the live site has not been deployed.** No production database records were edited. Mobile Rates and Zozo share a database, so approving or correcting CMS records needs a separate editorial workflow.

Provisional **pre-fix observed health: 65/100**. This is an expert rubric assessment, not a Google score. Technical 70, content 45, on-page 70, schema 60, AI readiness 60, images 85; CWV is unavailable. The measured/inspectable categories are weighted using the skill and renormalized over 90%. Do not treat this as a measured performance score or an improvement claim. No post-deployment score is assigned.

## Coverage and evidence
Final crawl:500 attempts,497 completed HTTP200 responses, three comparison transfer timeouts, zero confirmed HTTP errors;534 discovered URLs remain beyond the cap. All497 completed pages had a title, description, canonical, one H1 and parseable detected JSON-LD. See `crawl-data.json` for every response and exclusions. Crawl respects robots, uses five workers with a one-second delay, and caps at 500 URLs. Faceted combinations are bounded; comparison detail routes that record tracking are excluded. This is a site-wide template review and bounded URL crawl, not a claim that every possible query combination was inspected. Screenshots and `visual-measurements.json` document desktop 1440px and mobile 390px rendering of the original deployment.

All nine submitted sitemap URLs returned 200. HTTP and www redirect to the HTTPS apex in one hop. Unknown products and out-of-range pagination return real 404s. Public content is server rendered. Filter pages remain crawlable with noindex so crawlers can see that directive. Product index approval remains deliberately explicit; the small sitemap is not a reason to index unreviewed products.

## Fixes implemented
| Priority | Finding and evidence | Local correction |
|---|---|---|
| High | PhoneSpecs guessed RAM technology and always displayed Verified/official sources | Display stored facts, actual editor/reviewer names and safe saved source links; omit unsupported claims |
| High | Reference-only prices were represented as purchase offers; missing retailer stock became In Stock | Offer schema requires real retailer URL/positive price; unknown stock stays unknown |
| High | Comparison tool HTML exceeded 3.7 MB in successful live responses | Serialize only selector ID, slug, name, brand and thumbnail; retain complete selected specs/prices |
| Medium | Three category schemas contained literal JSX text | Real interpolated CollectionPage descriptions and matching phone canonical path |
| Medium | Empty news/comparison archives and query comparison states were indexable | Content-aware noindex for empty archives; noindex query tool states; retain canonical pair redirects |
| Medium | Upcoming-only brands could appear in sitemap despite noindex brand page | Match released-product eligibility used by brand metadata |
| Medium | Nested Open Graph objects lost root image/type/site name | Shared image/type/brand defaults while preserving route overrides |
| Medium | Generic schema entity identity | Mobile Rates Organization/WebSite IDs and logo; consistent article publisher |
| Medium | Current year and official-price language implied unverified freshness/authority | Stable product titles and factual description wording; real update dates only |
| Medium | Saved source field names differed between frontend and backend | Support source_name/source_url and legacy name/url without unsafe links |
| Medium | Article description/byline/update visibility incomplete | Content-derived description fallback, organization/person attribution, visible valid update date |
| Medium | Paid placements lacked sponsorship relation | rel=sponsored on ad links |
| Low | Ad creative size changed with image load/rotation | Reserve consistent creative aspect ratio; preserve entire creative |
| Low | Empty ad collections returned404 | Successful empty array response |
| Low | Inert More options button and undersized arrows | Remove inert action; increase carousel targets to44px |
| Low | Above-fold article cover was lazy | Eager, high-priority cover loading |

## Content and search experience
The site serves comparison intent with product specifications, filters, prices and side-by-side tools. Do not pad pages to arbitrary word counts. The highest-value editorial work is factual verification, trustworthy source citations, precise price provenance and original comparisons. The observed Samsung sample contains a model/MPN apparently inconsistent with its title; validate against the manufacturer before indexing. This cannot safely be repaired by inventing values. Thin/sample articles remain excluded by the existing approval rules.

Public robots rules allow search/AI crawlers through the wildcard. Useful headings and SSR are present. No evidence establishes AI citation share, ranking position or external authority. An llms.txt file is optional, not a substitute for correct content, and no ranking/citation guarantee is made.

## Performance and visual findings
Homepage HTML was about906 KB decoded and131 KB transferred with gzip. Neither viewport overflowed horizontally. The rendered homepage had50 images, zero missing alt attributes and zero broken completed images in the sample. These are homepage observations, not all-image guarantees. Search and heading remained visible on mobile. JSON-LD parseability does not equal rich-result eligibility.

PageSpeed returned a quota error. LCP, INP and CLS field values are therefore **unavailable**. Browser render duration is not LCP. Client-loaded ads can still insert/remove space; fixing creative dimensions does not prove zero CLS. Measure real ad-populated pages before changing inventory layout or reserving permanent empty space. Other optional security headers and broader image-delivery changes should follow actual deployment/embedding requirements.

## Validation and rollout
See `validation.json` for final tests and local rendered checks. Production build uses pinned Next16.2.10 and reads the package's bundled guides. The initial mounted-directory dependency install failed; build validation uses an isolated /tmp copy with locked dependencies. The sitemap now uses cacheable vehicle fetching and ISR, preserving the last successful XML during a failed refresh. See SEARCH-CONSOLE.md for the live200 checks and historical fetch-failure limitation.

Deploy only this repository's Mobile Rates services. Do not push to Zozo or modify other containers. After deployment repeat robots/sitemap/metadata checks, verify source links and comparison selection, and monitor Search Console indexing/canonical reports. Actual indexing depends on editorial approval and Google recrawling.

## Evidence sources
- [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies): markup should represent visible, non-misleading content; validation does not guarantee rich results.
- [Google outbound-link guidance](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links): mark paid placements sponsored.
- Bundled Next16.2.10 metadata, JSON-LD, image and sitemap guides; specialist reports under findings/.

## Unavailable evidence
Search Console, GA4, CrUX, Matomo and authenticated backlink tools are not configured. No traffic, rank, backlink-health or AI-visibility conclusions are asserted. No database migration, seed, copy or content edit was performed. Screenshots and crawl are pre-deployment evidence.

## Owner-confirmed indexing workflow
The605 excluded pages in the supplied screenshot are intentional. Noindex is not penalized as a finding; the owner will approve ten pages daily. New regression tests cover that workflow. See SEARCH-CONSOLE.md for the four confirmed legitimate404 paths and sitemap diagnosis.

Comparison transport now also requests a lean backend selector projection and loads phone candidates in100-record pages. Required candidate-fetch failures are no longer silently converted into empty successful selectors. Backend approval/release filters remain unchanged.

## Final validation result
Production webpack build passed with Next16.2.10 and TypeScript.23 frontend SEO tests,5 frontend currency tests,6 backend selector tests and5 backend currency tests passed (39 total); syntax and diff checks passed. Eleven locally rendered routes passed status/metadata/indexing/schema checks. The comparison sample had669 populated selector candidates and640685 decoded HTML bytes, versus3,712,996 live before. The sitemap is now a prerendered ISR route, rather than an uncached dynamic route. Results validate local code, not a deployed revision.

## Regression prevention
Frontend Docker builds now require the SEO and currency test suites before the production build. Backend Docker builds require selector and currency tests. Deployment already builds both images before replacing Mobile Rates services, so a failing test prevents replacement. No claim of bug-free software or guaranteed indexing is made.
