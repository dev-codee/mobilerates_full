"use client";
import { useCurrency } from "@/app/context/CurrencyContext";
import { resolvePrice } from "@/app/lib/currency";
import Price from "@/app/components/Price";


import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Phone, getAIComparisonVerdict } from "@/app/lib/api";
import AIVerdictClient from "@/app/components/AIVerdictClient";
import { useAuth } from "@/app/context/AuthContext";
import { isJunk } from "@/app/lib/spec-value";
import AppIcon from "./AppIcon";

// Normalizes a spec cell: placeholder strings ("null", "N/A", "-", …) collapse
// to a single neutral dash so the comparison grid never prints "null".
const cell = (value: React.ReactNode): React.ReactNode =>
  isJunk(value) ? <span className="text-text-muted/50 font-normal">—</span> : value;

interface CompareClientProps {
  initialPhones: Phone[];
  allPhones: Phone[];
}

interface SpecField {
  label: string;
  getValue: (p: Phone) => React.ReactNode;
  getRawValue?: (p: Phone) => number | null;
  better?: "higher" | "lower";
}

interface SpecCategory {
  name: string;
  icon: string;
  fields: SpecField[];
}

export default function CompareClient({ initialPhones = [], allPhones = [] }: CompareClientProps) {
  const router = useRouter();
  const { rates } = useCurrency();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Support up to 2 comparison slots
  const maxSlots = 2;
  const slots: (Phone | null)[] = Array.from({ length: maxSlots }, (_, i) => initialPhones[i] || null);

  const [aiVerdict, setAiVerdict] = useState<string | null>(null);
  const [aiKeyDifferences, setAiKeyDifferences] = useState<Record<string, string[]> | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const validSlugs = slots.filter((p) => p !== null).map((p) => p!.slug);
    if (validSlugs.length < 2) {
      setAiVerdict(null);
      setAiKeyDifferences(null);
      return;
    }

    let isMounted = true;
    setLoadingAI(true);

    getAIComparisonVerdict(validSlugs)
      .then((data) => {
        if (isMounted && data) {
          setAiVerdict(data.verdict);
          setAiKeyDifferences(data.key_differences);
        }
      })
      .catch((err) => console.error("Failed to fetch AI comparison", err))
      .finally(() => {
        if (isMounted) setLoadingAI(false);
      });

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots.filter(p => p !== null).map(p => p!.slug).join(",")]);

  const categories: SpecCategory[] = [
    {
      name: "General info",
      icon: "info",
      fields: [
        {
          label: "Price (lowest)",
          getValue: (p: Phone) => <Price product={p} />,
          getRawValue: (p: Phone) => { const price = resolvePrice(p, 'USD', rates); return price?.currency === 'USD' ? price.amount : null; },
          better: "lower"
        },
        {
          label: "Release Status",
          getValue: (p: Phone) => (
            <span className="capitalize">{p.status.replace("_", " ")}</span>
          ),
        },
      ],
    },
    {
      name: "Performance",
      icon: "memory",
      fields: [
        { label: "Chipset", getValue: (p: Phone) => p.specs.performance?.chipset || "N/A" },
        { label: "Processor (CPU)", getValue: (p: Phone) => p.specs.extra_specs?.processor?.cpu_name || p.specs.performance?.cpu || "N/A" },
        { label: "Fabrication", getValue: (p: Phone) => p.specs.extra_specs?.processor?.fabrication || "N/A" },
        { label: "CPU Cores", getValue: (p: Phone) => p.specs.extra_specs?.processor?.cpu_cores || "N/A" },
        { label: "CPU Clock", getValue: (p: Phone) => p.specs.extra_specs?.processor?.cpu_clock || "N/A" },
        { label: "Graphics (GPU)", getValue: (p: Phone) => p.specs.performance?.gpu || "N/A" },
        { label: "GPU Clock", getValue: (p: Phone) => p.specs.extra_specs?.processor?.gpu_clock || "N/A" },
        { label: "NPU / AI Engine", getValue: (p: Phone) => p.specs.extra_specs?.processor?.npu || p.specs.extra_specs?.processor?.ai_engine || "N/A" },
        { label: "ISP", getValue: (p: Phone) => p.specs.extra_specs?.processor?.isp || "N/A" },
        {
          label: "RAM",
          getValue: (p: Phone) =>
            p.specs.performance?.ram_options_gb?.length
              ? `${p.specs.performance.ram_options_gb.join(" GB / ")} GB`
              : "N/A",
          getRawValue: (p: Phone) => p.specs.performance?.ram_options_gb?.length ? Math.max(...p.specs.performance.ram_options_gb) : null,
          better: "higher"
        },
        { label: "RAM Type", getValue: (p: Phone) => p.specs.extra_specs?.ram_storage?.ram_type || "N/A" },
        { label: "RAM Speed", getValue: (p: Phone) => p.specs.extra_specs?.ram_storage?.ram_speed || "N/A" },
        {
          label: "Storage",
          getValue: (p: Phone) =>
            p.specs.performance?.storage_options_gb?.length
              ? `${p.specs.performance.storage_options_gb.join(" GB / ")} GB`
              : "N/A",
          getRawValue: (p: Phone) => p.specs.performance?.storage_options_gb?.length ? Math.max(...p.specs.performance.storage_options_gb) : null,
          better: "higher"
        },
        { label: "Storage Type", getValue: (p: Phone) => p.specs.extra_specs?.ram_storage?.storage_type || "N/A" },
        {
          label: "Expandable Storage",
          getValue: (p: Phone) =>
            p.specs.performance?.expandable_storage !== undefined
              ? p.specs.performance.expandable_storage
                ? p.specs.extra_specs?.ram_storage?.max_expansion || "Yes"
                : "No"
              : "N/A",
          getRawValue: (p: Phone) => p.specs.performance?.expandable_storage ? 1 : 0,
          better: "higher"
        },
      ],
    },
    {
      name: "Display",
      icon: "smartphone",
      fields: [
        {
          label: "Size",
          getValue: (p: Phone) =>
            p.specs.display?.size_inches ? `${p.specs.display.size_inches} inches` : "N/A",
          getRawValue: (p: Phone) => p.specs.display?.size_inches || null,
          better: "higher"
        },
        { label: "Type", getValue: (p: Phone) => p.specs.display?.type || "N/A" },
        { label: "Resolution", getValue: (p: Phone) => p.specs.display?.resolution || "N/A" },
        { label: "Pixels", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.pixels || "N/A" },
        { label: "PPI", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.ppi || "N/A", getRawValue: (p: Phone) => p.specs.extra_specs?.features_listing?.ppi ? parseFloat(p.specs.extra_specs.features_listing.ppi.replace(/[^0-9.]/g, '')) : null, better: "higher" },
        { label: "Aspect Ratio", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.aspect_ratio || "N/A" },
        {
          label: "Refresh Rate",
          getValue: (p: Phone) =>
            p.specs.display?.refresh_rate_hz ? `${p.specs.display.refresh_rate_hz} Hz` : "N/A",
          getRawValue: (p: Phone) => p.specs.display?.refresh_rate_hz || null,
          better: "higher"
        },
        { label: "Touch Sampling", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.touch_sampling || "N/A" },
        { label: "Protection", getValue: (p: Phone) => p.specs.display?.protection || "N/A" },
        { label: "Screen to Body", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.screen_to_body || "N/A", getRawValue: (p: Phone) => p.specs.extra_specs?.features_listing?.screen_to_body ? parseFloat(p.specs.extra_specs.features_listing.screen_to_body.replace(/[^0-9.]/g, '')) : null, better: "higher" },
        { label: "Screen Design", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.screen_design || "N/A" },
        { label: "Notch Type", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.notch_type || "N/A" },
        {
          label: "Peak Brightness",
          getValue: (p: Phone) =>
            p.specs.display?.peak_brightness_nits
              ? `${p.specs.display.peak_brightness_nits} nits`
              : "N/A",
          getRawValue: (p: Phone) => p.specs.display?.peak_brightness_nits || null,
          better: "higher"
        },
        { label: "Color Depth", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.color_depth || "N/A" },
        { label: "HDR Support", getValue: (p: Phone) => [p.specs.extra_specs?.features_listing?.hdr && "HDR", p.specs.extra_specs?.features_listing?.hdr10 && "HDR10", p.specs.extra_specs?.features_listing?.hdr10_plus && "HDR10+", p.specs.extra_specs?.features_listing?.dolby_vision && "Dolby Vision"].filter(Boolean).join(", ") || "N/A" },
        { label: "Always-On Display", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.always_on_display || "N/A" },
        { label: "PWM Dimming", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.pwm || "N/A" },
        { label: "Display Features", getValue: (p: Phone) => p.specs.extra_specs?.features_listing?.display_features || "N/A" },
      ],
    },
    {
      name: "Camera",
      icon: "photo_camera",
      fields: [
        { label: "Main Camera", getValue: (p: Phone) => p.specs.camera?.rear_summary || "N/A", getRawValue: (p: Phone) => p.specs.camera?.rear_summary ? parseFloat(p.specs.camera.rear_summary) : null, better: "higher" },
        { label: "Sensor Name", getValue: (p: Phone) => p.specs.extra_specs?.cameras_detailed?.sensor_name || "N/A" },
        { label: "Megapixels", getValue: (p: Phone) => p.specs.extra_specs?.cameras_detailed?.mp || "N/A" },
        { label: "Aperture", getValue: (p: Phone) => p.specs.extra_specs?.cameras_detailed?.aperture || "N/A" },
        { label: "Pixel Size", getValue: (p: Phone) => p.specs.extra_specs?.cameras_detailed?.pixel_size || "N/A" },
        { label: "Sensor Size", getValue: (p: Phone) => p.specs.extra_specs?.cameras_detailed?.sensor_size || "N/A" },
        { label: "Focal Length", getValue: (p: Phone) => p.specs.extra_specs?.cameras_detailed?.focal_length || "N/A" },
        { label: "Lens Type", getValue: (p: Phone) => p.specs.extra_specs?.cameras_detailed?.lens_type || "N/A" },
        { label: "Focus & Stabilization", getValue: (p: Phone) => [p.specs.extra_specs?.cameras_detailed?.ois && "OIS", p.specs.extra_specs?.cameras_detailed?.eis && "EIS", p.specs.extra_specs?.cameras_detailed?.pdaf && "PDAF", p.specs.extra_specs?.cameras_detailed?.laser_af && "Laser AF"].filter(Boolean).join(", ") || "N/A" },
        { label: "Camera Features", getValue: (p: Phone) => p.specs.extra_specs?.cameras_detailed?.features || "N/A" },
        { label: "Selfie Camera", getValue: (p: Phone) => p.specs.camera?.front_summary || "N/A", getRawValue: (p: Phone) => p.specs.camera?.front_summary ? parseFloat(p.specs.camera.front_summary) : null, better: "higher" },
        { label: "Video Recording", getValue: (p: Phone) => p.specs.camera?.video_recording || "N/A" },
        { label: "Video Features", getValue: (p: Phone) => p.specs.extra_specs?.video_recording_features || "N/A" },
      ],
    },
    {
      name: "Battery",
      icon: "battery_charging_full",
      fields: [
        {
          label: "Capacity",
          getValue: (p: Phone) =>
            p.specs.battery?.capacity_mah ? `${p.specs.battery.capacity_mah} mAh` : "N/A",
          getRawValue: (p: Phone) => p.specs.battery?.capacity_mah || null,
          better: "higher"
        },
        { label: "Battery Type", getValue: (p: Phone) => p.specs.extra_specs?.battery_detailed?.type || "N/A" },
        {
          label: "Charging Speed",
          getValue: (p: Phone) =>
            p.specs.battery?.charging_watts ? `${p.specs.battery.charging_watts}W` : "N/A",
          getRawValue: (p: Phone) => p.specs.battery?.charging_watts || null,
          better: "higher"
        },
        {
          label: "Fast Charging",
          getValue: (p: Phone) =>
            p.specs.battery?.fast_charging !== undefined
              ? p.specs.battery.fast_charging
                ? "Yes"
                : "No"
              : "N/A",
          getRawValue: (p: Phone) => p.specs.battery?.fast_charging === true ? 1 : 0,
          better: "higher"
        },
        { label: "Power Delivery / PPS", getValue: (p: Phone) => [p.specs.extra_specs?.battery_detailed?.pd && "PD", p.specs.extra_specs?.battery_detailed?.pps && "PPS"].filter(Boolean).join(", ") || "N/A" },
        {
          label: "Wireless Charging",
          getValue: (p: Phone) =>
            p.specs.battery?.wireless_charging !== undefined
              ? p.specs.battery.wireless_charging
                ? "Yes"
                : "No"
              : "N/A",
          getRawValue: (p: Phone) => p.specs.battery?.wireless_charging === true ? 1 : 0,
          better: "higher"
        },
        { label: "Reverse Charging", getValue: (p: Phone) => p.specs.extra_specs?.battery_detailed?.reverse_charging || "N/A" },
        { label: "Charger Included", getValue: (p: Phone) => p.specs.extra_specs?.battery_detailed?.charger_included || "N/A" },
        { label: "Removable", getValue: (p: Phone) => p.specs.extra_specs?.battery_detailed?.removable || "N/A" },
      ],
    },
    {
      name: "Body & Design",
      icon: "design_services",
      fields: [
        {
          label: "Dimensions",
          getValue: (p: Phone) =>
            p.specs.body?.height_mm && p.specs.body?.width_mm && p.specs.body?.thickness_mm
              ? `${p.specs.body.height_mm} x ${p.specs.body.width_mm} x ${p.specs.body.thickness_mm} mm`
              : "N/A",
        },
        {
          label: "Weight",
          getValue: (p: Phone) => (p.specs.body?.weight_g ? `${p.specs.body.weight_g} g` : "N/A"),
          getRawValue: (p: Phone) => p.specs.body?.weight_g || null,
          better: "lower"
        },
        { label: "Build Materials", getValue: (p: Phone) => p.specs.body?.materials || "N/A" },
        { label: "Frame & Back", getValue: (p: Phone) => (p.specs.extra_specs?.body_detailed?.frame || p.specs.extra_specs?.body_detailed?.back_material) ? `${p.specs.extra_specs?.body_detailed?.frame || ''} / ${p.specs.extra_specs?.body_detailed?.back_material || ''}`.replace(/^\s*\/\s*|\s*\/\s*$/g, '') : "N/A" },
        { label: "Water Resistance", getValue: (p: Phone) => p.specs.body?.water_resistance || p.specs.extra_specs?.body_detailed?.ip_rating || "N/A" },
        { label: "Military Standard", getValue: (p: Phone) => p.specs.extra_specs?.body_detailed?.mil_std || "N/A" },
        { label: "Colors", getValue: (p: Phone) => { const v = p.specs.extra_specs?.colors; return Array.isArray(v) ? v.join(", ") : (v || "N/A"); } },
      ],
    },
    {
      name: "Network & SIM",
      icon: "cell_tower",
      fields: [
        { label: "5G Support", getValue: (p: Phone) => p.specs.connectivity?.network?.includes("5G") ? "Yes" : (p.specs.connectivity?.network ? "No" : "N/A"), getRawValue: (p: Phone) => p.specs.connectivity?.network?.includes("5G") ? 1 : 0, better: "higher" },
        { label: "4G / LTE", getValue: (p: Phone) => (p.specs.connectivity?.network?.includes("4G") || p.specs.connectivity?.network?.includes("LTE")) ? "Yes" : (p.specs.connectivity?.network ? "No" : "N/A") },
        { label: "Network Support", getValue: (p: Phone) => p.specs.connectivity?.network || "N/A" },
        { label: "Network Features", getValue: (p: Phone) => p.specs.extra_specs?.network_detailed?.features || "N/A" },
        { label: "SIM Options", getValue: (p: Phone) => p.specs.connectivity?.sim || "N/A" },
        { label: "SIM Types", getValue: (p: Phone) => p.specs.extra_specs?.sim_detailed?.types || "N/A" },
      ],
    },
    {
      name: "Connectivity",
      icon: "wifi",
      fields: [
        { label: "Wi-Fi", getValue: (p: Phone) => p.specs.extra_specs?.connectivity_detailed?.wifi || "N/A" },
        { label: "Bluetooth", getValue: (p: Phone) => p.specs.connectivity?.bluetooth || "N/A" },
        { label: "Positioning (GPS)", getValue: (p: Phone) => p.specs.extra_specs?.connectivity_detailed?.gps || "N/A" },
        { label: "GLONASS", getValue: (p: Phone) => p.specs.extra_specs?.connectivity_detailed?.glonass || "N/A" },
        {
          label: "NFC Support",
          getValue: (p: Phone) =>
            p.specs.connectivity?.nfc !== undefined
              ? p.specs.connectivity.nfc
                ? "Yes"
                : "No"
              : "N/A",
          getRawValue: (p: Phone) => p.specs.connectivity?.nfc === true ? 1 : 0,
          better: "higher"
        },
        { label: "Infrared (IR)", getValue: (p: Phone) => p.specs.extra_specs?.connectivity_detailed?.infrared || "N/A" },
        { label: "UWB", getValue: (p: Phone) => p.specs.extra_specs?.connectivity_detailed?.uwb || "N/A" },
        { label: "Radio (FM)", getValue: (p: Phone) => p.specs.extra_specs?.connectivity_detailed?.fm || "N/A" },
        { label: "USB", getValue: (p: Phone) => p.specs.connectivity?.usb || "N/A" },
        { label: "USB OTG", getValue: (p: Phone) => p.specs.extra_specs?.connectivity_detailed?.otg || "N/A" },
      ],
    },
    {
      name: "Audio",
      icon: "volume_up",
      fields: [
        { label: "Speakers", getValue: (p: Phone) => p.specs.extra_specs?.audio?.speakers || "N/A" },
        { label: "Stereo Speakers", getValue: (p: Phone) => p.specs.extra_specs?.audio?.stereo || "N/A" },
        { label: "Microphones", getValue: (p: Phone) => p.specs.extra_specs?.audio?.microphones || "N/A" },
        { label: "3.5mm Jack", getValue: (p: Phone) => p.specs.extra_specs?.audio?.headphone_jack || p.specs.extra_specs?.connectivity_detailed?.headphone_jack || "N/A" },
        { label: "Audio Features", getValue: (p: Phone) => [p.specs.extra_specs?.audio?.dolby && "Dolby Atmos", p.specs.extra_specs?.audio?.hi_res && "Hi-Res Audio", p.specs.extra_specs?.audio?.snapdragon_sound && "Snapdragon Sound"].filter(Boolean).join(", ") || "N/A" },
      ],
    },
    {
      name: "Sensors",
      icon: "sensors",
      fields: [
        { label: "Fingerprint", getValue: (p: Phone) => p.specs.extra_specs?.sensors?.fingerprint || "N/A" },
        { label: "Face Unlock", getValue: (p: Phone) => p.specs.extra_specs?.sensors?.face_unlock || "N/A" },
        { label: "Other Sensors", getValue: (p: Phone) => [p.specs.extra_specs?.sensors?.accelerometer && "Accelerometer", p.specs.extra_specs?.sensors?.compass && "Compass", p.specs.extra_specs?.sensors?.gyroscope && "Gyroscope", p.specs.extra_specs?.sensors?.barometer && "Barometer", p.specs.extra_specs?.sensors?.hall_sensor && "Hall Sensor", p.specs.extra_specs?.sensors?.ambient_light && "Ambient Light", p.specs.extra_specs?.sensors?.proximity && "Proximity"].filter(Boolean).join(", ") || "N/A" },
      ],
    },
    {
      name: "Software",
      icon: "code",
      fields: [
        { label: "Operating System", getValue: (p: Phone) => p.specs.os || "N/A" },
        { label: "Custom UI", getValue: (p: Phone) => p.specs.extra_specs?.software?.ui || "N/A" },
        { label: "Software Updates", getValue: (p: Phone) => p.specs.extra_specs?.software?.years_updates ? `${p.specs.extra_specs.software.years_updates} Years` : "N/A" },
        { label: "Upgrade Promise", getValue: (p: Phone) => p.specs.extra_specs?.software?.upgrade_promise || "N/A" },
        { label: "Security Patch", getValue: (p: Phone) => p.specs.extra_specs?.software?.security_patch || "N/A" },
        { label: "Bootloader", getValue: (p: Phone) => p.specs.extra_specs?.software?.bootloader || "N/A" },
        { label: "Rootable", getValue: (p: Phone) => p.specs.extra_specs?.software?.rootable || "N/A" },
      ],
    },
    {
      name: "AI Capabilities",
      icon: "smart_toy",
      fields: [
        { label: "Supported Features", getValue: (p: Phone) => { const v = p.specs.extra_specs?.ai_features; return Array.isArray(v) ? v.join(", ") : (v || "N/A"); } },
      ],
    },
  ];

  // Update query parameters in the URL
  const updateUrl = (newSlots: (Phone | null)[]) => {
    const activePhones = newSlots.filter((p) => p !== null) as Phone[];
    
    if (activePhones.length === 2) {
      // Canonical 2-phone comparison
      router.push(`/compare/${activePhones[0].slug}-vs-${activePhones[1].slug}`);
    } else {
      // 1 or 3 phones fallback to query params
      const params = new URLSearchParams();
      activePhones.forEach((p) => {
        params.append("phone", p.slug);
      });
      router.push(`/compare?${params.toString()}`);
    }
  };

  // Add phone to slot
  const handleAddPhone = (phone: Phone, index: number) => {
    const newSlots = [...slots];
    newSlots[index] = phone;
    updateUrl(newSlots);
  };

  // Remove phone from slot
  const handleRemovePhone = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    updateUrl(newSlots);
  };
  const hasDifferences = aiKeyDifferences && Object.values(aiKeyDifferences).some((arr: any) => arr.length > 0);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6 bg-surface min-h-[80vh]">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-3xl md:text-4xl font-bold text-text-main tracking-tight">
          Compare Phones
        </h1>
        <p className="font-body-md text-text-muted text-sm md:text-base">
          Add up to {maxSlots} devices to compare prices and full specifications side-by-side.
        </p>
      </div>

      {/* Responsive Scrollable Container */}
      <div className="w-full overflow-x-auto relative rounded-xl border border-border-subtle bg-surface-white shadow-sm scrollbar-thin">
        <div className="min-w-[700px] md:min-w-full grid grid-cols-[180px_1fr_1fr] divide-x divide-border-subtle">
          
          {/* ── Sticky Header: Label Column ── */}
          <div className="sticky left-0 bg-surface-white z-20 flex flex-col justify-end p-6 border-b border-border-subtle shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] min-h-[300px]">
            <div className="font-headline-sm text-sm font-bold text-text-main uppercase tracking-wider mb-2">
              Devices
            </div>
            <p className="font-body-sm text-xs text-text-muted">
              Vertical side-by-side comparison.
            </p>
          </div>

          {/* ── Sticky Header: Phone Slots ── */}
          {slots.map((phone, index) => (
            <div
              key={index}
              className="p-6 flex flex-col items-center justify-between min-h-[300px] relative border-b border-border-subtle bg-surface-white group/slot"
            >
              {phone ? (
                <>
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemovePhone(index)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-surface-container hover:bg-error/10 hover:text-error text-text-muted flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    title="Remove device"
                  >
                    <AppIcon name="close" size={16} />
                  </button>

                  {/* Device Info */}
                  <div className="flex flex-col items-center text-center gap-3 w-full mt-4">
                    <div className="relative w-28 h-36 flex items-center justify-center bg-surface-container-lowest/50 p-2 rounded-lg border border-border-subtle/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={phone.images?.[0]?.url || "/placeholder-phone.svg"}
                        alt={phone.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/slot:scale-105"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        {phone.brand_slug.toUpperCase().replace("-", " ")}
                      </span>
                      <h3 className="font-headline-sm text-base font-bold text-text-main mt-0.5 line-clamp-1">
                        {phone.name}
                      </h3>
                      <p className="font-headline-md text-sm font-bold text-price-green mt-1">
                        <Price product={phone} />
                      </p>
                    </div>
                    {/* Key Differences AI section */}
                    {aiKeyDifferences?.[phone.slug] && (
                      <div className="mt-4 text-left w-full border-t border-border-subtle/50 pt-3">
                        <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                          <AppIcon name="psychiatry" size={16} /> Key Differences
                        </h4>
                        <ul className="space-y-2">
                          {aiKeyDifferences[phone.slug].map((diff, i) => (
                            <li key={i} className="text-xs text-text-muted leading-tight flex items-start gap-1.5">
                              <AppIcon name="check_circle" size={14} className="text-green-500 shrink-0 mt-0.5" />
                              {diff}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Link to Details */}
                  <Link
                    href={`/${phone.slug}`}
                    className="w-full mt-4 bg-surface-container-low hover:bg-primary/10 hover:text-primary text-text-main font-semibold text-xs py-2 px-4 rounded-lg text-center transition-colors border border-border-subtle"
                  >
                    View Details
                  </Link>
                </>
              ) : (
                <PhoneSearchSelector
                  index={index}
                  onSelect={(p) => handleAddPhone(p, index)}
                  allPhones={allPhones}
                  selectedSlugs={slots.filter((s) => s !== null).map((s) => s!.slug)}
                />
              )}
            </div>
          ))}

          {/* ── Table Spec Rows ── */}
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="col-span-3 grid grid-cols-[180px_1fr_1fr] divide-x divide-border-subtle">
              {/* Category Header Bar */}
              <div className="col-span-3 bg-surface-container-low/40 py-3 px-6 flex items-center gap-2 border-b border-t border-border-subtle">
                <AppIcon name={category.icon} size={18} className="text-text-muted" />
                <h3 className="font-headline-sm text-sm font-bold text-text-main uppercase tracking-wider">
                  {category.name}
                </h3>
              </div>

              {/* Rows within Category */}
              {category.fields.map((field, fieldIdx) => {
                // Determine the best values if this field has comparison logic
                let bestIndices = slots.map(() => false);
                if (field.getRawValue && field.better) {
                  const rawValues = slots.map(p => p ? field.getRawValue!(p) : null);
                  const validValues = rawValues.filter(v => v !== null && v !== undefined && !isNaN(v as number) && v !== 0) as number[];
                  if (validValues.length > 1) {
                    const bestValue = field.better === "higher" ? Math.max(...validValues) : Math.min(...validValues);
                    const countBest = rawValues.filter(v => v === bestValue).length;
                    // Only highlight if it's not a tie across all valid values
                    if (countBest < validValues.length) {
                      bestIndices = rawValues.map(v => v === bestValue);
                    }
                  }
                }

                return (
                <div key={fieldIdx} className="col-span-3 grid grid-cols-[180px_1fr_1fr] divide-x divide-border-subtle border-b border-border-subtle/50 last:border-b-0 hover:bg-surface-container-lowest/30 transition-colors">
                  {/* Label (Sticky left) */}
                  <div className="sticky left-0 bg-surface-white z-10 py-3 px-5 text-xs font-semibold text-text-muted flex items-center border-r border-border-subtle shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] min-h-[48px]">
                    {field.label}
                  </div>
                  
                  {/* Values */}
                  {slots.map((phone, index) => (
                    <div key={index} className={`py-3 px-5 text-sm flex items-center min-h-[48px] ${bestIndices[index] ? 'bg-green-500/10 text-green-700 dark:text-green-400 font-bold' : 'text-text-main'}`}>
                      {phone ? (
                        <div className="w-full font-semibold">{cell(field.getValue(phone))}</div>
                      ) : (
                        <span className="text-text-muted/40 font-light">-</span>
                      )}
                    </div>
                  ))}
                </div>
                );
              })}


            </div>
          ))}

        </div>
      </div>

      {/* AI Verdict Section */}
      <AIVerdictClient verdict={aiVerdict} loading={loadingAI} hasEnoughPhones={slots.filter((p) => p !== null).length >= 2} />

    </div>
  );
}

