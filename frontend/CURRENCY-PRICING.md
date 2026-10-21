# USD and local-currency pricing

USD is the primary product price, rounded to whole dollars for display only. Stored prices and conversion/filter calculations retain their precision. The visitor's selected local currency appears underneath, unless it is already USD. A saved manual choice takes priority over IP country; unknown countries fall back to USD.

## Managing prices

In **Admin → Phones / Earbuds / EVs → Add or Edit → Basic**, use:

- **Global reference price (USD)** for the sourced USD amount. It is optional for existing products. Clearing it removes the explicit reference.
- **USD price source** for the manufacturer/retailer source URL or attribution.
- The existing **PKR headline price** and retailer price rows for real Pakistan prices. These remain separate from the USD reference.

For a Pakistani visitor, an existing PKR price is displayed beneath USD. Otherwise the USD reference is converted to PKR. For a product with only PKR data, the USD amount is calculated from that original PKR price. Legacy EV `pricing.price_global_base_usd` remains a fallback when there is no top-level USD reference. No catalogue prices are bulk rewritten.

The `≈` marker identifies a conversion, and its tooltip shows the original amount and rate date. Other countries currently receive converted estimates; changing currency does not imply that a Pakistani retailer ships to that country. Editorial text and structured retailer offers retain their source currency.

## Deployment

1. Deploy the backend currency routes/models before the frontend. Keep `NEXT_PUBLIC_API_URL` pointing at the backend `/api` base.
2. With Cloudflare, enable IP Geolocation and pass `CF-IPCountry` to Next.js. With Vercel, its country header is selected automatically. For another ingress, set `GEOIP_COUNTRY_HEADER` to the trusted country-code header it supplies. The ingress must overwrite this header, and direct public origin access should be restricted. If no country header is available, automatic mode looks up the visitor's IP directly from their browser through `https://api.country.is/`, with a four-second timeout. Only the two-letter country is cached in a first-party cookie for one hour; the returned IP is not stored. Header detection takes precedence over the cached country. Manual currency choices skip the fallback. Country is used only for a display preference, never permissions.
3. The backend fetches the public USD rates from ExchangeRate-API daily on demand and persists the last valid snapshot in MongoDB (`exchangeratesnapshots`). No API key is required. Attribution is included in the footer.
4. Failed refreshes retain the last valid snapshot for at most seven days. Beyond that, the original currencies remain visible; cross-currency filtering returns a temporary error rather than incorrect results. Refresh retries are throttled for 15 minutes.

`/currency-context` on Next.js is private/no-store because it detects the visitor's country and saved preference. Product responses carry original data. Listing requests explicitly include `display_currency`, so backend caches distinguish budget semantics. Next.js listing pages read the display cookie and are dynamic. Static product pages use the shared client provider; no visitor's local currency is embedded into a shared cached page.

## Sorting, filters and history

- Price sorting and comparison winners use the primary USD-equivalent price.
- Budget inputs use the selected local currency. Existing URL `min_price`/`max_price` values retain PKR-equivalent units for old links. The backend tests the selected local price against that budget before pagination.
- Historical PKR prices all use the same current rate snapshot when shown in USD/local currency. Percentage changes remain based on the original history, so FX movement is not presented as product price movement.
- Supported country mappings are in `app/lib/currency.ts`. Unsupported countries default to USD, and users can choose a supported currency manually.

## Verification

Run `npm run test:currency`, `npx tsc --noEmit`, and `npm run build -- --webpack` in the frontend. Run `npm run test:currency` in the backend.

The browser regression uses isolated fixture data and never writes to the production API:

1. `node tests/fixtures/currency-api.mjs`
2. `NEXT_PUBLIC_API_URL=http://127.0.0.1:5107/api npm run dev -- --port 3107`
3. `node tests/currency.browser.mjs` with Playwright installed. If using an existing installation, set `PLAYWRIGHT_MODULE_PATH` to its `index.mjs`; optionally set `CHROMIUM_EXECUTABLE_PATH`.

It covers automatic Pakistan detection, USD + PKR display, AED conversion, saved selection, USD budget conversion, the three product types, comparisons, mobile overflow, and admin save/reopen/clear payloads. Admin persistence is mocked in the browser test; backend model tests validate the saved fields separately.
