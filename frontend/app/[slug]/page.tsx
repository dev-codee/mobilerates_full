import Price from "@/app/components/Price";
import { verifiedRating } from "@/app/lib/content-quality";
import { serializeJsonLd } from "@/app/lib/schema";
import { cleanMetadata, withoutSiteBrand } from "@/app/lib/seo";
import { resolveProduct } from "@/app/lib/products";
import VehicleDetailPage, { generateMetadata as vehicleMetadata } from "@/app/components/details/VehicleDetailPage";
import EarbudDetailPage, { generateMetadata as earbudMetadata } from "@/app/components/details/EarbudDetailPage";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getPhones, getRelatedPhones, Phone } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import PhoneGallery from "@/app/components/PhoneGallery";
import PhoneSpecs from "@/app/components/PhoneSpecs";
import PriceHistoryChart from "@/app/components/PriceHistoryChart";
import UserFeedbackWidget from "@/app/components/UserFeedbackWidget";
import ReviewSection from "@/app/components/ReviewSection";
import AdSlot from "@/app/components/AdSlot";
import AppIcon from "@/app/components/AppIcon";
import { generateProductSchema, generateBreadcrumbSchema, generateVideoSchema, generateWebPageSchema } from "@/app/lib/schema";
import { filterVisibleTags } from "@/app/lib/tags";

export const revalidate = 3600; // Cache phone detail pages for 1 hour

