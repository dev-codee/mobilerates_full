"use client";

import { notify } from "@/app/lib/notifications";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function NewAdPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    placement: 'TOP_HEADER',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const token = Cookies.get('admin_token');
    const formDataObj = new FormData();
    formDataObj.append('image', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormData(prev => ({ ...prev, image: data.data.url }));
      } else {
        setError(data.message || 'Image upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const token = Cookies.get('admin_token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify('Advertisement saved successfully.', 'success');
        router.push('/admin/ads');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Ad</h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Summer Sale Top Banner"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {isUploading && <p className="text-sm text-gray-500 mt-1">Uploading image...</p>}
          {formData.image && (
             <div className="mt-2">
                 <img src={formData.image} alt="Preview" className="h-32 object-contain bg-gray-100 p-1 rounded border" />
             </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination Link</label>
          <input
            type="url"
            name="link"
            required
            value={formData.link}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
          <select
            name="placement"
            value={formData.placement}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="TOP_HEADER">Top Header (Above Nav)</option>
            <option value="SIDEBAR">Sidebar (Right Column)</option>
            <option value="BOTTOM_PAGE">Bottom Page (Above Footer)</option>
            <option value="PRODUCT_AREA">Product Area (In Content)</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active (Display this ad on the site)
          </label>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Ad'}
          </button>
        </div>
      </form>
    </div>
  );
}
