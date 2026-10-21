'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import AppIcon from './components/AppIcon';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-24 flex flex-col items-center justify-center text-center min-h-[60vh] bg-surface">
      <AppIcon name="error" size={64} className="text-outline mb-4 opacity-70" />
      <h1 className="text-2xl md:text-3xl font-bold text-text-main mb-2">
        This page is temporarily unavailable
      </h1>
      <p className="text-text-muted max-w-md mx-auto mb-6">
        We could not load this page. Your connection or our service may be temporarily unavailable. Try again in a moment.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => unstable_retry()}
          className="bg-primary hover:bg-on-primary-fixed-variant text-white font-semibold text-sm px-5 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-border-subtle bg-surface-white hover:bg-surface-container-low text-text-main font-semibold text-sm px-5 h-10 rounded-lg flex items-center justify-center transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
