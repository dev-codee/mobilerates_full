"use client";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2 } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/sessions`, {credentials: 'include'});
      const data = await res.json();
      if (res.ok) setSessions(data.data);
    } catch (err) {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/sessions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setSessions(s => s.filter(x => x._id !== id));
      } else {
        const data = await res.json();
        notify(data.message);
      }
    } catch (err) {
      notify('Error revoking session');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
        <ShieldAlert className="text-gray-400 w-6 h-6" />
      </div>

      <p className="text-gray-500 mb-8 text-sm">
        These are the devices that are currently logged into your account. If you don't recognize a device, revoke its access immediately.
      </p>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="text-gray-500 text-sm">No active sessions found.</div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-semibold text-gray-900">
                  {session.userAgent ? (
                    session.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser'
                  ) : 'Unknown Device'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  IP: {session.ipAddress} • Expires: {new Date(session.expiresAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => revokeSession(session._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Revoke Session"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
