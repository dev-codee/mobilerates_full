'use client';
/* eslint-disable @next/next/no-html-link-for-pages -- A full navigation recovers a failed root layout. */

export default function GlobalError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '48px 24px', textAlign: 'center' }}>
        <main>
          <h1>This site is temporarily unavailable</h1>
          <p>We could not load the site. Please try again in a moment.</p>
          <button type="button" onClick={unstable_retry} style={{ padding: '12px 20px', cursor: 'pointer' }}>Try again</button>
          <p><a href="/">Go to the homepage</a></p>
        </main>
      </body>
    </html>
  );
}
