// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhoneImage {
  url: string;
  cloud_public_id: string;
  is_primary: boolean;
  alt_text?: string;
}

export interface PhonePrice {
  retailer_slug: string;
  retailer_name: string;
  variant?: string;
  price_pkr: number;
  stock_status?: string;
  product_url?: string;
}

export interface PriceHistoryPoint {
  date: string;
  price_pkr: number;
  source?: string;
}

export interface Phone {
  _id: string;
  slug: string;
  name: string;
  brand_slug: string;
  status: "available" | "upcoming" | "discontinued" | "out_of_stock";
  description?: string;
  release_date?: string;
  images: PhoneImage[];
  model_number?: string;
  series?: string;
  category?: string;
  subcategory?: string;
  country_availability?: string[];
  carrier_version?: string;
  region_version?: string;
  manufacturer?: string;
  made_in?: string;
  video_url?: string;
  specs: {
    performance?: {
      ram_options_gb?: number[];
      storage_options_gb?: number[];
      chipset?: string;
      cpu?: string;
      gpu?: string;
      expandable_storage?: boolean;
    };
    battery?: {
      capacity_mah?: number;
      charging_watts?: number;
      fast_charging?: boolean;
      wireless_charging?: boolean;
    };
    camera?: {
      rear_summary?: string;
      front_summary?: string;
      video_recording?: string;
    };
    display?: {
      size_inches?: number;
      type?: string;
      resolution?: string;
      refresh_rate_hz?: number;
      protection?: string;
      peak_brightness_nits?: number;
    };
    body?: {
      height_mm?: number;
      width_mm?: number;
      thickness_mm?: number;
      weight_g?: number;
      materials?: string;
      water_resistance?: string;
    };
    connectivity?: {
      network?: string;
      sim?: string;
      usb?: string;
      bluetooth?: string;
      nfc?: boolean;
    };
    os?: string;
    ai_features?: string[];
    extra_specs?: any;
  };
  prices: PhonePrice[];
  price_pkr?: number;
  price_usd?: number;
  price_usd_source?: string;
  price_history?: PriceHistoryPoint[];
  pta_tax?: {
    passport_pkr?: number;
    cnic_pkr?: number;
    last_updated?: string;
    source_note?: string;
  };
  tags?: string[];
  view_count?: number;
  rating: {
    average: number;
    count: number;
  };
  seo?: {
    meta_title?: string;
    meta_description?: string;
    ai_seo_title?: string;
    ai_meta_description?: string;
    ai_faq?: { question: string; answer: string }[];
    ai_summary?: string;
    ai_pros?: string[];
    ai_cons?: string[];
    ai_buying_advice?: string;
    ai_snippet?: string;
    ai_suggested_tags?: string[];
    ai_keywords?: string[];
    is_indexable?: boolean;
  };
  updated_at?: string;
  updatedAt?: string;
  createdBy?: { _id: string; name?: string; username?: string } | string;
  updatedBy?: { _id: string; name?: string; username?: string } | string;
  reviewer?: { _id: string; name?: string; username?: string } | string;
  sources?: { name?: string; url?: string; updated_at?: string }[];
  importSource?: string;
}

