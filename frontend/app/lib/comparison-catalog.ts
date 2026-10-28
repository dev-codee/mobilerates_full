import { cache } from 'react';
import { getPhones } from './api';

// Bound each response so one large catalog cannot exhaust the API timeout.
// view=selector also avoids transferring full specifications from the backend.
export const getComparisonPhoneCatalog = cache(async () => {
  const first = await getPhones('limit=100&page=1&view=selector');
  const pages = first.pagination.totalPages;
  if (!Number.isInteger(pages) || pages < 0) throw new Error('Invalid comparison pagination');
  const phones = [...first.phones];
  for (let page = 2; page <= pages; page++) {
    const result = await getPhones(`limit=100&page=${page}&view=selector`);
    if (!result.phones.length) throw new Error('Incomplete comparison catalog');
    phones.push(...result.phones);
  }
  return { ...first, phones };
});
