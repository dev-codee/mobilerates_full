# EV (Electric Vehicle) Comprehensive Specification Schema & Field Guide

This document defines the complete, production-grade specification schema for expanding the **Zozo** platform to support Electric Vehicles (EVs) across all global and local manufacturers (Tesla, BYD, Deepal, Xiaomi, Porsche, Hyundai, BMW, Mercedes-Benz, Audi, Zeekr, MG, Rivian, Lucid, Nio, Xpeng, etc.).

---

## 1. Overview & Data Architecture

An EV database differs significantly from smartphones or internal combustion engine (ICE) cars. Key distinct features include **battery pack chemistry & usable capacity**, **charging curve & architecture (400V vs 800V)**, **multi-cycle range (WLTP / EPA / CLTC)**, **bi-directional charging (V2L/V2H/V2G)**, **aerodynamics ($C_d$)**, **thermal management (heat pump)**, and **intelligent driver assist/sensor suites (LiDAR/TOPS)**.

### Variant / Trim Architecture
Most EVs are sold in distinct trims sharing the same chassis but with different batteries, motors, and drivetrains (e.g., *Tesla Model 3 RWD* vs *Long Range AWD* vs *Performance*).
* **Model Level (Parent)**: Brand, Model Name, Generation, Body Style, General Platform, Safety Ratings, Infotainment OS, Dimensions, Base Warranty.
* **Variant / Trim Level (Child)**: Powertrain (RWD/AWD), Motor count & output, Battery Capacity (gross/net), Range (WLTP/EPA/CLTC), Charging Speed, Acceleration, Curb Weight, Wheel options, Pricing.

---

## 2. Complete Field Breakdown by Category

### Category 1: Vehicle Identity & Classification
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| `name` | String | e.g. "BYD Seal Performance AWD" | Full human-readable name of vehicle & trim |
| `slug` | String | URL-safe Slug | Unique identifier e.g. `byd-seal-performance-awd-2025` |
| `brand_slug` | String | Foreign Key | Brand identifier e.g. `byd`, `tesla`, `xiaomi`, `deepal`, `porsche` |
| `model_name` | String | e.g. "Seal", "Model 3", "SU7" | Core model line |
| `variant_name` | String | e.g. "Long Range AWD", "Performance", "Standard Range" | Specific trim name |
| `model_year` | Number | Year (e.g. 2025, 2026) | Model year |
| `generation` | String | e.g. "1st Gen Facelift (Highland)" | Vehicle generation / facelift code |
| `vehicle_type` | Enum | `BEV` \| `PHEV` \| `EREV` \| `FCEV` | All-Electric (BEV), Plug-in Hybrid (PHEV), Range-Extender (EREV) |
| `body_type` | Enum | `Sedan` \| `SUV` \| `Crossover` \| `Hatchback` \| `Coupe` \| `MPV` \| `Pickup` \| `Sports` \| `Wagon` | Body style classification |
| `segment` | Enum | `A-Segment` (Micro) \| `B-Segment` (Subcompact) \| `C-Segment` (Compact) \| `D-Segment` (Mid-size) \| `E-Segment` (Executive) \| `F-Segment` (Luxury) | Global automotive segment |
| `platform` | String | e.g. "e-Platform 3.0", "E-GMP", "PPE", "Modena" | Dedicated EV modular architecture |
| `doors` | Number | e.g. 2, 4, 5 | Number of passenger doors |
| `seats` | Number / Array | e.g. 5 or `[5, 7]` | Seating configurations available |
| `status` | Enum | `available` \| `upcoming` \| `announced` \| `rumored` \| `discontinued` | Market status |
| `announcement_date`| Date | ISO Date | Global unveil date |
| `release_date` | Date | ISO Date | Market launch / initial deliveries date |
| `assembly_country` | String | e.g. "China", "Germany", "USA", "Pakistan (CKD)" | Country of manufacture / assembly |

---

