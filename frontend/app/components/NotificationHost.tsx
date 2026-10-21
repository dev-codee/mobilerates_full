'use client';

import { useSyncExternalStore } from 'react';
import { dismissNotice, getNotices, getServerNotices, subscribeNotices } from '@/app/lib/notifications';

export default function NotificationHost() {
  const notices = useSyncExternalStore(subscribeNotices, getNotices, getServerNotices);
  return (
    <div className="fixed bottom-5 right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {notices.map(notice => (
        <div key={notice.id} role={notice.kind === 'error' ? 'alert' : 'status'} aria-atomic="true"
          className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${notice.kind === 'error'
            ? 'border-red-300 bg-red-50 text-red-950' : notice.kind === 'success'
            ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-blue-300 bg-blue-50 text-blue-950'}`}>
          <p className="flex-1 text-sm font-medium">{notice.message}</p>
          <button type="button" aria-label="Dismiss message" onClick={() => dismissNotice(notice.id)} className="px-2 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}
