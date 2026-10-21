"use client";

import { notify, mutationError } from "@/app/lib/notifications";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function NewCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) { notify("Category saved successfully.", "success"); router.push('/admin/categories'); }
      else throw new Error(await mutationError(res, "save this category"));
    } catch (error) {
      console.error(error);
      notify(error instanceof Error ? error.message : "Unable to complete this action. Check your connection and try again.", "error");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input required type="text" value={formData.name} onChange={handleNameChange} className="mt-1 block w-full border border-gray-300 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" rows={3}></textarea>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
