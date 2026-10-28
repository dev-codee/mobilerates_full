import { CurrencyText } from "@/app/components/Price";
import { displayCurrency } from "@/app/lib/pricing-server";
import { notFound } from "next/navigation";
import { serializeJsonLd } from "@/app/lib/schema";
import { listingIndexing, isValidListingPage } from "@/app/lib/indexing";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import { getPhones, getBrands } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PhoneCard from "@/app/components/PhoneCard";
import Breadcrumb from "@/app/components/Breadcrumb";
import SidebarFilter from "@/app/components/SidebarFilter";
import Pagination from "@/app/components/Pagination";
import SortSelect from "@/app/components/SortSelect";
import AppIcon from "@/app/components/AppIcon";
import { generateCollectionPageSchema, generateBreadcrumbSchema } from "@/app/lib/schema";

export const revalidate = 600; // Cache phone collection queries for 10 minutes

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const brand = resolvedParams.brand as string;
  const maxPrice = resolvedParams.max_price as string;
  const category = resolvedParams.category as string;
  const forLabel = resolvedParams.for as string;

  let title = "Mobile Phone Prices — Full Phone List";
  let description = "Browse mobile phone prices and specifications. Filter by brand, budget, camera, memory, and battery to compare phones and find a suitable model.";

  if (forLabel) {
    title = `${forLabel} — Price`;
    description = `Discover the best phones for ${forLabel}. Detailed specs, current prices, and comparison.`;
  } else if (brand && !brand.includes(",")) {
    const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
    title = `${formattedBrand} Mobile Phone Prices`;
    description = `Compare all ${formattedBrand} mobile phone prices, full specifications, and latest deals.`;
  } else if (maxPrice) {
    const formattedPrice = Number(maxPrice).toLocaleString();
    title = `Best Mobile Phones Under Rs. ${formattedPrice}`;
    description = `Find the best smartphones priced under Rs. ${formattedPrice}. Compare camera, battery, RAM, and performance.`;
  } else if (category) {
    title = `Best ${category.charAt(0).toUpperCase() + category.slice(1)} Mobile Phones`;
  }

  const isBrandPage = !!brand && !brand.includes(",") && !maxPrice && !category && !forLabel;
  const indexing = listingIndexing(isBrandPage ? `/brands/${brand}` : "/phones", resolvedParams, isBrandPage);
  if (indexing.robots.index) {
    const query = new URLSearchParams();
    if (brand) query.set("brand", brand);
    if (typeof resolvedParams.page === "string") query.set("page", resolvedParams.page);
    const result = await getPhones(query.toString());
    indexing.robots.index = !!result.pagination.total && result.pagination.total > 0;
  }
  const canonicalUrl = indexing.canonical;
  // Append the auto-updating current year (stripping any pre-existing year so it
  // never doubles or goes stale) and expose it as an `absolute` title so the
  // the root title template is not applied to listing pages.
  const year = new Date().getFullYear();
  const finalTitle = `${title.replace(/\s*\b20\d{2}\b\s*$/, "").trim()} ${year}`;

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