### Category 2: Battery & Energy Storage
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| `battery_chemistry`| Enum / String| `LFP (Blade)` \| `NMC` \| `NCA` \| `Solid-State` \| `Sodium-ion` | Cell chemistry (affects lifespan, cold tolerance, charging habits) |
| `capacity_gross_kwh`| Number | kWh (e.g. 82.5) | Total physical battery capacity |
| `capacity_usable_kwh`| Number | kWh (e.g. 80.0) | Net buffer-adjusted usable capacity |
| `system_voltage` | Number | Volts (e.g. 400, 800, 900) | Electrical architecture (800V+ enables ultra-fast charging) |
| `cell_format` | String | e.g. "Prismatic Blade", "Cylindrical 4680", "Pouch" | Cell packaging format |
| `integration_type` | Enum / String| `Cell-to-Pack (CTP)` \| `Cell-to-Body (CTB)` \| `Cell-to-Chassis (CTC)` \| `Module-based` | Battery structural integration |
| `thermal_management`| String | e.g. "Active Liquid Cooling & Heating with Heat Pump" | Cooling & heating mechanisms |
| `preheating_support`| Boolean | `true` / `false` | Battery manual & route-based preconditioning for fast charging |
| `swappable_battery`| Boolean | `true` / `false` | Quick battery swapping support (e.g. NIO BaaS) |
| `warranty_years` | Number | Years (e.g. 8) | Manufacturer battery warranty duration |
| `warranty_distance_km`| Number | km (e.g. 160000) | Battery warranty mileage cap |
| `warranty_soh_guarantee`| Number | Percentage (e.g. 70) | Minimum State of Health guaranteed during warranty |

---

### Category 3: Range & Energy Consumption (Efficiency)
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| **WLTP (Europe/Global)** | | | |
| `range_wltp_combined_km` | Number | km (e.g. 570) | Standard European combined cycle |
| `range_wltp_city_km` | Number | km (e.g. 690) | WLTP urban / city cycle |
| `consumption_wltp_kwh_100km`| Number | kWh/100 km (e.g. 15.8) | Official combined energy consumption |
| **EPA (North America)** | | | |
| `range_epa_combined_km` | Number | km / converted to miles (e.g. 500 km / 310 mi) | Stricter US EPA cycle |
| `efficiency_mpge_combined` | Number | MPGe (e.g. 115) | US EPA Miles Per Gallon equivalent |
| **CLTC (China Standard)** | | | |
| `range_cltc_km` | Number | km (e.g. 650) | China Light-Duty Vehicle Test Cycle (common for BYD/Deepal/Xiaomi) |
| **Real-World Estimates (Zozo Benchmark)** | | | |
| `real_world_range_mild_km` | Number | km (e.g. 510) | Estimated range at 23°C mild weather |
| `real_world_range_cold_km` | Number | km (e.g. 385) | Estimated range at -10°C cold weather with heater |
| `real_world_range_highway_km`| Number | km (e.g. 420) | Range at continuous 110-120 km/h highway speeds |
| `drag_coefficient_cd` | Number | $C_d$ (e.g. 0.195, 0.219) | Aerodynamic drag coefficient |

---

### Category 4: Charging & Bidirectional Power
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| **AC Charging (Home / Level 2)** | | | |
| `ac_max_power_kw` | Number | kW (e.g. 7.4, 11, 22) | Max AC onboard charger rate |
| `ac_phases` | Number | 1 or 3 (Phase) | Single-phase vs 3-phase support |
| `ac_port_type` | Enum | `Type 2 (Mennekes)` \| `Type 1 (J1772)` \| `GB/T AC` \| `NACS` | Standard of AC port |
| `ac_charge_time_0_100` | String / Number | Hours (e.g. "7.5 hrs @ 11kW", 7.5) | Time for full home charge |
| `ac_port_location` | String | e.g. "Rear Left", "Front Right" | Physical location on body |
| **DC Fast Charging (Public / Level 3)** | | | |
| `dc_max_power_kw` | Number | kW (e.g. 150, 250, 350, 480) | Peak DC fast charging power |
| `dc_port_type` | Enum | `CCS2` \| `CCS1` \| `NACS (Tesla)` \| `GB/T DC` \| `CHAdeMO` | Fast charging port standard |
| `dc_charge_time_10_80_min` | Number | Minutes (e.g. 18, 25, 37) | Standard fast charge benchmark |
| `dc_charging_speed_km_15min`| Number | km (e.g. 240 km added in 15 min) | Fast charge range recovery rate |
| `plug_and_charge` | Boolean | `true` / `false` | ISO 15118 automatic authentication |
| **Bidirectional Power (V2X)** | | | |
| `v2l_support` | Boolean | `true` / `false` | Vehicle-to-Load (powering laptops, appliances, campsites) |
| `v2l_max_power_kw` | Number | kW (e.g. 3.3 kW, 6.6 kW) | Max output power via internal/external socket |
| `v2h_support` | Boolean | `true` / `false` | Vehicle-to-Home backup power capability |
| `v2g_support` | Boolean | `true` / `false` | Vehicle-to-Grid energy export capability |
| `v2v_support` | Boolean | `true` / `false` | Vehicle-to-Vehicle charging |