export interface Review {
  _id: string;
  phoneId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaginatedReviews {
  reviews: Review[];
  pagination: PaginationInfo;
}

export interface Brand {
  _id: string;
  slug: string;
  name: string;
  logo?: string;
  type?: "phone" | "ev" | "earbud" | string;
  total_phones?: number;
  total_vehicles?: number;
  total_earbuds?: number;
  phone_count?: number;
  earbud_count?: number;
}

export interface EarbudImage {
  url: string;
  cloud_public_id: string;
  is_primary: boolean;
  alt_text?: string;
}

export interface EarbudPrice {
  retailer_slug: string;
  retailer_name: string;
  variant?: string;
  price_pkr: number;
  stock_status?: string;
  product_url?: string;
  last_checked?: string;
}

export interface EarbudSpecs {
  audio?: {
    driver_type?: string;
    driver_size_mm?: number;
    frequency_min_hz?: number;
    frequency_max_hz?: number;
    impedance_ohms?: number;
    sensitivity_db?: number;
    hi_res_audio?: boolean;
    spatial_audio?: string;
    sound_features?: string[];
  };
  noise_cancellation?: {
    has_anc?: boolean;
    anc_depth_db?: number;
    anc_type?: string;
    transparency_mode?: boolean;
    enc_call_noise_reduction?: boolean;
    mic_count_total?: number;
    mic_count_per_earbud?: number;
    wind_noise_reduction?: boolean;
    mic_tech_features?: string[];
  };
  battery?: {
    earbud_battery_mah?: number;
    case_battery_mah?: number;
    playtime_earbuds_anc_off_hrs?: number;
    playtime_earbuds_anc_on_hrs?: number;
    total_playtime_with_case_hrs?: number;
    charging_port?: string;
    fast_charging?: boolean;
    fast_charge_summary?: string;
    earbud_charge_time_mins?: number;
    case_charge_time_mins?: number;
    wireless_charging?: boolean;
  };
  connectivity?: {
    bluetooth_version?: string;
    bluetooth_range_meters?: number;
    codecs?: string[];
    multipoint_pairing?: boolean;
    google_fast_pair?: boolean;
    low_latency_gaming_mode?: boolean;
    latency_ms?: number;
    app_support?: string;
  };
  physical?: {
    water_resistance?: string;
    case_water_resistance?: string;
    earbud_weight_g?: number;
    case_weight_g?: number;
    total_weight_g?: number;
    earbud_dimensions_mm?: string;
    case_dimensions_mm?: string;
  };
  controls?: {
    control_type?: string;
    volume_control?: boolean;
    in_ear_detection?: boolean;
    voice_assistant?: string[];
    extra_features?: string[];
  };
  in_the_box?: string[];
  extra_specs?: any;
}

export interface Earbud {
  _id: string;
  slug: string;
  name: string;
  brand_slug: string;
  model_number?: string;
  release_date?: string;
  description?: string;
  status: "available" | "upcoming" | "discontinued" | "out_of_stock" | "rumored" | "released";
  wearing_type?: string;
  colors?: string[];
  country_availability?: string[];
  made_in?: string;
  tags?: string[];
  video_url?: string;
  price_pkr?: number;
  price_usd?: number;
  price_usd_source?: string;
  price_history?: PriceHistoryPoint[];
  images: EarbudImage[];
  specs?: EarbudSpecs;
  prices: EarbudPrice[];
  rating?: {
    average?: number;
    count?: number;
  };
  view_count?: number;
  seo?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    focus_keyword?: string;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    ai_seo_title?: string;
    ai_meta_description?: string;
    ai_faq?: { question: string; answer: string }[];
    ai_summary?: string;
    ai_pros?: string[];
    ai_cons?: string[];
    ai_buying_advice?: string;
    ai_snippet?: string;
    ai_suggested_tags?: string[];
    ai_keywords?: string[];
    is_indexable?: boolean;
  };
  approvalStatus?: string;
  is_published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedEarbuds {
  earbuds: Earbud[];
  pagination: PaginationInfo;
}

export interface RelatedEarbudsResponse {
  by_brand?: Earbud[];
  by_price?: Earbud[];
}

export interface VehiclePrice {
  retailer_slug?: string;
  retailer_name: string;
  variant?: string;
  price_pkr: number;
  stock_status?: string;
  product_url?: string;
  last_checked?: string;
}

export interface Vehicle {
  _id: string;
  slug: string;
  name: string;
  brand_slug: string;
  model_name?: string;
  variant_name?: string;
  model_year?: number;
  generation?: string;
  vehicle_type?: "BEV" | "PHEV" | "EREV" | "FCEV" | string;
  ev_category?: "Car" | "Bike" | "Scooter" | "Cycle" | "Rickshaw" | string;
  body_type?: string;
  segment?: string;
  platform?: string;
  doors?: number;
  seats?: number;
  status: "available" | "upcoming" | "announced" | "rumored" | "discontinued" | string;
  announcement_date?: string;
  release_date?: string;
  assembly_country?: string;
  made_in?: string;
  description?: string;
  tags?: string[];
  country_availability?: string[];
  video_url?: string;
  price_pkr?: number;
  price_usd?: number;
  price_usd_source?: string;
  images: { url: string; is_primary?: boolean; alt_text?: string }[];
  prices?: VehiclePrice[];
  pricing?: {
    price_global_base_usd?: number;
    price_global_base_cny?: number;
    price_global_base_eur?: number;
    price_pkr_ex_factory?: number;
    price_pkr_on_road?: number;
  };
  specs?: {
    battery?: {
      chemistry?: string;
      capacity_gross_kwh?: number;
      capacity_usable_kwh?: number;
      system_voltage?: number;
      thermal_management?: string;
      warranty_years?: number;
      warranty_distance_km?: number;
    };
    range_and_efficiency?: {
      wltp_combined_km?: number;
      wltp_consumption_kwh_100km?: number;
      epa_combined_km?: number;
      efficiency_mpge_combined?: number;
      cltc_range_km?: number;
      real_world_range_mild_km?: number;
      real_world_range_cold_km?: number;
      real_world_range_highway_km?: number;
      drag_coefficient_cd?: number;
    };
    charging?: {
      ac_max_power_kw?: number;
      ac_port_type?: string;
      ac_charge_time_0_100_hrs?: number;
      dc_max_power_kw?: number;
      dc_port_type?: string;
      dc_charge_time_10_80_min?: number;
      v2l_support?: boolean;
      v2h_support?: boolean;
      v2g_support?: boolean;
    };
    powertrain?: {
      drive_layout?: string;
      motor_count?: number;
      total_power_hp?: number;
      total_power_kw?: number;
      total_torque_nm?: number;
      acceleration_0_100_kmh?: number;
      acceleration_0_60_mph?: number;
      top_speed_kmh?: number;
    };
    dimensions_and_weight?: {
      length_mm?: number;
      width_mm?: number;
      height_mm?: number;
      wheelbase_mm?: number;
      ground_clearance_mm?: number;
      curb_weight_kg?: number;
      trunk_liters?: number;
      frunk_liters?: number;
      towing_braked_kg?: number;
      towing_unbraked_kg?: number;
    };
    chassis_and_suspension?: {
      front_suspension?: string;
      rear_suspension?: string;
      air_suspension?: boolean;
      turning_circle_m?: number;
      wheel_sizes_inches?: number[];
      tire_size?: string;
    };
    cockpit_and_tech?: {
      cockpit_os?: string;
      cockpit_chip?: string;
      center_screen_inches?: number;
      center_screen_features?: string;
      driver_cluster_inches?: number;
      hud?: string;
      apple_carplay?: string;
      android_auto?: string;
      audio_brand?: string;
      speaker_count?: number;
      wireless_chargers?: number;
      ota_updates?: string;
      heat_pump?: boolean;
    };
    adas_and_safety?: {
      euro_ncap_stars?: number;
      nhtsa_stars?: number;
      airbag_count?: number;
      autonomy_level?: string;
      adas_system_name?: string;
      lidar_count?: number;
      camera_count?: number;
      radar_count?: number;
      ultrasonic_count?: number;
      features?: string[];
    };
    extra_specs?: any;
  };
  ratings?: {
    overall?: number;
    range_efficiency?: number;
    charging_speed?: number;
    performance?: number;
    tech_cockpit?: number;
    safety_adas?: number;
    value_for_money?: number;
  };
  rating?: {
    average?: number;
    count?: number;
  };
  seo?: {
    meta_title?: string;
    meta_description?: string;
    ai_seo_title?: string;
    ai_meta_description?: string;
    ai_faq?: { question: string; answer: string }[];
    ai_summary?: string;
    ai_editorial_summary?: string;
    ai_pros?: string[];
    ai_cons?: string[];
    ai_buying_advice?: string;
    ai_snippet?: string;
    ai_keywords?: string[];
    is_indexable?: boolean;
  };
  competitor_slugs?: string[];
}

export interface VehicleDetailResponse {
  vehicle: Vehicle;
  variants?: Vehicle[];
}

export interface RelatedVehiclesResponse {
  by_brand?: Vehicle[];
  by_category?: Vehicle[];
  by_price?: Vehicle[];
}

export interface PaginatedVehicles {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HomeData {
  trending: Phone[];
  latest: Phone[];
  brands: Brand[];
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPhones {
  phones: Phone[];
  pagination: PaginationInfo;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0 && !envUrl.includes("undefined")) {
    return envUrl.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  return "http://localhost:5000/api";
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

// A slow or flaky backend must NEVER be turned into a soft-404. If a transient
// fetch failure quietly returned null, the page would render "Not Found" with an
// HTTP 200 and Google would deindex a URL that is actually fine. So we give each
// request a hard timeout, retry transient failures (5xx / network / timeout),
// and if they persist we THROW — letting error.tsx serve a real HTTP 500 that
// Googlebot will retry later, instead of a bogus empty page.
const API_TIMEOUT_MS = 8000;
const API_MAX_RETRIES = 2;

async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  let lastError: unknown;
  for (let attempt = 0; attempt <= API_MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        next: { revalidate: 60 },
        ...init,
        signal: controller.signal,
      });

