"use client";
import Price from "@/app/components/Price";


import React from "react";
import type { Vehicle } from "@/app/lib/api";
import { isJunk } from "@/app/lib/spec-value";
import AppIcon from "./AppIcon";

interface EVSpecsProps {
  vehicle: Vehicle;
  className?: string;
}

// Helper to render a single spec row (hides if null/undefined/empty or a
// placeholder string like "null"/"N/A").
const renderRow = (label: string, value: React.ReactNode) => {
  if (value === "false") return null;
  if (value === true || value === "true") value = "Yes";
  if (value === false) value = "No";
  if (Array.isArray(value)) {
    const cleaned = value.filter((v) => !isJunk(v));
    if (cleaned.length === 0) return null;
    value = cleaned.join(", ");
  }
  if (isJunk(value)) return null;
  return (
    <div key={label} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-6 py-2.5 px-5 md:px-6 border-b border-border-subtle/50 last:border-b-0 hover:bg-surface-container-lowest/50 transition-colors duration-150">
      <span className="text-text-muted font-semibold text-xs md:text-sm capitalize">{label.replace(/_/g, " ")}</span>
      <span className="text-text-main text-xs md:text-sm font-medium leading-relaxed">{value}</span>
    </div>
  );
};

// Helper to render an accordion section (only if at least one row has data)
const renderSection = (
  id: string,
  title: string,
  icon: string,
  rowNodes: React.ReactNode[]
) => {
  const validRows = rowNodes.filter(Boolean);
  if (validRows.length === 0) return null; // Entire section hidden if all fields are empty!

  return (
    <details open className="group flex flex-col border-b border-border-subtle last:border-b-0">
      <summary className="w-full p-4 md:p-5 md:px-6 flex items-center justify-between cursor-pointer select-none bg-surface-container-low/20 hover:bg-surface-container-low/40 transition-colors duration-200 list-none [&::-webkit-details-marker]:hidden border-none outline-none text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-white border border-border-subtle flex items-center justify-center text-primary shadow-xs">
            <AppIcon name={icon} size={18} />
          </div>
          <span className="font-headline-sm text-sm md:text-base font-bold text-text-main">
            {title}
          </span>
        </div>

        <AppIcon
          name="keyboard_arrow_down"
          size={20}
          className="text-text-muted transition-transform duration-200 group-open:rotate-180 ml-auto"
        />
      </summary>

      <div className="flex flex-col bg-surface-white">
        {validRows}
      </div>
    </details>
  );
};