---

### Category 5: Drivetrain, Motors & Performance
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| `drive_layout` | Enum | `RWD` \| `FWD` \| `AWD` \| `Tri-Motor AWD` \| `Quad-Motor AWD` | Wheel drive configuration |
| `motor_count` | Number | 1, 2, 3, 4 | Number of electric motors |
| `front_motor_type` | String | e.g. "Permanent Magnet Synchronous (PMSM)" or "Asynchronous (ASM)" | Front axle motor tech |
| `front_motor_power_hp` | Number | hp (or kW) | Front motor output |
| `rear_motor_type` | String | e.g. "Silicon Carbide (SiC) PMSM" | Rear axle motor tech |
| `rear_motor_power_hp` | Number | hp (or kW) | Rear motor output |
| `total_power_hp` | Number | hp (e.g. 530) | Combined horsepower |
| `total_power_kw` | Number | kW (e.g. 390) | Combined kilowatts (SI standard) |
| `total_torque_nm` | Number | Nm (e.g. 670) | Instant maximum torque |
| `acceleration_0_100_kmh` | Number | Seconds (e.g. 3.8, 5.9) | 0 to 100 km/h sprint |
| `acceleration_0_60_mph` | Number | Seconds (e.g. 3.6) | 0 to 60 mph |
| `top_speed_kmh` | Number | km/h (e.g. 180, 225, 260) | Electronically limited top speed |
| `quarter_mile_seconds` | Number | Seconds (e.g. 11.5) | Standing 1/4 mile time |
| `transmission_type` | String | e.g. "Single-Speed Fixed Reduction" or "2-Speed Automatic" (Taycan) | Gearbox architecture |
| `one_pedal_driving` | Boolean | `true` / `false` | Full stop regenerative one-pedal mode |
| `regen_modes` | Array[String] | `["Low", "Standard", "High", "Adaptive", "Paddle-Controlled"]` | Regenerative braking adjustments |
| `max_regen_power_kw` | Number | kW (e.g. 150 kW) | Maximum energy recuperation power |
| `launch_control` | Boolean | `true` / `false` | High-output launch mode |

---

### Category 6: Dimensions, Weight & Storage
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| `length_mm` | Number | mm (e.g. 4800) | Overall length |
| `width_mm` | Number | mm (e.g. 1875 without mirrors / 2150 with mirrors) | Width |
| `height_mm` | Number | mm (e.g. 1460) | Overall height |
| `wheelbase_mm` | Number | mm (e.g. 2920) | Wheelbase (determines interior legroom) |
| `ground_clearance_mm` | Number | mm (e.g. 145 mm standard / 210 mm off-road) | Ground clearance |
| `curb_weight_kg` | Number | kg (e.g. 2150) | Empty vehicle weight |
| `gvwr_kg` | Number | kg (e.g. 2600) | Gross Vehicle Weight Rating |
| `max_payload_kg` | Number | kg (e.g. 450) | Maximum carrying weight |
| `weight_distribution` | String | e.g. "50:50" or "48:52" | Front to rear weight balance |
| `trunk_capacity_liters` | Number | Liters (e.g. 402) | Rear boot capacity with seats up |
| `trunk_max_liters` | Number | Liters (e.g. 1200) | Rear boot capacity with seats folded |
| `frunk_capacity_liters` | Number | Liters (e.g. 53, 88) or null | Front trunk ("Frunk") storage |
| `frunk_powered` | Boolean | `true` / `false` | Power open/close frunk |
| `roof_load_kg` | Number | kg (e.g. 75) | Max roof rack dynamic capacity |
| `towing_braked_kg` | Number | kg (e.g. 1500) | Maximum braked trailer capacity |
| `towing_unbraked_kg` | Number | kg (e.g. 750) | Maximum unbraked trailer capacity |