// ─── Slot Search Dropdown Component ──────────────────────────────────────────

interface SearchSelectorProps {
  index: number;
  onSelect: (phone: Phone) => void;
  allPhones: Phone[];
  selectedSlugs: string[];
}

function PhoneSearchSelector({ index, onSelect, allPhones, selectedSlugs }: SearchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out already selected phones and match query
  const filteredPhones = allPhones.filter((phone) => {
    const isAlreadySelected = selectedSlugs.includes(phone.slug);
    const matchesQuery =
      phone.name.toLowerCase().includes(query.toLowerCase()) ||
      phone.brand_slug.toLowerCase().includes(query.toLowerCase());
    return !isAlreadySelected && matchesQuery;
  });

  return (
    <div ref={dropdownRef} className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-border-subtle rounded-xl min-h-[220px] bg-surface-container-low/10 hover:bg-surface-container-low/20 transition-all duration-200 relative my-auto">
      <AppIcon name="add_circle" size={32} className="text-text-muted/60 mb-2" />
      <span className="text-xs font-semibold text-text-muted mb-4">Add Device {index + 1}</span>

      {/* Input container */}
      <div className="w-full relative max-w-[200px]">
        <input
          type="text"
          placeholder="Search phone..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full text-xs font-semibold py-2 px-3 pl-8 border border-border-subtle rounded-lg bg-surface-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-left text-text-main"
        />
        <AppIcon
          name="search"
          size={16}
          className="text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[80%] left-4 right-4 bg-surface-white border border-border-subtle rounded-xl shadow-lg max-h-56 overflow-y-auto z-30 mt-2 divide-y divide-border-subtle/50 flex flex-col py-1">
          {filteredPhones.length > 0 ? (
            filteredPhones.map((phone) => (
              <button
                key={phone._id}
                onClick={() => {
                  onSelect(phone);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full py-2.5 px-4 text-left hover:bg-surface-container-low/60 flex items-center gap-3 transition-colors border-none outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center p-1 border border-border-subtle/30 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={phone.images?.[0]?.url || "/placeholder-phone.svg"}
                    alt={phone.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-text-muted uppercase font-medium">
                    {phone.brand_slug.toUpperCase().replace("-", " ")}
                  </span>
                  <span className="text-sm font-bold text-text-main truncate">
                    {phone.name}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-4 px-4 text-center text-xs text-text-muted font-medium">
              No devices found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
