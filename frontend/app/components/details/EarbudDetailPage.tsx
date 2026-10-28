import Price from "@/app/components/Price";
import { serializeJsonLd } from "@/app/lib/schema";
import { cleanMetadata } from "@/app/lib/seo";
import { getProductEarbudBySlug as getEarbudBySlug } from "@/app/lib/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getRelatedEarbuds, type Earbud } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import EarbudGallery from "@/app/components/EarbudGallery";
import EarbudSpecs from "@/app/components/EarbudSpecs";
import EarbudCard from "@/app/components/EarbudCard";
import AppIcon from "@/app/components/AppIcon";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateVideoSchema,
} from "@/app/lib/schema";


function getYouTubeEmbedId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const earbud = await getEarbudBySlug(resolvedParams.slug);

  if (!earbud) {
    return cleanMetadata({
      title: "Earbud Not Found",
      description: "The requested wireless earbuds could not be found.",
      robots: { index: false, follow: false },
    });
  }

  const rawTitle = earbud.seo?.meta_title || earbud.seo?.ai_seo_title || `${earbud.name} Price & Full Specs`;
  const title = rawTitle.trim();
  const description =
    (earbud.seo?.meta_description ||
    earbud.seo?.ai_meta_description ||
    `Compare ${earbud.name} prices and specifications, including battery life, noise cancellation, Bluetooth, and sound features.`).trim();

  const primaryImage = earbud.images?.find((img) => img.is_primary) || earbud.images?.[0];
  const canonicalUrl = `https://mobilerates.info/${earbud.slug}`;

  return cleanMetadata({
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    // Only explicitly approved product content is eligible for indexing.
    ...(earbud.seo?.is_indexable !== true && {
      robots: { index: false, follow: true },
    }),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: primaryImage?.url ? [{ url: primaryImage.url, alt: earbud.name }] : [],
    },
  });
}