---

### Category 7: Chassis, Suspension, Brakes & Wheels
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| `front_suspension` | String | e.g. "Double Wishbone independent" | Front axle suspension structure |
| `rear_suspension` | String | e.g. "Five-Link Multi-link independent" | Rear axle suspension structure |
| `air_suspension` | Boolean | `true` / `false` | Height-adjustable air suspension |
| `adaptive_damping` | Boolean | `true` / `false` | Electronically controlled adaptive dampers (CDC/FSD) |
| `rear_wheel_steering` | Boolean | `true` / `false` (e.g. up to ±10°) | 4-wheel steering for agile tight turns |
| `turning_circle_diameter_m`| Number | Meters (e.g. 10.8 m) | Kerb-to-kerb turning radius |
| `front_brakes` | String | e.g. "Ventilated Discs 355mm, 4-Piston Calipers" | Front braking hardware |
| `rear_brakes` | String | e.g. "Ventilated Discs" or "Drum Brakes" | Rear braking hardware |
| `wheel_sizes_inches` | Array[Number] | `[18, 19, 20]` | Supported rim diameter options |
| `standard_tire_size` | String | e.g. "245/45 R19" or staggered "F: 245/40 R20, R: 275/35 R20" | Tire specs |
| `ev_specific_tires` | Boolean | `true` / `false` | Low rolling resistance acoustic foam tires |

---

### Category 8: Cockpit, Infotainment & Smart Features
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| `cockpit_os` | String | e.g. "Android Automotive OS", "Tesla OS", "Xiaomi HyperOS", "HarmonyOS" | In-vehicle operating system |
| `cockpit_chipset` | String | e.g. "Qualcomm Snapdragon 8295", "AMD Ryzen", "Snapdragon 8155" | Central compute processor |
| `center_display_size_in`| Number | Inches (e.g. 15.6, 17.0) | Main touch screen diagonal |
| `center_display_type` | String | e.g. "OLED", "Mini-LED", "IPS LCD (Rotating / Swiveling)" | Display technology & features |
| `driver_cluster_size_in`| Number | Inches (e.g. 10.25) or null (if integrated into HUD/Center) | Digital instrument cluster |
| `hud_type` | Enum / String| `None` \| `Standard Color HUD` \| `AR-HUD (Augmented Reality 56")` | Head-up display |
| `passenger_screen_in` | Number | Inches (e.g. 10.9) or null | Dedicated front passenger screen |
| `rear_screens` | String | e.g. "Dual 13-inch OLED screens" | Rear seat entertainment |
| `apple_carplay` | Enum | `Wireless` \| `Wired` \| `None` | Apple smartphone integration |
| `android_auto` | Enum | `Wireless` \| `Wired` \| `None` | Google smartphone integration |
| `audio_brand` | String | e.g. "Burmester", "Dynaudio", "Harman Kardon", "Bose", "B&W" | Premium audio system branding |
| `audio_speaker_count` | Number | e.g. 12, 19, 23 | Number of cabin speakers |
| `audio_power_watts` | Number | Watts (e.g. 1020W, 770W) | Amplifier output rating |
| `wireless_charging_pads`| Number | e.g. 2x 50W cooled wireless chargers | Mobile phone induction pads |
| `ota_updates` | Enum | `Full Vehicle (Powertrain+ADAS+Infotainment)` \| `Infotainment Only` | Over-The-Air firmware update depth |
| `app_connectivity` | Array[String] | `["Remote Climate", "Lock/Unlock", "Charge Scheduling", "Valet Mode", "Sentry Live Cam", "Digital Key"]` | Mobile app capabilities |
| `digital_key_tech` | Array[String] | `["UWB (Ultra-Wideband)", "NFC Keycard", "Bluetooth BLE", "Smartwatch"]` | Phone-as-a-key protocols |
| `sentry_mode` | Boolean | `true` / `false` | 360-degree security recording while parked |
| `heat_pump` | Boolean | `true` / `false` (Standard / Optional) | High-efficiency thermal heat pump (crucial for winter range) |

