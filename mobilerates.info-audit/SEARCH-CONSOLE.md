# Search Console findings, 28 October 2026

The owner intentionally keeps products noindex and plans to approve ten per day. Preserve that workflow. The screenshot's605 noindex pages are expected, not a defect; do not remove noindex site-wide or request validation for intentional exclusions.

Four supplied missing URLs were followed through their redirects with a maximum of three hops. All resolve to genuine HTTP404:
- http://www.mobilerates.info/txt/index.php → https://mobilerates.info/txt/index.php
- https://mobilerates.info/us → same path
- http://mobilerates.info/cgi-bin/ → https://mobilerates.info/cgi-bin
- https://mobilerates.info/cgi-bin/ → https://mobilerates.info/cgi-bin

No reference to these paths was found in application/public source or the saved500-URL crawl. The PHP/CGI paths resemble scanner probes, but their discovery source is not known. Unknown paths should continue returning404. A redirect is appropriate only if a real prior page has a relevant replacement; do not redirect everything to the homepage.

Three alternate-canonical and two redirected pages can be legitimate. Four crawled-but-not-indexed pages require exact URLs and URL Inspection evidence; code changes cannot guarantee Google will index them.

## Sitemap fetch failure
The provided Search Console row was dated October14 and said Unknown / Couldn't fetch /0 discovered. Fresh independent normal and Googlebot-user-agent requests on October28 each returned200, application/xml,818 bytes, nine URL entries. A spoofed user-agent check does not verify Google's actual IP/WAF access. The old failure's root cause cannot be established without historical origin/WAF logs or Search Console last-read details.

The code did reveal an avoidable reliability risk: no-store vehicle fetching forced sitemap generation per request. The local patch makes that request cacheable and enables ISR at300 seconds (other60-second data dependencies may shorten effective revalidation). Successful XML can be served during background refresh and retained on failure. Failed generation still throws rather than publishing a partial sitemap. CMS requests have an8-second timeout. Daily approvals appear after successful cache refresh; temporary staleness during outages is intentional. This improves resilience but cannot eliminate DNS/TLS/WAF outages.

After deployment, resubmit the same https://mobilerates.info/sitemap.xml in Search Console and inspect the new Last read/status. Do not create a second sitemap merely to hide the old row. Google must fetch again before the dashboard reflects the current response.

[Google's Page indexing report guidance](https://support.google.com/webmasters/answer/7440203) distinguishes legitimate exclusions/404s from errors and does not promise100% indexing.
