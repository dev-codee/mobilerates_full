import { Suspense } from "react";
import { cleanMetadata } from "@/app/lib/seo";
import Link from 'next/link';
import NavbarClient from '@/app/components/NavbarClient';
import Footer from '@/app/components/Footer';
import AppIcon from '@/app/components/AppIcon';

export const metadata = cleanMetadata({
  title: 'Page Not Found',
  robots: { index: false, follow: true },
  description: 'The page you are looking for could not be found.',
});

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Suspense fallback={<div className="h-16 border-b border-border-subtle" />}><NavbarClient dynamicPages={[]} popularBrands={[]} /></Suspense>
      
      <main className="flex-grow flex items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-6">
          {/* Illustration / Icon */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center bg-primary/10 rounded-full mb-4">
            <AppIcon name="search_off" size={80} className="text-primary opacity-80" />
            <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-surface-white shadow-md border border-border-subtle rounded-full p-2.5 md:p-3 animate-bounce">
              <span className="font-display-lg text-lg md:text-2xl font-black text-red-500 tracking-tighter">404</span>
            </div>
          </div>
          
          <h1 className="font-headline-lg text-3xl md:text-5xl font-black text-text-main tracking-tight">
            404 — Page not found
          </h1>
          
          <p className="font-body-lg text-text-muted text-base md:text-lg max-w-md mx-auto leading-relaxed">
            This page may have moved or been removed, or the address may be incorrect. Check the URL or use the links below to find a product.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-on-primary-fixed-variant text-white font-label-lg font-bold px-8 py-3.5 rounded-xl shadow-md transition-all hover:-translate-y-1 w-full sm:w-auto"
            >
              <AppIcon name="home" size={20} />
              Back to Home
            </Link>
            
            <Link 
              href="/brands"
              className="flex items-center justify-center gap-2 bg-surface-white border border-border-subtle hover:border-primary text-text-main hover:text-primary font-label-lg font-bold px-8 py-3.5 rounded-xl shadow-sm transition-all hover:bg-surface-container-lowest hover:-translate-y-1 w-full sm:w-auto"
            >
              <AppIcon name="category" size={20} />
              Explore Brands
            </Link>
          </div>
          
          {/* Helpful Links Box */}
          <div className="mt-12 w-full max-w-md">
            <div className="p-5 bg-surface-white border border-border-subtle rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="font-headline-sm font-bold text-text-main flex items-center justify-center gap-2 uppercase tracking-wide text-xs">
                <AppIcon name="explore" size={18} className="text-primary" />
                Helpful Links
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link href="/phones" className="text-text-muted hover:text-primary hover:underline transition-colors p-2 text-center rounded-lg hover:bg-primary/5 font-medium">All Mobile Phones</Link>
                <Link href="/compare" className="text-text-muted hover:text-primary hover:underline transition-colors p-2 text-center rounded-lg hover:bg-primary/5 font-medium">Compare Phones</Link>
                <Link href="/news" className="text-text-muted hover:text-primary hover:underline transition-colors p-2 text-center rounded-lg hover:bg-primary/5 font-medium">Tech News</Link>
                <Link href="/vehicles" className="text-text-muted hover:text-primary hover:underline transition-colors p-2 text-center rounded-lg hover:bg-primary/5 font-medium">Electric Vehicles</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
