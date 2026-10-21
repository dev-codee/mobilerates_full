"use client";

import React from "react";
import type { Earbud } from "@/app/lib/api";
import { isJunk } from "@/app/lib/spec-value";
import AppIcon from "./AppIcon";

interface EarbudSpecsProps {
  earbud: Earbud;
  className?: string;
}

const renderRow = (label: string, value: React.ReactNode) => {
  if (value === "false") return null;
  if (value === true || value === "true") value = "Yes";
  if (value === false) value = "No";
  if (Array.isArray(value)) {
    const cleaned = value.filter((v) => !isJunk(v));
    if (cleaned.length === 0) return null;
    value = cleaned.join(", ");
  }
  // Hide the row for empty or placeholder values ("null", "N/A", …).
  if (isJunk(value)) return null;
  return (
    <div
      key={label}
      className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-6 py-2.5 px-5 md:px-6 border-b border-border-subtle/50 last:border-b-0 hover:bg-surface-container-lowest/50 transition-colors duration-150"
    >
      <span className="text-text-muted font-semibold text-xs md:text-sm capitalize">
        {label.replace(/_/g, " ")}
      </span>
      <span className="text-text-main text-xs md:text-sm font-medium leading-relaxed">
        {value}
      </span>
    </div>
  );
};

const renderSection = (
  id: string,
  title: string,
  icon: string,
  rowNodes: React.ReactNode[]
) => {
  const validRows = rowNodes.filter(Boolean);
  if (validRows.length === 0) return null;

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

      <div className="flex flex-col bg-surface-white">{validRows}</div>
    </details>
  );
};

