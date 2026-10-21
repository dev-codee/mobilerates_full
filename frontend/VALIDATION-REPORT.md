# Sitemap validation — 14 October 2026

Live sitemap: https://mobilerates.info/sitemap.xml
Deployed commit: `ea754d9`.

## Result

Reduced from **140 to 9 URLs**. The sitemap now contains the homepage, phones, earbuds, vehicles, brands, About, Contact, Terms and Privacy.

Removed automatic unverified brand entries, comparison tools, the HTML sitemap, and the imported `heeh` sample news article. Product URLs require explicit indexing approval; a brand is included when it has at least one indexable phone. Published, non-sample news can enter the sitemap when available.

## Verified live

- Valid XML namespace and no duplicate URLs.
- All nine URLs return HTTP 200 without redirects.
- All nine have matching canonical URLs and no noindex directives.
- robots.txt references the new-domain sitemap.
- The sample article and an unverified brand page render noindex metadata.
- Production Docker build, TypeScript and scoped lint passed.
- Other applications retained their original running containers.

Google Search Console index status was not queried. Removing an entry from a sitemap alone does not remove it from Google's index.
