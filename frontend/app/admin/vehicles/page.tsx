"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Trash2, Pencil, Copy, Search } from 'lucide-react';
import Cookies from 'js-cookie';

const CATEGORIES = ['', 'Car', 'Bike', 'Scooter', 'Cycle', 'Rickshaw'];

export default function VehiclesListPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => { fetchVehicles(currentPage, searchQuery, category); }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, category]);

  const fetchVehicles = async (page = 1, search = '', cat = '') => {
    setIsLoading(true);
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles?page=${page}&limit=20&search=${encodeURIComponent(search)}&category=${encodeURIComponent(cat)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setVehicles(data.data.vehicles || data.data);
        if (data.data.totalPages) setTotalPages(data.data.totalPages);
      } else if (res.status === 401) {
        Cookies.remove('admin_token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
    } finally {
      setIsLoading(false);
    }
  };

  const token = Cookies.get('admin_token');
  let role = '';
  if (token) { try { role = JSON.parse(atob(token.split('.')[1])).role; } catch (e) {} }
  const canApprove = ['SUPER_ADMIN', 'MODERATOR'].includes(role);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/${id}/approve`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${Cookies.get('admin_token')}` }
      });
      if (res.ok) { notify("Vehicle approved successfully.", "success"); fetchVehicles(currentPage, searchQuery, category); }
      else notify(`Failed to approve: ${(await res.json()).message}`);
    } catch (error) { console.error(error); notify("Unable to complete this action. Check your connection and try again.", "error"); }
  };
  const handleReject = async (id: string) => {
    const note = prompt("Enter rejection reason/note:");
    if (note === null) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Cookies.get('admin_token')}` },
        body: JSON.stringify({ note })
      });
      if (res.ok) { notify("Vehicle rejected successfully.", "success"); fetchVehicles(currentPage, searchQuery, category); }
      else notify(`Failed to reject: ${(await res.json()).message}`);
    } catch (error) { console.error(error); notify("Unable to complete this action. Check your connection and try again.", "error"); }
  };
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${Cookies.get('admin_token')}` }
      });
      if (res.ok) { notify("Vehicle deleted successfully.", "success"); setVehicles(prev => prev.filter(v => v._id !== id)); }
      else notify(`Failed to delete: ${(await res.json()).message}`);
    } catch (error) {
      console.error('Failed to delete vehicle', error);
      notify('An error occurred while deleting the EV');
    }
  };
  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">All EVs</h2>
          <p className="mt-1 text-xs text-gray-500">Manage electric vehicles (cars, bikes, cycles) here.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select value={category} onChange={e => { setCategory(e.target.value); setCurrentPage(1); }} className="py-2 px-3 border border-gray-300 rounded-md text-xs">
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input type="text" placeholder="Search EVs..." value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-64" />
          </div>
          <Link href="/admin/vehicles/new" className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-semibold whitespace-nowrap">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add EV
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading EVs...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 mb-4">No EVs found.</p>
          <Link href="/admin/vehicles/new" className="text-indigo-600 font-medium hover:underline">Add your first EV</Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((v) => (
                <tr key={v._id} className="group hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
                        {v.images && v.images.length > 0 ? (
                          <img src={v.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (<span className="text-gray-400 text-xs">No img</span>)}
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className="text-xs font-medium text-gray-900">{v.name}</div>
                        <div className="text-xs text-gray-500">{v.model_name || 'N/A'}{v.variant_name ? ` · ${v.variant_name}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">{v.brand_slug}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">{v.ev_category || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500 capitalize">{(v.status || '').replace('_', ' ')}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      v.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      v.approvalStatus === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
                      v.approvalStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{v.approvalStatus || 'DRAFT'}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-xs font-medium sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)]">
                    <div className="flex justify-end space-x-2">
                      {canApprove && v.approvalStatus !== 'APPROVED' && (
                        <>
                          <button onClick={() => handleApprove(v._id)} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded text-xs cursor-pointer">Approve</button>
                          {v.approvalStatus !== 'REJECTED' && (
                            <button onClick={() => handleReject(v._id)} className="text-rose-600 hover:text-rose-900 bg-rose-50 px-2 py-1 rounded text-xs cursor-pointer">Reject</button>
                          )}
                        </>
                      )}
                      <Link href={`/admin/vehicles/${v._id}`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md inline-flex items-center" title="Edit EV">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/vehicles/new?clone=${v._id}`} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-md inline-flex items-center" title="Clone EV">
                        <Copy className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(v._id, v.name)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md inline-flex items-center" title="Delete EV">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-700">Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span></p>
              <div className="flex space-x-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 text-xs rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 text-xs rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
