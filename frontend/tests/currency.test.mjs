import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compiled = ts.transpileModule(readFileSync(new URL('../app/lib/currency.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { convert, resolvePrice, countryCurrency, normalizeCountry, validCurrency, formatMoney } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const rates = { USD: 1, PKR: 280, AED: 3.67, JPY: 150, KWD: 0.307 };
test('IP country defaults and supported manual choices', () => {
  assert.equal(countryCurrency('pk'), 'PKR');
  assert.equal(countryCurrency('AE'), 'AED');
  assert.equal(countryCurrency('DE'), 'EUR');
  assert.equal(countryCurrency(null), 'USD');
  assert.equal(countryCurrency('XX'), 'USD');
  assert.equal(validCurrency('<script>'), false);
  assert.equal(normalizeCountry(' pk '), 'PK');
  assert.equal(normalizeCountry('XX'), null);
  assert.equal(normalizeCountry('T1'), null);
  assert.equal(normalizeCountry(null), null);
});
test('preserves a Pakistani price and prefers USD reference abroad', () => {
  const product = { price_usd: 500, price_pkr: 155000 };
  assert.equal(resolvePrice(product, 'PKR', rates).amount, 155000);
  assert.equal(resolvePrice(product, 'PKR', rates).estimated, false);
  assert.equal(resolvePrice(product, 'USD', rates).amount, 500);
  assert.equal(resolvePrice(product, 'AED', rates).amount, 1835);
});
test('USD-only and legacy PKR-only products remain usable', () => {
  assert.equal(resolvePrice({ price_usd: 500 }, 'PKR', rates).amount, 140000);
  assert.equal(resolvePrice({ price_pkr: 140000 }, 'USD', rates).amount, 500);
  assert.equal(resolvePrice({ pricing: { price_global_base_usd: 20000 } }, 'PKR', rates).amount, 5600000);
  assert.equal(resolvePrice({ prices: [{ price_pkr: -1 }, { price_pkr: 28000 }, { price_pkr: 56000 }] }, 'USD', rates).amount, 100);
});
test('missing rates never relabel a source price or invent a value', () => {
  const price = resolvePrice({ price_pkr: 155000 }, 'USD', { USD: 1 });
  assert.equal(price.currency, 'PKR');
  assert.equal(price.amount, 155000);
  assert.equal(price.estimated, false);
  assert.equal(resolvePrice({ price_usd: Infinity, price_pkr: NaN }, 'USD', rates), null);
  assert.equal(resolvePrice({}, 'USD', rates), null);
  assert.equal(convert(100, 'PKR', 'EUR', rates), null);
  assert.equal(convert(-1, 'USD', 'PKR', rates), null);
});
test('budget conversion round trips and currency precision', () => {
  const canonical = convert(500, 'USD', 'PKR', rates);
  assert.equal(canonical, 140000);
  assert.equal(convert(canonical, 'PKR', 'USD', rates), 500);
  assert.match(formatMoney(1234.56, 'JPY'), /1,235/);
  assert.match(formatMoney(1.23456, 'KWD'), /1\.235/);
  assert.match(formatMoney(499.49, 'USD'), /USD\s499$/);
  assert.match(formatMoney(499.5, 'USD'), /USD\s500$/);
  // Display rounding must not change conversion/filtering precision.
  assert.equal(resolvePrice({ price_usd: 499.5 }, 'USD', rates).amount, 499.5);
});
