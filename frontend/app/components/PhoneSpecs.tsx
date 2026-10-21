import { Phone } from "@/app/lib/api";
import { isJunk, clean } from "@/app/lib/spec-value";
import AppIcon from "./AppIcon";

interface PhoneSpecsProps {
  specs: Phone["specs"];
  className?: string;
  phone?: Phone;
}

// ─── Component ───────────────────────────────────────────────────────────────

import SubmitBenchmarkWrapper from "./SubmitBenchmarkWrapper";

export default function PhoneSpecs({ specs, className = "", phone }: PhoneSpecsProps) {
  const ext = specs.extra_specs || {};

  const chipset = specs.performance?.chipset || "";
  let fabrication = ext.processor?.fabrication || "";
  let chipsetClean = chipset;
  if (!fabrication) {
    const fabMatch = chipset.match(/\((\d+\s*nm)\)/i) || chipset.match(/(\d+\s*nm)/i);
    if (fabMatch) {
      fabrication = fabMatch[1];
      chipsetClean = chipset.replace(/\(\d+\s*nm\)/i, "").replace(/\s\s+/g, " ").trim();
    }
  }

  let ramType = ext.ram_storage?.ram_type || "LPDDR4X";
  const chipsetLower = chipset.toLowerCase();
  if (!ext.ram_storage?.ram_type) {
    if (
      chipsetLower.includes("snapdragon 8") ||
      chipsetLower.includes("snapdragon 7+ gen") ||
      chipsetLower.includes("apple a17") ||
      chipsetLower.includes("apple a18") ||
      chipsetLower.includes("dimensity 9") ||
      chipsetLower.includes("dimensity 8300") ||
      chipsetLower.includes("tensor g") ||
      chipsetLower.includes("elite")
    ) {
      ramType = "LPDDR5X";
    } else if (chipsetLower.includes("lpddr5")) {
      ramType = "LPDDR5";
    }
  }

  const processorDisplay = ext.processor?.cpu_name || (specs.performance?.cpu ? specs.performance.cpu.replace(/Octa-core/i, "Octa core").trim() : "");

  // ─── General Information ───────────────────────────────────────────────────
  let verifiedByName = "Mobile Rates Team";
  if (phone) {
    const reviewer = typeof phone.reviewer === "object" ? phone.reviewer?.name || phone.reviewer?.username : null;
    const updatedBy = typeof phone.updatedBy === "object" ? phone.updatedBy?.name || phone.updatedBy?.username : null;
    const createdBy = typeof phone.createdBy === "object" ? phone.createdBy?.name || phone.createdBy?.username : null;
    const staffName = reviewer || updatedBy || createdBy;
    if (staffName && typeof staffName === "string" && staffName.trim()) {
      verifiedByName = staffName.trim();
    } else if (typeof phone.reviewer === "string" && !phone.reviewer.match(/^[0-9a-fA-F]{24}$/)) {
      verifiedByName = phone.reviewer;
    } else if (typeof phone.updatedBy === "string" && !phone.updatedBy.match(/^[0-9a-fA-F]{24}$/)) {
      verifiedByName = phone.updatedBy;
    } else if (typeof phone.createdBy === "string" && !phone.createdBy.match(/^[0-9a-fA-F]{24}$/)) {
      verifiedByName = phone.createdBy;
    }
  }

  let sourceDisplay = "Official Manufacturer & Authorized Retailers";
  if (phone) {
    if (phone.sources && phone.sources.length > 0) {
      sourceDisplay = phone.sources.map((s) => s.name || "Official Source").join(", ");
    } else if (phone.importSource) {
      sourceDisplay = phone.importSource;
    } else if (phone.brand_slug) {
      sourceDisplay = `Official ${phone.brand_slug.toUpperCase().replace("-", " ")} Specifications & Local Market`;
    }
  }

  const rawDate = phone?.updatedAt || phone?.updated_at || (phone?.price_history && phone.price_history[phone.price_history.length - 1]?.date) || phone?.release_date;
  let lastUpdateDisplay = "Recently Updated";
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        lastUpdateDisplay = d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch {
      lastUpdateDisplay = String(rawDate);
    }
  }

  let ratingDisplay: React.ReactNode = "No reviews yet";
  if (phone?.rating) {
    const count = Number(phone.rating.count) || 0;
    const avg = Number(phone.rating.average) || 0;
    if (count > 0 && avg > 0) {
      ratingDisplay = (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-[#FF9800]">
            <AppIcon name="star" size={16} fill="#FF9800" className="text-[#FF9800]" />
            <span className="font-bold text-text-main text-sm">{avg.toFixed(1)} / 5.0</span>
          </div>
          <span className="text-text-muted text-xs">({count} customer review{count > 1 ? "s" : ""})</span>
        </div>
      );
    } else if (count > 0) {
      ratingDisplay = <span className="text-text-muted text-sm">{count} review{count > 1 ? "s" : ""}</span>;
    } else {
      ratingDisplay = <span className="text-text-muted text-sm">No reviews yet</span>;
    }
  }

  const renderRow = (label: string, value: React.ReactNode) => {
    if (value === "true" || value === true) value = "Yes";
    if (value === "false" || value === false) return null;
    if (Array.isArray(value)) {
      const cleaned = value.filter((v) => !isJunk(v));
      if (cleaned.length === 0) return null;
      value = cleaned.join(", ");
    }
    // Hide the row when the value is empty or a placeholder like "null"/"N/A".
    // React elements (e.g. the rating/verified badges) are objects, so isJunk
    // returns false for them and they render as intended.
    if (isJunk(value)) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 py-1.5 px-6 border-b border-border-subtle last:border-b-0 hover:bg-surface-container-lowest/40 transition-colors duration-150">
        <span className="text-text-main font-bold text-sm capitalize">{label.replace(/_/g, " ")}</span>
        <span className="text-text-main text-sm font-normal leading-relaxed">{value}</span>
      </div>
    );
  };

  const renderSection = (
    id: string,
    title: string,
    icon: string,
    rows: React.ReactNode
  ) => {
    return (
      <details open className="group flex flex-col">
        <summary className="w-full p-5 md:px-6 flex items-center justify-between cursor-pointer select-none bg-surface-container-low/20 hover:bg-surface-container-low/40 transition-colors duration-200 list-none [&::-webkit-details-marker]:hidden border-none outline-none text-left">
          <div className="flex items-center gap-3">
            <AppIcon name={icon} size={22} className="text-text-muted" />
            <span className="font-headline-sm text-base md:text-lg font-bold text-text-main">
              {title}
            </span>
          </div>
          <AppIcon
            name="keyboard_arrow_down"
            size={20}
            className="text-text-muted transition-transform duration-200 group-open:rotate-180 ml-auto"
          />
        </summary>
        <div className="flex flex-col bg-surface-white divide-y divide-border-subtle/30">
          {rows}
        </div>
      </details>
    );
  };

  return (
    <section className={`bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col divide-y divide-border-subtle ${className}`}>
      {renderSection("general_info", "General Information", "info", (
        <>
          {renderRow(
            "Verified By",
            <div className="inline-flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-text-main">{verifiedByName}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <AppIcon name="check_circle" size={13} className="text-emerald-600" />
                Verified
              </span>
            </div>
          )}
          {renderRow("Source", sourceDisplay)}
          {renderRow("Last Update", lastUpdateDisplay)}
          {renderRow("Total Review and Rating", ratingDisplay)}
        </>
      ))}

      {renderSection("performance", "Performance", "memory", (
        <>
          {renderRow("Chipset", chipsetClean || specs.performance?.chipset)}
          {renderRow("Processor", processorDisplay)}
          {renderRow("Fabrication", fabrication)}
          {renderRow("CPU Cores", ext.processor?.cpu_cores)}
          {renderRow("CPU Clock", ext.processor?.cpu_clock)}
          {renderRow("Graphics (GPU)", specs.performance?.gpu)}
          {renderRow("GPU Clock", ext.processor?.gpu_clock)}
          {renderRow("NPU / AI Engine", ext.processor?.npu || ext.processor?.ai_engine)}
          {renderRow("ISP", ext.processor?.isp)}
          {renderRow("RAM", specs.performance?.ram_options_gb?.length ? `${specs.performance.ram_options_gb.join(" GB / ")} GB` : "")}
          {renderRow("RAM Type", specs.performance?.ram_options_gb?.length ? ramType : "")}
          {renderRow("RAM Speed", ext.ram_storage?.ram_speed)}
          {renderRow("Storage Options", specs.performance?.storage_options_gb?.length ? `${specs.performance.storage_options_gb.join(" GB / ")} GB` : "")}
          {renderRow("Storage Type", ext.ram_storage?.storage_type)}
          {specs.performance?.expandable_storage !== undefined && renderRow("Expandable Storage", specs.performance.expandable_storage ? (ext.ram_storage?.max_expansion || "Yes") : "No")}
        </>
      ))}

      {renderSection("display", "Display", "smartphone", (
        <>
          {clean(specs.display?.size_inches) && renderRow("Size", `${specs.display!.size_inches} inches`)}
          {renderRow("Type", specs.display?.type)}
          {renderRow("Resolution", specs.display?.resolution)}
          {renderRow("Pixels", ext.features_listing?.pixels)}
          {renderRow("PPI", ext.features_listing?.ppi)}
          {renderRow("Aspect Ratio", ext.features_listing?.aspect_ratio)}
          {clean(specs.display?.refresh_rate_hz) && renderRow("Refresh Rate", `${specs.display!.refresh_rate_hz} Hz`)}
          {renderRow("Touch Sampling", ext.features_listing?.touch_sampling)}
          {renderRow("Protection", specs.display?.protection)}
          {renderRow("Screen to Body", ext.features_listing?.screen_to_body)}
          {renderRow("Screen Design", ext.features_listing?.screen_design)}
          {renderRow("Notch Type", ext.features_listing?.notch_type)}
          {clean(specs.display?.peak_brightness_nits) && renderRow("Peak Brightness", `${specs.display!.peak_brightness_nits} nits`)}
          {renderRow("Color Depth", ext.features_listing?.color_depth)}
          {renderRow("HDR Support", [ext.features_listing?.hdr && "HDR", ext.features_listing?.hdr10 && "HDR10", ext.features_listing?.hdr10_plus && "HDR10+", ext.features_listing?.dolby_vision && "Dolby Vision"].filter(Boolean).join(", ") || "")}
          {renderRow("Always-On Display", ext.features_listing?.always_on_display)}
          {renderRow("PWM Dimming", ext.features_listing?.pwm)}
          {renderRow("Display Features", ext.features_listing?.display_features)}
        </>
      ))}

      {renderSection("camera", "Camera", "photo_camera", (
        <>
          {renderRow("Main Camera", specs.camera?.rear_summary)}
          {renderRow("Sensor Name", ext.cameras_detailed?.sensor_name)}
          {renderRow("Megapixels", ext.cameras_detailed?.mp)}
          {renderRow("Aperture", ext.cameras_detailed?.aperture)}
          {renderRow("Pixel Size", ext.cameras_detailed?.pixel_size)}
          {renderRow("Sensor Size", ext.cameras_detailed?.sensor_size)}
          {renderRow("Focal Length", ext.cameras_detailed?.focal_length)}
          {renderRow("Lens Type", ext.cameras_detailed?.lens_type)}
          {renderRow("Focus & Stabilization", [ext.cameras_detailed?.ois && "OIS", ext.cameras_detailed?.eis && "EIS", ext.cameras_detailed?.pdaf && "PDAF", ext.cameras_detailed?.laser_af && "Laser AF"].filter(Boolean).join(", ") || "")}
          {renderRow("Camera Features", ext.cameras_detailed?.features)}
          {renderRow("Selfie Camera", specs.camera?.front_summary)}
          {renderRow("Video Recording", specs.camera?.video_recording)}
          {renderRow("Video Features", ext.video_recording_features)}
        </>
      ))}

      {renderSection("battery", "Battery", "battery_charging_full", (
        <>
          {clean(specs.battery?.capacity_mah) && renderRow("Capacity", `${specs.battery!.capacity_mah} mAh`)}
          {renderRow("Battery Type", ext.battery_detailed?.type)}
          {clean(specs.battery?.charging_watts) && renderRow("Charging Speed", `${specs.battery!.charging_watts}W`)}
          {specs.battery?.fast_charging !== undefined && renderRow("Fast Charging", specs.battery.fast_charging ? "Yes" : "No")}
          {renderRow("Power Delivery / PPS", [ext.battery_detailed?.pd && "PD", ext.battery_detailed?.pps && "PPS"].filter(Boolean).join(", ") || "")}
          {specs.battery?.wireless_charging !== undefined && renderRow("Wireless Charging", specs.battery.wireless_charging ? "Yes" : "No")}
          {renderRow("Reverse Charging", ext.battery_detailed?.reverse_charging)}
          {renderRow("Charger Included", ext.battery_detailed?.charger_included)}
          {renderRow("Removable", ext.battery_detailed?.removable)}
        </>
      ))}

      {renderSection("body", "Body & Design", "design_services", (
        <>
          {clean(specs.body?.height_mm) && clean(specs.body?.width_mm) && clean(specs.body?.thickness_mm) && renderRow("Dimensions", `${specs.body!.height_mm} x ${specs.body!.width_mm} x ${specs.body!.thickness_mm} mm`)}
          {clean(specs.body?.weight_g) && renderRow("Weight", `${specs.body!.weight_g} g`)}
          {renderRow("Build Materials", specs.body?.materials)}
          {renderRow("Frame & Back", [clean(ext.body_detailed?.frame), clean(ext.body_detailed?.back_material)].filter(Boolean).join(" / "))}
          {renderRow("Water Resistance", specs.body?.water_resistance || ext.body_detailed?.ip_rating)}
          {renderRow("Military Standard", ext.body_detailed?.mil_std)}
          {renderRow("Colors", ext.colors)}
        </>
      ))}

      {renderSection("network", "Network & SIM", "cell_tower", (
        <>
          {specs.connectivity?.network && renderRow("5G Support", specs.connectivity.network.includes("5G") ? "Yes" : "No")}
          {specs.connectivity?.network && renderRow("4G / LTE", (specs.connectivity.network.includes("4G") || specs.connectivity.network.includes("LTE")) ? "Yes" : "No")}
          {renderRow("Network", specs.connectivity?.network)}
          {renderRow("Network Features", ext.network_detailed?.features)}
          {renderRow("SIM", specs.connectivity?.sim)}
          {renderRow("SIM Types", ext.sim_detailed?.types)}
        </>
      ))}

      {renderSection("connectivity", "Connectivity", "wifi", (
        <>
          {renderRow("Wi-Fi", ext.connectivity_detailed?.wifi)}
          {renderRow("Bluetooth", specs.connectivity?.bluetooth)}
          {renderRow("Positioning (GPS)", ext.connectivity_detailed?.gps)}
          {renderRow("GLONASS", ext.connectivity_detailed?.glonass)}
          {specs.connectivity?.nfc !== undefined && renderRow("NFC", specs.connectivity.nfc ? "Yes" : "No")}
          {renderRow("Infrared (IR)", ext.connectivity_detailed?.infrared)}
          {renderRow("UWB", ext.connectivity_detailed?.uwb)}
          {renderRow("Radio (FM)", ext.connectivity_detailed?.fm)}
          {renderRow("USB", specs.connectivity?.usb)}
          {renderRow("USB OTG", ext.connectivity_detailed?.otg)}
        </>
      ))}

      {renderSection("audio", "Audio", "volume_up", (
        <>
          {renderRow("Speakers", ext.audio?.speakers)}
          {renderRow("Stereo Speakers", ext.audio?.stereo)}
          {renderRow("Microphones", ext.audio?.microphones)}
          {renderRow("3.5mm Jack", ext.audio?.headphone_jack || ext.connectivity_detailed?.headphone_jack)}
          {renderRow("Audio Features", [ext.audio?.dolby && "Dolby Atmos", ext.audio?.hi_res && "Hi-Res Audio", ext.audio?.snapdragon_sound && "Snapdragon Sound"].filter(Boolean).join(", ") || "")}
        </>
      ))}

      {renderSection("sensors", "Sensors", "sensors", (
        <>
          {renderRow("Fingerprint", ext.sensors?.fingerprint)}
          {renderRow("Face Unlock", ext.sensors?.face_unlock)}
          {renderRow("Other Sensors", [ext.sensors?.accelerometer && "Accelerometer", ext.sensors?.compass && "Compass", ext.sensors?.gyroscope && "Gyroscope", ext.sensors?.barometer && "Barometer", ext.sensors?.hall_sensor && "Hall Sensor", ext.sensors?.ambient_light && "Ambient Light", ext.sensors?.proximity && "Proximity"].filter(Boolean).join(", ") || "")}
        </>
      ))}

      {renderSection("software", "Software", "code", (
        <>
          {renderRow("Operating System", specs.os)}
          {renderRow("Custom UI", ext.software?.ui)}
          {renderRow("Software Updates", clean(ext.software?.years_updates) ? `${ext.software?.years_updates} Years` : "")}
          {renderRow("Upgrade Promise", ext.software?.upgrade_promise)}
          {renderRow("Security Patch", ext.software?.security_patch)}
          {renderRow("Bootloader", ext.software?.bootloader)}
          {renderRow("Rootable", ext.software?.rootable)}
        </>
      ))}

      {ext.ai_features && ext.ai_features.length > 0 && renderSection("ai", "AI Capabilities", "smart_toy", (
        <>
          {renderRow("Supported Features", ext.ai_features)}
        </>
      ))}

      {phone && <SubmitBenchmarkWrapper phone={phone} />}
    </section>
  );
}
