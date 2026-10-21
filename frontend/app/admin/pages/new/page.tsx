"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import TipTapEditor from '@/app/components/TipTapEditor';

export default function NewPagePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '', slug: '', body: '', status: 'DRAFT', pageType: 'STANDALONE', placement: 'NONE', parentPage: ''
  });
  const [parentPages, setParentPages] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/admin`, { headers: { Authorization: `Bearer ${Cookies.get("admin_token")}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParentPages(data.filter((p: any) => p.pageType === 'PARENT'));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('admin_token');
    try {
      const payload = { ...formData };
      if (!payload.parentPage) {
        delete (payload as any).parentPage;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) { notify("Page saved successfully.", "success"); router.push('/admin/pages'); }
      else {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        notify(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      notify('Failed to save page.');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title, slug });
  };

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Add New Page</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input required type="text" value={formData.title} onChange={handleTitleChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Content</h2>
          <TipTapEditor content={formData.body} onChange={(html) => setFormData({...formData, body: html})} />
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Structure & Placement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Page Type</label>
              <select value={formData.pageType} onChange={e => setFormData({...formData, pageType: e.target.value, parentPage: ''})} className="mt-1 block w-full border border-gray-300 rounded p-2">
                <option value="STANDALONE">Standalone Page</option>
                <option value="PARENT">Parent Page (Has Children)</option>
                <option value="CHILD">Child Page (Belongs to Parent)</option>
              </select>
            </div>
            {formData.pageType === 'CHILD' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Parent Page</label>
                <select required value={formData.parentPage} onChange={e => setFormData({...formData, parentPage: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2">
                  <option value="">-- Select Parent --</option>
                  {parentPages.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Placement</label>
              <select value={formData.placement} onChange={e => setFormData({...formData, placement: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2">
                <option value="NONE">None (Hidden from Menus)</option>
                <option value="HEADER">Header Navbar</option>
                <option value="FOOTER">Footer Links</option>
                <option value="BOTH">Both Header and Footer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Publishing</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="mt-1 block w-64 border border-gray-300 rounded p-2">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded font-bold hover:bg-indigo-700 w-full md:w-auto">Save Page</button>
      </form>
    </div>
  );
}
