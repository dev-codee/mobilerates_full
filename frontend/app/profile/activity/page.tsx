"use client";

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/activity`, {credentials: 'include'});
      const data = await res.json();
      if (res.ok) setLogs(data.data);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'LOGIN': return 'bg-emerald-100 text-emerald-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      case 'REGISTER': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <Clock className="text-gray-400 w-6 h-6" />
      </div>

      <p className="text-gray-500 mb-8 text-sm">
        A detailed history of your account activity.
      </p>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-gray-500 text-sm">No activity found.</div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl">
              <div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeColor(log.type)}`}>
                    {log.type}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{log.details || 'No details'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {log.userAgent}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2 sm:mt-0 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
