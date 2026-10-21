"use client";
import { notify, mutationError } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminEarbudForm from '../components/AdminEarbudForm';

export default function EditEarbudPage() {
  const router = useRouter();
  const params = useParams();
  const earbudId = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!earbudId) return;
    const fetchEarbud = async () => {
      const token = Cookies.get('admin_token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/earbuds/${earbudId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          if (data.data.release_date) {
            data.data.release_date = new Date(data.data.release_date).toISOString().split('T')[0];
          }
          setInitialData(data.data);
        } else if (res.status === 401) {
          Cookies.remove('admin_token');
          router.push('/login');
        } else {
          notify("Failed to load earbud data");
          router.push('/admin/earbuds');
        }
      } catch (error) {
        console.error('Failed to fetch earbud', error);
        notify("An error occurred while loading earbud data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarbud();
  }, [earbudId, router]);

  const handleSubmit = async (payload: any) => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/earbuds/${earbudId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        notify("Wireless Earbud updated successfully!");
        router.push('/admin/earbuds');
      } else {
        notify(await mutationError(response, "save this earbud"), "error");
      }
    } catch (error) {
      console.error(error);
      notify("An error occurred while updating earbud");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading earbud data...</div>;

  return <AdminEarbudForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} />;
}