export default async function EarbudDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const earbud = await getEarbudBySlug(resolvedParams.slug);

  if (!earbud) {
    notFound();
  }

  const related = await getRelatedEarbuds(earbud.slug).catch(() => null);

  const brandName = earbud.brand_slug.replace(/-/g, " ").toUpperCase();
  const rawPriceStr = String(earbud.price_pkr || "");
  const parsedPricePkr = Number(rawPriceStr.replace(/[^0-9.]/g, ""));
  const validPrices = (earbud.prices || [])
    .map((p) => Number(p.price_pkr))
    .filter((p) => !isNaN(p) && p > 0);
  const lowestPrice =
    !isNaN(parsedPricePkr) && parsedPricePkr > 0
      ? parsedPricePkr
      : validPrices.length
      ? Math.min(...validPrices)
      : null;

  const releaseDateStr = earbud.release_date
    ? (() => {
        try {
          const d = new Date(earbud.release_date);
          if (isNaN(d.getTime())) return String(earbud.release_date);
          return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } catch {
          return String(earbud.release_date);
        }
      })()
    : null;

  const breadcrumbItems = [
    { label: "Earbuds", href: "/earbuds" },
    { label: brandName, href: `/earbuds?brand=${earbud.brand_slug}` },
    { label: earbud.name },
  ];

  const primaryImage = earbud.images?.find((img) => img.is_primary) || earbud.images?.[0];
  const youtubeVideoId = earbud.video_url ? getYouTubeEmbedId(earbud.video_url) : null;

  // Key Specs Highlights
  const hasAnc = earbud.specs?.noise_cancellation?.has_anc;
  const ancDepth = earbud.specs?.noise_cancellation?.anc_depth_db;
  const ancType = earbud.specs?.noise_cancellation?.anc_type;
  const earbudHours = earbud.specs?.battery?.playtime_earbuds_anc_off_hrs;
  const totalHours = earbud.specs?.battery?.total_playtime_with_case_hrs;
  const driverSize = earbud.specs?.audio?.driver_size_mm;
  const driverType = earbud.specs?.audio?.driver_type || "Not specified";
  const btVersion = earbud.specs?.connectivity?.bluetooth_version || "Not specified";
  const waterRating = earbud.specs?.physical?.water_resistance || "Not specified";
  const earbudWeight = earbud.specs?.physical?.earbud_weight_g;

  return (
    <>
      {/* Schema / SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateProductSchema({ ...earbud, product_type: "Wireless Earbuds" } as any)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateBreadcrumbSchema(breadcrumbItems)),
        }}
      />
      {youtubeVideoId && generateVideoSchema(earbud as any) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(generateVideoSchema(earbud as any)),
          }}
        />
      )}

      <div className="min-h-screen bg-surface-white flex flex-col selection:bg-primary/20">
        <Navbar />

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">
          <Breadcrumb items={breadcrumbItems} />

          {/* Top Section: Gallery + Product Header & Pricing */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Gallery (5 cols) */}
            <div className="lg:col-span-5">
              <EarbudGallery
                images={earbud.images || []}
                altText={earbud.name}
                colors={earbud.colors}
              />
            </div>

            {/* Right: Details, Pricing, Highlights (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Brand, Badges & Model */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Link
                  href={`/earbuds?brand=${earbud.brand_slug}`}
                  className="text-xs font-bold px-2.5 py-1 rounded bg-surface-container-high text-primary uppercase tracking-wider hover:bg-primary hover:text-white transition-colors"
                >
                  {brandName}
                </Link>
                {earbud.wearing_type && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-low text-text-muted capitalize border border-border-subtle">
                    {earbud.wearing_type.replace(/-/g, " ")}
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                  {earbud.status ? earbud.status.replace(/_/g, " ") : "Status not specified"}
                </span>
                {earbud.model_number && (
                  <span className="text-xs text-text-muted">Model: {earbud.model_number}</span>
                )}
                {releaseDateStr && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-surface-container-low text-text-muted border border-border-subtle">
                    Released: {releaseDateStr}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-text-main leading-tight mb-5">
                {earbud.name}
              </h1>

              {/* Price Banner */}
              <div className="p-4 md:p-5 rounded-2xl bg-surface-container-low/70 border border-border-subtle mb-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs text-text-muted uppercase font-bold tracking-wider">
                      Best Price
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl md:text-4xl font-extrabold text-text-main tracking-tight">
                        <Price product={earbud} />
                      </span>
                    </div>
                  </div>

                  {earbud.prices && earbud.prices.length > 0 && (
                    <span className="text-xs font-medium text-text-muted">
                      Available across {earbud.prices.length} retailer{earbud.prices.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Retailer prices list */}
                {earbud.prices && earbud.prices.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border-subtle/80 flex flex-col gap-2">
                    <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                      Compare Store Prices
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {earbud.prices.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-surface-white rounded-lg border border-border-subtle text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-text-main truncate">{p.retailer_name}</p>
                            {p.variant && <p className="text-[11px] text-text-muted">{p.variant}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-text-main">
                              <Price amount={Number(p.price_pkr)} />
                            </span>
                            {p.product_url && (
                              <a
                                href={p.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-primary text-white rounded font-semibold text-[11px] hover:bg-primary-hover transition-colors"
                              >
                                Buy
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Specs Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-surface-container-lowest rounded-xl border border-border-subtle/70 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <AppIcon name="headphones" size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted block">ANC</span>
                    <span className="text-xs font-bold text-text-main truncate block">
                      {hasAnc ? `${ancDepth ? `${ancDepth}dB ` : ""}${ancType || "Active ANC"}` : "ENC Noise Red."}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-xl border border-border-subtle/70 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <AppIcon name="battery_charging_full" size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted block">Battery Life</span>
                    <span className="text-xs font-bold text-text-main truncate block">
                      {totalHours ? `${totalHours}h Total` : earbudHours ? `${earbudHours}h Buds` : "High Playtime"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-xl border border-border-subtle/70 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <AppIcon name="speaker" size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted block">Drivers</span>
                    <span className="text-xs font-bold text-text-main truncate block">
                      {driverSize ? `${driverSize}mm ${driverType}` : "Dynamic Sound"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-xl border border-border-subtle/70 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <AppIcon name="bluetooth" size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted block">Bluetooth</span>
                    <span className="text-xs font-bold text-text-main truncate block">
                      v{btVersion}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-xl border border-border-subtle/70 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
                    <AppIcon name="water_drop" size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted block">Waterproof</span>
                    <span className="text-xs font-bold text-text-main truncate block">
                      {waterRating}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest rounded-xl border border-border-subtle/70 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <AppIcon name="tune" size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-text-muted block">Bud Weight</span>
                    <span className="text-xs font-bold text-text-main truncate block">
                      {earbudWeight ? `${earbudWeight}g (each)` : "Lightweight"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Full Width Specs Section */}
          <div className="mt-12">
            <div className="border-b border-border-subtle pb-3 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-text-main">
                {earbud.name} Full Specifications
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Detailed technical specifications, acoustic drivers, noise cancellation, battery life, and connectivity
              </p>
            </div>

            <EarbudSpecs earbud={earbud} />
          </div>

          {/* Video Review Embed if available */}
          {youtubeVideoId && (
            <div className="mt-12">
              <div className="border-b border-border-subtle pb-3 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-text-main flex items-center gap-2">
                  <AppIcon name="movie" size={22} className="text-primary" />
                  Video Review & Sound Test
                </h2>
              </div>
              <div className="w-full aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black shadow-lg">
                <iframe loading="lazy"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title={`${earbud.name} Video Review`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* Related Earbuds Section */}
          {related && (related.by_brand?.length || related.by_price?.length) && (
            <div className="mt-14 pt-8 border-t border-border-subtle">
              {related.by_brand && related.by_brand.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-text-main">
                      More from {brandName}
                    </h3>
                    <Link
                      href={`/earbuds?brand=${earbud.brand_slug}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View all
                      <AppIcon name="chevron_right" size={14} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {related.by_brand.slice(0, 4).map((item) => (
                      <EarbudCard key={item._id} earbud={item} />
                    ))}
                  </div>
                </div>
              )}

              {related.by_price && related.by_price.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-text-main">
                      Similar Price Alternatives
                    </h3>
                    <Link
                      href="/earbuds"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Browse all
                      <AppIcon name="chevron_right" size={14} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {related.by_price.slice(0, 4).map((item) => (
                      <EarbudCard key={item._id} earbud={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
