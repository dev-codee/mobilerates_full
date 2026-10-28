import Price from "@/app/components/Price";
import { verifiedRating, publishableDescription } from "@/app/lib/content-quality";
import Image from "next/image";
import Link from "next/link";
import type { Phone } from "@/app/lib/api";
import { filterVisibleTags } from "@/app/lib/tags";
import AppIcon from "./AppIcon";

interface PhoneCardProps {
  phone: Phone;
  variant?: "list" | "grid";
  priority?: boolean;
}


function formatDate(dateStr?: string) {
  if (!dateStr) return "TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getFirstProAndCon(description?: string) {
  if (!description) return null;

  const lines = description.split('\n').map(l => l.trim()).filter(Boolean);
  let pro = "";
  let con = "";
  let inPros = false;
  let inCons = false;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();

    if (lower === 'pros' || lower === 'pros:') {
      inPros = true; inCons = false; continue;
    }
    if (lower === 'cons' || lower === 'cons:') {
      inCons = true; inPros = false; continue;
    }

    if (lower.startsWith('##') || lower.match(/^(design|display|performance|camera|battery|software)/)) {
      inPros = false; inCons = false;
    }

    if (inPros && !pro && !['thumbs_up_down', 'check_circle', 'done', 'cancel', 'close', '+', '-', '*'].includes(lower)) {
      pro = lines[i].replace(/^[+\-*•]\s*/, '').replace(/^:/, '').trim();
    }
    if (inCons && !con && !['thumbs_up_down', 'check_circle', 'done', 'cancel', 'close', '+', '-', '*'].includes(lower)) {
      con = lines[i].replace(/^[+\-*•]\s*/, '').replace(/^:/, '').trim();
    }

    if (pro && con) break;
  }

  if (!pro && !con) return null;

  return { pro, con };
}

