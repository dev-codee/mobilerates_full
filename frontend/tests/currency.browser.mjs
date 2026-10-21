const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH});
const context = await browser.newContext({viewport:{width:1440,height:1000}});
await context.route(/https:\/\/(www\.googletagmanager|www\.google-analytics|googleads|accounts\.google)/,route=>route.abort());
let countryLookups = 0;
await context.route('https://api.country.is/', route => {
  countryLookups++;
  return route.fulfill({ json: { country: 'PK' } });
});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto('http://localhost:3107/phones',{waitUntil:'networkidle'});
  await page.getByRole('combobox',{name:'Local currency'}).waitFor();
  await page.waitForFunction(()=>document.querySelector('select[aria-label="Local currency"]')?.textContent.includes('Auto (PKR)'));
  const prices=page.locator('[data-price-currency="USD"]');
  await prices.first().waitFor();
  assert.match(await prices.first().innerText(),/USD\s*500(?:\n|$)/);
  assert.match(await prices.first().innerText(),/PKR\s*155,000(?:\.00)?/);
  assert.equal(countryLookups, 1, 'Missing-country header must trigger visitor IP lookup');
  await page.reload({waitUntil:'networkidle'});
  await page.locator('select[data-currency-ready="true"]').waitFor();
  await page.waitForFunction(()=>document.querySelector('select[aria-label="Local currency"]')?.textContent.includes('Auto (PKR)'));
  assert.equal(countryLookups, 1, 'Cached country should prevent repeat lookups');
  assert.match(await prices.first().innerText(), /PKR\s*155,000/);
  await page.getByRole('combobox',{name:'Local currency'}).selectOption('AED');
  await page.waitForFunction(()=>document.body.innerText.includes('AED 1,835.00')||document.body.innerText.includes('AED 1,835.00'));
  assert.match(await prices.first().innerText(),/≈ AED\s*1,835\.00/);
  await page.reload({waitUntil:'networkidle'});
  await page.locator('select[data-currency-ready="true"]').waitFor();
  assert.equal(await page.getByRole('combobox',{name:'Local currency'}).inputValue(),'AED');
  await page.getByRole('combobox',{name:'Local currency'}).selectOption('USD');
  await context.clearCookies({name:'detected_country'});
  await page.reload({waitUntil:'networkidle'});
  await page.locator('select[data-currency-ready="true"]').waitFor();
  await page.waitForFunction(()=>document.querySelector('select[aria-label="Local currency"]')?.value === 'USD');
  assert.equal(countryLookups, 1, 'A manual USD preference must skip IP detection');
  assert.equal(await page.getByRole('combobox',{name:'Local currency'}).inputValue(), 'USD');
  const max=page.getByRole('spinbutton',{name:'Maximum price in USD'}).first();
  await max.fill('500');
  await page.getByRole('button',{name:'Apply Price'}).first().click();
  await page.waitForURL(/max_price=140000/);
  assert.match(page.url(),/max_price=140000/);
  await page.getByRole('combobox',{name:'Local currency'}).selectOption('auto');
  await page.waitForFunction(()=>document.querySelector('select[aria-label="Local currency"]')?.textContent.includes('Auto (PKR)'));
  for (const path of ['/earbuds','/vehicles','/currency-test-phone','/currency-test-earbud','/currency-test-vehicle','/compare?slugs=currency-test-phone,currency-test-phone-2']) {
    await page.goto('http://localhost:3107'+path,{waitUntil:'networkidle'});
    assert.ok((await page.locator('[data-price-currency="USD"]').count())>0,`USD missing on ${path}`);
    if (path === '/currency-test-phone') {
      assert.equal(await page.getByText('Source:', {exact:false}).count(), 0);
      const approximation = page.getByLabel('Approximately').first();
      await approximation.waitFor();
      const size = await approximation.evaluate(el => ({ marker: parseFloat(getComputedStyle(el).fontSize), price: parseFloat(getComputedStyle(el.parentElement).fontSize) }));
      assert.ok(size.marker < size.price && size.marker <= 14, 'Approximation marker should be smaller than its price');
    }
    console.log('Verified',path);
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://localhost:3107/phones',{waitUntil:'networkidle'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1),'Mobile overflow');
  await page.screenshot({path:'/tmp/zozo-currency-mobile.png',fullPage:true});
  const headerContext = await browser.newContext({extraHTTPHeaders:{'cf-ipcountry':'AE'}});
  let unexpectedLookups = 0;
  await headerContext.route('https://api.country.is/', route => { unexpectedLookups++; return route.abort(); });
  const headerPage = await headerContext.newPage();
  await headerPage.goto('http://localhost:3107/phones', {waitUntil:'networkidle'});
  await headerPage.waitForFunction(()=>document.querySelector('select[aria-label="Local currency"]')?.textContent.includes('Auto (AED)'));
  assert.match(await headerPage.locator('[data-price-currency="USD"]').first().innerText(), /AED\s*1,835/);
  assert.equal(unexpectedLookups, 0, 'Country header must bypass the fallback');
  await headerContext.close();
  const unavailableContext = await browser.newContext();
  await unavailableContext.route('https://api.country.is/', route => route.abort());
  const unavailablePage = await unavailableContext.newPage();
  await unavailablePage.goto('http://localhost:3107/phones', {waitUntil:'networkidle'});
  assert.match(await unavailablePage.locator('[data-price-currency="USD"]').first().innerText(), /USD\s*500$/);
  await unavailableContext.close();
  console.log('Missing-header lookup, country cache, manual override, header detection and lookup failure verified');
  await context.addCookies([{name:'admin_token',value:'eyJhbGciOiJub25lIn0.eyJyb2xlIjoiU1VQRVJfQURNSU4ifQ.test',domain:'localhost',path:'/'}]);
  await context.addInitScript(()=>localStorage.setItem('admin_user',JSON.stringify({name:'Test Admin',role:'SUPER_ADMIN'})));
  await page.setViewportSize({width:1440,height:1000});
  for(const type of ['phones','earbuds','vehicles']) {
    const slug = type === 'phones' ? 'currency-test-phone' : type === 'earbuds' ? 'currency-test-earbud' : 'currency-test-vehicle';
    const raw = await (await context.request.get(`http://127.0.0.1:5107/api/${type}/${slug}`)).json();
    let saved = { ...(raw.data.vehicle || raw.data), price_usd: 500, price_usd_source: 'https://example.com/original' };
    let writes = 0;
    await page.route(`**/api/admin/${type}/test-id`, async route => {
      if (['PUT','PATCH'].includes(route.request().method())) { saved = { ...saved, ...route.request().postDataJSON() }; writes++; }
      await route.fulfill({json:{success:true,data:saved},headers:{'access-control-allow-origin':'*'}});
    });
    await page.goto(`http://localhost:3107/admin/${type}/test-id`,{waitUntil:'networkidle'});
    const field=page.getByRole('spinbutton',{name:/Global reference price/});
    await field.waitFor(); assert.equal(await field.inputValue(),'500'); await field.fill('499.99');
    await page.getByRole('textbox',{name:'USD price source'}).fill('https://example.com/official-price');
    await page.getByRole('button',{name:type==='phones'?'Save Phone':type==='earbuds'?'Save Earbuds':'Save EV',exact:true}).click();
    await page.waitForTimeout(500);
    assert.equal(writes,1,`Save request missing: ${type}`);
    assert.equal(saved.price_usd,499.99);
    assert.equal(saved.price_usd_source,'https://example.com/official-price');
    assert.equal(Number(saved.price_pkr),155000);
    await page.goto(`http://localhost:3107/admin/${type}/test-id`,{waitUntil:'networkidle'});
    assert.equal(await field.inputValue(),'499.99');
    await field.fill(''); await page.getByRole('textbox',{name:'USD price source'}).fill('');
    await page.getByRole('button',{name:type==='phones'?'Save Phone':type==='earbuds'?'Save Earbuds':'Save EV',exact:true}).click();
    await page.waitForTimeout(500);
    assert.equal(writes,2);
    assert.equal(saved.price_usd,null);
    assert.equal(saved.price_usd_source,'');
    console.log('Admin save, reopen and clear verified',type);
  }
  assert.deepEqual(errors, [], 'Unexpected browser errors');
  console.log('Currency browser checks passed');
} finally { await browser.close(); }
