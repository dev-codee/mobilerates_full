import http from 'node:http';
const phone = { _id: '000000000000000000000001', slug: 'currency-test-phone', name: 'Currency Test Phone', brand_slug: 'samsung', price_usd: 500, price_pkr: 155000, status: 'available', release_date: '2025-01-01', images: [], prices: [{ retailer_name: 'Test Retailer', price_pkr: 155000, product_url: 'https://example.com/phone' }], specs: { display: {}, performance: {}, battery: {}, camera: {}, connectivity: {}, extra_specs: {} }, price_history: [{ date: '2025-01-01', price_pkr: 160000 }, { date: '2025-02-01', price_pkr: 155000 }] };
const earbud = { ...phone, slug: 'currency-test-earbud', name: 'Currency Test Earbud', specs: { audio: {}, noise_cancellation: {}, battery: {}, connectivity: {}, physical: {}, controls: {} } };
const vehicle = { ...phone, slug: 'currency-test-vehicle', name: 'Currency Test Vehicle', ev_category: 'Car', specs: { battery: {}, powertrain: {}, range_and_efficiency: {}, charging: {}, dimensions: {} } };
const brands = [{ slug: 'samsung', name: 'Samsung', total_phones: 1 }];
http.createServer((req,res) => {
  res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Content-Type','application/json');
  const url = new URL(req.url,'http://localhost');const p=url.pathname;
  let data=[];
  if(p.endsWith('/currency/rates')) data={base:'USD',rates:{USD:1,PKR:280,AED:3.67,EUR:0.92,JPY:150}, updatedAt:new Date().toISOString(),stale:false};
  else if(p==='/api/home') data={trending:[phone],latest:[phone],brands};
  else if(p==='/api/brands') data=brands;
  else if(p==='/api/phones') data={phones:[phone],pagination:{total:1,page:1,limit:15,totalPages:1}};
  else if(p==='/api/earbuds') data={earbuds:[earbud],total:1,page:1,limit:15,totalPages:1,pagination:{total:1,page:1,limit:15,totalPages:1}};
  else if(p==='/api/vehicles') data={data:[vehicle],total:1,page:1,limit:24,totalPages:1};
  else if(p==='/api/compare') data=[phone,{...phone,_id:'000000000000000000000002',slug:'currency-test-phone-2',name:'Second Test Phone',price_usd:400,price_pkr:170000}];
  else if(p==='/api/search') data=[phone];
  else if(p==='/api/phones/currency-test-phone') data=phone;
  else if(p==='/api/earbuds/currency-test-earbud') data=earbud;
  else if(p==='/api/vehicles/currency-test-vehicle') data={vehicle,variants:[]};
  else if(p.includes('/related')) data={};
  else if(p.includes('/stats')) data={likes:0,dislikes:0};
  else if(p.includes('/reviews/')) data={reviews:[],total:0,page:1,totalPages:1};
  else if(p.includes('/phones/') || p.includes('/earbuds/') || p.includes('/vehicles/')) { res.statusCode=404; data=null; }
  res.end(JSON.stringify({success:res.statusCode===200,data}));
}).listen(5107,'127.0.0.1',()=>console.log('Currency fixture on 5107'));
