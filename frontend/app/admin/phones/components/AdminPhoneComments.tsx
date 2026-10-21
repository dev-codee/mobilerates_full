"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface AdminPhoneCommentsProps {
  phoneId: string;
}

export default function AdminPhoneComments({ phoneId }: AdminPhoneCommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ userName: '', comment: '', rating: 5 });

  const fetchComments = async (pageNum = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${phoneId}/reviews?page=${pageNum}&limit=10&search=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setComments(data.data.reviews || []);
        setTotalPages(data.data.totalPages || 1);
        setPage(data.data.currentPage || 1);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phoneId) {
      fetchComments(page, search);
    }
  }, [phoneId, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComments(1, search);
  };

  const handleEdit = (comment: any) => {
    setEditingId(comment._id);
    setEditForm({ userName: comment.userName, comment: comment.comment, rating: comment.rating });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        setEditingId(null);
        fetchComments(page, search);
      } else {
        notify("Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchComments(page, search);
      } else {
        notify("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Manage Comments</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search comments..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-sm min-w-[250px]"
          />
          <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500 text-sm">No comments found.</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex justify-between gap-4">
              {editingId === comment._id ? (
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">User Name</label>
                    <input 
                      type="text" 
                      value={editForm.userName} 
                      onChange={(e) => setEditForm({...editForm, userName: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Rating (1-5)</label>
                    <input 
                      type="number" 
                      min="1" max="5" 
                      value={editForm.rating} 
                      onChange={(e) => setEditForm({...editForm, rating: Number(e.target.value)})}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Comment</label>
                    <textarea 
                      value={editForm.comment} 
                      onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => handleSaveEdit(comment._id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold">Save</button>
                    <button type="button" onClick={handleCancelEdit} className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-xs font-bold">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-amber-500 font-bold mb-2">⭐ {comment.rating} / 5</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => handleEdit(comment)} className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-bold">Edit</button>
                    <button type="button" onClick={() => handleDelete(comment._id)} className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-bold">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-semibold">Page {page} of {totalPages}</span>
              <button 
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
