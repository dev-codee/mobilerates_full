import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { isValidListingPage } from "@/app/lib/indexing";
import { getPopularVehicleComparisons } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import PopularVehicleComparisons from "@/app/components/PopularVehicleComparisons";
import Link from "next/link";

export const revalidate = 60; // ISR validation time

type ArchiveProps = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const getArchiveComparisons = cache(async () => {
  const comparisons = await getPopularVehicleComparisons(100);
  const seen = new Set<string>();
  return comparisons.filter(comparison => {
    const products = comparison.vehicles as { slug?: string }[] | undefined;
    if (!products || products.length !== 2 || !products[0]?.slug || !products[1]?.slug || products[0].slug === products[1].slug) return false;
    const pair = products.map(product => product.slug).sort().join("-vs-");
    if (seen.has(pair)) return false;
    seen.add(pair);
    return true;
  });
});

async function getArchivePage(searchParams: ArchiveProps["searchParams"]) {
  const params = await searchParams;
  if (!isValidListingPage(params)) notFound();
  const comparisons = await getArchiveComparisons();
  const totalPages = Math.max(1, Math.ceil(comparisons.length / 15));
  if (!isValidListingPage(params, totalPages)) notFound();
  return { params, comparisons, totalPages, page: Number(params.page || 1) };
}

export async function generateMetadata({ searchParams }: ArchiveProps): Promise<Metadata> {
  const { params, page } = await getArchivePage(searchParams);
  const title = page > 1 ? "All EV Comparisons — Page " + page : "All EV Comparisons";
  const description = "Browse electric vehicle comparisons. Compare EV prices, range, charging, and specifications side by side.";
  const canonical = `https://mobilerates.info/vehicles/comparisons${page > 1 ? `?page=${page}` : ""}`;
  const index = Object.keys(params).every(key => key === "page");
  return cleanMetadata({
    title, description, alternates: { canonical }, robots: { index, follow: true },
    openGraph: { title, description, url: canonical },
    twitter: { card: "summary_large_image", title, description, images: ["/social-preview.png"] },
  });
}

export default async function VehicleComparisonsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { comparisons: allComparisons, totalPages, page: validPage } = await getArchivePage(searchParams);
  const startIndex = (validPage - 1) * 15;
  const currentComparisons = allComparisons.slice(startIndex, startIndex + 15);

  return (
    <>
      <Navbar />
      <main className="w-full bg-surface min-h-screen flex flex-col">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6 w-full">
          <Breadcrumb
            items={[
              { label: "Vehicles", href: "/vehicles" },
              { label: "Compare", href: "/vehicles/compare" },
              { label: "All Comparisons" },
            ]}
          />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 w-full flex-grow">
          <h1 className="text-3xl font-bold text-text-main mb-6">All EV Comparisons</h1>
          {currentComparisons.length > 0 ? (
            <>
              <PopularVehicleComparisons comparisons={currentComparisons} title="Compare Prices and Specifications" />

              {/* Server-side Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  {validPage > 1 ? (
                    <Link
                      href={`/vehicles/comparisons?page=${validPage - 1}`}
                      className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg hover:bg-surface-container transition-colors font-medium text-sm border border-border-subtle"
                    >
                      Previous
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg opacity-50 font-medium text-sm border border-border-subtle cursor-not-allowed">
                      Previous
                    </button>
                  )}

                  <span className="text-sm font-medium text-text-muted">
                    Page {validPage} of {totalPages}
                  </span>

                  {validPage < totalPages ? (
                    <Link
                      href={`/vehicles/comparisons?page=${validPage + 1}`}
                      className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg hover:bg-surface-container transition-colors font-medium text-sm border border-border-subtle"
                    >
                      Next
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg opacity-50 font-medium text-sm border border-border-subtle cursor-not-allowed">
                      Next
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-text-main mb-4">No Comparisons Found</h2>
              <p className="text-text-muted mb-6">
                No EV comparisons have been saved yet. Start comparing to build the list.
              </p>
              <Link
                href="/vehicles/compare"
                className="inline-flex px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Compare EVs
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
