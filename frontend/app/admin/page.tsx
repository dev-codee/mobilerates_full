import { cookies } from 'next/headers';
import Link from 'next/link';
import { Smartphone, Car, Headphones } from 'lucide-react';

async function getStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return { totalPhones: 0, totalVehicles: 0, totalEarbuds: 0 };
    const data = await res.json();
    return data.data || { totalPhones: 0, totalVehicles: 0, totalEarbuds: 0 };
  } catch (e) {
    return { totalPhones: 0, totalVehicles: 0, totalEarbuds: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="p-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/phones" className="block group">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 p-5 hover:border-indigo-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Mobiles</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{stats.totalPhones ?? 0}</dd>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/vehicles" className="block group">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 p-5 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Electric Vehicles</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{stats.totalVehicles ?? 0}</dd>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/earbuds" className="block group">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 p-5 hover:border-amber-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Wireless Earbuds</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{stats.totalEarbuds ?? 0}</dd>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Headphones className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
