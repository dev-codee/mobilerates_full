import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const compiled = ts.transpileModule(readFileSync(new URL('../app/lib/comparison-options.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { toComparisonOption, comparisonHref } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('selector payload omits heavy data without mutating full selected records', () => {
  const full = {
    _id: 'p1', slug: 'sample-phone', name: 'Sample Phone', brand_slug: 'sample',
    images: [{ url: 'https://example.com/front.webp', cloud_public_id: 'internal' }, { url: 'https://example.com/back.webp' }],
    description: 'Detailed review. '.repeat(2000), specs: { display: { type: 'OLED' } },
    price_usd: 500, price_pkr: 150000, prices: [{ price_pkr: 145000 }], pricing: { price_global_base_usd: 499 },
  };
  const before = JSON.stringify(full);
  const option = toComparisonOption(full);
  assert.deepEqual(option, { _id: 'p1', slug: 'sample-phone', name: 'Sample Phone', brand_slug: 'sample', imageUrl: 'https://example.com/front.webp' });
  assert.ok(JSON.stringify(option).length < before.length / 20);
  assert.equal(JSON.stringify(full), before);
  assert.equal(full.specs.display.type, 'OLED');
  assert.equal(full.prices[0].price_pkr, 145000);
});

test('phone and vehicle selection retain slots and server-fetch URLs', () => {
  const first = { slug: 'first' };
  const option = toComparisonOption({ _id: '2', slug: 'second', name: 'Second' });
  assert.equal(option.brand_slug, '');
  assert.equal(option.imageUrl, undefined);
  assert.equal(comparisonHref('phone', [first, option, null]), '/compare/first-vs-second');
  assert.equal(comparisonHref('vehicle', [first, null, option]), '/vehicles/compare/first-vs-second');
  assert.equal(comparisonHref('phone', [null, option, null]), '/compare?phone=second');
  assert.equal(comparisonHref('vehicle', [first, option, { slug: 'third' }]), '/vehicles/compare?vehicle=first&vehicle=second&vehicle=third');
  assert.equal(comparisonHref('phone', [null, null]), '/compare?');
});

async function loadCatalog(getPhones) {
  const code = ts.transpileModule(readFileSync(new URL('../app/lib/comparison-catalog.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)((name) => {
    if (name === 'react') return { cache: (fn) => fn };
    if (name === './api') return { getPhones };
    throw new Error(name);
  }, module, module.exports);
  return module.exports.getComparisonPhoneCatalog;
}
test('comparison catalog retains all candidates across bounded API pages', async () => {
  const records = Array.from({ length: 250 }, (_, i) => ({ slug: `phone-${i}` }));
  const catalog = await loadCatalog(async (query) => {
    const params = new URLSearchParams(query);
    assert.equal(params.get('view'), 'selector');
    assert.equal(params.get('limit'), '100');
    const offset = (Number(params.get('page')) - 1) * 100;
    return { phones: records.slice(offset, offset + 100), pagination: { totalPages: 3 } };
  });
  assert.deepEqual((await catalog()).phones, records);
});
test('comparison catalog rejects incomplete responses rather than losing candidates silently', async () => {
  const catalog = await loadCatalog(async (query) => ({ phones: query.includes('page=1') ? [{ slug: 'first' }] : [], pagination: { totalPages: 2 } }));
  await assert.rejects(catalog(), /Incomplete comparison catalog/);
});