      // Genuinely missing resource — let the caller render a real 404. Not retried.
      if (res.status === 404) return null;

      // 4xx (other than 404) — a client error retrying won't fix. Fail fast.
      if (!res.ok && res.status < 500) {
        throw new Error(`API client error: ${res.status} ${res.statusText} for ${endpoint}`);
      }

      // 5xx — transient server problem. Throw to fall into the retry path below.
      if (!res.ok) {
        throw new Error(`API server error: ${res.status} ${res.statusText} for ${endpoint}`);
      }

      const json: ApiResponse<T> = await res.json();
      return json.data;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "";
      const isRetryable = !message.startsWith("API client error");

      if (!isRetryable || attempt === API_MAX_RETRIES) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        throw error;
      }
      // Linear backoff before the next attempt: 300ms, then 600ms.
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getVehicles(query?: string): Promise<PaginatedVehicles | null> {
  const endpoint = query ? `/vehicles?${query}` : "/vehicles";
  const data = await apiFetch<PaginatedVehicles>(endpoint, { cache: "no-store" });
  return data;
}

export async function getVehicleBySlug(slug: string): Promise<VehicleDetailResponse | null> {
  const data = await apiFetch<VehicleDetailResponse>(`/vehicles/${slug}`, { cache: "no-store" });
  return data;
}

export async function getRelatedVehicles(slug: string): Promise<RelatedVehiclesResponse | null> {
  const data = await apiFetch<RelatedVehiclesResponse>(`/vehicles/${slug}/related`, { cache: "no-store" });
  return data;
}

export async function getHomeData(): Promise<HomeData | null> {
  return apiFetch<HomeData>("/home");
}

export async function getPhones(query?: string): Promise<PaginatedPhones> {
  const endpoint = query ? `/phones?${query}` : "/phones";
  const data = await apiFetch<any>(endpoint);

  // Handle cached responses from before the pagination update
  if (Array.isArray(data)) {
    return { phones: data, pagination: { total: data.length, page: 1, limit: 15, totalPages: 1 } };
  }

  if (data && Array.isArray(data.phones)) {
    return data;
  }

  throw new Error("Invalid phone list response");
}

export interface SearchResultItem {
  _id: string;
  slug: string;
  name: string;
  brand_slug: string;
  item_type?: "phone" | "earbud" | "vehicle";
  price_pkr?: number;
  price_usd?: number;
  price_usd_source?: string;
  images?: { url: string; alt_text?: string }[];
  status?: string;
  specs?: any;
}

export async function searchPhones(q: string): Promise<SearchResultItem[]> {
  const data = await apiFetch<SearchResultItem[]>(`/search?q=${encodeURIComponent(q)}`);
  return data || [];
}

export async function searchProducts(q: string): Promise<SearchResultItem[]> {
  const data = await apiFetch<SearchResultItem[]>(`/search?q=${encodeURIComponent(q)}`);
  return data || [];
}

export async function getBrands(type?: string): Promise<Brand[]> {
  const query = type ? `?type=${type}` : "";
  const data = await apiFetch<Brand[]>(`/brands${query}`);
  return data || [];
}

export async function getPhoneBySlug(slug: string): Promise<Phone | null> {
  return apiFetch<Phone>(`/phones/${slug}`);
}

export async function getRelatedPhones(slug: string): Promise<any> {
  return apiFetch<any>(`/phones/${slug}/related`);
}

export async function getComparisonData(slugs: string[]): Promise<Phone[]> {
  if (slugs.length === 0) return [];
  const data = await apiFetch<Phone[]>(`/compare?slugs=${slugs.join(",")}`);
  return data || [];
}

export async function getAIComparisonVerdict(slugs: string[]): Promise<{ verdict: string, key_differences: Record<string, string[]> } | null> {
  if (slugs.length < 2) return null;
  const data = await apiFetch<{ verdict: string, key_differences: Record<string, string[]> }>(`/compare/ai?slugs=${slugs.join(",")}`);
  return data || null;
}

export async function trackComparison(slugs: string[]): Promise<void> {
  if (slugs.length < 2) return;
  try {
    await fetch(`${getApiBaseUrl()}/compare/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slugs: slugs.join(",") }),
    });
  } catch (error) {
    console.error("Failed to track comparison:", error);
  }
}

export async function getPopularComparisons(limit: number | "all" = 5): Promise<any[]> {
  const data = await apiFetch<any[]>(`/compare/popular?limit=${limit}`);
  return data || [];
}

// ─── Vehicle (EV) Comparison ────────────────────────────────────────────────────

export async function getVehicleComparisonData(slugs: string[]): Promise<Vehicle[]> {
  if (slugs.length === 0) return [];
  const data = await apiFetch<Vehicle[]>(`/vehicles/compare?slugs=${slugs.join(",")}`, { cache: "no-store" });
  return data || [];
}

export async function getAIVehicleComparison(slugs: string[]): Promise<{ verdict: string, key_differences: Record<string, string[]> } | null> {
  if (slugs.length < 2) return null;
  const data = await apiFetch<{ verdict: string, key_differences: Record<string, string[]> }>(`/vehicles/compare/ai?slugs=${slugs.join(",")}`);
  return data || null;
}

export async function trackVehicleComparison(slugs: string[]): Promise<void> {
  if (slugs.length < 2) return;
  try {
    await fetch(`${getApiBaseUrl()}/vehicles/compare/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slugs: slugs.join(",") }),
    });
  } catch (error) {
    console.error("Failed to track vehicle comparison:", error);
  }
}

