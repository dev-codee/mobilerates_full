"use client";
import { useCurrency } from "@/app/context/CurrencyContext";
import { resolvePrice } from "@/app/lib/currency";
import Price from "@/app/components/Price";


import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Vehicle, getAIVehicleComparison } from "@/app/lib/api";
import AppIcon from "./AppIcon";

interface VehicleCompareClientProps {
  initialVehicles: Vehicle[];
  allVehicles: Vehicle[];
}

interface SpecField {
  label: string;
  getValue: (v: Vehicle) => React.ReactNode;
  getRawValue?: (v: Vehicle) => number | null;
  better?: "higher" | "lower";
}

interface SpecCategory {
  name: string;
  icon: string;
  fields: SpecField[];
}

// ─── Formatting helpers ──────────────────────────────────────────────────────
const num = (v: number | null | undefined) =>
  v !== null && v !== undefined && !isNaN(Number(v)) ? Number(v) : null;

const unit = (v: number | null | undefined, suffix: string) => {
  const n = num(v);
  return n !== null ? `${n.toLocaleString()} ${suffix}` : "N/A";
};

const yesNo = (v: boolean | undefined) => (v === undefined ? "N/A" : v ? "Yes" : "No");

const lowestPrice = (v: Vehicle): number | null => {
  const rawStr = String(v.price_pkr || "");
  const parsed = Number(rawStr.replace(/[^0-9.]/g, ""));
  const validPrices = (v.prices || [])
    .map((pr) => Number(pr.price_pkr))
    .filter((pr) => !isNaN(pr) && pr > 0);
  return !isNaN(parsed) && parsed > 0
    ? parsed
    : validPrices.length
    ? Math.min(...validPrices)
    : null;
};