function getTagColorClass(tag: string) {
  const hash = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorThemes = [
    { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/20" },
    { bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/20" },
    { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/20" },
    { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-500/20" },
    { bg: "bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/20" },
    { bg: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-500/20" },
    { bg: "bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-500/20" },
    { bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/20" },
    { bg: "bg-teal-500/10", text: "text-teal-700 dark:text-teal-400", border: "border-teal-500/20" }
  ];
  return colorThemes[hash % colorThemes.length];
}

function getYouTubeEmbedId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const product = await resolveProduct(slug);
  if (product?.type === "vehicle") return vehicleMetadata({ params });
  if (product?.type === "earbud") return earbudMetadata({ params });
  const phone = product?.type === "phone" ? product.data : null;

  if (!phone) {
    // The page component calls notFound() (→ HTTP 404) for this case, but if a
    // stale/edge cache ever serves this metadata with a 200, noindex stops Google
    // from indexing the soft-404.
    return cleanMetadata({
      title: "Phone Not Found",
      description: "The requested phone could not be found.",
      robots: { index: false, follow: false },
    });
  }

  const primaryImage = phone.images?.find((img) => img.is_primary)?.url || phone.images?.[0]?.url;
  const canonicalUrl = `https://mobilerates.info/${phone.slug}`;

  // Auto-updating year (e.g. 2026) appended to the title. Any year already baked
  // into a custom/AI title is stripped first so it never shows stale or doubled.
  const year = new Date().getFullYear();
  const baseTitle =
    phone.seo?.meta_title ||
    phone.seo?.ai_seo_title ||
    `${phone.name} Latest Price & Specs`;
  const title = `${withoutSiteBrand(baseTitle).replace(/\s*\b20\d{2}\b\s*$/, "").trim()} ${year}`.trim();

  const description = (phone.seo?.meta_description || phone.seo?.ai_meta_description || `Best price for ${phone.name}. Compare full specifications, camera, battery, features, and user reviews.`).trim();

  return cleanMetadata({
    title: { absolute: title },
    description,
    keywords: phone.seo?.ai_keywords || [`mobile phones`, `${phone.name} price`, `${phone.brand_slug} mobile`, `buy ${phone.name}`],
    alternates: {
      canonical: canonicalUrl,
    },
    // Only explicitly approved product content is eligible for indexing.
    ...(phone.seo?.is_indexable !== true && {
      robots: { index: false, follow: true },
    }),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: primaryImage ? [{ url: primaryImage, alt: `${phone.name} Price` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  });
}

export default async function PhoneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const product = await resolveProduct(slug);
  if (product?.type === "vehicle") return VehicleDetailPage({ params });
  if (product?.type === "earbud") return EarbudDetailPage({ params });
  if (!product) notFound();
  const phone = product.data;

  // Guard against records with missing fields — an undefined brand_slug/name
  // would throw on `.toUpperCase()`/`.replace()` during render and surface to
  // Google as a "Server error (5xx)" for that phone.
  phone.brand_slug = phone.brand_slug || "";
  phone.name = phone.name || "Phone";

  // Derived values
  const rawPriceStr = String(phone.price_pkr || "");
  const parsedPricePkr = Number(rawPriceStr.replace(/[^0-9.]/g, ''));
  const validPrices = (phone.prices || []).map((p) => Number(p.price_pkr)).filter(p => !isNaN(p) && p > 0);
  const lowestPrice = (!isNaN(parsedPricePkr) && parsedPricePkr > 0) ? parsedPricePkr : (validPrices.length ? Math.min(...validPrices) : null);
  const rating = verifiedRating(phone.rating);
  const reviewCount = phone.rating?.count || 0;
  const hasAffiliateUrls = phone.prices?.some((p) => !!p.product_url);

  // Fetch competitor phones
  let competitorPhones: Phone[] = [];
  try {
    if (lowestPrice) {
      const minPrice = lowestPrice - 3000;
      const maxPrice = lowestPrice + 3000;
      const allMatching = await getPhones(`min_price=${minPrice}&max_price=${maxPrice}`);
      competitorPhones = allMatching.phones
        .filter((p) => p.slug !== phone.slug)
        .slice(0, 10);
    } else {
      const sameBrand = await getPhones(`brand=${phone.brand_slug}`);
      competitorPhones = sameBrand.phones
        .filter((p) => p.slug !== phone.slug)
        .slice(0, 10);
    }
  } catch (error) {
    console.error("Failed to fetch competitors:", error);
  }

  // Fetch brand phones for the sidebar list
  let brandPhones: Phone[] = [];
  try {
    if (!lowestPrice) {
      brandPhones = competitorPhones;
    } else {
      const sameBrand = await getPhones(`brand=${phone.brand_slug}`);
      brandPhones = sameBrand.phones
        .filter((p) => p.slug !== phone.slug)
        .slice(0, 10);
    }
  } catch (error) {
    console.error("Failed to fetch brand phones:", error);
  }

  // Fetch related phones (processor & network)
  let relatedByProcessor: Phone[] = [];
  let relatedByNetwork: Phone[] = [];
  try {
    const relatedData = await getRelatedPhones(phone.slug);
    if (relatedData) {
      relatedByProcessor = relatedData.by_processor || [];
      relatedByNetwork = relatedData.by_network || [];
    }
  } catch (error) {
    console.error("Failed to fetch related phones:", error);
  }

  const releaseDateStr = phone.release_date && !isNaN(Date.parse(phone.release_date))
    ? new Date(phone.release_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  // Format specs for the row
  const specs = phone.specs || {};

  // RAM processing
  const ramOptions = specs.performance?.ram_options_gb;
  const ramDisplay = ramOptions?.length
    ? `${Math.max(...ramOptions)}GB`
    : "N/A";

  // Storage processing
  const storageOptions = specs.performance?.storage_options_gb;
  const storageDisplay = storageOptions?.length
    ? `${Math.max(...storageOptions)}GB`
    : "N/A";

  // Battery processing
  const batteryCap = specs.battery?.capacity_mah;
  const batteryDisplay = batteryCap ? `${batteryCap}mAh` : "N/A";

  // Camera processing (simplified, taking first rear camera if available or a summary)
  const cameraDisplay = specs.camera?.rear_summary || "N/A";

  // Display processing
  const displaySize = specs.display?.size_inches;
  const displayType = specs.display?.type;
  // If type contains size info (like "6000 mAh" which is wrong in the DB for display), we just use size
  const displayString = displaySize ? `${displaySize}"` : "N/A";

  // Chipset processing
  const chipsetFull = specs.performance?.chipset;
  // Try to extract a shorter name, e.g., "Snapdragon 6 Gen 3" from "Qualcomm SM6475-AB Snapdragon 6 Gen 3 (4 nm)"
  let chipsetDisplay = chipsetFull || "N/A";
  if (chipsetFull?.includes("Snapdragon")) {
    const match = chipsetFull.match(/(Snapdragon[^(\n]+)/);
    if (match) chipsetDisplay = match[1].trim();
  } else if (chipsetFull?.includes("Apple")) {
    const match = chipsetFull.match(/(Apple[^(\n]+)/);
    if (match) chipsetDisplay = match[1].trim();
  }

  // Network processing
  const network = specs.connectivity?.network || "";
  let networkDisplay = "N/A";
  if (network.includes("5G")) {
    networkDisplay = "5G Supported";
  } else if (network.includes("4G") || network.includes("LTE")) {
    networkDisplay = "4G Supported";
  } else if (network) {
    networkDisplay = "Network Supported";
  }

  // OS processing
  const osDisplay = specs.os || "N/A";


  return (
    <>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(generateProductSchema(phone as any)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: serializeJsonLd(generateBreadcrumbSchema([
          { label: phone.brand_slug.toUpperCase().replace("-", " "), href: `/brands/${phone.brand_slug}` },
          { label: phone.name }
        ]))
      }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: serializeJsonLd(generateWebPageSchema(
          phone.seo?.meta_title || `${phone.name} Price, Specs & Reviews`,
          phone.seo?.meta_description || phone.seo?.ai_meta_description || `Find the best price for ${phone.name}. Read full specifications, features, and user reviews.`,
          `/${phone.slug}`
        ))
      }} />
      {phone.video_url && generateVideoSchema(phone as any) && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(generateVideoSchema(phone as any)) }} />
      )}

      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-[15px] bg-surface">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: phone.brand_slug.toUpperCase().replace("-", " "), href: `/brands/${phone.brand_slug}` },
            { label: phone.name },
          ]}
        />

        {/* Hero Section Container */}
        <div className="bg-white border border-border-subtle rounded-xl p-6 md:p-8 shadow-sm">
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Gallery */}
            <PhoneGallery images={phone.images} altText={`${phone.name.replace(/\s+/g, '-')}-Price`} />

            {/* Product Info */}
            <div className="flex flex-col gap-3">
              <div>
                <h1 className="font-headline-lg text-xl md:text-2xl lg:text-[28px] text-text-main mb-1.5 font-bold tracking-tight">
                  {phone.name} Price & Specs
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-0">
                  <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full uppercase border border-border-subtle">
                    {phone.brand_slug.toUpperCase().replace("-", " ")}
                  </span>
                  {releaseDateStr && (
                    <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full border border-border-subtle">
                      Released: {releaseDateStr}
                    </span>
                  )}
                  {(phone.view_count !== undefined && phone.view_count !== null && (phone.view_count ?? 0) > 0) && (
                    <span className="inline-flex items-center gap-1.5 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full border border-border-subtle">
                      <AppIcon name="visibility" size={14} className="text-text-muted" />
                      <span>{(phone.view_count).toLocaleString()} views</span>
                    </span>
                  )}
                  {filterVisibleTags(phone.tags).map((tag) => {
                    const colors = getTagColorClass(tag);
                    return (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 ${colors.bg} ${colors.text} rounded-full px-3 py-1 text-xs font-semibold border ${colors.border}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>

                {/* Rating */}
                {rating ? (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center text-yellow-500">
                      <AppIcon name="star" size={18} fill="#FF9800" className="text-yellow-500" />
                      <span className="font-label-md text-sm text-text-main ml-1 font-semibold">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-text-muted font-body-sm text-sm">
                      ({reviewCount} reviews)
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Top Features */}
              <div className="mt-1">
                <h2 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
                  <span className="w-1 h-5 bg-primary rounded-full"></span>
                  Top Features of {phone.name}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <AppIcon name="memory" size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">RAM</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{ramDisplay}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <AppIcon name="storage" size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Storage</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{storageDisplay}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <AppIcon name="signal_cellular_alt" size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Network</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{networkDisplay}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <AppIcon name="battery_charging_full" size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Battery</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{batteryDisplay}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <AppIcon name="widgets" size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">OS</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{osDisplay}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <AppIcon name="smartphone" size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Display</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{displayString}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <AppIcon name="photo_camera" size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Camera</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{cameraDisplay}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                      <AppIcon name="developer_board" size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">Chipset</span>
                      <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">{chipsetDisplay}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display-lg text-2xl md:text-3xl font-bold text-price-green tracking-tight">
                  <Price product={phone} />
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                <Link
                  href={`/compare?phone=${phone.slug}`}
                  rel="nofollow"
                  className="flex items-center justify-center gap-1.5 py-1 px-3 sm:py-1.5 sm:px-4 rounded-sm border border-border-subtle bg-surface-white hover:bg-surface-container-low hover:border-primary font-medium text-[10px] sm:text-[11px] text-text-main transition-colors"
                >
                  <AppIcon name="compare_arrows" size={14} />
                  Compare
                </Link>
                <button className="flex items-center justify-center gap-1.5 py-1 px-3 sm:py-1.5 sm:px-4 rounded-sm border border-border-subtle bg-surface-white hover:bg-surface-container-low hover:border-primary font-medium text-[10px] sm:text-[11px] text-text-main transition-colors">
                  <AppIcon name="flame" size={14} />
                  Price Alert
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Price Comparison & Specs Grid Container with equal vertical gap */}
        <div className="flex flex-col gap-[15px]">
          {/* Price History Graph — only rendered when we have at least two data points */}
          {phone.price_history && phone.price_history.length >= 2 && (
            <PriceHistoryChart points={phone.price_history} phoneName={phone.name} />
          )}

          {/* Price Comparison Table */}
          {hasAffiliateUrls && (
            <section className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 md:px-6 border-b border-border-subtle bg-surface-container-low/30">
                <h2 className="font-headline-md text-lg font-bold text-text-main">
                  Price Comparison
                </h2>
              </div>

              <div className="divide-y divide-border-subtle">
                {phone.prices && phone.prices.length > 0 ? (
                  phone.prices.map((priceItem, index) => (
                    <div
                      key={index}
                      className="p-3 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container-low border border-border-subtle rounded-lg flex items-center justify-center font-bold text-primary text-base uppercase shadow-sm flex-shrink-0">
                          {priceItem.retailer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-label-md text-sm font-semibold text-text-main">
                            {priceItem.retailer_name}
                          </div>
                          <div className="font-body-sm text-xs text-price-green font-medium flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-price-green"></span>
                            {priceItem.stock_status || "In Stock"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-1 md:mt-0 pt-3 md:pt-0 border-t border-border-subtle md:border-0">
                        <div className="font-headline-md text-lg font-bold text-text-main">
                          <Price amount={priceItem.price_pkr} />
                        </div>
                        {priceItem.product_url ? (
                          <a
                            href={priceItem.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-on-primary-fixed-variant text-white font-label-md text-xs px-5 h-9 transition-all shadow-md hover:shadow-lg rounded-lg font-semibold flex items-center justify-center cursor-pointer"
                          >
                            Buy Now
                          </a>
                        ) : (
                          <button
                            className="bg-surface-container-low text-text-muted font-label-md text-xs px-5 h-9 rounded-lg font-semibold flex items-center justify-center cursor-not-allowed border border-border-subtle"
                            disabled
                          >
                            Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center flex flex-col items-center">
                    <AppIcon name="category" size={32} className="text-outline mb-2 opacity-60" />
                    <p className="text-text-muted font-medium">No prices available for this phone yet.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Specifications and Competitors Section with equal gap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[15px] items-start">
            <div className="lg:col-span-2">
              {/* Full Specifications Table */}
              <PhoneSpecs specs={phone.specs} phone={phone} />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
                <h3 className="font-headline-sm text-sm font-bold text-text-main mb-4 flex items-center gap-1">
                  <AppIcon name="compare_arrows" size={18} className="text-primary" />
                  Competitors for {phone.name}
                </h3>

                {competitorPhones.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {competitorPhones.map((comp) => {
                      const compLowestPrice = comp.prices?.length
                        ? Math.min(...comp.prices.map((p) => p.price_pkr))
                        : null;
                      const primaryImage = comp.images?.find((img) => img.is_primary) || comp.images?.[0];

                      return (
                        <Link
                          key={comp._id}
                          href={`/${comp.slug}`}
                          className="flex flex-col rounded-lg border border-border-subtle hover:border-primary hover:shadow-sm transition-all bg-white overflow-hidden group"
                        >
                          <div className="relative aspect-[4/5] bg-surface-container-low flex items-center justify-center p-3">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={comp.name}
                                className="object-contain w-full h-full mix-blend-darken group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <AppIcon name="smartphone" size={28} className="text-text-muted" />
                            )}
                          </div>
                          <div className="flex flex-col p-3 bg-white">
                            <h4 className="font-semibold text-xs text-text-main group-hover:text-primary transition-colors line-clamp-2 min-h-[32px]">
                              {comp.name}
                            </h4>
                            <span className="text-sm font-bold text-text-main mt-1">
                              <Price product={comp} />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">No competitor devices found.</p>
                )}
              </div>

              {/* Other Brand Phones */}
              <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm mt-6">
                <h3 className="font-headline-sm text-sm font-bold text-text-main mb-3">
                  Other {phone.brand_slug.toUpperCase().replace("-", " ")} Mobile Prices
                </h3>
                <ul className="flex flex-col gap-2">
                  {brandPhones.map(bp => (
                    <li key={bp._id}>
                      <Link href={`/${bp.slug}`} className="text-sm text-primary hover:underline line-clamp-1">
                        {bp.name} Price
                      </Link>
                    </li>
                  ))}
                  {brandPhones.length === 0 && (
                    <li className="text-xs text-text-muted">No other phones found.</li>
                  )}
                </ul>
              </div>

              {/* Best Phones by Price */}
              <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm mt-6">
                <h3 className="font-headline-sm text-sm font-bold text-red-600 mb-3">
                  Best Phones List with Price
                </h3>
                <ul className="flex flex-col gap-2">
                  {[10000, 15000, 20000, 30000, 40000, 50000, 80000, 100000].map(price => (
                    <li key={price}>
                      <Link href={`/phones?max_price=${price}`} className="text-sm text-primary hover:underline">
                        Mobile phone price under <Price amount={price} estimate={false} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related by Processor */}
              {relatedByProcessor.length > 0 && (
                <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm mt-6">
                  <h3 className="font-headline-sm text-sm font-bold text-text-main mb-3">
                    Phones with Same Processor
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {relatedByProcessor.map(p => (
                      <li key={p._id}>
                        <Link href={`/${p.slug}`} className="text-sm text-primary hover:underline">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related by Network */}
              {relatedByNetwork.length > 0 && (
                <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm mt-6">
                  <h3 className="font-headline-sm text-sm font-bold text-text-main mb-3">
                    Similar Network Phones
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {relatedByNetwork.map(p => (
                      <li key={p._id}>
                        <Link href={`/${p.slug}`} className="text-sm text-primary hover:underline">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sidebar Ad Slot */}
              <div className="mt-6">
                <AdSlot placement="SIDEBAR" layout="col" />
              </div>
            </div>
          </div>
        </div>

        {/* Video Review Section */}
        {phone.video_url && (
          <section className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border-subtle bg-surface-container-low/30 flex items-center gap-2">
              <AppIcon name="smart_display" size={24} className="text-red-600" />
              <h2 className="font-headline-md text-xl font-bold text-text-main">
                Video Review & Hands-on
              </h2>
            </div>
            <div className="p-6 flex justify-center">
              {getYouTubeEmbedId(phone.video_url) ? (
                <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden border border-border-subtle shadow-sm">
                  <iframe loading="lazy"
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeEmbedId(phone.video_url)}`}
                    title={`${phone.name} Video Review`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={phone.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
                >
                  <AppIcon name="open_in_new" size={18} />
                  Watch Video on YouTube
                </a>
              )}
            </div>
          </section>
        )}

        {/* User Feedback Widget */}
        <UserFeedbackWidget phoneId={phone._id} phoneName={phone.name} />

        {/* Product Description — temporarily hidden from UI */}
        {/* <PhoneDescriptionClient slug={phone.slug} initialDescription={phone.description} phoneName={phone.name} /> */}

        {/* Product Area Ad Slot */}
        <div className="mt-2 mb-4">
          <AdSlot placement="PRODUCT_AREA" layout="row" />
        </div>

        {/* User Reviews Section */}
        <ReviewSection phoneId={phone._id} />
      </main>
      <Footer />
    </>
  );
}