---

### Category 9: ADAS, Sensors, Autonomy & Safety
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| `safety_rating_euro_ncap`| Object | `{ stars: 5, adult_pct: 91, child_pct: 89, year: 2024 }` | Euro NCAP crash testing |
| `safety_rating_nhtsa` | Number | 5 (Stars) | US NHTSA rating |
| `airbag_count` | Number | e.g. 7, 9, 11 (including front-center far-side airbag) | Total airbag count |
| `autonomy_level` | Enum | `Level 2` \| `Level 2+ (Supervised NOA)` \| `Level 3 (Conditional Hands-Off)` | Standard SAE driving automation level |
| `adas_platform_name` | String | e.g. "Tesla FSD", "Huawei ADS 3.0", "BYD DiPilot 300", "XPENG XNGP" | Marketing & technical name of ADAS system |
| `adas_compute_chip` | String | e.g. "Dual NVIDIA Drive Orin-X (508 TOPS)", "Tesla HW4" | Autonomous driving computer |
| `lidar_count` | Number | e.g. 0, 1 (Roof-mounted AT128), 2, 3 | Solid-state / Mechanical LiDAR units |
| `camera_count` | Number | e.g. 11 (8MP High-Definition Surround Cameras) | Camera sensor count |
| `radar_count` | Number | e.g. 5 (4D Millimeter-Wave Radars + 77GHz) | Radar sensor count |
| `ultrasonic_sensor_count`| Number | e.g. 12 (USS) | Parking distance ultrasonic sensors |
| `key_adas_features` | Array[String] | `["City Navigation on Autopilot (Urban NOA)", "Highway Assist", "Automated Emergency Braking (AEB)", "Blind Spot Collision Avoidance", "Autonomous Valet Parking (AVP)", "3D 360° Transparent Chassis", "Driver Monitoring (IR Eye-Tracking)"]` | List of supported driver assist capabilities |

---

### Category 10: Pricing, Taxation, Incentives & Local Markets
| Field Name | Type | Unit / Format | Description & Examples |
| :--- | :--- | :--- | :--- |
| **Global Pricing** | | | |
| `price_global_base_usd` | Number | USD (e.g. 38,990) | US / Global benchmark MSRP |
| `price_global_base_cny` | Number | CNY (e.g. 215,900) | China domestic benchmark price (crucial for Chinese brands) |
| `price_global_base_eur` | Number | EUR (e.g. 42,990) | European base price |
| **Pakistan Local Market (Zozo Focus)** | | | |
| `price_pkr_ex_factory` | Number | PKR (e.g. 14,500,000) | Local ex-factory retail price |
| `price_pkr_on_road` | Number | PKR (e.g. 15,200,000) | Estimated price including registration, taxes, insurance |
| `customs_duty_rate_pct` | Number | Percentage (e.g. 0% for CBU EV under 50kWh / specific SRO) | Applicable EV import duty tier |
| `sales_tax_rate_pct` | Number | Percentage (e.g. 10% or 18% GST) | Concessionary sales tax on EVs |
| `token_tax_annual_pkr` | Number | PKR (kW-based motor tax instead of engine cc) | Annual government motor token tax |
| `included_home_charger`| String | e.g. "7kW AC Wallbox included with installation" | Included charging equipment |
| `charging_adapter_included`| String | e.g. "GB/T to Type 2 & GB/T to CCS2 adapter included" | Port converters supplied by dealer |
| `price_history` | Array[Object] | `[{ date, price_pkr, source }]` | Historical price tracking chart |