export async function getPopularVehicleComparisons(limit: number | "all" = 8): Promise<any[]> {
  const data = await apiFetch<any[]>(`/vehicles/compare/popular?limit=${limit}`);
  return data || [];
}

// ─── Vehicle (EV) Reviews & Voting ──────────────────────────────────────────────

export interface VehicleReview {
  _id: string;
  vehicleId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaginatedVehicleReviews {
  reviews: VehicleReview[];
  pagination: PaginationInfo;
}

export async function getVehicleReviews(vehicleId: string, page = 1, limit = 6): Promise<PaginatedVehicleReviews> {
  const data = await apiFetch<any>(`/vehicle-reviews/${vehicleId}?page=${page}&limit=${limit}`);

  if (Array.isArray(data)) {
    return { reviews: data, pagination: { total: data.length, page: 1, limit: 6, totalPages: 1 } };
  }

  return data || { reviews: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 1 } };
}

export async function postVehicleReview(payload: { vehicleId: string; rating: number; comment: string }): Promise<VehicleReview> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/vehicle-reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to submit review");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error submitting vehicle review:", error);
    throw error;
  }
}

export async function getVehicleVoteStats(vehicleId: string): Promise<any> {
  const data = await apiFetch<any>(`/vehicle-votes/${vehicleId}/stats`);
  return data || null;
}

