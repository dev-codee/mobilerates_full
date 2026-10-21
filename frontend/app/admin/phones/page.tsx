"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Trash2, Pencil, Copy, Search } from 'lucide-react';
import Cookies from 'js-cookie';

export default function PhonesListPage() {
  const router = useRouter();
  const [phones, setPhones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPhones(currentPage, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const fetchPhones = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones?page=${page}&limit=20&search=${encodeURIComponent(search)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setPhones(data.data.phones || data.data);
        if (data.data.totalPages) {
          setTotalPages(data.data.totalPages);
        }
      } else if (res.status === 401) {
        Cookies.remove('admin_token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch phones', error);
    } finally {
      setIsLoading(false);
    }
  };

  const token = Cookies.get('admin_token');
  let role = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role;
    } catch (e) {}
  }
  const canApprove = ['SUPER_ADMIN', 'MODERATOR'].includes(role);

  const handleApprove = async (id: string) => {
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        notify("Phone approved successfully.", "success");
        fetchPhones(currentPage, searchQuery);
      } else {
        const error = await res.json();
        notify(`Failed to approve: ${error.message}`);
      }
    } catch (error) {
      console.error(error);
      notify("Unable to complete this action. Check your connection and try again.", "error");
    }
  };
  const handleReject = async (id: string) => {
    const note = prompt("Enter rejection reason/note:");
    if (note === null) return;
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${id}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        notify("Phone rejected successfully.", "success");
        fetchPhones(currentPage, searchQuery);
      } else {
        const error = await res.json();
        notify(`Failed to reject: ${error.message}`);
      }
    } catch (error) {
      console.error(error);
      notify("Unable to complete this action. Check your connection and try again.", "error");
    }
  };
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        notify("Phone deleted successfully.", "success");
        setPhones(prev => prev.filter(p => p._id !== id));
      } else {
        const error = await res.json();
        notify(`Failed to delete: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete phone', error);
      notify('An error occurred while deleting the phone');
    }
  };
  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">All Mobiles</h2>
          <p className="mt-1 text-xs text-gray-500">Manage all your phones here.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search mobiles..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-xs focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-64"
            />
          </div>
          <Link 
            href="/admin/phones/new" 
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Mobile
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading phones...</div>
      ) : phones.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 mb-4">No phones found.</p>
          <Link href="/admin/phones/new" className="text-indigo-600 font-medium hover:underline">
            Add your first phone
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {phones.map((phone) => (
                <tr key={phone._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200">
                        {phone.images && phone.images.length > 0 ? (
                          <img src={phone.images[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-xs">No img</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-xs font-medium text-gray-900">{phone.name}</div>
                        <div className="text-xs text-gray-500">{phone.model_number || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                      {phone.brand_slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 capitalize">
                    {phone.status.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      phone.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      phone.approvalStatus === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800' :
                      phone.approvalStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {phone.approvalStatus || 'DRAFT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {phone.createdBy?.name || 'Super Admin'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex justify-end space-x-2">
                      {canApprove && phone.approvalStatus !== 'APPROVED' && (
                        <>
                          <button 
                            onClick={() => handleApprove(phone._id)}
                            className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded text-xs cursor-pointer"
                            title="Approve Mobile"
                          >
                            Approve
                          </button>
                          {phone.approvalStatus !== 'REJECTED' && (
                            <button 
                              onClick={() => handleReject(phone._id)}
                              className="text-rose-600 hover:text-rose-900 bg-rose-50 px-2 py-1 rounded text-xs cursor-pointer"
                              title="Reject Mobile"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      )}
                      <Link 
                        href={`/admin/phones/${phone._id}`}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md transition-colors inline-flex items-center"
                        title="Edit Mobile"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/admin/phones/new?clone=${phone._id}`}
                        className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-md transition-colors inline-flex items-center"
                        title="Clone Mobile"
                      >
                        <Copy className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(phone._id, phone.name)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors inline-flex items-center"
                        title="Delete Mobile"
                      >
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
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {(() => {
                      const getPages = () => {
                        if (totalPages <= 7) {
                          return Array.from({ length: totalPages }, (_, i) => i + 1);
                        }
                        if (currentPage <= 4) {
                          return [1, 2, 3, 4, 5, '...', totalPages];
                        }
                        if (currentPage >= totalPages - 3) {
                          return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                        }
                        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                      };
                      return getPages().map((page, idx) => {
                        if (page === '...') {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-xs font-medium ${
                              currentPage === page
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      });
                    })()}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