export default function EarbudSpecs({ earbud, className = "" }: EarbudSpecsProps) {
  const specs = earbud.specs || {};
  const audio = specs.audio || {};
  const anc = specs.noise_cancellation || {};
  const battery = specs.battery || {};
  const conn = specs.connectivity || {};
  const phys = specs.physical || {};
  const controls = specs.controls || {};

  const freqRange =
    audio.frequency_min_hz && audio.frequency_max_hz
      ? `${audio.frequency_min_hz} Hz - ${audio.frequency_max_hz} Hz`
      : null;

  const formatReleaseDate = (val?: string | Date | null) => {
    if (!val) return null;
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(val);
    }
  };

  return (
    <div
      className={`flex flex-col bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-xs ${className}`}
    >
      {/* 1. General & Overview */}
      {renderSection("general", "General Overview", "headphones", [
        renderRow("Model Name", earbud.name),
        renderRow("Brand", earbud.brand_slug.replace(/-/g, " ").toUpperCase()),
        renderRow("Model Number", earbud.model_number),
        renderRow("Wearing Type", earbud.wearing_type),
        renderRow("Release Date", formatReleaseDate(earbud.release_date)),
        renderRow("Status", earbud.status ? earbud.status.replace(/_/g, " ") : null),
        renderRow("Made In", earbud.made_in),
      ])}

      {/* 2. Audio & Drivers */}
      {renderSection("audio", "Audio & Drivers", "speaker", [
        renderRow("Driver Type", audio.driver_type),
        renderRow(
          "Driver Size",
          audio.driver_size_mm ? `${audio.driver_size_mm} mm` : null
        ),
        renderRow("Frequency Response", freqRange),
        renderRow("Impedance", audio.impedance_ohms ? `${audio.impedance_ohms} Ω` : null),
        renderRow("Sensitivity", audio.sensitivity_db ? `${audio.sensitivity_db} dB` : null),
        renderRow("Hi-Res Audio Certified", audio.hi_res_audio),
        renderRow("Spatial Audio / 3D Sound", audio.spatial_audio),
        renderRow("Audio Features", audio.sound_features),
      ])}

      {/* 3. Noise Cancellation & Microphones */}
      {renderSection("anc", "Noise Cancellation & Mics", "headphones", [
        renderRow("Active Noise Cancellation (ANC)", anc.has_anc),
        renderRow(
          "ANC Depth",
          anc.anc_depth_db ? `${anc.anc_depth_db} dB` : null
        ),
        renderRow("ANC Type", anc.anc_type),
        renderRow("Transparency / Ambient Mode", anc.transparency_mode),
        renderRow("ENC Call Noise Reduction", anc.enc_call_noise_reduction),
        renderRow("Total Microphones", anc.mic_count_total),
        renderRow("Microphones Per Earbud", anc.mic_count_per_earbud),
        renderRow("Wind Noise Reduction", anc.wind_noise_reduction),
        renderRow("Mic Tech & Features", anc.mic_tech_features),
      ])}

      {/* 4. Battery & Charging */}
      {renderSection("battery", "Battery & Playtime", "battery_charging_full", [
        renderRow(
          "Earbuds Playtime (ANC Off)",
          battery.playtime_earbuds_anc_off_hrs
            ? `${battery.playtime_earbuds_anc_off_hrs} hours`
            : null
        ),
        renderRow(
          "Earbuds Playtime (ANC On)",
          battery.playtime_earbuds_anc_on_hrs
            ? `${battery.playtime_earbuds_anc_on_hrs} hours`
            : null
        ),
        renderRow(
          "Total Playtime (with Case)",
          battery.total_playtime_with_case_hrs
            ? `${battery.total_playtime_with_case_hrs} hours`
            : null
        ),
        renderRow(
          "Earbud Battery Capacity",
          battery.earbud_battery_mah ? `${battery.earbud_battery_mah} mAh` : null
        ),
        renderRow(
          "Case Battery Capacity",
          battery.case_battery_mah ? `${battery.case_battery_mah} mAh` : null
        ),
        renderRow("Charging Port", battery.charging_port),
        renderRow("Fast Charging", battery.fast_charging),
        renderRow("Fast Charge Rate", battery.fast_charge_summary),
        renderRow(
          "Earbud Charge Time",
          battery.earbud_charge_time_mins
            ? `${battery.earbud_charge_time_mins} mins`
            : null
        ),
        renderRow(
          "Case Charge Time",
          battery.case_charge_time_mins ? `${battery.case_charge_time_mins} mins` : null
        ),
        renderRow("Qi Wireless Charging", battery.wireless_charging),
      ])}

      {/* 5. Connectivity & Codecs */}
      {renderSection("connectivity", "Connectivity & Codecs", "bluetooth", [
        renderRow("Bluetooth Version", conn.bluetooth_version),
        renderRow(
          "Wireless Range",
          conn.bluetooth_range_meters ? `${conn.bluetooth_range_meters} meters` : null
        ),
        renderRow("Supported Codecs", conn.codecs),
        renderRow("Multipoint Pairing (Dual Device)", conn.multipoint_pairing),
        renderRow("Google Fast Pair", conn.google_fast_pair),
        renderRow("Low Latency Gaming Mode", conn.low_latency_gaming_mode),
        renderRow("Gaming Latency", conn.latency_ms ? `${conn.latency_ms} ms` : null),
        renderRow("Companion App Support", conn.app_support),
      ])}

      {/* 6. Physical & Build */}
      {renderSection("physical", "Design & Water Resistance", "water_drop", [
        renderRow("Water Resistance (Earbuds)", phys.water_resistance),
        renderRow("Water Resistance (Case)", phys.case_water_resistance),
        renderRow(
          "Earbud Weight (each)",
          phys.earbud_weight_g ? `${phys.earbud_weight_g} g` : null
        ),
        renderRow("Case Weight", phys.case_weight_g ? `${phys.case_weight_g} g` : null),
        renderRow("Total Weight", phys.total_weight_g ? `${phys.total_weight_g} g` : null),
        renderRow("Earbud Dimensions", phys.earbud_dimensions_mm),
        renderRow("Case Dimensions", phys.case_dimensions_mm),
        renderRow("Colors", earbud.colors),
      ])}

      {/* 7. Controls & Smart Features */}
      {renderSection("controls", "Controls & Sensors", "tune", [
        renderRow("Control Type", controls.control_type),
        renderRow("Volume Control on Buds", controls.volume_control),
        renderRow("In-Ear Wear Detection", controls.in_ear_detection),
        renderRow("Voice Assistants", controls.voice_assistant),
        renderRow("Extra Features", controls.extra_features),
      ])}

      {/* 8. Package Contents */}
      {renderSection("in_the_box", "What's in the Box", "category", [
        renderRow("Package Accessories", specs.in_the_box),
      ])}
    </div>
  );
}