export default function EVSpecs({ vehicle, className = "" }: EVSpecsProps) {
  const specs = vehicle.specs || {};
  const pricing = vehicle.pricing || {};

  return (
    <section className={`bg-surface-white border border-border-subtle rounded-2xl overflow-hidden shadow-sm flex flex-col ${className}`}>
      <div className="p-4 md:px-6 border-b border-border-subtle bg-surface-container-low/30 flex items-center justify-between">
        <h2 className="font-headline-md text-base md:text-lg font-bold text-text-main flex items-center gap-2">
          <AppIcon name="receipt_long" size={20} className="text-primary" />
          Full Specifications & Features
        </h2>
        <span className="text-xs text-text-muted font-medium">
          Verified Specs
        </span>
      </div>

      {/* 1. Identity & Classification */}
      {renderSection("identity", "Identity & Classification", "directions_car", [
        renderRow("Brand", vehicle.brand_slug ? vehicle.brand_slug.toUpperCase().replace("-", " ") : ""),
        renderRow("Model Name", vehicle.model_name),
        renderRow("Variant / Trim", vehicle.variant_name),
        renderRow("Model Year", vehicle.model_year),
        renderRow("Generation", vehicle.generation),
        renderRow("Vehicle Type", vehicle.vehicle_type),
        renderRow("Category", vehicle.ev_category),
        renderRow("Body Type", vehicle.body_type),
        renderRow("Segment", vehicle.segment),
        renderRow("Platform / Architecture", vehicle.platform),
        renderRow("Doors", vehicle.doors ? `${vehicle.doors} Doors` : ""),
        renderRow("Seating Capacity", vehicle.seats ? `${vehicle.seats} Seats` : ""),
        renderRow("Assembly Type", vehicle.assembly_country),
        renderRow("Country of Origin", vehicle.made_in),
        renderRow("Market Status", vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : ""),
        renderRow("Announcement Date", vehicle.announcement_date ? new Date(vehicle.announcement_date).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : ""),
        renderRow("Release Date", vehicle.release_date ? new Date(vehicle.release_date).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : ""),
        renderRow("Country Availability", vehicle.country_availability),
      ])}

      {/* 2. Battery & Energy Storage */}
      {renderSection("battery", "Battery & Energy Storage", "battery_charging_full", [
        renderRow("Usable Capacity", specs.battery?.capacity_usable_kwh ? `${specs.battery.capacity_usable_kwh} kWh` : ""),
        renderRow("Gross Capacity", specs.battery?.capacity_gross_kwh ? `${specs.battery.capacity_gross_kwh} kWh` : ""),
        renderRow("Battery Chemistry", specs.battery?.chemistry),
        renderRow("System Voltage", specs.battery?.system_voltage ? `${specs.battery.system_voltage} V` : ""),
        renderRow("Thermal Management", specs.battery?.thermal_management),
        renderRow("Battery Warranty (Years)", specs.battery?.warranty_years ? `${specs.battery.warranty_years} Years` : ""),
        renderRow("Battery Warranty (Distance)", specs.battery?.warranty_distance_km ? `${specs.battery.warranty_distance_km.toLocaleString()} km` : ""),
      ])}

      {/* 3. Range & Efficiency */}
      {renderSection("range", "Range & Efficiency", "speed", [
        renderRow("WLTP Combined Range", specs.range_and_efficiency?.wltp_combined_km ? `${specs.range_and_efficiency.wltp_combined_km} km` : ""),
        renderRow("WLTP Consumption", specs.range_and_efficiency?.wltp_consumption_kwh_100km ? `${specs.range_and_efficiency.wltp_consumption_kwh_100km} kWh/100 km` : ""),
        renderRow("EPA Combined Range", specs.range_and_efficiency?.epa_combined_km ? `${specs.range_and_efficiency.epa_combined_km} km` : ""),
        renderRow("EPA Efficiency (MPGe)", specs.range_and_efficiency?.efficiency_mpge_combined ? `${specs.range_and_efficiency.efficiency_mpge_combined} MPGe` : ""),
        renderRow("CLTC Range", specs.range_and_efficiency?.cltc_range_km ? `${specs.range_and_efficiency.cltc_range_km} km` : ""),
        renderRow("Real-World Range (Mild Weather)", specs.range_and_efficiency?.real_world_range_mild_km ? `${specs.range_and_efficiency.real_world_range_mild_km} km` : ""),
        renderRow("Real-World Range (Cold Weather)", specs.range_and_efficiency?.real_world_range_cold_km ? `${specs.range_and_efficiency.real_world_range_cold_km} km` : ""),
        renderRow("Real-World Range (Highway)", specs.range_and_efficiency?.real_world_range_highway_km ? `${specs.range_and_efficiency.real_world_range_highway_km} km` : ""),
        renderRow("Drag Coefficient (Cd)", specs.range_and_efficiency?.drag_coefficient_cd ? `${specs.range_and_efficiency.drag_coefficient_cd} Cd` : ""),
      ])}

      {/* 4. Charging & Bidirectional Power */}
      {renderSection("charging", "Charging & Bidirectional Power", "bolt", [
        renderRow("DC Fast Charging Max Power", specs.charging?.dc_max_power_kw ? `${specs.charging.dc_max_power_kw} kW` : ""),
        renderRow("DC Fast Charge Time (10-80%)", specs.charging?.dc_charge_time_10_80_min ? `${specs.charging.dc_charge_time_10_80_min} minutes` : ""),
        renderRow("DC Port Type", specs.charging?.dc_port_type),
        renderRow("AC Charging Max Power", specs.charging?.ac_max_power_kw ? `${specs.charging.ac_max_power_kw} kW` : ""),
        renderRow("AC Charge Time (0-100%)", specs.charging?.ac_charge_time_0_100_hrs ? `${specs.charging.ac_charge_time_0_100_hrs} hours` : ""),
        renderRow("AC Port Type", specs.charging?.ac_port_type),
        renderRow("Vehicle-to-Load (V2L)", specs.charging?.v2l_support ? "Supported (Power external devices)" : ""),
        renderRow("Vehicle-to-Home (V2H)", specs.charging?.v2h_support ? "Supported" : ""),
        renderRow("Vehicle-to-Grid (V2G)", specs.charging?.v2g_support ? "Supported" : ""),
      ])}

      {/* 5. Drivetrain, Motors & Performance */}
      {renderSection("powertrain", "Drivetrain, Motors & Performance", "sports_motorsports", [
        renderRow("Drive Layout", specs.powertrain?.drive_layout),
        renderRow("Electric Motor Count", specs.powertrain?.motor_count ? `${specs.powertrain.motor_count} Motors` : ""),
        renderRow("Total Power (Horsepower)", specs.powertrain?.total_power_hp ? `${specs.powertrain.total_power_hp} HP` : ""),
        renderRow("Total Power (Kilowatts)", specs.powertrain?.total_power_kw ? `${specs.powertrain.total_power_kw} kW` : ""),
        renderRow("Total Torque", specs.powertrain?.total_torque_nm ? `${specs.powertrain.total_torque_nm} Nm` : ""),
        renderRow("Acceleration 0-100 km/h", specs.powertrain?.acceleration_0_100_kmh ? `${specs.powertrain.acceleration_0_100_kmh} seconds` : ""),
        renderRow("Acceleration 0-60 mph", specs.powertrain?.acceleration_0_60_mph ? `${specs.powertrain.acceleration_0_60_mph} seconds` : ""),
        renderRow("Top Speed", specs.powertrain?.top_speed_kmh ? `${specs.powertrain.top_speed_kmh} km/h` : ""),
      ])}

      {/* 6. Dimensions, Weight & Storage */}
      {renderSection("dimensions", "Dimensions, Weight & Storage", "straighten", [
        renderRow("Length", specs.dimensions_and_weight?.length_mm ? `${specs.dimensions_and_weight.length_mm} mm` : ""),
        renderRow("Width", specs.dimensions_and_weight?.width_mm ? `${specs.dimensions_and_weight.width_mm} mm` : ""),
        renderRow("Height", specs.dimensions_and_weight?.height_mm ? `${specs.dimensions_and_weight.height_mm} mm` : ""),
        renderRow("Wheelbase", specs.dimensions_and_weight?.wheelbase_mm ? `${specs.dimensions_and_weight.wheelbase_mm} mm` : ""),
        renderRow("Ground Clearance", specs.dimensions_and_weight?.ground_clearance_mm ? `${specs.dimensions_and_weight.ground_clearance_mm} mm` : ""),
        renderRow("Curb Weight", specs.dimensions_and_weight?.curb_weight_kg ? `${specs.dimensions_and_weight.curb_weight_kg} kg` : ""),
        renderRow("Trunk / Boot Capacity", specs.dimensions_and_weight?.trunk_liters ? `${specs.dimensions_and_weight.trunk_liters} Liters` : ""),
        renderRow("Front Trunk (Frunk)", specs.dimensions_and_weight?.frunk_liters ? `${specs.dimensions_and_weight.frunk_liters} Liters` : ""),
        renderRow("Towing Capacity (Braked)", specs.dimensions_and_weight?.towing_braked_kg ? `${specs.dimensions_and_weight.towing_braked_kg} kg` : ""),
        renderRow("Towing Capacity (Unbraked)", specs.dimensions_and_weight?.towing_unbraked_kg ? `${specs.dimensions_and_weight.towing_unbraked_kg} kg` : ""),
      ])}

      {/* 7. Chassis, Suspension & Wheels */}
      {renderSection("chassis", "Chassis, Suspension & Wheels", "settings_suggest", [
        renderRow("Front Suspension", specs.chassis_and_suspension?.front_suspension),
        renderRow("Rear Suspension", specs.chassis_and_suspension?.rear_suspension),
        renderRow("Air Suspension", specs.chassis_and_suspension?.air_suspension !== undefined ? (specs.chassis_and_suspension.air_suspension ? "Adaptive Air Suspension" : "Standard Coil Springs") : ""),
        renderRow("Turning Circle", specs.chassis_and_suspension?.turning_circle_m ? `${specs.chassis_and_suspension.turning_circle_m} m` : ""),
        renderRow("Wheel Sizes", specs.chassis_and_suspension?.wheel_sizes_inches ? specs.chassis_and_suspension.wheel_sizes_inches.map(s => `${s}"`).join(", ") : ""),
        renderRow("Tire Size", specs.chassis_and_suspension?.tire_size),
      ])}

      {/* 8. Cockpit, Infotainment & Smart Tech */}
      {renderSection("cockpit", "Cockpit, Infotainment & Smart Tech", "devices", [
        renderRow("Cockpit Operating System", specs.cockpit_and_tech?.cockpit_os),
        renderRow("Infotainment Processor / Chip", specs.cockpit_and_tech?.cockpit_chip),
        renderRow("Center Touchscreen Size", specs.cockpit_and_tech?.center_screen_inches ? `${specs.cockpit_and_tech.center_screen_inches} inches` : ""),
        renderRow("Center Screen Features", specs.cockpit_and_tech?.center_screen_features),
        renderRow("Digital Driver Display", specs.cockpit_and_tech?.driver_cluster_inches ? `${specs.cockpit_and_tech.driver_cluster_inches} inches` : ""),
        renderRow("Head-Up Display (HUD)", specs.cockpit_and_tech?.hud),
        renderRow("Apple CarPlay", specs.cockpit_and_tech?.apple_carplay),
        renderRow("Android Auto", specs.cockpit_and_tech?.android_auto),
        renderRow("Audio Brand", specs.cockpit_and_tech?.audio_brand),
        renderRow("Speaker Count", specs.cockpit_and_tech?.speaker_count ? `${specs.cockpit_and_tech.speaker_count} Speakers` : ""),
        renderRow("Wireless Smartphone Chargers", specs.cockpit_and_tech?.wireless_chargers ? `${specs.cockpit_and_tech.wireless_chargers} Pad(s)` : ""),
        renderRow("Over-The-Air (OTA) Updates", specs.cockpit_and_tech?.ota_updates),
        renderRow("Heat Pump", specs.cockpit_and_tech?.heat_pump !== undefined ? (specs.cockpit_and_tech.heat_pump ? "Standard Energy-Efficient Heat Pump" : "Not Equipped") : ""),
      ])}

      {/* 9. ADAS, Sensors, Autonomy & Safety */}
      {renderSection("safety", "ADAS, Autonomy & Safety", "shield", [
        renderRow("Euro NCAP Rating", specs.adas_and_safety?.euro_ncap_stars ? `${specs.adas_and_safety.euro_ncap_stars} / 5 Stars` : ""),
        renderRow("NHTSA Safety Rating", specs.adas_and_safety?.nhtsa_stars ? `${specs.adas_and_safety.nhtsa_stars} / 5 Stars` : ""),
        renderRow("Airbag Count", specs.adas_and_safety?.airbag_count ? `${specs.adas_and_safety.airbag_count} Airbags` : ""),
        renderRow("Autonomy Level", specs.adas_and_safety?.autonomy_level),
        renderRow("ADAS System Name", specs.adas_and_safety?.adas_system_name),
        renderRow("LiDAR Sensors", specs.adas_and_safety?.lidar_count ? `${specs.adas_and_safety.lidar_count} LiDAR` : ""),
        renderRow("Surround Cameras", specs.adas_and_safety?.camera_count ? `${specs.adas_and_safety.camera_count} Cameras (360°)` : ""),
        renderRow("Radar Sensors", specs.adas_and_safety?.radar_count ? `${specs.adas_and_safety.radar_count} mmWave Radars` : ""),
        renderRow("Ultrasonic Sensors", specs.adas_and_safety?.ultrasonic_count ? `${specs.adas_and_safety.ultrasonic_count} Ultrasonic Sensors` : ""),
        renderRow("Active Safety Features", specs.adas_and_safety?.features),
      ])}

      {/* 10. Pricing & Global Markets */}
      {renderSection("pricing", "Pricing & Global Markets", "payments", [
        renderRow("Pakistan Ex-Factory Price", pricing.price_pkr_ex_factory ? <Price amount={pricing.price_pkr_ex_factory} /> : ""),
        renderRow("Pakistan Estimated On-Road Price", pricing.price_pkr_on_road ? <Price amount={pricing.price_pkr_on_road} /> : ""),
        renderRow("Global Base Price", pricing.price_global_base_usd ? <Price amount={pricing.price_global_base_usd} source="USD" /> : ""),
        renderRow("European Base Price", pricing.price_global_base_eur ? <Price amount={pricing.price_global_base_eur} source="EUR" /> : ""),
        renderRow("Chinese Base Price", pricing.price_global_base_cny ? <Price amount={pricing.price_global_base_cny} source="CNY" /> : ""),
      ])}
    </section>
  );
}
