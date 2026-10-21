import Price from "@/app/components/Price";
import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/app/lib/api";
import AppIcon from "./AppIcon";
import { getBrandRegion } from "@/app/lib/brandRegion";

interface EVCardProps {
  vehicle: Vehicle;
  variant?: "list" | "grid";
  priority?: boolean;
}

export default function EVCard({ vehicle, variant = "list", priority = false }: EVCardProps) {
  const primaryImage = vehicle.images?.find((img) => img.url) || vehicle.images?.[0];
  const imageUrl = primaryImage?.url || "/placeholder-car.svg";
  const imageAlt = primaryImage?.alt_text || vehicle.name;

  const rawPriceStr = String(vehicle.price_pkr || "");
  const parsedPricePkr = Number(rawPriceStr.replace(/[^0-9.]/g, ''));
  const validPrices = (vehicle.prices || []).map((p) => Number(p.price_pkr)).filter(p => !isNaN(p) && p > 0);
  const lowestPrice = (!isNaN(parsedPricePkr) && parsedPricePkr > 0) ? parsedPricePkr : (validPrices.length ? Math.min(...validPrices) : null);

  const batteryUsable = vehicle.specs?.battery?.capacity_usable_kwh;
  const batteryGross = vehicle.specs?.battery?.capacity_gross_kwh;
  const battery = batteryUsable ? `${batteryUsable} kWh (Usable)` : batteryGross ? `${batteryGross} kWh` : "Battery TBA";

  const rangeWltp = vehicle.specs?.range_and_efficiency?.wltp_combined_km;
  const rangeEpa = vehicle.specs?.range_and_efficiency?.epa_combined_km;
  const range = rangeWltp ? `${rangeWltp} km (WLTP)` : rangeEpa ? `${rangeEpa} km (EPA)` : "Range TBA";

  const accel = vehicle.specs?.powertrain?.acceleration_0_100_kmh ? `${vehicle.specs.powertrain.acceleration_0_100_kmh}s (0-100 km/h)` : "Acceleration TBA";
  const power = vehicle.specs?.powertrain?.total_power_hp ? `${vehicle.specs.powertrain.total_power_hp} HP` : "Power TBA";
  const drive = vehicle.specs?.powertrain?.drive_layout || "Drive TBA";

  const userRating = vehicle.rating?.average || vehicle.ratings?.overall || 0;
  const brandRegion = getBrandRegion(vehicle.brand_slug, vehicle.made_in);

  return (
    <div className="flex flex-col bg-surface-white border border-border-subtle rounded-lg p-4 md:p-5 transition-all duration-300 hover:shadow-card group relative h-full">
      
      {/* Title & Price Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <Link href={`/${vehicle.slug}`} className="block">
            <h2 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {vehicle.name}
            </h2>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-surface-container-high text-text-muted uppercase tracking-wider">
              {vehicle.ev_category || 'Vehicle'}
            </span>
            {vehicle.body_type && vehicle.body_type.toLowerCase() !== vehicle.ev_category?.toLowerCase() && (
              <span className="text-[10px] font-medium text-text-muted border-l border-border-subtle pl-2">
                {vehicle.body_type}
              </span>
            )}
            {brandRegion && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted border-l border-border-subtle pl-2">
                <span className="text-sm leading-none">{brandRegion.flag}</span>
                {brandRegion.country}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold text-text-main">
              <Price product={vehicle} />
            </span>
          </div>
          {lowestPrice ? (
             <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">Starting Price</span>
          ) : (
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-0.5">Expected Price</span>
          )}
        </div>
      </div>

      {/* Image */}
      <Link href={`/${vehicle.slug}`} className="relative w-full aspect-[16/9] bg-surface-container-low rounded-lg p-3 flex items-center justify-center group overflow-hidden mb-4">
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            preload={priority}
            sizes="(max-width: 767px) calc(100vw - 90px), (max-width: 1023px) calc(50vw - 102px), (max-width: 1279px) calc(33.33vw - 96px), 332px"
            className="object-contain mix-blend-darken group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Specs Grid */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
        <li className="flex items-center gap-2 text-xs text-text-main">
          <AppIcon name="battery_charging_full" size={15} className="text-text-muted shrink-0" />
          <span>{battery}</span>
        </li>
        <li className="flex items-center gap-2 text-xs text-text-main">
          <AppIcon name="speed" size={15} className="text-text-muted shrink-0" />
          <span>{range}</span>
        </li>
        <li className="flex items-center gap-2 text-xs text-text-main">
          <AppIcon name="shutter_speed" size={15} className="text-text-muted shrink-0" />
          <span>{accel}</span>
        </li>
        <li className="flex items-center gap-2 text-xs text-text-main">
          <AppIcon name="bolt" size={15} className="text-text-muted shrink-0" />
          <span>{power}</span>
        </li>
        <li className="flex items-center gap-2 text-xs text-text-main col-span-2">
          <AppIcon name="settings_ethernet" size={15} className="text-text-muted shrink-0" />
          <span>{drive}</span>
        </li>
      </ul>

      <div className="flex justify-end mb-4">
        <Link href={`/${vehicle.slug}`} className="text-[10px] font-bold text-text-main underline underline-offset-2 hover:text-primary">
          View All Specs
        </Link>
      </div>

      {/* Footer: Rating & CTA */}
      <div className="mt-auto pt-3 border-t border-border-subtle/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">Rating</span>
          <div className="flex items-center gap-0.5 text-[#FF9800]">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= Math.round(userRating);
              return (
                <AppIcon
                  key={star}
                  name={star <= userRating ? "star" : star - 0.5 <= userRating ? "star_half" : "star"}
                  size={14}
                  fill={isFilled ? "#FF9800" : "none"}
                  className="text-[#FF9800]"
                />
              );
            })}
            <span className="text-xs font-bold text-text-main ml-1">{userRating ? userRating.toFixed(1) : "N/A"}</span>
          </div>
        </div>
        <Link
          href={`/${vehicle.slug}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-text-main text-surface-white hover:bg-primary hover:text-on-primary rounded-md transition-colors text-[10px] font-bold uppercase tracking-wider"
        >
          Details
          <AppIcon name="chevron_right" size={14} />
        </Link>
      </div>
    </div>
  );
}