export default function PhoneCard({ phone, variant = "list", priority = false }: PhoneCardProps) {
  // Get primary image or first image
  const primaryImage = phone.images?.find((img) => img.is_primary) || phone.images?.[0];
  const imageUrl = primaryImage?.url || "/placeholder-phone.svg";
  const imageAlt = primaryImage?.alt_text || phone.name;

  // Get lowest price safely
  const rawPriceStr = String(phone.price_pkr || "");
  const parsedPricePkr = Number(rawPriceStr.replace(/[^0-9.]/g, ''));
  const validPrices = (phone.prices || []).map((p) => Number(p.price_pkr)).filter(p => !isNaN(p) && p > 0);
  const lowestPrice = (!isNaN(parsedPricePkr) && parsedPricePkr > 0) ? parsedPricePkr : (validPrices.length ? Math.min(...validPrices) : null);

  const chipset = phone.specs?.performance?.chipset || "Chipset TBA";
  const ramOptions = phone.specs?.performance?.ram_options_gb;
  const storageOptions = phone.specs?.performance?.storage_options_gb;
  const ramStorage = (ramOptions || storageOptions)
    ? `${ramOptions ? Math.max(...ramOptions) : '??'} GB RAM | ${storageOptions ? Math.max(...storageOptions) : '??'} GB Storage`
    : "RAM & Storage TBA";

  const ext = phone.specs?.extra_specs || {};

  const rearCamera = phone.specs?.camera?.rear_summary || ext.cameras_detailed?.mp || "Rear Camera TBA";
  const frontCamera = phone.specs?.camera?.front_summary || ext.cameras_detailed?.front_mp || "Front Camera TBA";

  const battery = (phone.specs?.battery?.capacity_mah || phone.specs?.battery?.charging_watts)
    ? `${phone.specs?.battery?.capacity_mah || '??'} mAh | ${phone.specs?.battery?.charging_watts || '??'}W Charging`
    : ext.battery_detailed?.capacity ? `${ext.battery_detailed.capacity} mAh` : "Battery TBA";

  const display = (phone.specs?.display?.size_inches || phone.specs?.display?.type)
    ? `${phone.specs?.display?.size_inches || '??'} Inches | ${phone.specs?.display?.type || 'Display'}`
    : ext.features_listing?.screen_size ? `${ext.features_listing.screen_size} | Display` : "Display TBA";

  // Ratings
  const userRating = verifiedRating(phone.rating) || 0;
  const phoneData = getFirstProAndCon(publishableDescription(phone.description));
  const visibleTags = filterVisibleTags(phone.tags);

  return (
    <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

      {/* Top Section */}
      <div className="p-5 md:p-6 pb-4 relative">
        {visibleTags.length > 0 && (
          <div className="absolute top-2 left-6 text-[10px] font-bold text-[#E53935] bg-[#E53935]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {visibleTags[0]}
          </div>
        )}
        {/* Header */}
        <div className={`flex justify-between items-start mb-2 ${visibleTags.length > 0 ? 'mt-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <Link href={`/${phone.slug}`} className="hover:text-primary transition-colors">
              <h2 className={`font-headline-md font-bold text-text-main leading-tight ${variant === 'list' ? 'text-xl md:text-2xl' : 'text-lg'}`}>
                {phone.name}
              </h2>
            </Link>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {(phone.view_count !== undefined && phone.view_count !== null && (phone.view_count ?? 0) > 0) && (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted" title={`${phone.view_count} views`}>
                <AppIcon name="visibility" size={15} className="text-text-muted" />
                <span>{(phone.view_count).toLocaleString()}</span>
              </span>
            )}
            {variant === "list" && (
              <Link
                href={`/compare?phone=${phone.slug}`}
                rel="nofollow"
                className="flex items-center gap-1 text-primary text-sm font-semibold hover:bg-primary/5 px-2 py-1 rounded transition-colors shrink-0"
              >
                <AppIcon name="add" size={16} />
                Compare
              </Link>
            )}
          </div>
        </div>

        <div className="text-xs text-text-muted mb-5 pl-4">
          Release Date: <span className="font-medium text-text-main">{formatDate(phone.release_date)}</span>
        </div>

        {/* Grid for Image and Specs */}
        <div className={`grid grid-cols-1 ${variant === 'list' ? 'md:grid-cols-12 pl-4' : 'px-2'} gap-6`}>

          {/* Left Column (Image) */}
          <div className={`${variant === 'list' ? 'md:col-span-4 lg:col-span-3' : 'w-full max-w-[200px] mx-auto'} flex flex-col items-center`}>
            <Link href={`/${phone.slug}`} className="relative w-full aspect-[3/4] bg-surface-container-low rounded-xl p-4 flex items-center justify-center group overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  preload={priority}
                  sizes={variant === "grid"
                    ? "168px"
                    : "(max-width: 767px) calc(100vw - 120px), (max-width: 1023px) calc(33.33vw - 182px), (max-width: 1279px) calc(25vw - 150px), 170px"}
                  className="object-contain mix-blend-darken group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Link>

            <div className="flex gap-4 mt-3">
              <Link
                href={`/compare?phone=${phone.slug}`}
                rel="nofollow"
                className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors"
                title="Compare"
              >
                <AppIcon name="compare_arrows" size={16} />
              </Link>
              <Link href={`/${phone.slug}`} className="w-8 h-8 rounded border border-border-subtle flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors" aria-label={`View ${phone.name} photos`}>
                <AppIcon name="photo_camera" size={16} />
              </Link>
            </div>

            <Link href={`/${phone.slug}`} className="text-xs font-bold text-text-main underline underline-offset-2 mt-2 hover:text-primary">
              View Photos ({phone.images?.length || 0})
            </Link>
          </div>

          {/* Right Column (Specs) */}
          <div className={`${variant === 'list' ? 'md:col-span-8 lg:col-span-9' : 'w-full'} flex flex-col justify-between`}>
            <div>
              <ul className="space-y-3 mb-4 relative">
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <AppIcon name="developer_board" size={18} className="text-text-muted shrink-0 mt-0.5" />
                  {chipset}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <AppIcon name="memory" size={18} className="text-text-muted shrink-0 mt-0.5" />
                  {ramStorage}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <AppIcon name="photo_camera" size={18} className="text-text-muted shrink-0 mt-0.5" />
                  {rearCamera}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <AppIcon name="camera_front" size={18} className="text-text-muted shrink-0 mt-0.5" />
                  {frontCamera}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <AppIcon name="battery_charging_full" size={18} className="text-text-muted shrink-0 mt-0.5" />
                  {battery}
                </li>
                <li className="flex items-start gap-3 text-sm text-text-main">
                  <AppIcon name="smartphone" size={18} className="text-text-muted shrink-0 mt-0.5" />
                  {display}
                </li>

              </ul>

              <div className="flex justify-end border-b border-border-subtle/50 pb-4 mb-4">
                <Link href={`/${phone.slug}`} className="text-xs font-bold text-text-main underline underline-offset-2 hover:text-primary">
                  View All Specs
                </Link>
              </div>
            </div>

            <div>
              {/* Ratings & Pros/Cons */}
              <div className={`grid grid-cols-1 ${variant === 'list' ? 'lg:grid-cols-2' : ''} gap-6`}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-text-muted w-20">Rating</span>
                    <div className="flex items-center gap-0.5 text-[#FF9800]">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= Math.round(userRating);
                        return (
                          <AppIcon
                            key={star}
                            name={star <= userRating ? "star" : star - 0.5 <= userRating ? "star_half" : "star"}
                            size={16}
                            fill={isFilled ? "#FF9800" : "none"}
                            className="text-[#FF9800]"
                          />
                        );
                      })}
                      <span className="ml-1 text-sm font-bold text-text-main">{userRating > 0 ? `${userRating.toFixed(1)}/5` : "Not rated"}</span>
                    </div>
                  </div>
                </div>

                {phoneData && variant === "list" && (
                  <div className="flex flex-col gap-2">
                    {phoneData.pro && (
                      <p className="text-xs text-text-main line-clamp-2">
                        <span className="font-bold text-[#8BC34A]">Pros:</span> {phoneData.pro}
                      </p>
                    )}
                    {phoneData.con && (
                      <p className="text-xs text-text-main line-clamp-2">
                        <span className="font-bold text-[#F44336]">Cons:</span> {phoneData.con}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-2">
                <Link href={`/${phone.slug}`} className="text-xs font-bold text-text-main underline underline-offset-2 hover:text-primary">
                  Read Full Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Strip */}
      <div className="bg-surface-container-lowest border-t border-border-subtle p-3 px-6 flex items-center justify-between">
        <span className="font-bold text-text-main text-lg">
          <Price product={phone} />
        </span>

        <Link
          href={`/${phone.slug}`}
          className="text-[#FF9800] font-bold text-sm hover:underline"
        >
          View Details
        </Link>
      </div>

    </div>
  );
}
