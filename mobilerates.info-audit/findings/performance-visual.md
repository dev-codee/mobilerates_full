# Performance, visual, and image audit

Audited 2026-10-28 against public https://mobilerates.info and local source. Follow-up implementation was delegated for AdSlot and card/carousel controls; no production records were directly edited.

## Evidence and coverage

- Installed Claude SEO runtime doctor: Python/browser ready. Its mobile renderer returned HTTP 200, server-rendered content and a complete accessibility tree.
- Homepage desktop (1440 × 1000) and mobile (390 × 844) screenshots: `screenshots/home-desktop.png`, `screenshots/home-mobile.png`.
- Browser measurements: `visual-measurements.json`. Homepage has no horizontal overflow at either width. One H1, top 185px mobile / 234px desktop, and primary search visible above fold.
- 50 homepage image elements: zero missing alt attributes/text and zero broken completed images in the sampled render. Deferred offscreen images are not counted as broken.
- Homepage document encoded body: 131,415 bytes; decoded body: 906,459 bytes. Both sampled responses HTTP 200. DOMContentLoaded varied 18,016.7ms mobile / 2,242.6ms desktop on this audit host; these are uncontrolled navigation samples, **not Core Web Vitals or a mobile-vs-desktop benchmark**.
- PageSpeed mobile API returned quota/rate-limit error. No Lighthouse score, LCP, INP, CLS, or CrUX field data was obtained. Performance score remains unmeasured. Render time must not be represented as LCP.
- Skill screenshot and visual tools timed out awaiting network idle. Their default false flags are invalid results. Screenshots above were obtained with the installed Playwright runtime and DOM-ready navigation instead.

## Findings and fixes

### Medium: article cover bypasses image optimization

`frontend/app/news/[slug]/page.tsx:129` uses a Next Image with `unoptimized` and default lazy loading. Its aspect-video wrapper correctly reserves space. For approved remote hosts, enable optimization and eager/preload only where the cover is a likely initial-viewport LCP candidate; preserve support for legitimate external image hosts rather than breaking arbitrary editorial URLs. Verify responsive srcset, successful optimized response, and image quality after deployment. Indicator: image transfer bytes and article lab LCP.

### Medium: advertising containers can shift layout

`frontend/app/components/AdSlot.tsx` renders natural-height raw images without an aspect-ratio; loading skeleton assumes 4:3 but final images do not. Homepage passes `showSkeleton=false`, so future active ads insert new content after fetch. Reserve matching dimensions for known creative ratios and avoid removing occupied above-fold space. This is a source-level risk, not a measured CLS failure. Test with active ad fixtures of different sizes and with no ads. Indicator: observed layout-shift entries/CLS after an ad loads.

### Medium: sponsored links lack sponsored relationship

AdSlot's external paid-ad links have `noopener noreferrer` but omit `sponsored`. Add `rel="sponsored noopener noreferrer"` (nofollow is also an available qualifier). Verify rendered advertising anchors retain the relationship. No dependency on database changes.

### Medium: card options are undersized and inert

`frontend/app/components/PhoneCard.tsx:215` renders a More options button directly inside a specs list, with no event handler. Eight sampled homepage buttons measure 18 × 24px. Remove this inert element; it implies an action that does not exist. If genuine options are implemented later, use an adequate hit target and valid list structure. Verify product cards remain keyboard-navigable and click through normally.

### Low: carousel targets could be easier to tap

BrandsSection and FeaturedComparisons arrow buttons measure 30 × 30px. Enlarge hit areas to roughly 44 × 44px without covering neighboring content; test touch and keyboard interaction. Mobile menu target is 38 × 41px; primary search is 340 × 44px and usable.

### Low: downstream competitor images do not defer loading

`frontend/app/[slug]/page.tsx:549` uses raw competitor images without loading=lazy or decoding=async. Wrapper aspect ratio prevents basic layout collapse. Use responsive Next Image for approved hosts, or add native lazy loading and async decoding. Verify competitors remain visible on scroll.

### Investigate before changing: large HTML payload

Homepage emits ~906KB decoded HTML; compressed transfer is ~131KB. Root config enables inline CSS; server-to-client props may also contribute. Determine attribution before removing inline CSS or changing data shapes. Leading indicator: compressed HTML and server component payload size. This audit does not prove inline CSS is the cause or that changing it improves LCP.

## Non-errors and remaining limits

- Browser 404s on `/api/ads/placements/TOP_HEADER` and `/api/ads/placements/BOTTOM_PAGE` occur on ad API requests, not page links. The root agent is changing empty-ad responses to 200 with `data: []`; verify after deployment.
- `/api/auth/me` 401 is expected for an anonymous visitor, not an indexing failure.
- Local variable font uses display swap, product cards use responsive image sizes, primary galleries reserve image space, image config supports AVIF/WebP, and informational hero content renders without waiting for client-only data.
- Only homepage was visually measured. Product, brand, comparison, and news image behavior was inspected in source. No site-wide missing-alt count, image-byte savings, field CWV, interaction latency or accessibility conformance claim is made.

## Implemented follow-up

- Read installed Next 16.2.10 `use-client` and `link` guides from the isolated build dependency directory before edits.
- AdSlot now marks paid links sponsored, reserves a stable 4:3 creative area, retains the complete creative with object-contain, and sets explicit dimensions/async decoding. Different creative aspect ratios may show letterboxing. Initial asynchronous insertion and removal of an empty skeleton remain potential CLS sources; fixing these completely requires server-provided ad inventory or permanent empty reserved space.
- Removed the nonfunctional More options button from PhoneCard.
- Enlarged BrandsSection and FeaturedComparisons arrow boxes from 32px CSS to 44px CSS.
- Build/type validation is performed centrally by the root agent. Screenshots and browser counts in this report are the pre-deployment public baseline, not proof of deployed fixes.

## Additional high-impact payload fix

The root audit identified ~3.71MB HTML on a phone comparison query page. Full product inventories were passed across the server/client boundary solely to populate selectors. Added `comparison-options.ts` to project candidates to id, slug, name, brand, and first-image URL. Both phone and vehicle client selectors use these lean options; selected records keep their complete specs and currency pricing, and selection still navigates to server routes that fetch full selected products. Applied server-side projections to both canonical comparison routes; root applies the equivalent projections in the two query/tool pages.

`tests/comparison-options.test.mjs` verifies substantial fixture payload reduction without source mutation, preserved selected specs/pricing, missing-thumbnail behavior, and phone/vehicle selection URLs for one, two, three and zero selections. The isolated test run passed. Production payload reduction must be measured after deployment; no invented byte savings are claimed.
