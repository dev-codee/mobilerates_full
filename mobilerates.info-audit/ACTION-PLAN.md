# Prioritized action plan

| Priority | Action | Dependency | Failure check | Leading indicator |
|---|---|---|---|---|
| High | Deploy the tested code to Mobile Rates only | Production deployment connection (requested; no SSH host configured locally) | Public HTML still shows literal JSX/Verified defaults or old generic entity | Deployed revision and rendered metadata |
| High | Verify model numbers, specs, sources and price provenance for each product | Manufacturer/retailer evidence and editorial review; shared DB authorization for edits | Title/model/source disagree or prices cannot be substantiated | Fraction of reviewed products with verifiable citations |
| High | Approve indexing only for genuinely reviewed useful pages | Previous editorial step | noindex/sitemap disagreement or unreviewed records exposed | Approved product count and Search Console valid indexed pages |
| Medium | Validate comparison payload and add/remove selection after deployment | Lean selector patch deployed | Candidate list missing, selected prices/specs differ, HTML still oversized | Comparison response bytes and selector completion |
| Medium | Connect Search Console and CWV measurement | Owner access/API quota | Missing index/field data persists | Coverage, chosen canonicals, 75th percentile LCP/INP/CLS |
| Medium | Measure ads under real inventory | Representative ads and browser/field traces | Insertion/removal still shifts visible content | CLS attributable to ad placements |
| Medium | Develop original sourced buying guidance and verify information/contact pages | Real business/editorial facts | Generic or inaccurate content remains | Useful published articles and sourced factual claims |
| Low | Review optional security/embedding headers | Production proxy requirements | Required integrations break | Header checks and browser errors |

Implemented local items and validation are documented in FULL-AUDIT-REPORT.md. No unmeasured ranking, traffic or rich-result improvement is promised. A PDF version can be generated with the installed SEO report workflow if desired.
