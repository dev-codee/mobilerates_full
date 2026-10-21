"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Trash2, Pencil, Copy, Search, ExternalLink, CheckCircle, XCircle, Headphones, Volume2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function EarbudsListPage() {
  const router = useRouter();
  const [earbuds, setEarbuds] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch earbud brands for filter dropdown
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands?category=earbud`);
        const data = await res.json();
        if (res.ok && data.data) {
          setBrands(data.data);
        }
      } catch (err) {
        console.error("Failed to load earbud brands", err);
      }
    };
    fetchBrands();
  }, []);

  // Fetch earbuds list
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEarbuds(currentPage, searchQuery, selectedBrand, selectedStatus);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, selectedBrand, selectedStatus]);

  const fetchEarbuds = async (page = 1, search = '', brand = '', status = '') => {
    setIsLoading(true);
    const token = Cookies.get('admin_token');
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/earbuds?page=${page}&limit=20`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (brand) url += `&brand=${encodeURIComponent(brand)}`;
      if (status) url += `&approvalStatus=${encodeURIComponent(status)}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setEarbuds(data.data.earbuds || data.data);
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.totalPages || 1);
          setTotalCount(data.data.pagination.total || 0);
        } else if (data.data.totalPages) {
          setTotalPages(data.data.totalPages);
          setTotalCount(data.data.total || 0);
        }
      } else if (res.status === 401) {
        Cookies.remove('admin_token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch earbuds', error);
    } finally {
      setIsLoading(false);
    }
  };

  const token = Cookies.get('admin_token');
  let role = '';
  if (token) {
    try {
      role = JSON.parse(atob(token.split('.')[1])).role;
    } catch (e) {}
  }
  const canApprove = ['SUPER_ADMIN', 'MODERATOR'].includes(role);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/earbuds/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${Cookies.get('admin_token')}` }
      });
      if (res.ok) {
        notify("Earbud approved successfully.", "success");
        fetchEarbuds(currentPage, searchQuery, selectedBrand, selectedStatus);
      } else {
        notify(`Failed to approve: ${(await res.json()).message}`);
      }
    } catch (error) {
      console.error(error);
      notify("Unable to complete this action. Check your connection and try again.", "error");
    }
  };
  const handleReject = async (id: string) => {
    const note = prompt("Enter rejection reason/note:");
    if (note === null) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/earbuds/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('admin_token')}`
        },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        notify("Earbud rejected successfully.", "success");
        fetchEarbuds(currentPage, searchQuery, selectedBrand, selectedStatus);
      } else {
        notify(`Failed to reject: ${(await res.json()).message}`);
      }
    } catch (error) {
      console.error(error);
      notify("Unable to complete this action. Check your connection and try again.", "error");
    }
  };
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/earbuds/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${Cookies.get('admin_token')}` }
      });
      if (res.ok) {
        notify("Earbud deleted successfully.", "success");
        setEarbuds(prev => prev.filter(e => e._id !== id));
      } else {
        notify(`Failed to delete: ${(await res.json()).message}`);
      }
    } catch (error) {
      console.error('Failed to delete earbud', error);
      notify('An error occurred while deleting the earbud');
    }
  };
  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Headphones className="w-8 h-8 text-amber-500" />
            Wireless Earbuds
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Manage TWS wireless earbuds, specifications, audio features, and pricing ({totalCount} total).
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/earbuds/new"
            className="flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Earbud
          </Link>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, model or brand..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedBrand}
            onChange={e => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
            className="py-1.5 px-3 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Brands</option>
            {brands.map(b => (
              <option key={b._id || b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="py-1.5 px-3 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Approval Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Earbuds Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            Loading earbuds...
          </div>
        ) : earbuds.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No earbuds found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-gray-50/75 text-gray-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Earbud</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Wearing Type</th>
                  <th className="py-3 px-4">ANC & Audio</th>
                  <th className="py-3 px-4">Price (PKR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {earbuds.map(eb => {
                  const primaryImg = eb.images?.find((img: any) => img.is_primary) || eb.images?.[0];
                  const hasAnc = eb.specs?.noise_cancellation?.has_anc;
                  const ancDepth = eb.specs?.noise_cancellation?.anc_depth_db;
                  const driverMm = eb.specs?.audio?.driver_size_mm;

                  return (
                    <tr key={eb._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                            {primaryImg?.url ? (
                              <Image
                                src={primaryImg.url}
                                alt={eb.name}
                                width={40}
                                height={40}
                                className="object-contain w-full h-full p-0.5"
                              />
                            ) : (
                              <Headphones className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/earbuds/${eb._id}`}
                              className="font-bold text-gray-900 hover:text-amber-600 transition-colors"
                            >
                              {eb.name}
                            </Link>
                            <div className="text-[11px] text-gray-400 font-mono">
                              {eb.model_number || eb.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-700 capitalize">
                        {eb.brand_slug?.replace(/-/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {eb.wearing_type || 'In-Ear'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {hasAnc ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              ANC {ancDepth ? `${ancDepth}dB` : ''}
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">
                              Passive
                            </span>
                          )}
                          {driverMm && (
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {driverMm}mm
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {eb.price_pkr ? `Rs. ${Number(eb.price_pkr).toLocaleString()}` : <span className="text-gray-400 font-normal">TBA</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          eb.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          eb.approvalStatus === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          eb.approvalStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {eb.approvalStatus || 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canApprove && eb.approvalStatus === 'PENDING_REVIEW' && (
                            <>
                              <button
                                onClick={() => handleApprove(eb._id)}
                                title="Approve Earbud"
                                className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(eb._id)}
                                title="Reject Earbud"
                                className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/${eb.slug}`}
                            target="_blank"
                            title="View on Website"
                            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/earbuds/new?clone=${eb._id}`}
                            title="Clone/Duplicate"
                            className="p-1 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <Copy className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/earbuds/${eb._id}`}
                            title="Edit"
                            className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(eb._id, eb.name)}
                            title="Delete"
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
