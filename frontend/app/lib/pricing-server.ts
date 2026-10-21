import 'server-only';
import { cookies } from 'next/headers';
import { validCurrency } from './currency';
export async function displayCurrency() {
  const value = (await cookies()).get('display_currency')?.value;
  return validCurrency(value) ? value : 'USD';
}
