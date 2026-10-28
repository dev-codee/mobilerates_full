# Content, schema, and AI accessibility audit

Audit date: 2026-10-28. Evidence: public homepage and `/phones` partial response HTML, complete robots.txt, repository source for all public page templates. Public HTML downloads exceeded 30 seconds; partial responses are sufficient for the specific metadata/JSON-LD findings below but are not a complete crawl or a Core Web Vitals test. No Search Console, backlink, or AI-platform visibility metrics were available to this specialist. Scores, if synthesized, are audit heuristics, not Google's internal measures.

## Priority findings

1. **High: invented specification and verification claims.** `components/PhoneSpecs.tsx` defaults unknown RAM type to LPDDR4X and guesses LPDDR5X from chipset. It renders a Verified badge for every phone, including a fallback team name; a missing source becomes an official-manufacturer claim. Missing updates become 'Recently Updated', and release dates can become update dates. Only display stored specification values, real reviewer/editor attribution, and recorded timestamps. Show actual citation links using backend `source_name`/`source_url`; the frontend currently expects incompatible `name`/`url` properties. Failure check: a sparse product must not gain RAM/verification/source/recency facts. Monitor editorial completeness, not word count.
2. **High: misleading unknown availability.** Phone and vehicle retailer tables render missing `stock_status` as 'In Stock'. Change this to unknown availability. Failure check: a retailer row with no status never claims availability. The JSON-LD already correctly omits unknown availability.
3. **Medium: malformed collection descriptions.** Public `/phones` JSON-LD has the literal description `Explore $<CurrencyText text={title} />`. Equivalent source bugs exist in earbuds and vehicles. Replace with plain natural-language descriptions. Failure check: parsed JSON-LD has no JSX or template tokens.
4. **Medium: generic entity identity.** Public Organization and WebSite names are 'Mobile price comparison website'; article publisher and nested WebPage site name repeat it. Use the visible brand Mobile Rates, stable organization/website IDs, and its existing logo. This does not require appending the brand to page titles. Failure check: homepage WebSite name and visible branding agree. Monitor Google's chosen site name.
5. **Medium: artificial title freshness.** Phone and vehicle metadata append the runtime year to every item, regardless of content updates; earbuds also use runtime year in defaults. Use stable descriptive product titles while preserving editor-supplied title text and model years. Failure check: year rollover does not change unedited page titles.
6. **Medium: unsubstantiated commercial copy.** Earbud metadata calls every reference price 'official'; homepage asserts coverage of 'all top retailers'. Prefer price/specification comparison wording without blanket coverage or official-price claims. Failure check: default copy remains accurate for a product with no retailer data.
7. **Medium: article attribution and update visibility.** Article schema cleans author names with a title-brand-removal helper, potentially deleting organization bylines; publisher lacks real identity. A `dateModified` is emitted but no visible update date appears. Preserve actual bylines, distinguish an organization byline if recognizable, show a real update date when later than publication, and use content-derived description fallback. Never invent authors, credentials, tests, or sources.
8. **Needs editorial owner: first-hand content and trust pages.** Product specs/comparisons provide useful intent-matched data, but code cannot establish hands-on expertise or prove CMS claims. The fetched homepage exposes only `/pages/terms` as a CMS footer link. Verify About, contact/correction channel, privacy, methodology, and editorial author information against actual business practices before publishing any new claims. Do not fabricate these details or alter production CMS records without scope authorization.

## What works

- Product and collection data are present in initial HTML; schema uses escaped JSON-LD serialization.
- Ratings are included only for positive counts and bounded numerical averages; unknown video dates suppress VideoObject rather than inventing dates.
- Product canonical URLs are consistent root-level slugs; content approval/noindex controls are explicit.
- Related product and comparison links support discovery. News has publication timestamps and recorded bylines when present.
- Public robots.txt's wildcard rule allows Googlebot, OAI-SearchBot, Claude-SearchBot, PerplexityBot, and Applebot on public content. This is permission to crawl, not proof of indexing or citation. Training bot policies are separate and were not changed.
- No `llms.txt` finding should be assigned a Google ranking penalty. Platform citation visibility was not measured.
- FAQPage currently present on vehicle details is not itself a defect; no new Google rich-result benefit is promised.

## Primary guidance checked

- [Google site-name guidance](https://developers.google.com/search/docs/appearance/site-names): align WebSite identity with the real site name.
- [Google product snippet guidance](https://developers.google.com/search/docs/appearance/structured-data/product-snippet): meaningful, accurate product/offer data; rich-result eligibility is not guaranteed.
- [Google helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): reliable, original, people-first information and clear creator context.

Implementation and verification status will be appended after local changes are checked. Production deployment is a separate verification step.

## Implemented locally and verified

- Removed guessed RAM type, unconditional verification badge, invented official-source defaults, release-date-as-update fallback, and fake recent-update fallback. Stored reviewers/editors remain attributed accurately; actual source URLs now link, supporting both backend and legacy field names, with HTTP(S)-only links.
- Changed missing phone/vehicle retailer status to 'Availability not confirmed'.
- Removed automatic current-year suffixes from product metadata; editor-supplied model/title years remain untouched. Removed official-price and blanket best-price defaults from owned product templates.
- Organization, WebSite, nested WebPage and article publisher now identify Mobile Rates with stable IDs; Organization uses the existing logo. Reference-only products no longer manufacture Offer entries without an actual retailer URL. Such products can retain valid Product information while lacking price-rich-result eligibility.
- Article metadata uses content-derived fallback descriptions. Recorded bylines are preserved, recognizable site-team bylines use Organization rather than Person, real updates are visible, and article hero images are requested eagerly.
- Read version-matched Next 16.2.10 metadata, JSON-LD, server-component and image documentation from the isolated npm install at `/tmp/mobilerates-seo-build/node_modules/next/dist/docs/` before editing (repository mount could not host npm installation).
- `frontend/tests/seo.test.mjs` contains seven passing tests covering offer data, unknown stock, schema identity and script escaping, sparse specifications, safe source links, route share metadata and indexing semantics. Run via `npm run test:seo`. Executed against the final copied source in `/tmp/mobilerates-seo-test` using the installed dependency tree. `git diff --check` passed. Parent workflow performs the integrated build/deployment checks.
- A compressed live product fetch completed for `/samsung-galaxy-s26-ultra`, confirming pre-fix Verified and LPDDR5X output. The stored model identifier exposed as SKU/MPN is `SM-G960F`; its association with this product requires editorial verification. No production records were changed and no claim is made that every CMS fact was independently validated.
