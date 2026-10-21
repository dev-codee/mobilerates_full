"use client";

import { notify, mutationError } from "@/app/lib/notifications";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`);
      if (!res.ok) throw new Error(await mutationError(res, "load these records"));
      if (res.ok) {
        const data = await res.json();
        setFormData({ name: data.name, slug: data.slug, description: data.description || '' });
      }
    } catch (error) {
      console.error(error);
      notify(error instanceof Error ? error.message : "Unable to complete this action. Check your connection and try again.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('admin_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
        method: 'PUT',
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

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded p-2" rows={3}></textarea>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Update</button>
      </form>
    </div>
  );
}