export default function VehicleCompareClient({
  initialVehicles = [],
  allVehicles = [],
}: VehicleCompareClientProps) {
  const router = useRouter();
  const { rates } = useCurrency();

  const maxSlots = 2;
  const slots: (Vehicle | null)[] = Array.from(
    { length: maxSlots },
    (_, i) => initialVehicles[i] || null
  );

  const [aiVerdict, setAiVerdict] = useState<string | null>(null);
  const [aiKeyDifferences, setAiKeyDifferences] = useState<Record<string, string[]> | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const activeSlugsKey = slots.filter((v) => v !== null).map((v) => v!.slug).join(",");

  useEffect(() => {
    const validSlugs = slots.filter((v) => v !== null).map((v) => v!.slug);
    if (validSlugs.length < 2) {
      setAiVerdict(null);
      setAiKeyDifferences(null);
      return;
    }

    let isMounted = true;
    setLoadingAI(true);

    getAIVehicleComparison(validSlugs)
      .then((data) => {
        if (isMounted && data) {
          setAiVerdict(data.verdict);
          setAiKeyDifferences(data.key_differences);
        }
      })
      .catch((err) => console.error("Failed to fetch AI vehicle comparison", err))
      .finally(() => {
        if (isMounted) setLoadingAI(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlugsKey]);

  const categories: SpecCategory[] = [
    {
      name: "General info",
      icon: "info",
      fields: [
        {
          label: "Price (lowest)",
          getValue: (v) => {
            return <Price product={v} />;
          },
          getRawValue: (v) => { const price = resolvePrice(v, 'USD', rates); return price?.currency === 'USD' ? price.amount : null; },
          better: "lower",
        },
        { label: "Type", getValue: (v) => v.vehicle_type || "N/A" },
        { label: "Category", getValue: (v) => v.ev_category || "N/A" },
        { label: "Body Type", getValue: (v) => v.body_type || "N/A" },
        { label: "Segment", getValue: (v) => v.segment || "N/A" },
        { label: "Model Year", getValue: (v) => v.model_year || "N/A" },
        { label: "Seats", getValue: (v) => v.seats || "N/A" },
        { label: "Doors", getValue: (v) => v.doors || "N/A" },
        {
          label: "Release Status",
          getValue: (v) => <span className="capitalize">{(v.status || "").replace("_", " ")}</span>,
        },
        { label: "Made In", getValue: (v) => v.made_in || v.assembly_country || "N/A" },
      ],
    },
    {
      name: "Battery",
      icon: "battery_charging_full",
      fields: [
        {
          label: "Usable Capacity",
          getValue: (v) => unit(v.specs?.battery?.capacity_usable_kwh, "kWh"),
          getRawValue: (v) => num(v.specs?.battery?.capacity_usable_kwh),
          better: "higher",
        },
        {
          label: "Gross Capacity",
          getValue: (v) => unit(v.specs?.battery?.capacity_gross_kwh, "kWh"),
          getRawValue: (v) => num(v.specs?.battery?.capacity_gross_kwh),
          better: "higher",
        },
        { label: "Chemistry", getValue: (v) => v.specs?.battery?.chemistry || "N/A" },
        {
          label: "System Voltage",
          getValue: (v) => unit(v.specs?.battery?.system_voltage, "V"),
          getRawValue: (v) => num(v.specs?.battery?.system_voltage),
          better: "higher",
        },
        { label: "Thermal Management", getValue: (v) => v.specs?.battery?.thermal_management || "N/A" },
        {
          label: "Warranty",
          getValue: (v) => {
            const y = num(v.specs?.battery?.warranty_years);
            const km = num(v.specs?.battery?.warranty_distance_km);
            if (y && km) return `${y} yrs / ${km.toLocaleString()} km`;
            if (y) return `${y} years`;
            if (km) return `${km.toLocaleString()} km`;
            return "N/A";
          },
          getRawValue: (v) => num(v.specs?.battery?.warranty_distance_km),
          better: "higher",
        },
      ],
    },
    {
      name: "Range & Efficiency",
      icon: "speed",
      fields: [
        {
          label: "WLTP Range",
          getValue: (v) => unit(v.specs?.range_and_efficiency?.wltp_combined_km, "km"),
          getRawValue: (v) => num(v.specs?.range_and_efficiency?.wltp_combined_km),
          better: "higher",
        },
        {
          label: "EPA Range",
          getValue: (v) => unit(v.specs?.range_and_efficiency?.epa_combined_km, "km"),
          getRawValue: (v) => num(v.specs?.range_and_efficiency?.epa_combined_km),
          better: "higher",
        },
        {
          label: "CLTC Range",
          getValue: (v) => unit(v.specs?.range_and_efficiency?.cltc_range_km, "km"),
          getRawValue: (v) => num(v.specs?.range_and_efficiency?.cltc_range_km),
          better: "higher",
        },
        {
          label: "Real-World (Mild)",
          getValue: (v) => unit(v.specs?.range_and_efficiency?.real_world_range_mild_km, "km"),
          getRawValue: (v) => num(v.specs?.range_and_efficiency?.real_world_range_mild_km),
          better: "higher",
        },
        {
          label: "Real-World (Highway)",
          getValue: (v) => unit(v.specs?.range_and_efficiency?.real_world_range_highway_km, "km"),
          getRawValue: (v) => num(v.specs?.range_and_efficiency?.real_world_range_highway_km),
          better: "higher",
        },
        {
          label: "Real-World (Cold)",
          getValue: (v) => unit(v.specs?.range_and_efficiency?.real_world_range_cold_km, "km"),
          getRawValue: (v) => num(v.specs?.range_and_efficiency?.real_world_range_cold_km),
          better: "higher",
        },
        {
          label: "Consumption",
          getValue: (v) => unit(v.specs?.range_and_efficiency?.wltp_consumption_kwh_100km, "kWh/100km"),
          getRawValue: (v) => num(v.specs?.range_and_efficiency?.wltp_consumption_kwh_100km),
          better: "lower",
        },
        {
          label: "Drag Coefficient (Cd)",
          getValue: (v) =>
            num(v.specs?.range_and_efficiency?.drag_coefficient_cd) !== null
              ? String(v.specs?.range_and_efficiency?.drag_coefficient_cd)
              : "N/A",
          getRawValue: (v) => num(v.specs?.range_and_efficiency?.drag_coefficient_cd),
          better: "lower",
        },
      ],
    },
    {
      name: "Charging",
      icon: "bolt",
      fields: [
        {
          label: "DC Max Power",
          getValue: (v) => unit(v.specs?.charging?.dc_max_power_kw, "kW"),
          getRawValue: (v) => num(v.specs?.charging?.dc_max_power_kw),
          better: "higher",
        },
        {
          label: "DC 10-80%",
          getValue: (v) => unit(v.specs?.charging?.dc_charge_time_10_80_min, "min"),
          getRawValue: (v) => num(v.specs?.charging?.dc_charge_time_10_80_min),
          better: "lower",
        },
        { label: "DC Port", getValue: (v) => v.specs?.charging?.dc_port_type || "N/A" },
        {
          label: "AC Max Power",
          getValue: (v) => unit(v.specs?.charging?.ac_max_power_kw, "kW"),
          getRawValue: (v) => num(v.specs?.charging?.ac_max_power_kw),
          better: "higher",
        },
        {
          label: "AC 0-100%",
          getValue: (v) => unit(v.specs?.charging?.ac_charge_time_0_100_hrs, "hrs"),
          getRawValue: (v) => num(v.specs?.charging?.ac_charge_time_0_100_hrs),
          better: "lower",
        },
        { label: "AC Port", getValue: (v) => v.specs?.charging?.ac_port_type || "N/A" },
        {
          label: "V2L Support",
          getValue: (v) => yesNo(v.specs?.charging?.v2l_support),
          getRawValue: (v) => (v.specs?.charging?.v2l_support ? 1 : 0),
          better: "higher",
        },
        {
          label: "V2H Support",
          getValue: (v) => yesNo(v.specs?.charging?.v2h_support),
          getRawValue: (v) => (v.specs?.charging?.v2h_support ? 1 : 0),
          better: "higher",
        },
        {
          label: "V2G Support",
          getValue: (v) => yesNo(v.specs?.charging?.v2g_support),
          getRawValue: (v) => (v.specs?.charging?.v2g_support ? 1 : 0),
          better: "higher",
        },
      ],
    },
    {
      name: "Powertrain & Performance",
      icon: "sports_motorsports",
      fields: [
        { label: "Drive Layout", getValue: (v) => v.specs?.powertrain?.drive_layout || "N/A" },
        {
          label: "Motors",
          getValue: (v) => v.specs?.powertrain?.motor_count ?? "N/A",
          getRawValue: (v) => num(v.specs?.powertrain?.motor_count),
          better: "higher",
        },
        {
          label: "Power",
          getValue: (v) => unit(v.specs?.powertrain?.total_power_hp, "hp"),
          getRawValue: (v) => num(v.specs?.powertrain?.total_power_hp),
          better: "higher",
        },
        {
          label: "Power (kW)",
          getValue: (v) => unit(v.specs?.powertrain?.total_power_kw, "kW"),
          getRawValue: (v) => num(v.specs?.powertrain?.total_power_kw),
          better: "higher",
        },
        {
          label: "Torque",
          getValue: (v) => unit(v.specs?.powertrain?.total_torque_nm, "Nm"),
          getRawValue: (v) => num(v.specs?.powertrain?.total_torque_nm),
          better: "higher",
        },
        {
          label: "0-100 km/h",
          getValue: (v) =>
            num(v.specs?.powertrain?.acceleration_0_100_kmh) !== null
              ? `${v.specs?.powertrain?.acceleration_0_100_kmh} s`
              : "N/A",
          getRawValue: (v) => num(v.specs?.powertrain?.acceleration_0_100_kmh),
          better: "lower",
        },
        {
          label: "Top Speed",
          getValue: (v) => unit(v.specs?.powertrain?.top_speed_kmh, "km/h"),
          getRawValue: (v) => num(v.specs?.powertrain?.top_speed_kmh),
          better: "higher",
        },
      ],
    },
    {
      name: "Dimensions & Weight",
      icon: "straighten",
      fields: [
        {
          label: "Dimensions (L×W×H)",
          getValue: (v) => {
            const d = v.specs?.dimensions_and_weight;
            return d?.length_mm && d?.width_mm && d?.height_mm
              ? `${d.length_mm} × ${d.width_mm} × ${d.height_mm} mm`
              : "N/A";
          },
        },
        {
          label: "Wheelbase",
          getValue: (v) => unit(v.specs?.dimensions_and_weight?.wheelbase_mm, "mm"),
          getRawValue: (v) => num(v.specs?.dimensions_and_weight?.wheelbase_mm),
          better: "higher",
        },
        {
          label: "Ground Clearance",
          getValue: (v) => unit(v.specs?.dimensions_and_weight?.ground_clearance_mm, "mm"),
          getRawValue: (v) => num(v.specs?.dimensions_and_weight?.ground_clearance_mm),
          better: "higher",
        },
        {
          label: "Curb Weight",
          getValue: (v) => unit(v.specs?.dimensions_and_weight?.curb_weight_kg, "kg"),
          getRawValue: (v) => num(v.specs?.dimensions_and_weight?.curb_weight_kg),
          better: "lower",
        },
        {
          label: "Boot Space",
          getValue: (v) => unit(v.specs?.dimensions_and_weight?.trunk_liters, "L"),
          getRawValue: (v) => num(v.specs?.dimensions_and_weight?.trunk_liters),
          better: "higher",
        },
        {
          label: "Frunk Space",
          getValue: (v) => unit(v.specs?.dimensions_and_weight?.frunk_liters, "L"),
          getRawValue: (v) => num(v.specs?.dimensions_and_weight?.frunk_liters),
          better: "higher",
        },
        {
          label: "Towing (Braked)",
          getValue: (v) => unit(v.specs?.dimensions_and_weight?.towing_braked_kg, "kg"),
          getRawValue: (v) => num(v.specs?.dimensions_and_weight?.towing_braked_kg),
          better: "higher",
        },
      ],
    },
    {
      name: "Chassis & Suspension",
      icon: "settings_suggest",
      fields: [
        { label: "Front Suspension", getValue: (v) => v.specs?.chassis_and_suspension?.front_suspension || "N/A" },
        { label: "Rear Suspension", getValue: (v) => v.specs?.chassis_and_suspension?.rear_suspension || "N/A" },
        {
          label: "Air Suspension",
          getValue: (v) => yesNo(v.specs?.chassis_and_suspension?.air_suspension),
          getRawValue: (v) => (v.specs?.chassis_and_suspension?.air_suspension ? 1 : 0),
          better: "higher",
        },
        {
          label: "Turning Circle",
          getValue: (v) => unit(v.specs?.chassis_and_suspension?.turning_circle_m, "m"),
          getRawValue: (v) => num(v.specs?.chassis_and_suspension?.turning_circle_m),
          better: "lower",
        },
        {
          label: "Wheel Sizes",
          getValue: (v) =>
            v.specs?.chassis_and_suspension?.wheel_sizes_inches?.length
              ? `${v.specs.chassis_and_suspension.wheel_sizes_inches.join('" / ')}"`
              : "N/A",
        },
        { label: "Tire Size", getValue: (v) => v.specs?.chassis_and_suspension?.tire_size || "N/A" },
      ],
    },
    {
      name: "Cockpit & Tech",
      icon: "dashboard",
      fields: [
        { label: "Cockpit OS", getValue: (v) => v.specs?.cockpit_and_tech?.cockpit_os || "N/A" },
        { label: "Cockpit Chip", getValue: (v) => v.specs?.cockpit_and_tech?.cockpit_chip || "N/A" },
        {
          label: "Center Screen",
          getValue: (v) => unit(v.specs?.cockpit_and_tech?.center_screen_inches, "in"),
          getRawValue: (v) => num(v.specs?.cockpit_and_tech?.center_screen_inches),
          better: "higher",
        },
        {
          label: "Driver Cluster",
          getValue: (v) => unit(v.specs?.cockpit_and_tech?.driver_cluster_inches, "in"),
          getRawValue: (v) => num(v.specs?.cockpit_and_tech?.driver_cluster_inches),
          better: "higher",
        },
        { label: "Head-Up Display", getValue: (v) => v.specs?.cockpit_and_tech?.hud || "N/A" },
        { label: "Apple CarPlay", getValue: (v) => v.specs?.cockpit_and_tech?.apple_carplay || "N/A" },
        { label: "Android Auto", getValue: (v) => v.specs?.cockpit_and_tech?.android_auto || "N/A" },
        { label: "Audio Brand", getValue: (v) => v.specs?.cockpit_and_tech?.audio_brand || "N/A" },
        {
          label: "Speakers",
          getValue: (v) => v.specs?.cockpit_and_tech?.speaker_count ?? "N/A",
          getRawValue: (v) => num(v.specs?.cockpit_and_tech?.speaker_count),
          better: "higher",
        },
        { label: "OTA Updates", getValue: (v) => v.specs?.cockpit_and_tech?.ota_updates || "N/A" },
        {
          label: "Heat Pump",
          getValue: (v) => yesNo(v.specs?.cockpit_and_tech?.heat_pump),
          getRawValue: (v) => (v.specs?.cockpit_and_tech?.heat_pump ? 1 : 0),
          better: "higher",
        },
      ],
    },
    {
      name: "ADAS & Safety",
      icon: "shield",
      fields: [
        {
          label: "Euro NCAP",
          getValue: (v) =>
            num(v.specs?.adas_and_safety?.euro_ncap_stars) !== null
              ? `${v.specs?.adas_and_safety?.euro_ncap_stars} ★`
              : "N/A",
          getRawValue: (v) => num(v.specs?.adas_and_safety?.euro_ncap_stars),
          better: "higher",
        },
        {
          label: "Airbags",
          getValue: (v) => v.specs?.adas_and_safety?.airbag_count ?? "N/A",
          getRawValue: (v) => num(v.specs?.adas_and_safety?.airbag_count),
          better: "higher",
        },
        { label: "Autonomy Level", getValue: (v) => v.specs?.adas_and_safety?.autonomy_level || "N/A" },
        { label: "ADAS System", getValue: (v) => v.specs?.adas_and_safety?.adas_system_name || "N/A" },
        {
          label: "Cameras",
          getValue: (v) => v.specs?.adas_and_safety?.camera_count ?? "N/A",
          getRawValue: (v) => num(v.specs?.adas_and_safety?.camera_count),
          better: "higher",
        },
        {
          label: "Radars",
          getValue: (v) => v.specs?.adas_and_safety?.radar_count ?? "N/A",
          getRawValue: (v) => num(v.specs?.adas_and_safety?.radar_count),
          better: "higher",
        },
        {
          label: "LiDAR",
          getValue: (v) => v.specs?.adas_and_safety?.lidar_count ?? "N/A",
          getRawValue: (v) => num(v.specs?.adas_and_safety?.lidar_count),
          better: "higher",
        },
        {
          label: "ADAS Features",
          getValue: (v) =>
            v.specs?.adas_and_safety?.features?.length
              ? v.specs.adas_and_safety.features.join(", ")
              : "N/A",
        },
      ],
    },
  ];

  const updateUrl = (newSlots: (Vehicle | null)[]) => {
    const active = newSlots.filter((v) => v !== null) as Vehicle[];
    if (active.length === 2) {
      router.push(`/vehicles/compare/${active[0].slug}-vs-${active[1].slug}`);
    } else {
      const params = new URLSearchParams();
      active.forEach((v) => params.append("vehicle", v.slug));
      router.push(`/vehicles/compare?${params.toString()}`);
    }
  };

  const handleAddVehicle = (vehicle: Vehicle, index: number) => {
    const newSlots = [...slots];
    newSlots[index] = vehicle;
    updateUrl(newSlots);
  };

  const handleRemoveVehicle = (index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    updateUrl(newSlots);
  };

  const hasEnough = slots.filter((v) => v !== null).length >= 2;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-6 bg-surface min-h-[80vh]">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-3xl md:text-4xl font-bold text-text-main tracking-tight">
          Compare Electric Vehicles
        </h1>
        <p className="font-body-md text-text-muted text-sm md:text-base">
          Add up to {maxSlots} EVs to compare prices, range, charging, performance, and full specifications side-by-side.
        </p>
      </div>

      {/* Responsive Scrollable Container */}
      <div className="w-full overflow-x-auto relative rounded-xl border border-border-subtle bg-surface-white shadow-sm scrollbar-thin">
        <div className="min-w-[700px] md:min-w-full grid grid-cols-[180px_1fr_1fr] divide-x divide-border-subtle">

          {/* ── Sticky Header: Label Column ── */}
          <div className="sticky left-0 bg-surface-white z-20 flex flex-col justify-end p-6 border-b border-border-subtle shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] min-h-[300px]">
            <div className="font-headline-sm text-sm font-bold text-text-main uppercase tracking-wider mb-2">
              Vehicles
            </div>
            <p className="font-body-sm text-xs text-text-muted">
              Vertical side-by-side comparison.
            </p>
          </div>

          {/* ── Sticky Header: Vehicle Slots ── */}
          {slots.map((vehicle, index) => (
            <div
              key={index}
              className="p-6 flex flex-col items-center justify-between min-h-[300px] relative border-b border-border-subtle bg-surface-white group/slot"
            >
              {vehicle ? (
                <>
                  <button
                    onClick={() => handleRemoveVehicle(index)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-surface-container hover:bg-error/10 hover:text-error text-text-muted flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    title="Remove vehicle"
                  >
                    <AppIcon name="close" size={16} />
                  </button>

                  <div className="flex flex-col items-center text-center gap-3 w-full mt-4">
                    <div className="relative w-40 h-28 flex items-center justify-center bg-surface-container-lowest/50 p-2 rounded-lg border border-border-subtle/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vehicle.images?.[0]?.url || "/placeholder-car.svg"}
                        alt={vehicle.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/slot:scale-105"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        {(vehicle.brand_slug || "").toUpperCase().replace("-", " ")}
                      </span>
                      <h3 className="font-headline-sm text-base font-bold text-text-main mt-0.5 line-clamp-1">
                        {vehicle.name}
                      </h3>
                      <p className="font-headline-md text-sm font-bold text-price-green mt-1">
                        <Price product={vehicle} />
                      </p>
                    </div>

                    {aiKeyDifferences?.[vehicle.slug] && (
                      <div className="mt-4 text-left w-full border-t border-border-subtle/50 pt-3">
                        <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                          <AppIcon name="psychiatry" size={16} /> Key Differences
                        </h4>
                        <ul className="space-y-2">
                          {aiKeyDifferences[vehicle.slug].map((diff, i) => (
                            <li key={i} className="text-xs text-text-muted leading-tight flex items-start gap-1.5">
                              <AppIcon name="check_circle" size={14} className="text-green-500 shrink-0 mt-0.5" />
                              {diff}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/${vehicle.slug}`}
                    className="w-full mt-4 bg-surface-container-low hover:bg-primary/10 hover:text-primary text-text-main font-semibold text-xs py-2 px-4 rounded-lg text-center transition-colors border border-border-subtle"
                  >
                    View Details
                  </Link>
                </>
              ) : (
                <VehicleSearchSelector
                  index={index}
                  onSelect={(v) => handleAddVehicle(v, index)}
                  allVehicles={allVehicles}
                  selectedSlugs={slots.filter((s) => s !== null).map((s) => s!.slug)}
                />
              )}
            </div>
          ))}

          {/* ── Table Spec Rows ── */}
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="col-span-3 grid grid-cols-[180px_1fr_1fr] divide-x divide-border-subtle">
              <div className="col-span-3 bg-surface-container-low/40 py-3 px-6 flex items-center gap-2 border-b border-t border-border-subtle">
                <AppIcon name={category.icon} size={18} className="text-text-muted" />
                <h3 className="font-headline-sm text-sm font-bold text-text-main uppercase tracking-wider">
                  {category.name}
                </h3>
              </div>

              {category.fields.map((field, fieldIdx) => {
                let bestIndices = slots.map(() => false);
                if (field.getRawValue && field.better) {
                  const rawValues = slots.map((v) => (v ? field.getRawValue!(v) : null));
                  const validValues = rawValues.filter(
                    (val) => val !== null && val !== undefined && !isNaN(val as number) && val !== 0
                  ) as number[];
                  if (validValues.length > 1) {
                    const bestValue =
                      field.better === "higher" ? Math.max(...validValues) : Math.min(...validValues);
                    const countBest = rawValues.filter((val) => val === bestValue).length;
                    if (countBest < validValues.length) {
                      bestIndices = rawValues.map((val) => val === bestValue);
                    }
                  }
                }

                return (
                  <div key={fieldIdx} className="col-span-3 grid grid-cols-[180px_1fr_1fr] divide-x divide-border-subtle border-b border-border-subtle/50 last:border-b-0 hover:bg-surface-container-lowest/30 transition-colors">
                    <div className="sticky left-0 bg-surface-white z-10 py-3 px-5 text-xs font-semibold text-text-muted flex items-center border-r border-border-subtle shadow-[4px_0_8px_-4px_rgba(0,0,0,0.06)] min-h-[48px]">
                      {field.label}
                    </div>

                    {slots.map((vehicle, index) => (
                      <div
                        key={index}
                        className={`py-3 px-5 text-sm flex items-center min-h-[48px] ${
                          bestIndices[index]
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 font-bold"
                            : "text-text-main"
                        }`}
                      >
                        {vehicle ? (
                          <div className="w-full font-semibold">{field.getValue(vehicle)}</div>
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
      <VehicleAIVerdict verdict={aiVerdict} loading={loadingAI} hasEnough={hasEnough} />
    </div>
  );
}

// ─── AI Verdict block ────────────────────────────────────────────────────────

function VehicleAIVerdict({
  verdict,
  loading,
  hasEnough,
}: {
  verdict: string | null;
  loading: boolean;
  hasEnough: boolean;
}) {
  if (!hasEnough) {
    return (
      <div className="bg-surface-container-low/40 border border-border-subtle rounded-xl p-6 text-center text-text-muted text-sm font-medium">
        Add both vehicles to see the Conclusion.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-surface-white border border-border-subtle rounded-xl p-6 md:p-8 animate-pulse">
        <div className="flex items-center mb-4">
          <h3 className="font-headline-sm text-lg font-bold text-text-main">Conclusion</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
          <div className="h-4 bg-surface-container-high rounded w-full"></div>
          <div className="h-4 bg-surface-container-high rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!verdict) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-surface-white border border-primary/20 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="flex items-center mb-4 relative z-10">
        <h3 className="font-headline-sm text-lg font-bold text-text-main">Conclusion</h3>
      </div>
      <div className="prose prose-sm md:prose-base prose-neutral max-w-none relative z-10">
        <p className="text-text-main/90 leading-relaxed m-0">{verdict}</p>
      </div>
    </div>
  );
}

// ─── Slot Search Dropdown Component ──────────────────────────────────────────

interface SearchSelectorProps {
  index: number;
  onSelect: (vehicle: Vehicle) => void;
  allVehicles: Vehicle[];
  selectedSlugs: string[];
}

function VehicleSearchSelector({ index, onSelect, allVehicles, selectedSlugs }: SearchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredVehicles = allVehicles.filter((vehicle) => {
    const isAlreadySelected = selectedSlugs.includes(vehicle.slug);
    const matchesQuery =
      vehicle.name.toLowerCase().includes(query.toLowerCase()) ||
      (vehicle.brand_slug || "").toLowerCase().includes(query.toLowerCase());
    return !isAlreadySelected && matchesQuery;
  });

  return (
    <div ref={dropdownRef} className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-border-subtle rounded-xl min-h-[220px] bg-surface-container-low/10 hover:bg-surface-container-low/20 transition-all duration-200 relative my-auto">
      <AppIcon name="add_circle" size={32} className="text-text-muted/60 mb-2" />
      <span className="text-xs font-semibold text-text-muted mb-4">Add Vehicle {index + 1}</span>

      <div className="w-full relative max-w-[200px]">
        <input
          type="text"
          placeholder="Search EV..."
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

      {isOpen && (
        <div className="absolute top-[80%] left-4 right-4 bg-surface-white border border-border-subtle rounded-xl shadow-lg max-h-56 overflow-y-auto z-30 mt-2 divide-y divide-border-subtle/50 flex flex-col py-1">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <button
                key={vehicle._id}
                onClick={() => {
                  onSelect(vehicle);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full py-2.5 px-4 text-left hover:bg-surface-container-low/60 flex items-center gap-3 transition-colors border-none outline-none cursor-pointer"
              >
                <div className="w-10 h-8 rounded bg-surface-container flex items-center justify-center p-1 border border-border-subtle/30 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicle.images?.[0]?.url || "/placeholder-car.svg"}
                    alt={vehicle.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-text-muted uppercase font-medium">
                    {(vehicle.brand_slug || "").toUpperCase().replace("-", " ")}
                  </span>
                  <span className="text-sm font-bold text-text-main truncate">{vehicle.name}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="py-4 px-4 text-center text-xs text-text-muted font-medium">
              No vehicles found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
