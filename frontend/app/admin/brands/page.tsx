"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Pencil, Search, X, Upload } from 'lucide-react';
import Cookies from 'js-cookie';

interface BrandRow {
  _id: string;
  name: string;
  slug: string;
  type: 'phone' | 'ev';
  logo?: string;
  description?: string;
  phone_count: number;
  vehicle_count: number;
}

const TYPE_TABS: { key: string; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'phone', label: 'Mobiles' },
  { key: 'ev', label: 'EVs' },
];

const emptyForm = { _id: '', name: '', type: 'ev' as 'phone' | 'ev', logo: '', description: '' };

export default function BrandsAdminPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${apiUrl}/admin/brands?type=${typeFilter}&search=${encodeURIComponent(search)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) setBrands(data.data);
      else if (res.status === 401) { Cookies.remove('admin_token'); router.push('/login'); }
    } catch (e) {
      console.error('Failed to fetch brands', e);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, typeFilter, search, router]);

  useEffect(() => {
    const timer = setTimeout(fetchBrands, 400);
    return () => clearTimeout(timer);
  }, [fetchBrands]);

  const openAdd = () => { setForm(emptyForm); setShowModal(true); };
  const openEdit = (b: BrandRow) => {
    setForm({ _id: b._id, name: b.name, type: b.type || 'phone', logo: b.logo || '', description: b.description || '' });
    setShowModal(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const token = Cookies.get('admin_token');
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${apiUrl}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.data?.url) setForm(f => ({ ...f, logo: data.data.url }));
      else notify('Logo upload failed: ' + (data.message || 'Unknown error'));
    } catch (err) {
      console.error(err);
      notify('Logo upload failed');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { notify('Brand name is required'); return; }
    setIsSaving(true);
    try {
      const token = Cookies.get('admin_token');
      const isEdit = !!form._id;
      const res = await fetch(`${apiUrl}/admin/brands${isEdit ? `/${form._id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: form.name.trim(), type: form.type, logo: form.logo, description: form.description }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchBrands();
      } else {
        notify(`Failed to save brand: ${data.message}`);
      }
    } catch (e) {
      console.error(e);
      notify('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (b: BrandRow) => {
    if (!window.confirm(`Delete brand "${b.name}"?`)) return;
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${apiUrl}/admin/brands/${b._id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setBrands(prev => prev.filter(x => x._id !== b._id));
      else notify(data.message || 'Failed to delete brand');
    } catch (e) {
      console.error(e);
      notify('An error occurred while deleting the brand');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Brands</h2>
          <p className="mt-1 text-xs text-gray-500">Manage manufacturer brands for Mobiles and EVs.</p>
        </div>
        <button onClick={openAdd} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-semibold">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Brand
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          {TYPE_TABS.map(t => (
            <button key={t.key} onClick={() => setTypeFilter(t.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold ${typeFilter === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input type="text" placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-xs focus:ring-indigo-500 focus:border-indigo-500 w-64" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading brands...</div>
      ) : brands.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 mb-4">No brands found.</p>
          <button onClick={openAdd} className="text-indigo-600 font-medium hover:underline">Add your first brand</button>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {brands.map(b => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
                        {b.logo ? <img src={b.logo} alt="" className="h-full w-full object-contain" /> : <span className="text-gray-400 text-xs">No logo</span>}
                      </div>
                      <div className="ml-4 text-xs font-medium text-gray-900">{b.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{b.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.type === 'ev' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {b.type === 'ev' ? 'EV' : 'Mobile'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {b.type === 'ev' ? `${b.vehicle_count} EV(s)` : `${b.phone_count} phone(s)`}
                    {b.type === 'ev' && b.phone_count > 0 ? ` · ${b.phone_count} phone(s)` : ''}
                    {b.type !== 'ev' && b.vehicle_count > 0 ? ` · ${b.vehicle_count} EV(s)` : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openEdit(b)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md inline-flex items-center" title="Edit brand">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(b)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md inline-flex items-center" title="Delete brand">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{form._id ? 'Edit Brand' : 'Add Brand'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Brand Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="e.g. BYD" />
                {form._id && <p className="text-[10px] text-gray-400 mt-1">The URL slug stays fixed to avoid orphaning existing products.</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'phone' | 'ev' }))} className="w-full px-3 py-2 border rounded-md text-sm">
                  <option value="ev">EV (cars, bikes, cycles)</option>
                  <option value="phone">Mobile</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Logo</label>
                <div className="flex items-center space-x-3">
                  <div className="h-14 w-14 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
                    {form.logo ? <img src={form.logo} alt="" className="h-full w-full object-contain" /> : <span className="text-gray-400 text-[10px]">None</span>}
                  </div>
                  <label className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-xs font-medium cursor-pointer hover:bg-gray-200">
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload logo'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                  </label>
                  {form.logo && <button onClick={() => setForm(f => ({ ...f, logo: '' }))} className="text-xs text-red-600 hover:underline">Remove</button>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description (optional)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-sm" rows={3} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 text-xs font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
