"use client";
import { notify, mutationError } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminVehicleForm from '../components/AdminVehicleForm';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!vehicleId) return;
    const fetchVehicle = async () => {
      const token = Cookies.get('admin_token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/${vehicleId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          // Format dates for date inputs
          for (const dateField of ['release_date', 'announcement_date']) {
            if (data.data[dateField]) {
              data.data[dateField] = new Date(data.data[dateField]).toISOString().split('T')[0];
            }
          }
          setInitialData(data.data);
        } else if (res.status === 401) {
          Cookies.remove('admin_token');
          router.push('/login');
        } else {
          notify("Failed to load EV data");
          router.push('/admin/vehicles');
        }
      } catch (error) {
        console.error('Failed to fetch vehicle', error);
        notify("An error occurred while loading EV data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicle();
  }, [vehicleId, router]);

  const handleSubmit = async (payload: any) => {
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        notify("EV updated successfully!");
        router.push('/admin/vehicles');
      } else {
        notify(await mutationError(response, "save this vehicle"), "error");
      }
    } catch (error) {
      console.error(error);
      notify("Unable to save this vehicle. Check your connection and try again.", "error");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return <AdminVehicleForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} />;
}
