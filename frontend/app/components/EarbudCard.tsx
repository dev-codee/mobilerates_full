import Price from "@/app/components/Price";
import Image from "next/image";
import Link from "next/link";
import type { Earbud } from "@/app/lib/api";
import AppIcon from "./AppIcon";

interface EarbudCardProps {
  earbud: Earbud;
  variant?: "list" | "grid";
  priority?: boolean;
  sizes?: string;
}

export default function EarbudCard({ earbud, variant = "grid", priority = false, sizes = "(max-width: 639px) calc(100vw - 90px), (max-width: 767px) calc(50vw - 84px), (max-width: 1023px) calc(33.33vw - 96px), (max-width: 1279px) calc(25vw - 94px), 226px" }: EarbudCardProps) {
  const primaryImage = earbud.images?.find((img) => img.is_primary) || earbud.images?.[0];
  const imageUrl = primaryImage?.url || "/placeholder-phone.svg";
  const imageAlt = primaryImage?.alt_text || earbud.name;

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

  // Key specs extraction
  const hasAnc = earbud.specs?.noise_cancellation?.has_anc;
  const ancDepth = earbud.specs?.noise_cancellation?.anc_depth_db;
  const ancType = earbud.specs?.noise_cancellation?.anc_type;
  const ancLabel = hasAnc
    ? `${ancDepth ? `${ancDepth}dB ` : ""}${ancType || "Active Noise Cancellation"}`
    : earbud.specs?.noise_cancellation?.enc_call_noise_reduction
    ? "ENC Call Noise Reduction"
    : "Passive Noise Isolation";

  const earbudHours = earbud.specs?.battery?.playtime_earbuds_anc_off_hrs;
  const totalHours = earbud.specs?.battery?.total_playtime_with_case_hrs;
  const batteryLabel = totalHours
    ? `${earbudHours ? `${earbudHours}h + ` : ""}${totalHours}h Playtime`
    : earbudHours
    ? `${earbudHours}h Battery`
    : "Battery TBA";

  const driverSize = earbud.specs?.audio?.driver_size_mm;
  const driverType = earbud.specs?.audio?.driver_type || "Not specified";
  const driverLabel = driverSize ? `${driverSize}mm ${driverType} Driver` : "High-Res Driver";

  const btVersion = earbud.specs?.connectivity?.bluetooth_version;
  const codecs = earbud.specs?.connectivity?.codecs || [];
  const connectivityLabel = btVersion
    ? `Bluetooth ${btVersion}${codecs.length ? ` (${codecs.slice(0, 2).join(", ")})` : ""}`
    : "Bluetooth 5.3";

  const ipRating = earbud.specs?.physical?.water_resistance;

  const userRating = earbud.rating?.average || 0;
  const ratingCount = earbud.rating?.count || 0;

  const status = earbud.status || "available";
  const statusColorMap: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    released: "bg-emerald-50 text-emerald-700 border-emerald-200",
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    rumored: "bg-amber-50 text-amber-700 border-amber-200",
    out_of_stock: "bg-rose-50 text-rose-700 border-rose-200",
    discontinued: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const statusBadgeClass = statusColorMap[status] || "bg-surface-container-high text-text-muted border-border-subtle";

  return (
    <div className="flex flex-col bg-surface-white border border-border-subtle rounded-xl p-4 md:p-5 transition-all duration-300 hover:shadow-card group relative h-full hover:border-primary/40">
      {/* Top Meta: Brand, Status, Price */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-surface-container-high text-text-main">
              {earbud.brand_slug.replace(/-/g, " ")}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${statusBadgeClass}`}>
              {status.replace(/_/g, " ")}
            </span>
            {earbud.wearing_type && (
              <span className="text-[10px] font-medium text-text-muted capitalize">
                • {earbud.wearing_type.replace(/-/g, " ")}
              </span>
            )}
          </div>

          <Link href={`/${earbud.slug}`} className="block">
            <h2 className="text-base md:text-lg font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {earbud.name}
            </h2>
          </Link>
        </div>

        {/* Price Tag */}
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg md:text-xl font-bold text-text-main tracking-tight">
              <Price product={earbud} />
            </span>
          </div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">
            {lowestPrice ? "Best Price" : "Expected"}
          </span>
        </div>
      </div>

      {/* Earbud Image */}
      <Link
        href={`/${earbud.slug}`}
        className="relative w-full aspect-square max-h-[190px] bg-surface-container-low rounded-lg p-3 flex items-center justify-center group overflow-hidden mb-4"
      >
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            preload={priority}
            sizes={sizes}
            className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {hasAnc && (
          <span className="absolute top-2 left-2 bg-primary/95 text-on-primary text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
            <AppIcon name="headphones" size={11} />
            ANC
          </span>
        )}
        {ipRating && (
          <span className="absolute top-2 right-2 bg-surface-white/90 backdrop-blur-sm text-text-main text-[10px] font-semibold px-1.5 py-0.5 rounded border border-border-subtle flex items-center gap-1">
            <AppIcon name="water_drop" size={11} className="text-blue-500" />
            {ipRating}
          </span>
        )}
      </Link>

      {/* Highlight Features / Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {earbud.specs?.audio?.hi_res_audio && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Hi-Res Audio
          </span>
        )}
        {earbud.specs?.connectivity?.multipoint_pairing && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
            Dual Connect
          </span>
        )}
        {earbud.specs?.connectivity?.low_latency_gaming_mode && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            Game Mode
          </span>
        )}
        {earbud.specs?.battery?.wireless_charging && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Qi Wireless
          </span>
        )}
      </div>

      {/* Specs Grid */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4 text-xs text-text-main">
        <li className="flex items-center gap-2 min-w-0" title={ancLabel}>
          <AppIcon name="headphones" size={14} className="text-primary shrink-0" />
          <span className="truncate">{ancLabel}</span>
        </li>
        <li className="flex items-center gap-2 min-w-0" title={batteryLabel}>
          <AppIcon name="battery_charging_full" size={14} className="text-emerald-600 shrink-0" />
          <span className="truncate">{batteryLabel}</span>
        </li>
        <li className="flex items-center gap-2 min-w-0" title={driverLabel}>
          <AppIcon name="speaker" size={14} className="text-indigo-600 shrink-0" />
          <span className="truncate">{driverLabel}</span>
        </li>
        <li className="flex items-center gap-2 min-w-0" title={connectivityLabel}>
          <AppIcon name="bluetooth" size={14} className="text-blue-600 shrink-0" />
          <span className="truncate">{connectivityLabel}</span>
        </li>
      </ul>

      {/* Footer: Rating & CTA */}
      <div className="mt-auto pt-3 border-t border-border-subtle/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-[#FF9800]">
            <AppIcon name="star" size={13} fill="#FF9800" className="text-[#FF9800]" />
            <span className="text-xs font-bold text-text-main ml-1">
              {userRating > 0 ? userRating.toFixed(1) : "New"}
            </span>
          </div>
          {ratingCount > 0 && (
            <span className="text-[11px] text-text-muted">({ratingCount})</span>
          )}
        </div>

        <Link
          href={`/${earbud.slug}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-hover rounded-md transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
        >
          View Specs
          <AppIcon name="chevron_right" size={13} />
        </Link>
      </div>
    </div>
  );
}
