import { CurrencyText } from "@/app/components/Price";
import Price from "@/app/components/Price";
import { verifiedRating, publishableDescription } from "@/app/lib/content-quality";
import { serializeJsonLd } from "@/app/lib/schema";
import { cleanMetadata, withoutSiteBrand } from "@/app/lib/seo";
import { getProductVehicleBySlug as getVehicleBySlug } from "@/app/lib/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getRelatedVehicles, type Vehicle } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import EVGallery from "@/app/components/EVGallery";
import EVSpecs from "@/app/components/EVSpecs";
import EVDescriptionClient from "@/app/components/EVDescriptionClient";
import VehicleFeedbackWidget from "@/app/components/VehicleFeedbackWidget";
import VehicleReviewSection from "@/app/components/VehicleReviewSection";
import AdSlot from "@/app/components/AdSlot";
import AppIcon from "@/app/components/AppIcon";
import { getBrandRegion } from "@/app/lib/brandRegion";
import {
  generateVehicleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateVideoSchema,
  generateWebPageSchema,
} from "@/app/lib/schema";

export const revalidate = 3600; // Cache for 1 hour

function getYouTubeEmbedId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getBudgetLinks(category?: string) {
  const cat = category || "Car";

  if (cat === "Scooter" || cat === "Bike") {
    const catTitle = cat === "Bike" ? "Bikes" : "Scooters";
    return {
      title: `Electric ${catTitle} by Budget`,
      items: [
        { label: `Under Rs. 150,000`, price: 150000 },
        { label: `Under Rs. 250,000`, price: 250000 },
        { label: `Under Rs. 400,000`, price: 400000 },
        { label: `Under Rs. 600,000`, price: 600000 },
        { label: `Under Rs. 1,000,000`, price: 1000000 },
      ],
      queryParam: `category=${cat}`,
    };
  }

  if (cat === "Rickshaw") {
    return {
      title: `Electric Rickshaws by Budget`,
      items: [
        { label: `Under Rs. 300,000`, price: 300000 },
        { label: `Under Rs. 500,000`, price: 500000 },
        { label: `Under Rs. 800,000`, price: 800000 },
        { label: `Under Rs. 1,200,000`, price: 1200000 },
      ],
      queryParam: `category=Rickshaw`,
    };
  }

  if (cat === "Cycle") {
    return {
      title: `Electric Cycles by Budget`,
      items: [
        { label: `Under Rs. 35,000`, price: 35000 },
        { label: `Under Rs. 50,000`, price: 50000 },
        { label: `Under Rs. 75,000`, price: 75000 },
        { label: `Under Rs. 100,000`, price: 100000 },
      ],
      queryParam: `category=Cycle`,
    };
  }

  // Cars
  return {
    title: `Electric Cars by Budget`,
    items: [
      { label: `Under Rs. 5,000,000`, price: 5000000 },
      { label: `Under Rs. 8,000,000`, price: 8000000 },
      { label: `Under Rs. 10,000,000`, price: 10000000 },
      { label: `Under Rs. 15,000,000`, price: 15000000 },
      { label: `Under Rs. 20,000,000`, price: 20000000 },
      { label: `Under Rs. 30,000,000`, price: 30000000 },
    ],
    queryParam: `category=Car`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getVehicleBySlug(resolvedParams.slug);
  const vehicle = data?.vehicle;

  if (!vehicle) {
    return cleanMetadata({
      title: "Vehicle Not Found",
      description: "The requested electric vehicle could not be found.",
      robots: { index: false, follow: false },
    });
  }

  const primaryImage = vehicle.images?.find((img) => img.url)?.url;
  const canonicalUrl = `https://mobilerates.info/${vehicle.slug}`;

  const baseTitle =
    vehicle.seo?.meta_title ||
    vehicle.seo?.ai_seo_title ||
    `${vehicle.name} Price & Full Specs`;
  const title = withoutSiteBrand(baseTitle).trim();

  const description =
    (vehicle.seo?.meta_description ||
    vehicle.seo?.ai_meta_description ||
    `Get complete details on ${vehicle.name}. Compare price, battery capacity, range, acceleration, charging speed, features, and full specifications.`).trim();

  return cleanMetadata({
    title: { absolute: title },
    description,
    keywords: vehicle.seo?.ai_keywords || [
      `${vehicle.name} price`,
      `${vehicle.brand_slug} electric car`,
      `${vehicle.name} specs`,
      `electric vehicles`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    // Only explicitly approved product content is eligible for indexing.
    ...(vehicle.seo?.is_indexable !== true && {
      robots: { index: false, follow: true },
    }),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: primaryImage ? [{ url: primaryImage, alt: `${vehicle.name} Price` }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  });
}

export default async function EVDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const data = await getVehicleBySlug(resolvedParams.slug);

  if (!data || !data.vehicle) {
    notFound();
  }

  const { vehicle, variants = [] } = data;

  // Guard against missing fields
  vehicle.brand_slug = vehicle.brand_slug || "";
  vehicle.name = vehicle.name || "Electric Vehicle";

  // Related vehicles
  let relatedData: any = null;
  try {
    relatedData = await getRelatedVehicles(vehicle.slug);
  } catch (err) {
    console.error("Failed to fetch related vehicles:", err);
  }

  const competitors: Vehicle[] = relatedData?.by_category || [];
  const brandVehicles: Vehicle[] = relatedData?.by_brand || [];
  const priceCompetitors: Vehicle[] = relatedData?.by_price || [];

  // Derived price calculation
  const rawPriceStr = String(vehicle.price_pkr || "");
  const parsedPricePkr = Number(rawPriceStr.replace(/[^0-9.]/g, ""));
  const validPrices = (vehicle.prices || [])
    .map((p) => Number(p.price_pkr))
    .filter((p) => !isNaN(p) && p > 0);
  const lowestPrice =
    !isNaN(parsedPricePkr) && parsedPricePkr > 0
      ? parsedPricePkr
      : validPrices.length
      ? Math.min(...validPrices)
      : null;

  const hasAffiliateUrls = vehicle.prices?.some((p) => !!p.product_url);
  const rating = verifiedRating(vehicle.rating);
  const reviewCount = vehicle.rating?.count || 0;

  const releaseDateStr =
    vehicle.release_date && !isNaN(Date.parse(vehicle.release_date))
      ? new Date(vehicle.release_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const specs = vehicle.specs || {};
  const pricing = vehicle.pricing || {};
  const brandRegion = getBrandRegion(vehicle.brand_slug, vehicle.made_in);

  // Build the 8-box highlights (ONLY values that exist)
  const highlights: { icon: string; label: string; value: string }[] = [];

  // 1. Battery
  const batteryCap = specs.battery?.capacity_usable_kwh || specs.battery?.capacity_gross_kwh;
  if (batteryCap) {
    highlights.push({
      icon: "battery_charging_full",
      label: "Battery",
      value: `${batteryCap} kWh${specs.battery?.capacity_usable_kwh ? " (Usable)" : ""}`,
    });
  }

  // 2. Range
  const rangeKm = specs.range_and_efficiency?.wltp_combined_km || specs.range_and_efficiency?.epa_combined_km || specs.range_and_efficiency?.cltc_range_km;
  if (rangeKm) {
    const rangeStandard = specs.range_and_efficiency?.wltp_combined_km ? "WLTP" : specs.range_and_efficiency?.epa_combined_km ? "EPA" : "CLTC";
    highlights.push({
      icon: "speed",
      label: "Range",
      value: `${rangeKm} km (${rangeStandard})`,
    });
  }

  // 3. Acceleration
  if (specs.powertrain?.acceleration_0_100_kmh) {
    highlights.push({
      icon: "shutter_speed",
      label: "0-100 km/h",
      value: `${specs.powertrain.acceleration_0_100_kmh} seconds`,
    });
  }

  // 4. Power
  if (specs.powertrain?.total_power_hp || specs.powertrain?.total_power_kw) {
    const powerStr = specs.powertrain?.total_power_hp
      ? `${specs.powertrain.total_power_hp} HP`
      : `${specs.powertrain?.total_power_kw} kW`;
    highlights.push({
      icon: "bolt",
      label: "Power",
      value: powerStr,
    });
  }

  // 5. Drive
  if (specs.powertrain?.drive_layout) {
    highlights.push({
      icon: "settings_ethernet",
      label: "Drivetrain",
      value: specs.powertrain.drive_layout,
    });
  }

  // 6. Fast Charging
  if (specs.charging?.dc_max_power_kw || specs.charging?.dc_charge_time_10_80_min) {
    const dcStr = specs.charging?.dc_max_power_kw
      ? `${specs.charging.dc_max_power_kw} kW DC`
      : `${specs.charging?.dc_charge_time_10_80_min} min (10-80%)`;
    highlights.push({
      icon: "offline_bolt",
      label: "Fast Charge",
      value: dcStr,
    });
  }

  // 7. Seats & Doors
  if (vehicle.seats || vehicle.doors) {
    const seatStr = [
      vehicle.seats ? `${vehicle.seats} Seats` : null,
      vehicle.doors ? `${vehicle.doors} Doors` : null,
    ]
      .filter(Boolean)
      .join(" • ");
    highlights.push({
      icon: "airline_seat_recline_extra",
      label: "Cabin",
      value: seatStr,
    });
  }

  // 8. Screen / Cockpit
  if (specs.cockpit_and_tech?.center_screen_inches) {
    highlights.push({
      icon: "tv",
      label: "Touchscreen",
      value: `${specs.cockpit_and_tech.center_screen_inches}" Display`,
    });
  }

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateVehicleSchema(vehicle)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            generateBreadcrumbSchema([
              { label: "Vehicles", href: "/vehicles" },
              {
                label: vehicle.ev_category ? `${vehicle.ev_category}s` : "Cars",
                href: `/vehicles?category=${vehicle.ev_category || "Car"}`,
              },
              { label: vehicle.name },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            generateWebPageSchema(
              vehicle.seo?.meta_title || `${vehicle.name} Price, Specs & Features`,
              vehicle.seo?.meta_description ||
                `Check complete price, range, battery, performance and full specifications of ${vehicle.name}.`,
              `/${vehicle.slug}`
            )
          ),
        }}
      />
      {vehicle.seo?.ai_faq && vehicle.seo.ai_faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(generateFAQSchema(vehicle.seo.ai_faq)),
          }}
        />
      )}
      {vehicle.video_url && generateVideoSchema(vehicle as any) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(generateVideoSchema(vehicle as any)),
          }}
        />
      )}

      <div className="min-h-screen bg-surface flex flex-col selection:bg-primary/20">
        <Navbar />

        <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-[15px] bg-surface">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Vehicles", href: "/vehicles" },
              {
                label: vehicle.ev_category ? `${vehicle.ev_category}s` : "Cars",
                href: `/vehicles?category=${vehicle.ev_category || "Car"}`,
              },
              { label: vehicle.name },
            ]}
          />

          {/* Hero Section Container */}
          <div className="bg-white border border-border-subtle rounded-xl p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Automotive Gallery */}
              <EVGallery
                images={vehicle.images}
                altText={`${vehicle.name} Price`}
                vehicleName={vehicle.name}
              />

              {/* Right Column: Title, Pricing & Highlights */}
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="font-headline-lg text-xl md:text-2xl lg:text-[28px] text-text-main mb-1.5 font-bold tracking-tight">
                    {vehicle.name} Price & Specs
                  </h1>

                  {/* Badges & Meta Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-0">
                    {/* Brand */}
                    {vehicle.brand_slug && (
                      <Link
                        href={`/vehicles?brand=${vehicle.brand_slug}`}
                        className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full uppercase border border-border-subtle hover:bg-surface-container transition-colors"
                      >
                        {vehicle.brand_slug.toUpperCase().replace("-", " ")}
                      </Link>
                    )}

                    {/* Category */}
                    {vehicle.ev_category && (
                      <Link
                        href={`/vehicles?category=${vehicle.ev_category}`}
                        className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full uppercase border border-border-subtle hover:bg-surface-container transition-colors"
                      >
                        {vehicle.ev_category}
                      </Link>
                    )}

                    {/* Body Type (only if distinct from category) */}
                    {vehicle.body_type && vehicle.body_type.toLowerCase() !== vehicle.ev_category?.toLowerCase() && (
                      <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full border border-border-subtle uppercase">
                        {vehicle.body_type}
                      </span>
                    )}

                    {/* Vehicle / Powertrain Type (only if distinct) */}
                    {vehicle.vehicle_type &&
                      vehicle.vehicle_type.toLowerCase() !== vehicle.ev_category?.toLowerCase() &&
                      vehicle.vehicle_type.toLowerCase() !== vehicle.body_type?.toLowerCase() && (
                      <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full uppercase border border-border-subtle">
                        {vehicle.vehicle_type}
                      </span>
                    )}

                    {/* Availability Status */}
                    {vehicle.status && (
                      <span
                        className={`inline-flex items-center gap-1.5 font-label-sm text-xs px-3 py-1 rounded-full border ${
                          vehicle.status === "available"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : vehicle.status === "upcoming"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : "bg-blue-50 text-blue-900 border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            vehicle.status === "available"
                              ? "bg-emerald-600"
                              : vehicle.status === "upcoming"
                              ? "bg-amber-600"
                              : "bg-blue-600"
                          }`}
                        />
                        {(() => {
                          if (vehicle.status === "available") return "Available";
                          if (vehicle.status === "upcoming") return "Upcoming";
                          return vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1);
                        })()}
                      </span>
                    )}

                    {/* Release Date */}
                    {releaseDateStr && (
                      <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full border border-border-subtle">
                        Released: {releaseDateStr}
                      </span>
                    )}

                    {/* Region / Country of Origin */}
                    {brandRegion && (
                      <span className="inline-flex items-center gap-1 bg-surface-container-low text-text-muted font-label-sm text-xs px-3 py-1 rounded-full border border-border-subtle">
                        <span className="text-base leading-none">{brandRegion.flag}</span>
                        {brandRegion.country}
                      </span>
                    )}
                  </div>

                  {/* Rating display */}
                  {rating && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center text-yellow-500">
                        <AppIcon name="star" size={18} fill="#FF9800" className="text-yellow-500" />
                        <span className="font-label-md text-sm text-text-main ml-1 font-semibold">
                          {typeof rating === "number" ? rating.toFixed(1) : rating}
                        </span>
                      </div>
                      {reviewCount > 0 && (
                        <span className="text-text-muted font-body-sm text-sm">
                          ({reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display-lg text-2xl md:text-3xl font-bold text-price-green tracking-tight">
                      <Price product={vehicle} />
                    </span>
                    {lowestPrice ? (
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Starting</span>
                    ) : (
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Expected</span>
                    )}
                  </div>

                  {/* Global base currencies */}
                  {(pricing.price_global_base_usd || pricing.price_global_base_eur || pricing.price_global_base_cny) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted border border-border-subtle bg-surface-container-low/50 px-3 py-2 rounded-lg inline-block w-fit">
                      {pricing.price_global_base_usd && (
                        <span>MSRP: <strong className="text-text-main"><Price amount={pricing.price_global_base_usd} source="USD" /></strong></span>
                      )}
                      {pricing.price_global_base_eur && (
                        <span>• <strong className="text-text-main"><Price amount={pricing.price_global_base_eur} source="EUR" /></strong></span>
                      )}
                      {pricing.price_global_base_cny && (
                        <span>• <strong className="text-text-main"><Price amount={pricing.price_global_base_cny} source="CNY" /></strong></span>
                      )}
                    </div>
                  )}
                </div>

                {/* Sibling Trim / Variant Selector */}
                {variants.length > 1 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Available Trims & Variants ({variants.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const isCurrent = v.slug === vehicle.slug;
                        return (
                          <Link
                            key={v._id}
                            href={`/${v.slug}`}
                            className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all border ${
                              isCurrent
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-surface-white text-text-main border-border-subtle hover:border-primary hover:bg-surface-container-low"
                            }`}
                          >
                            <span>{v.variant_name || v.name}</span>
                            {(v.price_pkr || v.price_usd) && (
                              <span className={`ml-1.5 opacity-80 ${isCurrent ? "text-white" : "text-text-muted"}`}>
                                (<Price product={v} />)
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Key Specs */}
                {highlights.length > 0 && (
                  <div className="bg-white p-4 sm:p-5 rounded-xl mt-2">
                    <h2 className="text-base sm:text-lg font-bold text-text-main flex items-center gap-2 mb-4">
                      <span className="w-1 h-5 sm:h-6 bg-primary rounded-full"></span>
                      Top Features of {vehicle.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {highlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-1.5 sm:p-2 rounded-sm border border-border-subtle bg-surface-white hover:border-primary/50 transition-colors"
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                            <AppIcon name={h.icon} size={16} />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[9px] sm:text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">
                              {h.label}
                            </span>
                            <span className="text-[11px] sm:text-xs font-medium text-text-main leading-tight line-clamp-2">
                              {h.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 pt-2">
                      <Link
                        href={`/vehicles/compare?vehicle=${vehicle.slug}`}
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
                )}
              </div>
            </div>
          </div>

          {/* Dealership / Retailer Price Comparison (if available) */}
          {hasAffiliateUrls && (
            <section className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 md:px-6 border-b border-border-subtle bg-surface-container-low/30 flex items-center justify-between">
                <h2 className="font-headline-md text-base md:text-lg font-bold text-text-main flex items-center gap-2">
                  <AppIcon name="storefront" size={20} className="text-primary" />
                  Dealership & Retailer Prices
                </h2>
              </div>

              <div className="divide-y divide-border-subtle">
                {vehicle.prices && vehicle.prices.length > 0 ? (
                  vehicle.prices.map((priceItem, index) => (
                    <div
                      key={index}
                      className="p-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors"
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
                            <span className="w-1.5 h-1.5 rounded-full bg-price-green" />
                            {priceItem.stock_status || "Availability not confirmed"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t border-border-subtle md:border-0">
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
                ) : null}
              </div>
            </section>
          )}

          {/* Main Specifications and Sidebar Layout */}
          <div id="full-specs" className="grid grid-cols-1 lg:grid-cols-3 gap-[15px] items-start">
            {/* Left 2 Cols: Specs Table & Description */}
            <div className="lg:col-span-2 flex flex-col gap-[15px]">
              {/* Full Specs Accordion */}
              <EVSpecs vehicle={vehicle} />

              {/* Editorial / AI Description — temporarily hidden from UI */}
              {/* <EVDescriptionClient
                description={publishableDescription(vehicle.description)}
                vehicleName={vehicle.name}
                pros={vehicle.seo?.ai_pros}
                cons={vehicle.seo?.ai_cons}
                buyingAdvice={vehicle.seo?.ai_buying_advice}
                faqs={vehicle.seo?.ai_faq}
              /> */}

              {/* YouTube Video Review Embed */}
              {vehicle.video_url && (
                <section className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 md:px-6 border-b border-border-subtle bg-surface-container-low/30 flex items-center gap-2">
                    <AppIcon name="smart_display" size={22} className="text-red-600" />
                    <h2 className="font-headline-md text-base md:text-lg font-bold text-text-main">
                      Video Review & Hands-on
                    </h2>
                  </div>
                  <div className="p-6 flex justify-center">
                    {getYouTubeEmbedId(vehicle.video_url) ? (
                      <div className="w-full max-w-3xl aspect-video rounded-lg overflow-hidden border border-border-subtle shadow-sm">
                        <iframe loading="lazy"
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${getYouTubeEmbedId(vehicle.video_url)}`}
                          title={`${vehicle.name} Video Review`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={vehicle.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm"
                      >
                        <AppIcon name="open_in_new" size={18} />
                        Watch Review on YouTube
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right 1 Col: Sidebar & Competitors */}
            <div className="lg:col-span-1 flex flex-col gap-[15px]">
              {/* Competitors Card */}
              <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
                <h3 className="font-headline-sm text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                  <AppIcon name="compare_arrows" size={18} className="text-primary" />
                  Similar & Competitor EVs
                </h3>

                {competitors.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {competitors.map((comp) => {
                      const compImg = comp.images?.find((img) => img.url)?.url;
                      const formattedPrice = <Price product={comp} />;

                      return (
                        <div
                          key={comp._id}
                          className="flex flex-col rounded-md border border-border-subtle hover:border-primary hover:shadow-sm transition-all bg-surface-white overflow-hidden group"
                        >
                          <Link href={`/${comp.slug}`} className="flex flex-col">
                            <div className="relative aspect-[16/10] bg-surface-container-low flex items-center justify-center p-2">
                              <Image
                                src={compImg || "/placeholder-car.svg"}
                                alt={comp.name}
                                fill
                                className="object-contain mix-blend-darken group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex flex-col p-2.5 pb-1.5 bg-surface-white">
                              <h4 className="font-semibold text-xs text-text-main group-hover:text-primary transition-colors line-clamp-2 min-h-[32px] leading-snug">
                                {comp.name}
                              </h4>
                              <span className="text-xs font-bold text-text-main mt-1">
                                {formattedPrice}
                              </span>
                            </div>
                          </Link>
                          <Link
                            href={`/vehicles/compare/${vehicle.slug}-vs-${comp.slug}`}
                            rel="nofollow"
                            className="mx-2.5 mb-2.5 mt-0.5 inline-flex items-center justify-center gap-1 py-1 rounded-sm border border-border-subtle bg-surface-white hover:bg-primary/5 hover:border-primary font-medium text-[10px] text-text-main transition-colors"
                          >
                            <AppIcon name="compare_arrows" size={12} />
                            Compare
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">
                    No competitor {vehicle.ev_category ? `${vehicle.ev_category.toLowerCase()}s` : "vehicles"} found.
                  </p>
                )}
              </div>

              {/* Other Models from same brand */}
              {brandVehicles.length > 0 && (
                <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline-sm text-sm font-bold text-text-main">
                      Other {vehicle.brand_slug.toUpperCase().replace("-", " ")} Electric Models
                    </h3>
                    <Link
                      href={`/vehicles?brand=${vehicle.brand_slug}`}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      View all
                    </Link>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {brandVehicles.map((bv) => (
                      <li key={bv._id}>
                        <Link
                          href={`/${bv.slug}`}
                          className="text-xs md:text-sm text-primary hover:underline line-clamp-1 flex items-center justify-between"
                        >
                          <span>{bv.name}</span>
                          {(bv.price_pkr || bv.price_usd) && (
                            <span className="text-text-muted text-xs font-normal">
                              <Price product={bv} />
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price bracket navigation */}
              {(() => {
                const budgetGroup = getBudgetLinks(vehicle.ev_category);
                return (
                  <div className="bg-white border border-border-subtle rounded-xl p-4 shadow-sm">
                    <h3 className="font-headline-sm text-sm font-bold text-primary mb-3">
                      {budgetGroup.title}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {budgetGroup.items.map((p) => (
                        <li key={p.price}>
                          <Link
                            href={`/vehicles?${budgetGroup.queryParam}&max_price=${p.price}`}
                            className="text-xs md:text-sm text-text-main hover:text-primary transition-colors flex items-center justify-between"
                          >
                            <span><CurrencyText text={p.label} /></span>
                            <AppIcon name="chevron_right" size={14} className="text-text-muted" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Ad Slot */}
              <div className="rounded-2xl overflow-hidden">
                <AdSlot placement="SIDEBAR" layout="col" />
              </div>
            </div>
          </div>

          {/* User Feedback Widget (poll options adapt to EV type) */}
          <VehicleFeedbackWidget
            vehicleId={vehicle._id}
            vehicleName={vehicle.name}
            evCategory={vehicle.ev_category}
            bodyType={vehicle.body_type}
          />

          {/* User Reviews Section */}
          <VehicleReviewSection vehicleId={vehicle._id} vehicleName={vehicle.name} />
        </main>

        <Footer />
      </div>
    </>
  );
}
