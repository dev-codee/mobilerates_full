"use client";
import { notify, mutationError } from "@/app/lib/notifications";


import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminPhoneForm from '../components/AdminPhoneForm';

function AddMobileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get('clone');
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!cloneId);

  useEffect(() => {
    if (cloneId) {
      const fetchPhone = async () => {
        try {
          const token = Cookies.get('admin_token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${cloneId}`, {
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
          console.error("Failed to load phone for cloning", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPhone();
    }
  }, [cloneId]);

  const handleSubmit = async (payload: any) => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        notify("Phone created successfully!");
        router.push('/admin/phones');
      } else {
        notify(await mutationError(response, "save this phone"), "error");
      }
    } catch (error) {
      console.error(error);
      notify("Unable to save this phone. Check your connection and try again.", "error");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading original phone data...</div>;

  return <AdminPhoneForm onSubmit={handleSubmit} isEditing={false} initialData={initialData} />;
}

export default function AddMobilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <AddMobileContent />
    </Suspense>
  );
}
