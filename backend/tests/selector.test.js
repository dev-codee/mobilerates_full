import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Execute each real service with a mocked pricing/model boundary. No database,
// environment files, network requests, or production writes are involved.
function service(kind) {
    const modelName = kind === 'phone' ? 'Phone' : 'Vehicle';
    const method = `getAll${modelName}s`;
    const source = readFileSync(new URL(`../src/services/${kind}.service.js`, import.meta.url), 'utf8')
        .replace(/^import .*;\r?\n/gm, '')
        .replace(/^export const /gm, 'const ');
    const calls = [];
    const sample = { _id: 'sample-id', name: 'Sample', slug: 'sample', brand_slug: 'brand', images: [{ url: 'https://example.com/one.webp' }, { url: 'https://example.com/two.webp' }], description: 'Large description', specs: { performance: { chipset: 'Chip' } }, prices: [{ price_pkr: 100 }], price_pkr: 100 };
    const model = {};
    const pricedList = async (receivedModel, filter, projection, sort, skip, limit, query) => {
        assert.equal(receivedModel, model);
        calls.push({ filter, projection, sort, skip, limit, query });
        const item = Object.fromEntries(Object.entries(sample).filter(([field]) => field === '_id' || field in projection));
        if (projection.images?.$slice) item.images = sample.images.slice(0, projection.images.$slice);
        return { total: 5, items: [item] };
    };
    const getAll = new Function('pricedList', modelName, `${source}\nreturn ${method};`)(pricedList, model);
    return { getAll, calls };
}

for (const kind of ['phone', 'vehicle']) {
    test(`${kind} selector returns only identity and one image with the same pagination`, async () => {
        const { getAll, calls } = service(kind);
        const result = await getAll({ view: 'selector', limit: '2', page: '2' });
        const call = calls[0];
        assert.equal(call.filter.approvalStatus, 'APPROVED');
        assert.deepEqual(Object.keys(call.projection).sort(), ['_id', 'brand_slug', 'images', 'name', 'slug']);
        assert.equal(call.skip, 2);
        assert.equal(call.limit, 2);
        assert.equal(call.sort._id, 1);
        const item = (result.phones || result.data)[0];
        assert.deepEqual(Object.keys(item).sort(), ['_id', 'brand_slug', 'images', 'name', 'slug']);
        assert.equal(item.images.length, 1);
        assert.equal(item.description, undefined);
        assert.equal(item.specs, undefined);
        assert.equal(item.prices, undefined);
        const pagination = result.pagination || result;
        assert.equal(pagination.page, 2);
        assert.equal(pagination.total, 5);
        assert.equal(pagination.totalPages, 3);
    });
    test(`${kind} omitted or unknown view retains existing catalog projection`, async () => {
        const { getAll, calls } = service(kind);
        await getAll({});
        await getAll({ view: 'not-selector' });
        assert.deepEqual(calls[0].projection, calls[1].projection);
        assert.equal(calls[0].projection.description, 1);
        assert.equal(calls[0].projection.prices, 1);
        assert.ok(Object.keys(calls[0].projection).some(key => key.startsWith('specs.')));
        assert.equal(calls[0].projection['seo.is_indexable'], 1);
    });
}

test('phone selector preserves approval, released/upcoming split and requested filters', async () => {
    const { getAll, calls } = service('phone');
    const before = Date.now();
    await getAll({ view: 'selector', brand: 'samsung,apple', min_price: '10', max_price: '100', ram: '8', status: 'available' });
    const released = calls[0].filter;
    assert.equal(released.approvalStatus, 'APPROVED');
    assert.equal(released.status, 'available');
    assert.deepEqual(released.brand_slug, { $in: ['samsung', 'apple'] });
    assert.deepEqual(released.price_pkr, { $gte: 10, $lte: 100 });
    assert.deepEqual(released['specs.performance.ram_options_gb'], { $in: [8] });
    assert.ok(released.release_date.$not.$gt instanceof Date);
    assert.ok(released.release_date.$not.$gt.getTime() >= before);
    await getAll({ view: 'selector', status: 'upcoming' });
    assert.equal(calls[1].filter.approvalStatus, 'APPROVED');
    assert.ok(calls[1].filter.release_date.$gt instanceof Date);
    assert.equal(calls[1].filter.release_date.$not, undefined);
});

test('vehicle selector preserves approval and existing explicit status/category filters', async () => {
    const { getAll, calls } = service('vehicle');
    await getAll({ view: 'selector', status: 'available', brand: 'tesla', category: 'Car', min_price: '10', sort: 'newest' });
    const { filter, sort } = calls[0];
    assert.equal(filter.approvalStatus, 'APPROVED');
    assert.ok(filter.status.test('AVAILABLE'));
    assert.ok(filter.brand_slug.$in[0].test('TESLA'));
    assert.ok(filter.$or[0].ev_category.$in[0].test('Car'));
    assert.deepEqual(filter.price_pkr, { $gte: 10 });
    assert.deepEqual(sort, { release_date: -1, _id: 1 });
    // Vehicles have no implicit release-date exclusion today; selector mode
    // does not silently introduce a different catalog eligibility policy.
    assert.equal(filter.release_date, undefined);
});
