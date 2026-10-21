import { CurrencyText } from "@/app/components/Price";
import { displayCurrency } from "@/app/lib/pricing-server";
import { notFound } from "next/navigation";
import { serializeJsonLd } from "@/app/lib/schema";
import { listingIndexing, isValidListingPage } from "@/app/lib/indexing";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import { getEarbuds, getBrands, type Brand } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import EarbudCard from "@/app/components/EarbudCard";
import Breadcrumb from "@/app/components/Breadcrumb";
import Pagination from "@/app/components/Pagination";
import Link from "next/link";
import { Headphones, X } from "lucide-react";
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
  const maxPrice = resolvedParams.max_price as string;
  const status = resolvedParams.status as string;
  const anc = resolvedParams.has_anc as string;

  let brands: Brand[] = [];
  try {
    brands = await getBrands("earbud");
  } catch {
    // fallback
  }

  const brandName = brand ? formatBrandName(brand, brands) : "";

  let title = "Wireless Earbuds Prices";
  let description = "Browse wireless earbuds prices and specifications. Compare noise cancellation, battery life, Bluetooth connectivity, and audio features across brands.";

  if (brand && anc === "true") {
    title = `${brandName} ANC Wireless Earbuds Prices`;
    description = `Compare ${brandName} active noise cancelling earbuds prices, battery life, and specs.`;
  } else if (brand) {
    title = `${brandName} Earbuds Prices & Specifications`;
    description = `Compare all ${brandName} wireless earbuds prices, sound features, battery life, and reviews.`;
  } else if (maxPrice) {
    const formattedPrice = Number(maxPrice).toLocaleString();
    title = `Best Wireless Earbuds Under Rs. ${formattedPrice}`;
    description = `Find the best wireless earbuds priced under Rs. ${formattedPrice}. Compare ANC, playtime, and sound quality.`;
  } else if (anc === "true") {
    title = "Best ANC Noise Cancelling Earbuds";
    description = "Discover top rated Active Noise Cancellation (ANC) wireless earbuds with deep bass and high playtime.";
  } else if (status === "upcoming") {
    title = "Upcoming Wireless Earbuds";
    description = "Discover upcoming wireless earbuds and TWS launching soon.";
  }

  const year = new Date().getFullYear();
  const finalTitle = `${title.replace(/\s*\b20\d{2}\b\s*$/, "").trim()} ${year}`.trim();

  const indexing = listingIndexing("/earbuds", resolvedParams);
  if (indexing.robots.index) {
    const query = new URLSearchParams();
    if (brand) query.set("brand", brand);
    if (typeof resolvedParams.page === "string") query.set("page", resolvedParams.page);
    const result = await getEarbuds(query.toString());
    indexing.robots.index = !!result.pagination.total && result.pagination.total > 0;
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

export default async function EarbudsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  if (!isValidListingPage(resolvedParams)) notFound();
  const brand = resolvedParams.brand as string;
  const wearingType = resolvedParams.wearing_type as string;
  const minPrice = resolvedParams.min_price as string;
  const maxPrice = resolvedParams.max_price as string;
  const status = resolvedParams.status as string;
  const hasAnc = resolvedParams.has_anc as string;
  const wirelessCharging = resolvedParams.wireless_charging as string;
  const gamingMode = resolvedParams.gaming_mode as string;
  const sort = resolvedParams.sort as string;
  const page = (resolvedParams.page as string) || "1";
  const limit = (resolvedParams.limit as string) || "12";

  const queryParams = new URLSearchParams();
  queryParams.set("display_currency", await displayCurrency());
  if (brand) queryParams.set("brand", brand);
  if (wearingType) queryParams.set("wearing_type", wearingType);
  if (minPrice) queryParams.set("min_price", minPrice);
  if (maxPrice) queryParams.set("max_price", maxPrice);
  if (status) queryParams.set("status", status);
  if (hasAnc) queryParams.set("has_anc", hasAnc);
  if (wirelessCharging) queryParams.set("wireless_charging", wirelessCharging);
  if (gamingMode) queryParams.set("gaming_mode", gamingMode);
  if (sort) queryParams.set("sort", sort);
  if (page) queryParams.set("page", page);
  if (limit) queryParams.set("limit", limit);

  const [paginatedData, earbudBrands] = await Promise.all([
    getEarbuds(queryParams.toString()),
    getBrands("earbud").catch(() => []),
  ]);

  const earbuds = paginatedData?.earbuds || [];
  if (!isValidListingPage(resolvedParams, paginatedData.pagination.totalPages)) notFound();
  const total = paginatedData?.pagination?.total || 0;
  const totalPages = paginatedData?.pagination?.totalPages || 1;
  const currentPage = paginatedData?.pagination?.page || 1;

  const brandName = brand ? formatBrandName(brand, earbudBrands) : "";

  // Dynamic Page Title
  let pageHeading = "All Wireless Earbuds";
  if (brand && hasAnc === "true") {
    pageHeading = `${brandName} ANC Earbuds`;
  } else if (brand) {
    pageHeading = `${brandName} Earbuds`;
  } else if (hasAnc === "true") {
    pageHeading = "Active Noise Cancelling (ANC) Earbuds";
  } else if (gamingMode === "true") {
    pageHeading = "Low Latency Gaming Earbuds";
  } else if (maxPrice) {
    pageHeading = `Earbuds Under Rs. ${Number(maxPrice).toLocaleString()}`;
  } else if (status === "upcoming") {
    pageHeading = "Upcoming Wireless Earbuds";
  }

  // Breadcrumbs
  const breadcrumbItems: { label: string; href?: string }[] = [];
  if (brand || hasAnc || maxPrice || status) {
    breadcrumbItems.push({ label: "Earbuds", href: "/earbuds" });
    if (brand) {
      breadcrumbItems.push({ label: brandName });
    } else if (hasAnc) {
      breadcrumbItems.push({ label: "ANC Earbuds" });
    } else if (maxPrice) {
      breadcrumbItems.push({ label: `Under Rs. ${Number(maxPrice).toLocaleString()}` });
    } else if (status) {
      breadcrumbItems.push({ label: status.charAt(0).toUpperCase() + status.slice(1) });
    }
  } else {
    breadcrumbItems.push({ label: "Earbuds" });
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
      removeHref: `/earbuds${qs ? `?${qs}` : ""}`,
    });
  }
  if (hasAnc === "true") {
    const nextParams = new URLSearchParams(queryParams);
    nextParams.delete("has_anc");
    nextParams.delete("page");
    const qs = nextParams.toString();
    activeFilters.push({
      label: "Active Noise Cancellation (ANC)",
      removeHref: `/earbuds${qs ? `?${qs}` : ""}`,
    });
  }
  if (wirelessCharging === "true") {
    const nextParams = new URLSearchParams(queryParams);
    nextParams.delete("wireless_charging");
    nextParams.delete("page");
    const qs = nextParams.toString();
    activeFilters.push({
      label: "Wireless Charging",
      removeHref: `/earbuds${qs ? `?${qs}` : ""}`,
    });
  }
  if (gamingMode === "true") {
    const nextParams = new URLSearchParams(queryParams);
    nextParams.delete("gaming_mode");
    nextParams.delete("page");
    const qs = nextParams.toString();
    activeFilters.push({
      label: "Gaming Low Latency",
      removeHref: `/earbuds${qs ? `?${qs}` : ""}`,
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
      removeHref: `/earbuds${qs ? `?${qs}` : ""}`,
    });
  }

  const quickFilterPills = [
    { label: "All Earbuds", key: "all", params: {} },
    { label: "With ANC", key: "anc", params: { has_anc: "true" } },
    { label: "Under Rs. 5,000", key: "p5k", params: { max_price: "5000" } },
    { label: "Under Rs. 10,000", key: "p10k", params: { max_price: "10000" } },
    { label: "Under Rs. 20,000", key: "p20k", params: { max_price: "20000" } },
    { label: "Wireless Charging", key: "qi", params: { wireless_charging: "true" } },
    { label: "Gaming Mode", key: "game", params: { gaming_mode: "true" } },
    { label: "Upcoming", key: "upcoming", params: { status: "upcoming" } },
  ];

  const canonicalUrl = listingIndexing("/earbuds", resolvedParams).canonical.replace("https://mobilerates.info", "");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            generateCollectionPageSchema(pageHeading, `Explore $<CurrencyText text={pageHeading} />`, canonicalUrl)
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
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Headphones className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  TWS & Audio
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main">
                <CurrencyText text={pageHeading} />
              </h1>
              <p className="text-sm text-text-muted mt-1.5 max-w-2xl">
                Showing {earbuds.length} of {total} products with retailer prices
              </p>
            </div>

            {/* Sort Dropdown / Quick switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted">Sort by:</span>
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-border-subtle text-xs">
                <Link
                  href={`/earbuds?${(() => {
                    const p = new URLSearchParams(queryParams);
                    p.delete("sort");
                    p.delete("page");
                    return p.toString();
                  })()}`}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    !sort || sort === "newest"
                      ? "bg-surface-white text-text-main shadow-xs font-bold"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  Latest
                </Link>
                <Link
                  href={`/earbuds?${(() => {
                    const p = new URLSearchParams(queryParams);
                    p.set("sort", "price_asc");
                    p.delete("page");
                    return p.toString();
                  })()}`}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    sort === "price_asc"
                      ? "bg-surface-white text-text-main shadow-xs font-bold"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  USD Price: Low to High
                </Link>
                <Link
                  href={`/earbuds?${(() => {
                    const p = new URLSearchParams(queryParams);
                    p.set("sort", "price_desc");
                    p.delete("page");
                    return p.toString();
                  })()}`}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    sort === "price_desc"
                      ? "bg-surface-white text-text-main shadow-xs font-bold"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  USD Price: High to Low
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {quickFilterPills.map((pill) => {
              const nextParams = new URLSearchParams(queryParams);
              // Clear previous pill keys
              nextParams.delete("has_anc");
              nextParams.delete("max_price");
              nextParams.delete("min_price");
              nextParams.delete("wireless_charging");
              nextParams.delete("gaming_mode");
              nextParams.delete("status");
              nextParams.delete("page");

              Object.entries(pill.params).forEach(([k, v]) => {
                nextParams.set(k, v);
              });

              const isPillActive =
                pill.key === "all"
                  ? !hasAnc && !maxPrice && !wirelessCharging && !gamingMode && !status
                  : Object.entries(pill.params).every(([k, v]) => queryParams.get(k) === v);

              const qs = nextParams.toString();
              const href = `/earbuds${qs ? `?${qs}` : ""}`;

              return (
                <Link
                  key={pill.key}
                  href={href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isPillActive
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface-container-low text-text-muted border-border-subtle hover:bg-surface-container hover:text-text-main"
                  }`}
                >
                  <CurrencyText text={pill.label} />
                </Link>
              );
            })}
          </div>

          {/* Brand Filter Pills if brands exist */}
          {earbudBrands.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">
                Brands:
              </span>
              {earbudBrands.slice(0, 14).map((b) => {
                const isBrandActive = (brand || "").toLowerCase() === b.slug.toLowerCase();
                const nextParams = new URLSearchParams(queryParams);
                if (isBrandActive) {
                  nextParams.delete("brand");
                } else {
                  nextParams.set("brand", b.slug);
                }
                nextParams.delete("page");
                const qs = nextParams.toString();
                return (
                  <Link
                    key={b.slug}
                    href={`/earbuds${qs ? `?${qs}` : ""}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
                      isBrandActive
                        ? "bg-primary/10 text-primary border-primary font-bold"
                        : "bg-surface-white text-text-main border-border-subtle hover:border-primary/50"
                    }`}
                  >
                    {b.name}
                    {typeof b.earbud_count === "number" && b.earbud_count > 0 && (
                      <span className="ml-1 text-[10px] text-text-muted">({b.earbud_count})</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

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
                href="/earbuds"
                className="text-xs text-text-muted hover:text-primary underline ml-1 font-medium transition-colors"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Earbuds Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {earbuds.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-border-subtle text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-text-muted mb-3">
                  <Headphones className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">No earbuds found</h3>
                <p className="text-sm text-text-muted max-w-md mb-5">
                  {brand
                    ? `We couldn't find any ${brandName} earbuds matching your filters.`
                    : "No wireless earbuds match the selected filters. Try broadening your criteria or reset filters."}
                </p>
                {activeFilters.length > 0 && (
                  <Link
                    href="/earbuds"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Clear All Filters
                  </Link>
                )}
              </div>
            ) : (
              earbuds.map((earbud, index) => (
                <EarbudCard key={earbud._id} earbud={earbud} priority={index < 4} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
