import { CurrencyText } from "@/app/components/Price";
import { displayCurrency } from "@/app/lib/pricing-server";
import { notFound } from "next/navigation";
import { serializeJsonLd } from "@/app/lib/schema";
import { listingIndexing, isValidListingPage } from "@/app/lib/indexing";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import { getVehicles, getBrands, type Brand } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import EVCard from "@/app/components/EVCard";
import Breadcrumb from "@/app/components/Breadcrumb";
import Pagination from "@/app/components/Pagination";
import Link from "next/link";
import { Car, GitCompareArrows, X } from "lucide-react";
import { generateCollectionPageSchema, generateBreadcrumbSchema } from "@/app/lib/schema";

export const dynamic = "force-dynamic";

function formatBrandName(brandSlug: string, brands: Brand[] = []): string {
  if (!brandSlug) return "";
  const match = brands.find((b) => b.slug.toLowerCase() === brandSlug.toLowerCase());
  if (match) return match.name;
  return brandSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const brand = resolvedParams.brand as string;
  const category = resolvedParams.category as string;
  const maxPrice = resolvedParams.max_price as string;
  const status = resolvedParams.status as string;

  let brands: Brand[] = [];
  try {
    brands = await getBrands("ev");
  } catch {
    // fallback
  }

  const brandName = brand ? formatBrandName(brand, brands) : "";
  const formattedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  let title = "Electric Vehicles Prices";
  let description = "Browse electric vehicle prices and specifications. Compare battery capacity, driving range, charging details, and features across electric cars and bikes.";

  if (brand && category) {
    title = `${brandName} Electric ${formattedCategory}s Prices & Specifications`;
    description = `Compare all ${brandName} electric ${category.toLowerCase()}s prices, full specifications, range, and battery details.`;
  } else if (brand) {
    title = `${brandName} Electric Vehicles Prices`;
    description = `Compare all ${brandName} electric vehicle prices, full specifications, range, and battery details.`;
  } else if (maxPrice) {
    const formattedPrice = Number(maxPrice).toLocaleString();
    title = `Best Electric Vehicles Under Rs. ${formattedPrice}`;
    description = `Find the best electric vehicles priced under Rs. ${formattedPrice}. Compare battery capacity, range, and acceleration.`;
  } else if (category) {
    title = `${formattedCategory}s Prices & Specifications`;
    description = `Browse the latest Electric ${formattedCategory}s prices, specifications, and features.`;
  } else if (status === "upcoming") {
    title = "Upcoming Electric Vehicles";
    description = "Discover upcoming electric cars, bikes, and scooters launching soon.";
  }

  const year = new Date().getFullYear();
  const finalTitle = `${title.replace(/\s*\b20\d{2}\b\s*$/, "").trim()} ${year}`;

  const indexing = listingIndexing("/vehicles", resolvedParams);
  if (indexing.robots.index) {
    const query = new URLSearchParams();
    if (brand) query.set("brand", brand);
    if (typeof resolvedParams.page === "string") query.set("page", resolvedParams.page);
    const result = await getVehicles(query.toString());
    indexing.robots.index = !!result?.total && result?.total > 0;
  }
  const canonicalUrl = indexing.canonical;

  return cleanMetadata({
    title: { absolute: Number(resolvedParams.page) > 1 ? `${finalTitle} — Page ${resolvedParams.page}` : finalTitle },
    description,
    robots: indexing.robots,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: finalTitle,
      description,
      url: canonicalUrl,
    },
  });
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  if (!isValidListingPage(resolvedParams)) notFound();
  const brand = resolvedParams.brand as string;
  const category = resolvedParams.category as string;
  const bodyType = resolvedParams.body_type as string;
  const minPrice = resolvedParams.min_price as string;
  const maxPrice = resolvedParams.max_price as string;
  const status = resolvedParams.status as string;
  const sort = resolvedParams.sort as string;
  const page = resolvedParams.page as string;
  const limit = resolvedParams.limit as string;

  const queryParams = new URLSearchParams();
  queryParams.set("display_currency", await displayCurrency());
  if (brand) queryParams.set("brand", brand);
  if (category) queryParams.set("category", category);
  if (bodyType) queryParams.set("body_type", bodyType);
  if (minPrice) queryParams.set("min_price", minPrice);
  if (maxPrice) queryParams.set("max_price", maxPrice);
  if (status) queryParams.set("status", status);
  if (sort) queryParams.set("sort", sort);
  if (page) queryParams.set("page", page);
  if (limit) queryParams.set("limit", limit);

  const [paginatedData, evBrands] = await Promise.all([
    getVehicles(queryParams.toString()),
    getBrands("ev"),
  ]);

  const vehicles = paginatedData?.data || [];
  if (!isValidListingPage(resolvedParams, paginatedData?.totalPages || 0)) notFound();
  const brandName = brand ? formatBrandName(brand, evBrands) : "";
  const formattedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  // Dynamic titles
  let title = "All Electric Vehicles";
  if (brand && category) {
    title = `${brandName} Electric ${formattedCategory}s`;
  } else if (brand) {
    title = `${brandName} Electric Vehicles`;
  } else if (maxPrice) {
    title = `Electric Vehicles Under Rs. ${Number(maxPrice).toLocaleString()}`;
  } else if (category) {
    title = `${formattedCategory}s`;
  } else if (status === "upcoming") {
    title = "Upcoming Electric Vehicles";
  }

  // Breadcrumbs
  const breadcrumbItems: { label: string; href?: string }[] = [];
  if (brand || category || maxPrice || status) {
    breadcrumbItems.push({ label: "Vehicles", href: "/vehicles" });
    if (category && brand) {
      breadcrumbItems.push({ label: `${formattedCategory}s`, href: `/vehicles?category=${category}` });
      breadcrumbItems.push({ label: brandName });
    } else if (brand) {
      breadcrumbItems.push({ label: brandName });
    } else if (category) {
      breadcrumbItems.push({ label: `${formattedCategory}s` });
    } else if (maxPrice) {
      breadcrumbItems.push({ label: `Under Rs. ${Number(maxPrice).toLocaleString()}` });
    } else if (status) {
      breadcrumbItems.push({ label: status.charAt(0).toUpperCase() + status.slice(1) });
    }
  } else {
    breadcrumbItems.push({ label: "Vehicles" });
  }

  // Active filter chips
  const activeFilters: { label: string; removeHref: string }[] = [];
  if (brand) {
    const nextParams = new URLSearchParams(queryParams);
    nextParams.delete("brand");
    nextParams.delete("page");
    const qs = nextParams.toString();
    activeFilters.push({
      label: `Brand: ${brandName}`,
      removeHref: `/vehicles${qs ? `?${qs}` : ""}`,
    });
  }
  if (category) {
    const nextParams = new URLSearchParams(queryParams);
    nextParams.delete("category");
    nextParams.delete("page");
    const qs = nextParams.toString();
    activeFilters.push({
      label: `Category: ${formattedCategory}`,
      removeHref: `/vehicles${qs ? `?${qs}` : ""}`,
    });
  }
  if (maxPrice) {
    const nextParams = new URLSearchParams(queryParams);
    nextParams.delete("max_price");
    nextParams.delete("min_price");
    nextParams.delete("page");
    const qs = nextParams.toString();
    activeFilters.push({
      label: `Under Rs. ${Number(maxPrice).toLocaleString()}`,
      removeHref: `/vehicles${qs ? `?${qs}` : ""}`,
    });
  }

  const categoryOptions = [
    { label: "All EVs", slug: "" },
    { label: "Cars", slug: "Car" },
    { label: "Scooters", slug: "Scooter" },
    { label: "Bikes", slug: "Bike" },
    { label: "Rickshaws", slug: "Rickshaw" },
    { label: "Cycles", slug: "Cycle" },
  ];

  const canonicalUrl = listingIndexing("/vehicles", resolvedParams).canonical.replace("https://mobilerates.info", "");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            generateCollectionPageSchema(title, `Explore $<CurrencyText text={title} />`, canonicalUrl)
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateBreadcrumbSchema(breadcrumbItems)),
        }}
      />
      <div className="min-h-screen bg-surface-white flex flex-col selection:bg-primary/20">
        <Navbar />

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="mt-4 md:mt-6 pb-4 border-b border-border-subtle flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main">
                <CurrencyText text={title} />
              </h1>
              <p className="text-sm text-text-muted mt-2 max-w-2xl">
                Showing {vehicles.length} of {paginatedData?.total || 0} results
              </p>
            </div>
            <Link
              href="/vehicles/compare"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm shrink-0"
            >
              <GitCompareArrows className="w-4 h-4" />
              Compare EVs
            </Link>
          </div>

          {/* Category Quick Filter Pills */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryOptions.map((opt) => {
              const isActive = (category || "").toLowerCase() === opt.slug.toLowerCase();
              const nextParams = new URLSearchParams(queryParams);
              if (opt.slug) {
                nextParams.set("category", opt.slug);
              } else {
                nextParams.delete("category");
              }
              nextParams.delete("page");
              const qs = nextParams.toString();
              const href = `/vehicles${qs ? `?${qs}` : ""}`;

              return (
                <Link
                  key={opt.slug}
                  href={href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-surface-container-low text-text-muted border-border-subtle hover:bg-surface-container hover:text-text-main"
                  }`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-muted font-medium">Active filters:</span>
              {activeFilters.map((f, i) => (
                <Link
                  key={i}
                  href={f.removeHref}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <span><CurrencyText text={f.label} /></span>
                  <X className="w-3.5 h-3.5" />
                </Link>
              ))}
              <Link
                href="/vehicles"
                className="text-xs text-text-muted hover:text-primary underline ml-1 font-medium transition-colors"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Vehicles Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-border-subtle text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-text-muted mb-3">
                  <Car className="w-7 h-7 text-text-muted" />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">No vehicles found</h3>
                <p className="text-sm text-text-muted max-w-md mb-5">
                  {brand
                    ? `We couldn't find any ${brandName} electric vehicles matching your criteria.`
                    : "Try removing some filters or check back later."}
                </p>
                {activeFilters.length > 0 && (
                  <Link
                    href="/vehicles"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Clear All Filters
                  </Link>
                )}
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <EVCard key={vehicle._id} vehicle={vehicle} variant="list" />
              ))
            )}
          </div>

          {/* Pagination */}
          {paginatedData && paginatedData.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={paginatedData.page}
                totalPages={paginatedData.totalPages}
              />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
