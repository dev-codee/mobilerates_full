import { rebrandSiteContent } from "@/app/lib/branding";
import Link from "next/link";
import Image from "next/image";
import { getPages } from "@/app/lib/api";

export default async function Footer() {
  const pages = await getPages();
  const footerPages = pages.filter((page: { status: string; placement: string; slug?: string }) =>
    page.status === 'PUBLISHED' && !!page.slug && (page.placement === 'FOOTER' || page.placement === 'BOTH')
  );

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-border-subtle py-12 px-4 md:px-6 mt-auto">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center justify-center gap-6 text-center">
        {/* Brand */}
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Image src="/mobile-rates-logo.svg" unoptimized alt="Mobile Rates" width={160} height={45} className="h-12 w-auto object-contain" />
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
          {footerPages.map((page: any) => (
            <Link
              key={page._id}
              href={`/pages/${page.slug}`}
              className="text-text-main hover:text-primary transition-colors text-sm font-semibold"
            >
              {rebrandSiteContent(page.title || "")}
            </Link>
          ))}
          <Link href="/site-map" className="text-text-main hover:text-primary transition-colors text-sm font-semibold">Sitemap</Link>
        </nav>

        {/* Disclaimer */}
        <p className="text-text-muted text-xs leading-relaxed max-w-3xl mx-auto">
          Prices, specifications, and availability on Mobile Rates are provided for informational purposes only and are based on available product and retailer information. Information may change over time, and errors or outdated details may occur. All trademarks, logos, and product images belong to their respective owners. Users should verify product details, pricing, availability, and specifications with the official brand or retailer before making a purchase.
        </p>

        {/* Copyright */}
        <div className="text-text-muted text-xs mt-2">
          © {new Date().getFullYear()} Mobile Rates. All rights reserved.
          <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="block mt-2 text-[10px] hover:underline">
            Rates by ExchangeRate-API
          </a>
        </div>
      </div>
    </footer>
  );
}
