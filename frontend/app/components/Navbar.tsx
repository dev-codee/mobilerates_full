import { getPages, getBrands } from "@/app/lib/api";
import NavbarClient from "./NavbarClient";
import { Suspense } from "react";

// The 10 popular phone brands to show in the dropdown, in this exact order.
const POPULAR_BRAND_SLUGS = [
  "samsung",
  "apple",
  "xiaomi",
  "vivo",
  "oppo",
  "realme",
  "infinix",
  "tecno",
  "oneplus",
  "google",
];

export default async function Navbar() {
  const [pages, allBrands] = await Promise.all([
    getPages(),
    getBrands(),
  ]);

  const headerPages = pages.filter((p: any) => 
    p.status === 'PUBLISHED' && 
    (p.placement === 'HEADER' || p.placement === 'BOTH')
  );

  // Filter to popular phone brands and preserve the user-specified order.
  const popularBrands = POPULAR_BRAND_SLUGS
    .map((slug) => allBrands.find((b) => b.slug === slug))
    .filter((b): b is NonNullable<typeof b> => !!b)
    .map((b) => ({
      slug: b.slug,
      name: b.name,
      total_phones: b.total_phones || 0,
    }));

  return (
    <Suspense fallback={<div className="h-16 w-full border-b border-border-subtle bg-surface-white"></div>}>
      <NavbarClient dynamicPages={headerPages} popularBrands={popularBrands} />
    </Suspense>
  );
}
