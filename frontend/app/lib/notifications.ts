'use client';

export type Notice = { id: number; message: string; kind: 'success' | 'error' | 'info' };
let notices: Notice[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
const empty: Notice[] = [];

export function subscribeNotices(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function getNotices() { return notices; }
export function getServerNotices() { return empty; }
export function dismissNotice(id: number) {
  notices = notices.filter(notice => notice.id !== id);
  listeners.forEach(listener => listener());
}
export function notify(message: string, kind?: Notice['kind']) {
  const text = String(message || 'The action could not be completed. Please try again.');
  const resolvedKind = kind || (/\b(failed|error|invalid|unable|not found|cannot)\b/i.test(text) ? 'error'
    : /\b(successfully|success|saved|created|updated|deleted|copied|approved|submitted)\b/i.test(text) ? 'success' : 'info');
  const id = ++nextId;
  notices = [...notices.slice(-3), { id, message: text, kind: resolvedKind }];
  listeners.forEach(listener => listener());
  setTimeout(() => dismissNotice(id), resolvedKind === 'error' ? 12000 : 7000);
}

export async function mutationError(response: Response, action: string): Promise<string> {
  if (response.status === 401) return 'Your session has expired. Sign in again to continue.';
  if (response.status === 403) return 'You do not have permission to perform this action.';
  if (response.status === 404) return 'This item no longer exists. Refresh the list before trying again.';
  if (response.status === 409) return 'An item with these details already exists. Check the name or URL slug.';
  if (response.status === 429) return 'Too many requests. Wait a moment and try again.';
  if (response.status >= 500) return `Unable to ${action}. The service is temporarily unavailable. Please try again.`;
  const body = await response.json().catch(() => null);
  return typeof body?.message === 'string' ? body.message : `Unable to ${action}. Check the details and try again.`;
}
