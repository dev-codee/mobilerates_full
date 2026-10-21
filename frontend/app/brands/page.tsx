import { serializeJsonLd } from "@/app/lib/schema";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import { getBrands } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import BrandLogo from "@/app/components/BrandLogo";
import AppIcon from "@/app/components/AppIcon";
import { generateCollectionPageSchema } from "@/app/lib/schema";

export const metadata: Metadata = cleanMetadata({
  title: "All Mobile Phone Brands — Samsung, Apple, Xiaomi & More",
  description: "Browse all mobile phone brands. Find latest smartphones, prices, and specs from your favorite manufacturers.",
  alternates: {
    canonical: "https://mobilerates.info/brands",
  },
  openGraph: {
    title: "All Mobile Phone Brands",
    description: "Browse all mobile phone brands. Find latest smartphones and specs.",
    url: "https://mobilerates.info/brands",
  },
});

export default async function BrandsPage() {
  const brands = await getBrands("phone");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateCollectionPageSchema("Mobile Phone Brands", "Browse all mobile phone brands", "/brands")),
        }}
      />
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-10 bg-surface min-h-[60vh]">
        <div className="mb-8">
          <h1 className="font-headline-md text-3xl font-bold text-text-main mb-2">
            Mobile Brands
          </h1>
          <p className="text-text-muted">
            Explore our comprehensive collection of mobile phone brands and their latest devices.
          </p>
        </div>

        {brands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center bg-surface-white border border-border-subtle rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-20 h-20 mb-4 relative flex items-center justify-center bg-surface-container-lowest rounded-full p-2 group-hover:scale-105 transition-transform duration-300">
                  <BrandLogo name={brand.name} slug={brand.slug} logo={brand.logo} />
                </div>
                <h3 className="font-bold text-text-main text-center text-lg mb-1 group-hover:text-primary transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs font-semibold text-text-muted bg-surface-container-low px-3 py-1 rounded-full">
                  {brand.total_phones || 0} Phones
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-surface-white rounded-xl border border-border-subtle p-12 flex flex-col items-center justify-center text-center mt-6">
            <AppIcon name="category" size={64} className="text-outline mb-4 opacity-60" />
            <h2 className="font-headline-md text-xl font-bold text-text-main mb-2">
              No Brands Found
            </h2>
            <p className="text-text-muted max-w-md mx-auto">
              We couldn&apos;t find any brands at the moment. Please check back later.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