export async function castVehicleVote(payload: { vehicleId: string; sessionId: string; pollType: string; value: any }): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/vehicle-votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to cast vote");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error casting vehicle vote:", error);
    throw error;
  }
}

export async function getPages(): Promise<any[]> {
  const data = await fetch(`${getApiBaseUrl()}/pages`, {
    next: { revalidate: 60 }
  }).then(res => res.json()).catch(() => []);
  return Array.isArray(data) ? data : [];
}

export async function getVoteStats(phoneId: string): Promise<any> {
  const data = await apiFetch<any>(`/votes/${phoneId}/stats`);
  return data || null;
}

export async function castVote(payload: { phoneId: string; sessionId: string; pollType: string; value: any }): Promise<any> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to cast vote");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error casting vote:", error);
    throw error;
  }
}

export async function getReviews(phoneId: string, page = 1, limit = 6): Promise<PaginatedReviews> {
  const data = await apiFetch<any>(`/reviews/${phoneId}?page=${page}&limit=${limit}`);

  if (Array.isArray(data)) {
    return { reviews: data, pagination: { total: data.length, page: 1, limit: 6, totalPages: 1 } };
  }

  return data || { reviews: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 1 } };
}

export async function postReview(payload: { phoneId: string; rating: number; comment: string }): Promise<Review> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to submit review");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
}

// ─── Earbuds (TWS) API Functions ──────────────────────────────────────────────

export async function getEarbuds(query?: string, init?: RequestInit): Promise<PaginatedEarbuds> {
  const endpoint = query ? `/earbuds?${query}` : "/earbuds";
  const data = await apiFetch<any>(endpoint, init);
  if (data && Array.isArray(data.earbuds)) {
    return data;
  }
  throw new Error("Invalid earbud list response");
}

export async function getEarbudBySlug(slug: string, init?: RequestInit): Promise<Earbud | null> {
  return apiFetch<Earbud>(`/earbuds/${slug}`, init);
}

export async function getRelatedEarbuds(slug: string, init?: RequestInit): Promise<RelatedEarbudsResponse | null> {
  return apiFetch<RelatedEarbudsResponse>(`/earbuds/${slug}/related`, init);
}

