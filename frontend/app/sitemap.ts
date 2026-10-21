import { isIndexableArticle } from "./lib/editorial";
import type { MetadataRoute } from 'next';
import { getPhones, getEarbuds, getVehicles, getBrands, getApiBaseUrl } from './lib/api';

export const revalidate = 3600;
const SITE = 'https://mobilerates.info';
const BATCH_SIZE = 200;

type RecordForSitemap = { slug: string; brand_slug?: string; seo?: { is_indexable?: boolean }; updatedAt?: string; updated_at?: string };

function entry(path: string, record?: RecordForSitemap): MetadataRoute.Sitemap[number] {
  const value = record?.updatedAt || record?.updated_at;
  const modified = value ? new Date(value) : undefined;
  return {
    url: `${SITE}${path}`,
    ...(modified && Number.isFinite(modified.getTime()) ? { lastModified: modified } : {}),
  };
}

async function allProducts(fetchPage: (page: number) => Promise<{ records: RecordForSitemap[]; pages: number }>) {
  const records: RecordForSitemap[] = [];
  let pages = 1;
  for (let page = 1; page <= pages; page++) {
    const result = await fetchPage(page);
    if (!Number.isInteger(result.pages) || result.pages < 0) throw new Error('Invalid sitemap pagination');
    if (result.pages > 0 && !result.records.length) throw new Error('Incomplete sitemap product response');
    pages = result.pages;
    records.push(...result.records);
  }
  return records;
}

async function publishedCollection(endpoint: string) {
  const res = await fetch(`${getApiBaseUrl()}/${endpoint}?status=PUBLISHED`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Sitemap ${endpoint} failed: ${res.status}`);
  const json = await res.json();
  const records = Array.isArray(json) ? json : json.data;
  if (!Array.isArray(records)) throw new Error(`Invalid sitemap ${endpoint} response`);
  return records.filter(record => record.status === 'PUBLISHED' && record.seo?.is_indexable !== false);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [phones, earbuds, vehicles, brands, pages, publishedBlogs] = await Promise.all([
    Promise.all(['', '&status=upcoming'].map(status => allProducts(async page => {
      const result = await getPhones(`limit=${BATCH_SIZE}&page=${page}${status}`);
      return { records: result.phones, pages: result.pagination.totalPages };
    }))).then(groups => [...new Map(groups.flat().map(record => [record.slug, record])).values()]),
    Promise.all(['', '&status=upcoming'].map(status => allProducts(async page => {
      const result = await getEarbuds(`limit=${BATCH_SIZE}&page=${page}${status}`);
      return { records: result.earbuds, pages: result.pagination.totalPages };
    }))).then(groups => [...new Map(groups.flat().map(record => [record.slug, record])).values()]),
    allProducts(async page => {
      const result = await getVehicles(`limit=${BATCH_SIZE}&page=${page}`);
      if (!result) throw new Error('Missing sitemap vehicle response');
      return { records: result.data, pages: result.totalPages };
    }),
    getBrands('phone'), publishedCollection('pages'), publishedCollection('blogs'),
  ]);
  const blogs = publishedBlogs.filter(isIndexableArticle);
  const routes = ['/', '/phones', '/earbuds', '/vehicles', '/brands'].map(path => entry(path));
  if (blogs.length) routes.push(entry('/news'));
  const products = [...phones, ...earbuds, ...vehicles];
  const seen = new Set<string>();
  for (const product of products) {
    if (seen.has(product.slug)) throw new Error(`Product slug collision: ${product.slug}`);
    seen.add(product.slug);
    if (product.seo?.is_indexable === true) routes.push(entry(`/${product.slug}`, product));
  }
  routes.push(...brands.filter(brand => phones.some(phone => phone.brand_slug === brand.slug && phone.seo?.is_indexable === true)).map(brand => entry(`/brands/${brand.slug}`)));
  routes.push(...pages.map(page => entry(`/pages/${page.slug}`, page)), ...blogs.map(blog => entry(`/news/${blog.slug}`, blog)));
  const unique = [...new Map(routes.map(route => [route.url, route])).values()];
  if (unique.length > 50000) throw new Error('Sitemap requires splitting before exceeding 50,000 URLs');
  return unique;
}