export default async function PhonesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  if (!isValidListingPage(resolvedParams)) notFound();
  const maxPrice = resolvedParams.max_price as string;
  const minPrice = resolvedParams.min_price as string;
  const sort = resolvedParams.sort as string;
  const brand = resolvedParams.brand as string;
  const ram = resolvedParams.ram as string;
  const processor = resolvedParams.processor as string;
  const display = resolvedParams.display as string;
  const camera = resolvedParams.camera as string;
  const network = resolvedParams.network as string;
  const battery = resolvedParams.battery as string;
  const video = resolvedParams.video as string;
  const storage = resolvedParams.storage as string;
  const refreshRate = resolvedParams.refresh_rate as string;
  const page = resolvedParams.page as string;
  const limit = resolvedParams.limit as string;
  const category = resolvedParams.category as string;
  const status = resolvedParams.status as string;
  const forLabel = resolvedParams.for as string;

  // Build the query string
  const queryParts = [`display_currency=${await displayCurrency()}`];
  if (page) queryParts.push(`page=${page}`);
  if (minPrice) queryParts.push(`min_price=${minPrice}`);
  if (maxPrice) queryParts.push(`max_price=${maxPrice}`);
  if (sort) queryParts.push(`sort=${sort}`);
  if (brand) queryParts.push(`brand=${brand}`);
  if (ram) queryParts.push(`ram=${ram}`);
  if (processor) queryParts.push(`processor=${processor}`);
  if (display) queryParts.push(`display=${display}`);
  if (camera) queryParts.push(`camera=${camera}`);
  if (network) queryParts.push(`network=${network}`);
  if (battery) queryParts.push(`battery=${battery}`);
  if (video) queryParts.push(`video=${video}`);
  if (storage) queryParts.push(`storage=${storage}`);
  if (refreshRate) queryParts.push(`refresh_rate=${refreshRate}`);
  if (limit) queryParts.push(`limit=${limit}`);
  if (category) queryParts.push(`category=${category}`);
  if (status) queryParts.push(`status=${status}`);

  const query = queryParts.length > 0 ? queryParts.join("&") : undefined;

  const [paginatedData, brands] = await Promise.all([
    getPhones(query),
    getBrands()
  ]);

  const { phones, pagination } = paginatedData;
  if (!isValidListingPage(resolvedParams, pagination.totalPages)) notFound();

  let title = "All Phones";
  if (forLabel) {
    title = forLabel;
  } else if (brand && !brand.includes(",")) {
    const selectedBrand = brands.find((b) => b.slug === brand);
    if (selectedBrand) title = `${selectedBrand.name.toUpperCase()} Phones`;
  } else if (brand) {
    title = "Filtered Phones";
  } else if (category) {
    title = `Best Phones for ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  } else if (status === "upcoming") {
    title = "Upcoming Phones";
  } else if (sort === "price_asc") {
    title = "Best Phones By Price";
  } else if (maxPrice) {
    title = `Phones Under Rs. ${Number(maxPrice).toLocaleString()}`;
  } else if (sort === "latest") {
    title = "Latest Phones";
  } else if (sort === "trending") {
    title = limit === "10" ? "Top 10 Trending Phones" : "Trending Phones";
  }

  const isBrandPage = !!brand && !brand.includes(",") && !maxPrice && !category && !forLabel;
  const canonicalPath = listingIndexing(isBrandPage ? `/brands/${brand}` : "/phones", resolvedParams, isBrandPage).canonical.replace("https://mobilerates.info", "");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateCollectionPageSchema(title, `Explore ${title}: compare prices, specifications, and features.`, canonicalPath)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateBreadcrumbSchema([{ label: title }])),
        }}
      />
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8 bg-surface min-h-[60vh]">
        <SidebarFilter brands={brands} />

        <section className="flex-1">
          <div className="mb-6 space-y-4">
            <Breadcrumb items={[{ label: title }]} />

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight mb-1">
                <CurrencyText text={title} />
              </h1>
              <p className="text-sm text-text-muted">
                Compare prices, features, and full specifications across top online retailers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="font-body-sm text-body-sm text-text-muted">
                Showing <span className="font-semibold text-text-main">{phones.length}</span> of <span className="font-semibold text-text-main">{pagination.total}</span> results
              </p>
                <SortSelect />
            </div>
          </div>

          {phones.length > 0 ? (
            <div className="flex flex-col gap-6">
              {phones.map((phone) => (
                <PhoneCard key={phone._id} phone={phone} />
              ))}

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
              />
            </div>
          ) : (
            <div className="bg-surface-white rounded-xl border border-border-subtle p-12 flex flex-col items-center justify-center text-center mt-6">
              <AppIcon name="sentiment_dissatisfied" size={64} className="text-outline mb-4 opacity-60" />
              <h2 className="font-headline-md text-xl font-bold text-text-main mb-2">
                No Phones Found
              </h2>
              <p className="text-text-muted max-w-md mx-auto">
                We couldn&apos;t find any phones matching your filters. Try adjusting them or clearing the selections.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
