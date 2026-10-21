"use client";
import { notify, mutationError } from "@/app/lib/notifications";


import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminEarbudForm from '../components/AdminEarbudForm';

function AddEarbudContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('clone');
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!cloneId);

  useEffect(() => {
    if (!cloneId) return;
    const fetchEarbud = async () => {
      try {
        const token = Cookies.get('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/earbuds/${cloneId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const cloneData = data.data;
          delete cloneData._id;
          delete cloneData.slug;
          cloneData.name = `${cloneData.name} - Copy`;
          setInitialData(cloneData);
        }
      } catch (error) {
        console.error("Failed to load earbud for cloning", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarbud();
  }, [cloneId]);

  const handleSubmit = async (payload: any) => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/earbuds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        notify("Wireless Earbud created successfully!");
        router.push('/admin/earbuds');
      } else {
        notify(await mutationError(response, "save this earbud"), "error");
      }
    } catch (error) {
      console.error(error);
      notify("An error occurred while creating earbud");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading original earbud data for cloning...</div>;

  return <AdminEarbudForm onSubmit={handleSubmit} isEditing={false} initialData={initialData} />;
}

export default function AddEarbudPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <AddEarbudContent />
    </Suspense>
  );
}
