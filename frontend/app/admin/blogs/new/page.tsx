"use client";

import { notify, mutationError } from "@/app/lib/notifications";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import TipTapEditor from '@/app/components/TipTapEditor';

export default function NewBlogPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', body: '',
    status: 'DRAFT', featured: false, trending: false,
    pinned: false, breaking: false, categories: [] as string[]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      if (!res.ok) throw new Error(await mutationError(res, "load these records"));
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      console.error(error);
      notify(error instanceof Error ? error.message : "Unable to complete this action. Check your connection and try again.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) { notify("Article saved successfully.", "success"); router.push('/admin/blogs'); }
      else throw new Error(await mutationError(res, "save this article"));
    } catch (error) {
      console.error(error);
      notify(error instanceof Error ? error.message : "Unable to complete this action. Check your connection and try again.", "error");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title, slug });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setFormData({ ...formData, categories: selected });
  };

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Add New Blog</h1>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Excerpt</label>
            <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" rows={2}></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Categories</label>
            <select multiple value={formData.categories} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded p-2 h-32">
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Content</h2>
          <TipTapEditor content={formData.body} onChange={(html) => setFormData({...formData, body: html})} />
        </div>

        <div className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Publishing & Flags</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            
            <div className="flex items-center mt-6">
              <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="mr-2 h-4 w-4 text-indigo-600" />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured</label>
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="trending" checked={formData.trending} onChange={e => setFormData({...formData, trending: e.target.checked})} className="mr-2 h-4 w-4 text-indigo-600" />
              <label htmlFor="trending" className="text-sm font-medium text-gray-700">Trending</label>
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="breaking" checked={formData.breaking} onChange={e => setFormData({...formData, breaking: e.target.checked})} className="mr-2 h-4 w-4 text-indigo-600" />
              <label htmlFor="breaking" className="text-sm font-medium text-gray-700">Breaking News</label>
            </div>
          </div>
        </div>
        
        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded font-bold hover:bg-indigo-700 w-full md:w-auto">Save Blog Post</button>
      </form>
    </div>
  );
}
