"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Activity, Check, X, Eye, ImageIcon } from 'lucide-react';

interface Benchmark {
  _id: string;
  device_name: string;
  processor: string;
  status: string;
  screenshot_url: string;
  submitted_by: { name: string; email: string } | null;
  createdAt: string;
  benchmarks: any;
  user_info: any;
}

export default function AdminBenchmarksPage() {
  const router = useRouter();
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedBenchmark, setSelectedBenchmark] = useState<Benchmark | null>(null);

  useEffect(() => {
    fetchBenchmarks(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const fetchBenchmarks = async (page: number = 1, status: string = '') => {
    setIsLoading(true);
    const token = Cookies.get('admin_token');
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/benchmarks/admin?page=${page}&limit=20`;
      if (status) url += `&status=${status}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setBenchmarks(data.data.benchmarks);
        if (data.data.totalPages) {
          setTotalPages(data.data.totalPages);
        }
      } else if (res.status === 401) {
        Cookies.remove('admin_token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch benchmarks', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/benchmarks/admin/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBenchmarks(benchmarks.map(b => b._id === id ? { ...b, status: newStatus } : b));
        if (selectedBenchmark?._id === id) {
          setSelectedBenchmark({ ...selectedBenchmark, status: newStatus });
        }
      } else {
        notify('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="mr-2 h-6 w-6 text-indigo-600" />
            User Benchmarks
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve benchmark submissions from users.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device / Processor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : benchmarks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No benchmarks found.
                  </td>
                </tr>
              ) : (
                benchmarks.map((benchmark) => (
                  <tr key={benchmark._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{benchmark.device_name}</div>
                      <div className="text-sm text-gray-500">{benchmark.processor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{benchmark.submitted_by?.name || benchmark.user_info?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{benchmark.submitted_by?.email || 'Guest'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(benchmark.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${benchmark.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          benchmark.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {benchmark.status.charAt(0).toUpperCase() + benchmark.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setSelectedBenchmark(benchmark)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {benchmark.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(benchmark._id, 'approved')}
                              className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(benchmark._id, 'rejected')}
                              className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBenchmark && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">Benchmark Details</h3>
              <button onClick={() => setSelectedBenchmark(null)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Info Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Device Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Device:</span> <span className="font-medium">{selectedBenchmark.device_name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Processor:</span> <span className="font-medium">{selectedBenchmark.processor}</span></div>
                    {selectedBenchmark.user_info?.memory_config && (
                      <div className="flex justify-between"><span className="text-gray-500">Memory:</span> <span className="font-medium">{selectedBenchmark.user_info.memory_config}</span></div>
                    )}
                    {selectedBenchmark.user_info?.android_version && (
                      <div className="flex justify-between"><span className="text-gray-500">OS:</span> <span className="font-medium">{selectedBenchmark.user_info.android_version}</span></div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">User Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedBenchmark.submitted_by?.name || selectedBenchmark.user_info?.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedBenchmark.submitted_by?.email || 'N/A'}</span></div>
                    {selectedBenchmark.user_info?.comment && (
                      <div className="mt-3">
                        <span className="text-gray-500 block mb-1">Comment:</span>
                        <p className="text-sm text-gray-700 italic bg-white p-3 rounded border border-gray-200">"{selectedBenchmark.user_info.comment}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Benchmark Scores</h4>
                  <div className="space-y-4">
                    {selectedBenchmark.benchmarks?.antutu?.total && (
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                        <div className="font-bold text-orange-800 mb-2">AnTuTu</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Total: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.antutu.total.toLocaleString()}</span></div>
                          <div className="text-gray-600">CPU: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.antutu.cpu?.toLocaleString()}</span></div>
                          <div className="text-gray-600">GPU: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.antutu.gpu?.toLocaleString()}</span></div>
                          <div className="text-gray-600">UX: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.antutu.ux?.toLocaleString()}</span></div>
                        </div>
                      </div>
                    )}
                    
                    {(selectedBenchmark.benchmarks?.geekbench?.single_core || selectedBenchmark.benchmarks?.geekbench?.multi_core) && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                        <div className="font-bold text-blue-800 mb-2">Geekbench</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Single-Core: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.geekbench.single_core?.toLocaleString()}</span></div>
                          <div className="text-gray-600">Multi-Core: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.geekbench.multi_core?.toLocaleString()}</span></div>
                          {selectedBenchmark.benchmarks.geekbench.compute && (
                            <div className="text-gray-600 col-span-2">Compute: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.geekbench.compute.toLocaleString()}</span></div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedBenchmark.benchmarks?.throttle?.stability && (
                      <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                        <div className="font-bold text-green-800 mb-2">CPU Throttling</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600 col-span-2">Stability: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.throttle.stability}%</span></div>
                          <div className="text-gray-600">Max GIPS: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.throttle.gips_max}</span></div>
                          <div className="text-gray-600">Avg GIPS: <span className="font-semibold text-gray-900">{selectedBenchmark.benchmarks.throttle.gips_avg}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Column */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Screenshot Evidence
                </h4>
                <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center min-h-[400px]">
                  {selectedBenchmark.screenshot_url ? (
                    <img 
                      src={selectedBenchmark.screenshot_url} 
                      alt="Benchmark Evidence" 
                      className="max-w-full h-auto object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">No screenshot provided</span>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  {selectedBenchmark.status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(selectedBenchmark._id, 'approved')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Approve Submission
                    </button>
                  )}
                  {selectedBenchmark.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(selectedBenchmark._id, 'rejected')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Reject Submission
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
