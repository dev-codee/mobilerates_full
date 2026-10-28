import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const result = ts.transpileModule(source, { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true });
  assert.equal(result.diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, file);
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputText)((name) => {
    if (name in mocks) return mocks[name];
    if (name === 'react/jsx-runtime') return require(name);
    throw Error(`Unexpected dependency ${name}`);
  }, module, module.exports);
  return module.exports;
}
const seo = load('app/lib/seo.ts');
const schema = load('app/lib/schema.ts', { './seo': seo });
const indexing = load('app/lib/indexing.ts');
const editorial = load('app/lib/editorial.ts');
const sparse = { name: 'Example Phone', slug: 'example-phone', brand_slug: 'example', price_pkr: 12345 };
const withRetailers = { ...sparse, prices: [{ retailer_name: 'Example', price_pkr: 12000, product_url: 'https://example.com/phone' }] };

test('reference prices and invalid retailer records do not invent offers or ratings', () => {
  assert.equal(schema.generateProductSchema(sparse).offers, undefined);
  assert.equal(schema.generateProductSchema(sparse).aggregateRating, undefined);
  for (const price of [0, -1, NaN, Infinity]) {
    assert.equal(schema.generateProductSchema({ ...withRetailers, prices: [{ ...withRetailers.prices[0], price_pkr: price }] }).offers, undefined);
  }
  assert.equal(schema.generateProductSchema({ ...withRetailers, prices: [{ ...withRetailers.prices[0], product_url: 'javascript:alert(1)' }] }).offers, undefined);
});
test('actual retailers retain their prices and only recorded stock status', () => {
  const offer = schema.generateProductSchema(withRetailers).offers;
  assert.equal(offer.price, 12000);
  assert.equal(offer.priceCurrency, 'PKR');
  assert.equal(offer.availability, undefined);
  const out = { ...withRetailers, prices: [{ ...withRetailers.prices[0], stock_status: 'out_of_stock' }] };
  assert.equal(schema.generateProductSchema(out).offers.availability, 'https://schema.org/OutOfStock');
  const multiple = { ...withRetailers, prices: [...withRetailers.prices, { retailer_name: 'Other', price_pkr: 15000, product_url: 'https://example.org/phone' }] };
  assert.equal(schema.generateProductSchema(multiple).offers.lowPrice, 12000);
  assert.equal(schema.generateProductSchema(multiple).offers.highPrice, 15000);
});
test('entity identity is consistent and JSON-LD cannot close its script', () => {
  assert.equal(schema.generateWebSiteSchema().name, 'Mobile Rates');
  assert.equal(schema.generateOrganizationSchema()['@id'], 'https://mobilerates.info/#organization');
  assert.equal(schema.generateWebPageSchema('Example', 'Description', '/example').isPartOf['@id'], schema.generateWebSiteSchema()['@id']);
  const payload = { name: '</script><script>alert(1)</script>' };
  assert.ok(!schema.serializeJsonLd(payload).includes('<'));
  assert.deepEqual(JSON.parse(schema.serializeJsonLd(payload)), payload);
});
const specValues = load('app/lib/spec-value.ts');
const PhoneSpecs = load('app/components/PhoneSpecs.tsx', { '@/app/lib/spec-value': specValues, './AppIcon': { default: () => null }, './SubmitBenchmarkWrapper': { default: () => null } }).default;
const specs = { performance: { chipset: 'Snapdragon 8', ram_options_gb: [8] } };
const renderSpecs = (details) => renderToStaticMarkup(React.createElement(PhoneSpecs, { specs, phone: { ...sparse, specs, ...details } }));
test('sparse products do not gain inferred RAM, verification, or update claims', () => {
  const html = renderSpecs({ release_date: '2026-01-01' });
  for (const claim of ['LPDDR4X', 'LPDDR5X', 'Verified', 'Recently Updated', 'Official Manufacturer', 'January 1, 2026']) assert.ok(!html.includes(claim), claim);
});
test('stored sources and reviewer attribution render without unsafe links', () => {
  const html = renderSpecs({ sources: [{ source_name: 'Manufacturer', source_url: 'https://example.com/specs' }], reviewer: { name: 'Real Editor' }, updatedAt: '2026-10-27T00:00:00Z' });
  assert.ok(html.includes('href="https://example.com/specs"'));
  assert.ok(html.includes('Real Editor'));
  assert.match(html, /datetime="2026-10-27T00:00:00.000Z"/i);
  assert.ok(!renderSpecs({ sources: [{ source_name: 'Bad source', source_url: 'javascript:alert(1)' }] }).includes('href="javascript:'));
  assert.ok(renderSpecs({ sources: [{ name: 'Legacy source', url: 'https://example.org/specs' }] }).includes('href="https://example.org/specs"'));
});
test('share metadata has the route description and a social image fallback', () => {
  const metadata = seo.cleanMetadata({ title: 'Example phone', description: 'Details for this phone', openGraph: { title: 'Example phone', description: 'Details for this phone', url: 'https://mobilerates.info/example-phone' } });
  assert.equal(metadata.twitter.title, 'Example phone');
  assert.equal(metadata.twitter.description, 'Details for this phone');
  assert.ok(metadata.openGraph.images.length > 0);
  assert.ok(metadata.twitter.images.length > 0);
});
test('pagination stays discoverable while filters and invalid pages stay nonindexable', () => {
  assert.equal(indexing.listingIndexing('/phones', { page: '2' }).canonical, 'https://mobilerates.info/phones?page=2');
  assert.equal(indexing.listingIndexing('/phones', { page: '2' }).robots.index, true);
  assert.equal(indexing.listingIndexing('/phones', { max_price: '15000' }).robots.index, false);
  assert.equal(indexing.listingIndexing('/brands/samsung', { brand: 'samsung' }, true).robots.index, true);
  for (const page of ['0', '-1', '1.5', 'abc', ['2']]) assert.equal(indexing.isValidListingPage({ page }), false);
  assert.equal(indexing.isValidListingPage({ page: '3' }, 2), false);
  assert.equal(editorial.isIndexableArticle({ status: 'PUBLISHED', slug: 'heeh' }), false);
  assert.equal(editorial.isIndexableArticle({ status: 'PUBLISHED', slug: 'valid', seo: { is_indexable: false } }), false);
});
