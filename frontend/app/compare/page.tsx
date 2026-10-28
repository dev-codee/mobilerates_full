import { getComparisonPhoneCatalog } from "@/app/lib/comparison-catalog";
import { toComparisonOption } from "@/app/lib/comparison-options";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import { getComparisonData, getPopularComparisons } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import CompareClient from "@/app/components/CompareClient";
import PopularComparisons from "@/app/components/PopularComparisons";
import Link from "next/link";

export const revalidate = 60; // ISR validation time

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  return cleanMetadata({
  robots: { index: Object.keys(params).length === 0, follow: true },
  title: "Compare Mobile Phones Side-by-Side — Prices & Specifications",
  description: "Compare mobile phone prices, camera specs, battery life, performance, and features side by side.",
  alternates: {
    canonical: "https://mobilerates.info/compare",
  },
  openGraph: {
    title: "Compare Mobile Phones Side-by-Side",
    description: "Compare mobile phone prices, camera specs, battery life, performance, and features side by side.",
    url: "https://mobilerates.info/compare",
  },
  });
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawPhones = resolvedParams.phone;

  // Process slugs from search query parameter (?phone=slug1&phone=slug2)
  let selectedSlugs: string[] = [];
  if (rawPhones) {
    selectedSlugs = Array.isArray(rawPhones) ? rawPhones : [rawPhones];
  } else if (resolvedParams.slugs) {
    selectedSlugs = typeof resolvedParams.slugs === "string" ? resolvedParams.slugs.split(",") : [];
  }

  // Clean empty values
  selectedSlugs = selectedSlugs.map((s) => s.trim()).filter((s) => s.length > 0);

  // Redirect to canonical URL if exactly 2 phones are compared
  if (selectedSlugs.length === 2) {
    const { permanentRedirect } = await import("next/navigation");
    permanentRedirect(`/compare/${[...selectedSlugs].sort().join("-vs-")}`);
  }

  // Fetch full details safely
  const [comparisonPhonesResult, allPhonesResult, popularComparisonsResult] = await Promise.allSettled([
    getComparisonData(selectedSlugs),
    getComparisonPhoneCatalog(),
    getPopularComparisons(8)
  ]);

  if (allPhonesResult.status === "rejected") throw allPhonesResult.reason;
  if (comparisonPhonesResult.status === "rejected") throw comparisonPhonesResult.reason;

  const comparisonPhones =
    comparisonPhonesResult.status === "fulfilled" && Array.isArray(comparisonPhonesResult.value)
      ? comparisonPhonesResult.value
      : [];
  const allPhonesData =
    allPhonesResult.status === "fulfilled" && allPhonesResult.value
      ? allPhonesResult.value
      : { phones: [] };
  const popularComparisons =
    popularComparisonsResult.status === "fulfilled" && Array.isArray(popularComparisonsResult.value)
      ? popularComparisonsResult.value
      : [];

  return (
    <>
      <Navbar />
      <main className="w-full bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
          <Breadcrumb
            items={[
              { label: "Phones", href: "/phones" },
              { label: "Compare" },
            ]}
          />
        </div>
        <CompareClient initialPhones={comparisonPhones} allPhones={(allPhonesData.phones || []).map(toComparisonOption)} />
        
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
          {popularComparisons && popularComparisons.length > 0 && (
            <div className="flex flex-col gap-6">
              <PopularComparisons comparisons={popularComparisons} />
              <div className="flex justify-center">
                <Link 
                  href="/comparisons" 
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  View All Comparisons
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