---

### Category 11: Zozo Calculated Ratings & Editorial Badges
| Field Name | Type | Formula / Scale | Purpose on Frontend |
| :--- | :--- | :--- | :--- |
| `rating_overall` | Number | 1.0 to 10.0 | Weighted score across all categories |
| `rating_range_efficiency`| Number | 1.0 to 10.0 | Based on usable kWh, real-world km, and $C_d$ |
| `rating_charging_speed` | Number | 1.0 to 10.0 | Based on kW max, 10-80% duration, and 800V support |
| `rating_performance` | Number | 1.0 to 10.0 | Based on 0-100 time, hp, torque, and AWD |
| `rating_tech_cockpit` | Number | 1.0 to 10.0 | Based on OS, compute chip (8295), screens, OTA, audio |
| `rating_safety_adas` | Number | 1.0 to 10.0 | Based on NCAP score, LiDAR, TOPS compute, NOA support |
| `rating_value_for_money`| Number | 1.0 to 10.0 | Price to performance/range ratio |
| `ai_editorial_summary` | String | Rich Text Markdown | Quick overview for buyers |
| `ai_pros` | Array[String] | e.g. `["Ultra-fast 800V charging", "Sub-4s 0-100km/h", "Generous standard equipment"]` | Key advantages |
| `ai_cons` | Array[String] | e.g. `["Firm ride on 20-inch wheels", "No rear wiper", "Touchscreen-only controls"]` | Key drawbacks |
| `ai_buying_advice` | String | Text paragraph | Target audience recommendations |
| `competitor_slugs` | Array[String] | e.g. `["tesla-model-3-long-range", "xiaomi-su7-pro", "zeekr-007-awd"]` | Direct rival suggestions |

---

## 3. Real Example JSON Object (BYD Seal Performance AWD)

