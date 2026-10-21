"use client";

import { useAuth } from '../context/AuthContext';

export default function ProfileOverview() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Full Name</label>
            <div className="mt-1 text-lg font-semibold text-gray-900">{user.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email Address</label>
            <div className="mt-1 text-lg font-semibold text-gray-900">{user.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Role</label>
            <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {user.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
