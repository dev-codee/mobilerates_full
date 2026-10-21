"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Smartphone, PlusCircle, Users, Activity, FileText, Tags, FileEdit, Car, Bookmark, Headphones } from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import Cookies from 'js-cookie';
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = Cookies.get('admin_token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - (base64.length % 4)) % 4);
        const base64Decoded = atob(base64 + padding);
        const jsonPayload = decodeURIComponent(base64Decoded.split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        setRole(payload.role || '');
      } catch (e: any) {
        setDecodeError(e.message || String(e));
        console.error("JWT Decode error", e);
      }
    } else {
      setDecodeError("Token missing");
    }
  }, []);

  const isSuperAdmin = role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="h-16 flex flex-col justify-center px-6 border-b border-gray-200 shrink-0 py-2">
          <div className="flex items-center">
            <Image src="/mobile-rates-logo.svg" unoptimized alt="Mobile Rates Admin" width={180} height={56} className="h-8 w-[160px] object-contain" />
            <span className="ml-2 text-sm font-semibold text-gray-700">Admin</span>
          </div>
          {role ? (
            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit mt-0.5">
              {role.replace('_', ' ')}
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded w-fit mt-0.5" title={decodeError}>
              {decodeError ? `Error: ${decodeError}` : "No Token"}
            </span>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-900 rounded-md hover:bg-gray-50"
            >
              <LayoutDashboard className="mr-3 h-5 w-5 text-gray-500" />
              Dashboard
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mobiles
              </p>
            </div>

            <Link
              href="/admin/phones"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Smartphone className="mr-3 h-5 w-5 text-gray-400" />
              All Mobiles
            </Link>

            <Link
              href="/admin/phones/new"
              className="flex items-center px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md animate-pulse"
            >
              <PlusCircle className="mr-3 h-5 w-5 text-indigo-500" />
              Add Mobile
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Electric Vehicles
              </p>
            </div>

            <Link
              href="/admin/vehicles"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Car className="mr-3 h-5 w-5 text-gray-400" />
              All EVs
            </Link>

            <Link
              href="/admin/vehicles/new"
              className="flex items-center px-3 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-md"
            >
              <PlusCircle className="mr-3 h-5 w-5 text-emerald-500" />
              Add EV
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Wireless Earbuds
              </p>
            </div>

            <Link
              href="/admin/earbuds"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Headphones className="mr-3 h-5 w-5 text-gray-400" />
              All Earbuds
            </Link>

            <Link
              href="/admin/earbuds/new"
              className="flex items-center px-3 py-2 text-xs font-medium text-amber-600 bg-amber-50 rounded-md"
            >
              <PlusCircle className="mr-3 h-5 w-5 text-amber-500" />
              Add Earbud
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User Content
              </p>
            </div>

            <Link
              href="/admin/benchmarks"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Activity className="mr-3 h-5 w-5 text-gray-400" />
              User Benchmarks
            </Link>

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                CMS Content
              </p>
            </div>

            <Link
              href="/admin/blogs"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <FileText className="mr-3 h-5 w-5 text-gray-400" />
              Blogs
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Tags className="mr-3 h-5 w-5 text-gray-400" />
              Categories
            </Link>

            <Link
              href="/admin/brands"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <Bookmark className="mr-3 h-5 w-5 text-gray-400" />
              Brands
            </Link>

            <Link
              href="/admin/ads"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <FileEdit className="mr-3 h-5 w-5 text-gray-400" />
              Ads Management
            </Link>

            <Link
              href="/admin/pages"
              className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
            >
              <FileEdit className="mr-3 h-5 w-5 text-gray-400" />
              Pages
            </Link>

            {isSuperAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    System & Team
                  </p>
                </div>

                <Link
                  href="/admin/team"
                  className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Users className="mr-3 h-5 w-5 text-gray-400" />
                  Team Management
                </Link>

                <Link
                  href="/admin/activity"
                  className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Activity className="mr-3 h-5 w-5 text-gray-400" />
                  User Activity Logs
                </Link>

                <Link
                  href="/admin/team-activity"
                  className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Activity className="mr-3 h-5 w-5 text-gray-400" />
                  Staff Change Logs
                </Link>
              </>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