```json
{
  "slug": "byd-seal-performance-awd-2025",
  "name": "BYD Seal Performance AWD",
  "brand_slug": "byd",
  "model_name": "Seal",
  "variant_name": "Performance AWD",
  "model_year": 2025,
  "generation": "1st Gen",
  "vehicle_type": "BEV",
  "body_type": "Sedan",
  "segment": "D-Segment",
  "platform": "e-Platform 3.0 (CTB)",
  "status": "available",
  "release_date": "2024-08-01",
  "assembly_country": "China",
  "doors": 4,
  "seats": 5,
  "price_pkr": 15800000,
  "price_global_base_usd": 48500,

  "specs": {
    "battery": {
      "chemistry": "LFP (BYD Blade Battery)",
      "capacity_gross_kwh": 82.56,
      "capacity_usable_kwh": 82.5,
      "system_voltage": 550,
      "integration_type": "Cell-to-Body (CTB)",
      "thermal_management": "Liquid-cooled direct heat pump integration",
      "preheating_support": true,
      "swappable_battery": false,
      "warranty_years": 8,
      "warranty_distance_km": 160000,
      "warranty_soh_guarantee": 70
    },
    "range_and_efficiency": {
      "wltp_combined_km": 520,
      "wltp_city_km": 600,
      "wltp_consumption_kwh_100km": 18.2,
      "cltc_range_km": 650,
      "real_world_range_mild_km": 475,
      "real_world_range_cold_km": 360,
      "real_world_range_highway_km": 390,
      "drag_coefficient_cd": 0.219
    },
    "charging": {
      "ac_max_power_kw": 11,
      "ac_phases": 3,
      "ac_port_type": "Type 2 (Mennekes)",
      "ac_charge_time_0_100_hrs": 8.0,
      "ac_port_location": "Rear Right",
      "dc_max_power_kw": 150,
      "dc_port_type": "CCS2",
      "dc_charge_time_10_80_min": 26,
      "dc_speed_km_15min": 190,
      "plug_and_charge": true,
      "v2l_support": true,
      "v2l_max_power_kw": 3.3,
      "v2h_support": false,
      "v2g_support": false
    },
    "powertrain": {
      "drive_layout": "AWD",
      "motor_count": 2,
      "front_motor_type": "Asynchronous Induction (ASM)",
      "front_motor_power_hp": 218,
      "rear_motor_type": "Permanent Magnet Synchronous (PMSM)",
      "rear_motor_power_hp": 313,
      "total_power_hp": 530,
      "total_power_kw": 390,
      "total_torque_nm": 670,
      "acceleration_0_100_kmh": 3.8,
      "top_speed_kmh": 180,
      "transmission": "Single-Speed Fixed Gear",
      "one_pedal_driving": true,
      "itac_torque_control": true
    },
    "dimensions_and_weight": {
      "length_mm": 4800,
      "width_mm": 1875,
      "height_mm": 1460,
      "wheelbase_mm": 2920,
      "ground_clearance_mm": 145,
      "curb_weight_kg": 2185,
      "gvwr_kg": 2630,
      "weight_distribution": "50:50",
      "trunk_liters": 402,
      "frunk_liters": 53,
      "towing_braked_kg": 1500
    },
    "chassis_and_suspension": {
      "front_suspension": "Double Wishbone",
      "rear_suspension": "Five-Link Independent",
      "adaptive_damping": true,
      "air_suspension": false,
      "turning_circle_m": 11.4,
      "front_brakes": "Ventilated Discs with 4-Piston Calipers",
      "rear_brakes": "Ventilated Discs",
      "tire_size": "235/45 R19"
    },
    "cockpit_and_tech": {
      "cockpit_os": "BYD DiLink (Android Automotive based)",
      "cockpit_chip": "Qualcomm Snapdragon 8155",
      "center_screen_inches": 15.6,
      "center_screen_features": "Rotatable 90-degree motorized touchscreen",
      "driver_cluster_inches": 10.25,
      "hud": "Head-Up Display (W-HUD)",
      "apple_carplay": "Wireless",
      "android_auto": "Wireless",
      "audio_brand": "Dynaudio Premium Sound",
      "speaker_count": 12,
      "wireless_chargers": 2,
      "heat_pump": true,
      "keyless_tech": ["NFC Keycard", "Smartphone App Bluetooth Key"]
    },
    "adas_and_safety": {
      "euro_ncap_stars": 5,
      "airbag_count": 9,
      "autonomy_level": "Level 2+",
      "adas_system_name": "DiPilot",
      "camera_count": 6,
      "radar_count": 5,
      "ultrasonic_count": 12,
      "lidar_count": 0,
      "features": [
        "Adaptive Cruise Control with Stop&Go",
        "Lane Centering Assist",
        "Autonomous Emergency Braking",
        "Blind Spot Detection",
        "3D 360-degree Panoramic Camera",
        "Rear Cross Traffic Alert with Braking"
      ]
    }
  }
}
```

---

## 4. Key Search Filters & Comparison Facets for Zozo Frontend

When building the EV listing, search, and comparison pages (`/evs`, `/compare`, `/search`), the following filters are critical for users:

1. **Price Range** (PKR & USD brackets)
2. **Brand / Make** (BYD, Tesla, Deepal, Xiaomi, MG, Porsche, Audi, BMW, etc.)
3. **Vehicle Body Style** (Sedan, SUV, Crossover, Hatchback, Pickup)
4. **Drive Type** (AWD, RWD, FWD)
5. **Real-World / WLTP Range** (e.g. 300+ km, 400+ km, 500+ km, 600+ km)
6. **Battery Capacity** (<60 kWh, 60-80 kWh, >80 kWh)
7. **Battery Chemistry** (LFP vs NMC)
8. **0-100 km/h Acceleration** (Under 4.0s, 4.0s-6.0s, >6.0s)
9. **Fast Charging Time** (Under 20 mins, 20-30 mins)
10. **800V Architecture** (Yes / No toggle)
11. **V2L Power Output** (Yes / No toggle)
12. **Has Frunk** (Yes / No toggle)
13. **Heat Pump Included** (Yes / No toggle)
14. **LiDAR / Level 2+ ADAS** (Yes / No toggle)
