'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPages } from '@/app/lib/api';

type Policy = { slug: string; title: string; status: string };
export default function PublishedPolicyLinks() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  useEffect(() => {
    let active = true;
    getPages().then(pages => {
      if (active) setPolicies(pages.filter((page: Policy) => page.status === 'PUBLISHED' &&
        ['terms', 'terms-of-service', 'terms-and-conditions', 'privacy', 'privacy-policy'].includes(page.slug)));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  if (!policies.length) return null;
  return <nav aria-label="Terms and privacy" className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
    {policies.map(policy => <Link key={policy.slug} href={`/pages/${policy.slug}`} className="text-indigo-600 hover:underline">{policy.title}</Link>)}
  </nav>;
}
