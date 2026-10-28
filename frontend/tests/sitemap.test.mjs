import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const SITE = 'https://mobilerates.info';
const compile = (path) => ts.transpileModule(
  readFileSync(new URL(path, import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;
const sitemapCode = compile('../app/sitemap.ts');
const editorialCode = compile('../app/lib/editorial.ts');

function evaluate(code, dependencies = {}, globals = {}) {
  const module = { exports: {} };
  runInNewContext(code, {
    module, exports: module.exports,
    require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    ...globals,
  });
  return module.exports;
}

function fixture({ phones = [], upcomingPhones = [], earbuds = [], upcomingEarbuds = [], vehicles = [], brands = [], pages = [], blogs = [], apiOverrides = {}, fetchOverride } = {}) {
  const calls = [];
  function list(kind, query, records, upcoming = []) {
    const params = new URLSearchParams(query);
    const source = params.get('status') === 'upcoming' ? upcoming : records;
    const page = Number(params.get('page') || 1);
    const limit = Number(params.get('limit') || 200);
    calls.push({ kind, page, status: params.get('status') });
    return {
      records: source.slice((page - 1) * limit, page * limit),
      totalPages: Math.ceil(source.length / limit),
    };
  }
  const api = {
    getPhones: async (query) => {
      const result = list('phones', query, phones, upcomingPhones);
      return { phones: result.records, pagination: { totalPages: result.totalPages } };
    },
    getEarbuds: async (query) => {
      const result = list('earbuds', query, earbuds, upcomingEarbuds);
      return { earbuds: result.records, pagination: { totalPages: result.totalPages } };
    },
    getVehicles: async (query) => {
      const result = list('vehicles', query, vehicles);
      return { data: result.records, totalPages: result.totalPages };
    },
    getBrands: async () => brands,
    getApiBaseUrl: () => 'https://sitemap-fixture.invalid/api',
    ...apiOverrides,
  };
  const fetch = fetchOverride || (async (url) => ({
    ok: true,
    json: async () => new URL(url).pathname.endsWith('/pages') ? pages : blogs,
  }));
  const { default: sitemap } = evaluate(sitemapCode, {
    './lib/api': api,
    './lib/editorial': evaluate(editorialCode),
  }, { fetch, AbortSignal });
  return { sitemap, calls };
}

const product = (slug, isIndexable) => ({ slug, seo: { is_indexable: isIndexable } });
const urls = async (sitemap) => (await sitemap()).map((entry) => entry.url);

test('product sitemap requires explicit editorial approval for every product type', async () => {
  const records = (kind) => [
    product(`${kind}-approved`, true),
    product(`${kind}-held`, false),
    product(`${kind}-unset`, undefined),
    { slug: `${kind}-no-seo` },
  ];
  const { sitemap } = fixture({ phones: records('phone'), earbuds: records('earbud'), vehicles: records('vehicle') });
  const result = await urls(sitemap);
  for (const kind of ['phone', 'earbud', 'vehicle']) {
    assert.ok(result.includes(`${SITE}/${kind}-approved`));
    for (const suffix of ['held', 'unset', 'no-seo']) assert.ok(!result.includes(`${SITE}/${kind}-${suffix}`));
  }
});

test('daily approval of ten products only adds those ten and revoked approval removes the URL', async () => {
  const phones = Array.from({ length: 30 }, (_, i) => product(`phone-${i + 1}`, false));
  const { sitemap } = fixture({ phones });
  const productUrls = async () => (await urls(sitemap)).filter((url) => /\/phone-\d+$/.test(url));
  assert.equal((await productUrls()).length, 0);
  for (const phone of phones.slice(0, 10)) phone.seo.is_indexable = true;
  assert.equal((await productUrls()).length, 10);
  for (const phone of phones.slice(10, 20)) phone.seo.is_indexable = true;
  const dayTwo = await productUrls();
  assert.equal(dayTwo.length, 20);
  assert.ok(!dayTwo.includes(`${SITE}/phone-21`));
  phones[0].seo.is_indexable = false;
  const revoked = await productUrls();
  assert.equal(revoked.length, 19);
  assert.ok(!revoked.includes(`${SITE}/phone-1`));
});

test('sitemap traverses all product pages and includes records beyond the first batch', async () => {
  const phones = Array.from({ length: 405 }, (_, i) => product(`phone-${i}`, true));
  const { sitemap, calls } = fixture({ phones });
  const result = await urls(sitemap);
  assert.equal(result.filter((url) => /\/phone-\d+$/.test(url)).length, 405);
  assert.ok(result.includes(`${SITE}/phone-404`));
  assert.deepEqual(calls.filter((call) => call.kind === 'phones' && !call.status).map((call) => call.page), [1, 2, 3]);
  assert.equal(new Set(result).size, result.length);
});

test('noindexed, unpublished and placeholder CMS content is excluded', async () => {
  const records = [
    { slug: 'published', status: 'PUBLISHED' },
    { slug: 'approved', status: 'PUBLISHED', seo: { is_indexable: true } },
    { slug: 'held', status: 'PUBLISHED', seo: { is_indexable: false } },
    { slug: 'draft', status: 'DRAFT', seo: { is_indexable: true } },
  ];
  const { sitemap } = fixture({ pages: records, blogs: [...records, { slug: 'heeh', status: 'PUBLISHED' }] });
  const result = await urls(sitemap);
  for (const prefix of ['pages', 'news']) {
    assert.ok(result.includes(`${SITE}/${prefix}/published`));
    assert.ok(result.includes(`${SITE}/${prefix}/approved`));
    assert.ok(!result.includes(`${SITE}/${prefix}/held`));
    assert.ok(!result.includes(`${SITE}/${prefix}/draft`));
  }
  assert.ok(!result.includes(`${SITE}/news/heeh`));
  assert.ok(result.includes(`${SITE}/news`));
  const empty = fixture({ blogs: [{ slug: 'held', status: 'PUBLISHED', seo: { is_indexable: false } }] });
  assert.ok(!(await urls(empty.sitemap)).includes(`${SITE}/news`));
});

test('upcoming approved products remain listed while upcoming-only brands remain excluded', async () => {
  const { sitemap } = fixture({
    phones: [{ ...product('released-model', true), brand_slug: 'released-brand' }],
    upcomingPhones: [{ ...product('upcoming-model', true), brand_slug: 'upcoming-brand' }],
    upcomingEarbuds: [product('upcoming-earbuds', true)],
    brands: [{ slug: 'released-brand' }, { slug: 'upcoming-brand' }],
  });
  const result = await urls(sitemap);
  for (const path of ['/released-model', '/upcoming-model', '/upcoming-earbuds', '/brands/released-brand']) assert.ok(result.includes(`${SITE}${path}`));
  assert.ok(!result.includes(`${SITE}/brands/upcoming-brand`));
});

test('backend failures reject generation instead of publishing a partial sitemap', async (t) => {
  await t.test('product API rejection', async () => {
    const { sitemap } = fixture({ apiOverrides: { getPhones: async () => { throw new Error('Product API unavailable'); } } });
    await assert.rejects(sitemap(), /Product API unavailable/);
  });
  await t.test('missing vehicle response', async () => {
    const { sitemap } = fixture({ apiOverrides: { getVehicles: async () => null } });
    await assert.rejects(sitemap(), /Missing sitemap vehicle response/);
  });
  await t.test('pagination claims records that were not delivered', async () => {
    const { sitemap } = fixture({ apiOverrides: { getPhones: async () => ({ phones: [], pagination: { totalPages: 2 } }) } });
    await assert.rejects(sitemap(), /Incomplete sitemap product response/);
  });
  await t.test('CMS non-success response', async () => {
    const { sitemap } = fixture({ fetchOverride: async () => ({ ok: false, status: 503 }) });
    await assert.rejects(sitemap(), /Sitemap .* failed: 503/);
  });
  await t.test('malformed CMS response', async () => {
    const { sitemap } = fixture({ fetchOverride: async () => ({ ok: true, json: async () => ({ message: 'Unavailable' }) }) });
    await assert.rejects(sitemap(), /Invalid sitemap .* response/);
  });
});

test('vehicle data is cacheable so the sitemap can retain last successful XML', async () => {
  let options;
  const { sitemap } = fixture({ apiOverrides: { getVehicles: async (_query, init) => {
    options = init;
    return { data: [], totalPages: 0 };
  } } });
  await sitemap();
  assert.equal(options.cache, 'force-cache');
  assert.equal(options.next.revalidate, 300);
});
