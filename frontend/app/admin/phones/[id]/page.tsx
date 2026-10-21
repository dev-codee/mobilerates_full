"use client";
import { notify, mutationError } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminPhoneForm from '../components/AdminPhoneForm';

export default function EditMobilePage() {
  const router = useRouter();
  const params = useParams();
  const phoneId = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhone = async () => {
      const token = Cookies.get('admin_token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${phoneId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          // Format release_date for the date input
          if (data.data.release_date) {
            data.data.release_date = new Date(data.data.release_date).toISOString().split('T')[0];
          }
          if (data.data.specs?.performance?.ram_options_gb) {
            data.data.specs.performance.ram_options_gb = data.data.specs.performance.ram_options_gb.join(', ');
          }
          if (data.data.specs?.performance?.storage_options_gb) {
            data.data.specs.performance.storage_options_gb = data.data.specs.performance.storage_options_gb.join(', ');
          }
          setInitialData(data.data);
        } else if (res.status === 401) {
          Cookies.remove('admin_token');
          router.push('/login');
        } else {
          notify("Failed to load phone data");
          router.push('/admin/phones');
        }
      } catch (error) {
        console.error('Failed to fetch phone', error);
        notify("An error occurred while loading phone data");
      } finally {
        setIsLoading(false);
      }
    };

    if (phoneId) {
      fetchPhone();
    }
  }, [phoneId, router]);

  const handleSubmit = async (payload: any) => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${phoneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        notify("Phone updated successfully!");
        router.push('/admin/phones');
      } else {
        notify(await mutationError(response, "save this phone"), "error");
      }
    } catch (error) {
      console.error(error);
      notify("Unable to save this phone. Check your connection and try again.", "error");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return <AdminPhoneForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} />;
}
