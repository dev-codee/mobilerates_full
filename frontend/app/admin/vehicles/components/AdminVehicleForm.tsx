"use client";
import ReferencePriceFields from "@/app/admin/components/ReferencePriceFields";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Wand2, Sparkles, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ImageUploader from '../../../components/ImageUploader';

// ─── Option lists (kept in sync with Vehicle.model.js enums) ────────────────────
const EV_CATEGORIES = ['Car', 'Bike', 'Scooter', 'Cycle', 'Rickshaw'];
const VEHICLE_TYPES = ['BEV', 'PHEV', 'EREV', 'FCEV'];
const BODY_TYPES = ['Sedan', 'SUV', 'Crossover', 'Hatchback', 'Coupe', 'MPV', 'Pickup', 'Sports', 'Wagon', 'Scooter', 'Bike', 'Rickshaw', 'Other'];
const STATUSES = ['available', 'upcoming', 'announced', 'rumored', 'discontinued'];

// Tabs map 1:1 to the specs.* sub-objects in the Vehicle schema.
const TABS = [
  'basic', 'battery', 'range', 'charging', 'powertrain',
  'dimensions', 'chassis', 'cockpit', 'adas', 'pricing', 'seo',
];

const emptyVehicle = () => ({
  name: '', brand_slug: '', model_name: '', variant_name: '', model_year: '',
  generation: '', vehicle_type: 'BEV', ev_category: 'Car', body_type: 'Sedan',
  segment: '', platform: '', doors: '', seats: '', status: 'available',
  release_date: '', announcement_date: '', assembly_country: '', made_in: '',
  description: '', tags: [] as string[], country_availability: '', competitor_slugs: '',
  video_url: '', price_pkr: '', price_usd: '', price_usd_source: '', images: [] as any[],
  specs: {
    battery: {
      chemistry: '', capacity_gross_kwh: '', capacity_usable_kwh: '', system_voltage: '',
      thermal_management: '', warranty_years: '', warranty_distance_km: '',
    },
    range_and_efficiency: {
      wltp_combined_km: '', wltp_consumption_kwh_100km: '', epa_combined_km: '',
      efficiency_mpge_combined: '', cltc_range_km: '', real_world_range_mild_km: '',
      real_world_range_cold_km: '', real_world_range_highway_km: '', drag_coefficient_cd: '',
    },
    charging: {
      ac_max_power_kw: '', ac_port_type: '', ac_charge_time_0_100_hrs: '',
      dc_max_power_kw: '', dc_port_type: '', dc_charge_time_10_80_min: '',
      v2l_support: false, v2h_support: false, v2g_support: false,
    },
    powertrain: {
      drive_layout: '', motor_count: '', total_power_hp: '', total_power_kw: '',
      total_torque_nm: '', acceleration_0_100_kmh: '', acceleration_0_60_mph: '', top_speed_kmh: '',
    },
    dimensions_and_weight: {
      length_mm: '', width_mm: '', height_mm: '', wheelbase_mm: '', ground_clearance_mm: '',
      curb_weight_kg: '', trunk_liters: '', frunk_liters: '',
      towing_braked_kg: '', towing_unbraked_kg: '',
    },
    chassis_and_suspension: {
      front_suspension: '', rear_suspension: '', air_suspension: false,
      turning_circle_m: '', wheel_sizes_inches: '', tire_size: '',
    },
    cockpit_and_tech: {
      cockpit_os: '', cockpit_chip: '', center_screen_inches: '', center_screen_features: '',
      driver_cluster_inches: '', hud: '', apple_carplay: '', android_auto: '', audio_brand: '', 
      speaker_count: '', wireless_chargers: '', ota_updates: '', heat_pump: false,
    },
    adas_and_safety: {
      euro_ncap_stars: '', nhtsa_stars: '', airbag_count: '', autonomy_level: '', 
      adas_system_name: '', lidar_count: '', camera_count: '', radar_count: '', ultrasonic_count: '', features: '',
    },
    extra_specs: {},
  },
  pricing: {
    price_global_base_usd: '', price_global_base_cny: '', price_global_base_eur: '',
    price_pkr_ex_factory: '', price_pkr_on_road: '',
  },
  prices: [] as any[],
  ratings: {
    overall: '', range_efficiency: '', charging_speed: '', performance: '',
    tech_cockpit: '', safety_adas: '', value_for_money: '',
  },
  seo: {
    meta_title: '', meta_description: '', meta_keywords: '', focus_keyword: '', canonical_url: '',
    og_title: '', og_description: '', og_image: '', ai_seo_title: '', ai_meta_description: '',
    ai_faq: [] as any[], ai_editorial_summary: '', ai_pros: [] as string[], ai_cons: [] as string[],
    ai_buying_advice: '', ai_snippet: '', ai_suggested_tags: [] as string[], ai_keywords: [] as string[],
    is_indexable: false,
  },
  approvalStatus: 'APPROVED',
  is_published: true,
});

// Fields entered as comma-separated strings but stored as arrays.
const COMMA_ARRAY_PATHS = [
  'country_availability', 'competitor_slugs',
  'tags', 'specs.chassis_and_suspension.wheel_sizes_inches',
  'specs.adas_and_safety.features', 'seo.ai_faq', 'seo.ai_pros', 'seo.ai_cons',
  'seo.ai_suggested_tags', 'seo.ai_keywords'
];
const NUMERIC_ARRAY_PATHS = ['specs.chassis_and_suspension.wheel_sizes_inches'];

export default function AdminVehicleForm({ initialData, onSubmit, isEditing = false }: { initialData?: any, onSubmit: (data: any) => Promise<void>, isEditing?: boolean }) {
  const router = useRouter();
  const [brands, setBrands] = useState<{ slug: string, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIFilling, setIsAIFilling] = useState(false);
  const [isAIFillingSEO, setIsAIFillingSEO] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [addingBrand, setAddingBrand] = useState(false);

  const [formData, setFormData] = useState<any>(() => {
    const base = emptyVehicle();
    if (!initialData) return base;

    const data = { ...initialData };
    // Array -> comma string for editable inputs
    if (Array.isArray(data.country_availability)) data.country_availability = data.country_availability.join(', ');
    if (Array.isArray(data.competitor_slugs)) data.competitor_slugs = data.competitor_slugs.join(', ');

    const merged: any = {
      ...base, ...data,
      specs: { ...base.specs, ...(data.specs || {}) },
      pricing: { ...base.pricing, ...(data.pricing || {}) },
      ratings: { ...base.ratings, ...(data.ratings || {}) },
      seo: { ...base.seo, ...(data.seo || {}), is_indexable: isEditing && data.seo?.is_indexable === true },
    };
    // Deep-merge each spec sub-section so missing keys keep their empty defaults.
    for (const section of Object.keys(base.specs)) {
      merged.specs[section] = { ...(base.specs as any)[section], ...((data.specs || {})[section] || {}) };
    }
    // Array spec fields -> comma strings
    const p = merged.specs.powertrain;
    if (Array.isArray(p.regen_modes)) p.regen_modes = p.regen_modes.join(', ');
    const c = merged.specs.chassis_and_suspension;
    if (Array.isArray(c.wheel_sizes_inches)) c.wheel_sizes_inches = c.wheel_sizes_inches.join(', ');
    const t = merged.specs.cockpit_and_tech;
    if (Array.isArray(t.app_connectivity)) t.app_connectivity = t.app_connectivity.join(', ');
    if (Array.isArray(t.keyless_tech)) t.keyless_tech = t.keyless_tech.join(', ');
    const a = merged.specs.adas_and_safety;
    if (Array.isArray(a.features)) a.features = a.features.join(', ');
    return merged;
  });

  const fetchBrands = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return fetch(`${apiUrl}/brands?type=ev`)
      .then(res => res.json())
      .then(data => { if (data.success && data.data) setBrands(data.data); })
      .catch(console.error);
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleAddBrand = async () => {
    const name = newBrandName.trim();
    if (!name) return;
    setAddingBrand(true);
    try {
      const token = Cookies.get('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/admin/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, type: 'ev' })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        await fetchBrands();
        setTop('brand_slug', data.data.slug);
        setNewBrandName('');
        setShowAddBrand(false);
      } else {
        notify(`Failed to add brand: ${data.message}`);
      }
    } catch (e) {
      console.error(e);
      notify('Error adding brand');
    } finally {
      setAddingBrand(false);
    }
  };

  // Duplicate checker (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!formData.name && !formData.model_name) { setDuplicates([]); return; }
      try {
        const token = Cookies.get('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/check-duplicate?name=${encodeURIComponent(formData.name)}&model_name=${encodeURIComponent(formData.model_name)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) setDuplicates(data.data.filter((x: any) => x._id !== initialData?._id));
      } catch (e) { console.error(e); }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.name, formData.model_name]);

  // ── State setters ─────────────────────────────────────────────────────────────
  const setTop = (field: string, value: any) => setFormData((p: any) => ({ ...p, [field]: value }));
  const setSpec = (section: string, field: string, value: any) =>
    setFormData((p: any) => ({ ...p, specs: { ...p.specs, [section]: { ...p.specs[section], [field]: value } } }));
  const setGroup = (group: string, field: string, value: any) =>
    setFormData((p: any) => ({ ...p, [group]: { ...p[group], [field]: value } }));

  // ── AI auto-fill (specs) ──────────────────────────────────────────────────────
  const handleAIFill = async () => {
    if (!formData.name) { notify("Please enter a Vehicle Name first (e.g. 'BYD Seal Performance AWD')"); return; }
    setIsAIFilling(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/ai-fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ vehicleName: formData.name })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const ai = data.data;
        setFormData((prev: any) => {
          const next = { ...prev };
          // Top-level scalars
          for (const k of ['brand_slug', 'model_name', 'variant_name', 'model_year', 'generation',
            'vehicle_type', 'ev_category', 'body_type', 'segment', 'platform', 'doors', 'seats',
            'status', 'release_date', 'assembly_country', 'made_in', 'country_availability', 'price_pkr']) {
            if (ai[k] !== undefined && ai[k] !== null && ai[k] !== '') next[k] = ai[k];
          }
          if (Array.isArray(ai.tags) && ai.tags.length) next.tags = ai.tags;
          // Spec sections (merge, converting arrays to comma strings where the form expects them)
          const aiSpecs = ai.specs || {};
          next.specs = { ...prev.specs };
          for (const section of Object.keys(prev.specs)) {
            if (section === 'extra_specs') continue;
            const merged = { ...prev.specs[section], ...(aiSpecs[section] || {}) };
            for (const key of Object.keys(merged)) {
              if (Array.isArray(merged[key])) merged[key] = merged[key].join(', ');
            }
            next.specs[section] = merged;
          }
          if (ai.specs?.extra_specs) next.specs.extra_specs = { ...prev.specs.extra_specs, ...ai.specs.extra_specs };
          if (ai.pricing) next.pricing = { ...prev.pricing, ...ai.pricing };
          if (ai.description) next.description = ai.description;
          return next;
        });
        notify("AI researched and populated the EV fields. Review each tab and fill any values the AI safely left blank.");
      } else {
        notify("Failed to auto-fill: " + (data.message || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      notify("Error occurred during AI auto-fill.");
    } finally {
      setIsAIFilling(false);
    }
  };

  // ── AI auto-fill (SEO) ────────────────────────────────────────────────────────
  const handleAIFillSEO = async () => {
    if (!formData.name) { notify("Please enter a Vehicle Name first"); return; }
    setIsAIFillingSEO(true);
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/ai-fill-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ vehicleName: formData.name, brand_slug: formData.brand_slug, price_pkr: formData.price_pkr, specs: formData.specs })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setFormData((prev: any) => ({ ...prev, seo: { ...prev.seo, ...data.data } }));
        notify("AI successfully generated SEO content!");
      } else {
        notify("Failed to auto-fill SEO: " + (data.message || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      notify("Error occurred during AI SEO generation.");
    } finally {
      setIsAIFillingSEO(false);
    }
  };

  // ── Prices ────────────────────────────────────────────────────────────────────
  const [newPrice, setNewPrice] = useState({ retailer_name: '', price_pkr: '', stock_status: 'available', product_url: '', variant: '' });
  const addPriceItem = () => {
    if (!newPrice.retailer_name || !newPrice.price_pkr) { notify("Retailer Name and Price are required."); return; }
    const priceNum = Number(newPrice.price_pkr);
    if (isNaN(priceNum)) { notify("Price must be a valid number."); return; }
    setFormData((p: any) => ({
      ...p,
      prices: [...(p.prices || []), {
        retailer_name: newPrice.retailer_name,
        retailer_slug: newPrice.retailer_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price_pkr: priceNum, stock_status: newPrice.stock_status,
        product_url: newPrice.product_url || undefined, variant: newPrice.variant || undefined,
      }],
    }));
    setNewPrice({ retailer_name: '', price_pkr: '', stock_status: 'available', product_url: '', variant: '' });
  };
  const removePriceItem = (i: number) =>
    setFormData((p: any) => ({ ...p, prices: (p.prices || []).filter((_: any, idx: number) => idx !== i) }));

  // ── Submit ────────────────────────────────────────────────────────────────────
  const getPath = (obj: any, path: string) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj);
  const setPath = (obj: any, path: string, val: any) => {
    const keys = path.split('.'); const last = keys.pop() as string;
    const target = keys.reduce((a, k) => (a[k] = a[k] || {}), obj);
    target[last] = val;
  };

  // Recursively drop '' values so Mongoose doesn't store empties / throw casts.
  const stripEmpty = (val: any): any => {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      const out: any = {};
      for (const k of Object.keys(val)) {
        const cleaned = stripEmpty(val[k]);
        if (cleaned !== '' && cleaned !== undefined) out[k] = cleaned;
      }
      return out;
    }
    return val === '' ? undefined : val;
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) { notify("Vehicle name is required."); return; }
    setIsSubmitting(true);
    try {
      const payload = JSON.parse(JSON.stringify(formData));
      payload.price_usd = formData.price_usd === '' || formData.price_usd == null ? null : Number(formData.price_usd);
      payload.price_usd_source = formData.price_usd_source || '';
      if (payload.price_usd !== null && (!Number.isFinite(payload.price_usd) || payload.price_usd < 0)) { notify('Enter a valid USD price'); return; }
      // Convert comma-string fields into arrays
      for (const path of COMMA_ARRAY_PATHS) {
        const raw = getPath(payload, path);
        if (typeof raw === 'string') {
          let arr = raw.split(',').map((x: string) => x.trim()).filter(Boolean);
          if (NUMERIC_ARRAY_PATHS.includes(path)) arr = arr.map((x: string) => Number(x)).filter((n: number) => !isNaN(n)) as any;
          setPath(payload, path, arr);
        }
      }
      const cleaned = stripEmpty(payload);
      cleaned.price_usd_source = formData.price_usd_source || "";
      await onSubmit(cleaned);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────────
  const input = (label: string, value: any, onChange: (v: any) => void, type = 'text', placeholder = '') => (
    <div key={label} className="mb-1">
      <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{label.replace(/_/g, ' ')}</label>
      <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" placeholder={placeholder} />
    </div>
  );
  const toggle = (label: string, value: any, onChange: (v: boolean) => void) => (
    <label key={label} className="flex items-center space-x-1.5 text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
      <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="h-3.5 w-3.5 text-indigo-600 rounded border-gray-300" />
      <span className="capitalize">{label.replace(/_/g, ' ')}</span>
    </label>
  );
  const select = (label: string, value: any, options: string[], onChange: (v: string) => void, allowEmpty = true) => (
    <div key={label}>
      <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{label.replace(/_/g, ' ')}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs">
        {allowEmpty && <option value="">Select</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  // Auto-render every scalar/boolean field of a spec section based on its keys.
  const renderSpecSection = (section: string) => {
    const obj = formData.specs[section] || {};
    const textKeys = Object.keys(obj).filter(k => typeof obj[k] !== 'boolean');
    const boolKeys = Object.keys(obj).filter(k => typeof obj[k] === 'boolean');
    return (
      <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {textKeys.map(k => input(k, obj[k], v => setSpec(section, k, v)))}
        </div>
        {boolKeys.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {boolKeys.map(k => toggle(k, obj[k], v => setSpec(section, k, v)))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-4 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/admin/vehicles" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit EV' : 'Add New EV'}</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button type="button" onClick={handleAIFill} disabled={isAIFilling} className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-sm">
            <Wand2 className="w-4 h-4 mr-2" />
            {isAIFilling ? 'AI Researching...' : 'Auto-fill with AI'}
          </button>
          <button type="button" onClick={onFormSubmit} disabled={isSubmitting} className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 text-sm">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save EV'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={onFormSubmit} className="space-y-8">
        {/* BASIC */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {duplicates.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl">
                  <span className="font-bold text-xs">Warning: Potential Duplicates Detected!</span>
                  <div className="text-xs space-y-1 mt-1">
                    {duplicates.map(d => <div key={d._id}>• <span className="font-semibold">{d.name}</span> — {d.status}</div>)}
                  </div>
                </div>
              )}
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Identity & Classification</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {input('Full Name (Brand + Model + Trim)', formData.name, v => setTop('name', v), 'text', 'e.g. BYD Seal Performance AWD')}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-600">Brand</label>
                      <button type="button" onClick={() => setShowAddBrand(v => !v)} className="text-[11px] font-semibold text-indigo-600 hover:underline">
                        {showAddBrand ? 'Cancel' : '+ New brand'}
                      </button>
                    </div>
                    {showAddBrand ? (
                      <div className="flex items-center space-x-2">
                        <input autoFocus value={newBrandName} onChange={e => setNewBrandName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBrand(); } }}
                          className="flex-1 px-2 py-1.5 border rounded-md text-xs" placeholder="New brand name (e.g. Deepal)" />
                        <button type="button" onClick={handleAddBrand} disabled={addingBrand}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold disabled:opacity-50">
                          {addingBrand ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    ) : (
                      <select value={formData.brand_slug} onChange={e => setTop('brand_slug', e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs">
                        <option value="">Select Brand</option>
                        {/* Keep an AI-filled or cloned slug visible even if it isn't seeded yet */}
                        {formData.brand_slug && !brands.some(b => b.slug === formData.brand_slug) && (
                          <option value={formData.brand_slug}>{formData.brand_slug} (unlisted)</option>
                        )}
                        {brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                      </select>
                    )}
                  </div>
                  {input('Model Name', formData.model_name, v => setTop('model_name', v), 'text', 'e.g. Seal')}
                  {input('Variant / Trim', formData.variant_name, v => setTop('variant_name', v), 'text', 'e.g. Performance AWD')}
                  {input('Model Year', formData.model_year, v => setTop('model_year', v), 'number')}
                  {input('Generation', formData.generation, v => setTop('generation', v))}
                  {select('EV Category', formData.ev_category, EV_CATEGORIES, v => setTop('ev_category', v), false)}
                  {select('Vehicle Type', formData.vehicle_type, VEHICLE_TYPES, v => setTop('vehicle_type', v), false)}
                  {select('Body Type', formData.body_type, BODY_TYPES, v => setTop('body_type', v))}
                  {input('Segment', formData.segment, v => setTop('segment', v), 'text', 'e.g. D-Segment')}
                  {input('Platform', formData.platform, v => setTop('platform', v), 'text', 'e.g. e-Platform 3.0')}
                  {input('Doors', formData.doors, v => setTop('doors', v), 'number')}
                  {input('Seats', formData.seats, v => setTop('seats', v), 'number')}
                  {select('Status', formData.status, STATUSES, v => setTop('status', v), false)}
                  {input('Announcement Date', formData.announcement_date, v => setTop('announcement_date', v), 'date')}
                  {input('Release Date', formData.release_date, v => setTop('release_date', v), 'date')}
                  {input('Assembly Country', formData.assembly_country, v => setTop('assembly_country', v))}
                  {input('Made In', formData.made_in, v => setTop('made_in', v))}
                  <ReferencePriceFields value={formData.price_usd} source={formData.price_usd_source} onPrice={v => setFormData((p: any) => ({ ...p, price_usd: v }))} onSource={v => setFormData((p: any) => ({ ...p, price_usd_source: v }))} />
                  {input('Header Price (PKR)', formData.price_pkr, v => setTop('price_pkr', v), 'number')}
                  {input('Video URL (YouTube)', formData.video_url, v => setTop('video_url', v))}
                  {input('Tags (comma separated)', formData.tags?.join(', ') || '', v => setTop('tags', v.split(',').map((t: string) => t.trim()).filter(Boolean)))}
                  {input('Country Availability (comma)', formData.country_availability, v => setTop('country_availability', v))}
                  {input('Competitor Slugs (comma)', formData.competitor_slugs, v => setTop('competitor_slugs', v))}
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Description (Markdown)</h3>
                <textarea value={formData.description || ''} onChange={e => setTop('description', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono bg-gray-50" rows={10} placeholder="Enter EV description in Markdown..." />
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Images</h3>
                <ImageUploader onImagesChange={(images) => setTop('images', images)} existingImages={formData.images} />
              </section>
            </div>
          </div>
        )}

        {activeTab === 'battery' && renderSpecSection('battery')}
        {activeTab === 'range' && renderSpecSection('range_and_efficiency')}
        {activeTab === 'charging' && renderSpecSection('charging')}
        {activeTab === 'powertrain' && renderSpecSection('powertrain')}
        {activeTab === 'dimensions' && renderSpecSection('dimensions_and_weight')}
        {activeTab === 'chassis' && renderSpecSection('chassis_and_suspension')}
        {activeTab === 'cockpit' && renderSpecSection('cockpit_and_tech')}
        {activeTab === 'adas' && renderSpecSection('adas_and_safety')}

        {/* PRICING */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Pricing, Taxation & Local Market</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(formData.pricing).map(k => input(k, formData.pricing[k], v => setGroup('pricing', k, v), k.includes('note') || k.includes('charger') || k.includes('adapter') ? 'text' : 'number'))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Mobile Rates Ratings (1.0 – 10.0)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.keys(formData.ratings).map(k => input(k, formData.ratings[k], v => setGroup('ratings', k, v), 'number'))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Retailer Prices</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                <input className="px-2 py-1.5 border rounded-md text-xs" placeholder="Retailer" value={newPrice.retailer_name} onChange={e => setNewPrice(p => ({ ...p, retailer_name: e.target.value }))} />
                <input className="px-2 py-1.5 border rounded-md text-xs" placeholder="Price PKR" value={newPrice.price_pkr} onChange={e => setNewPrice(p => ({ ...p, price_pkr: e.target.value }))} />
                <input className="px-2 py-1.5 border rounded-md text-xs" placeholder="Variant" value={newPrice.variant} onChange={e => setNewPrice(p => ({ ...p, variant: e.target.value }))} />
                <input className="px-2 py-1.5 border rounded-md text-xs" placeholder="Product URL" value={newPrice.product_url} onChange={e => setNewPrice(p => ({ ...p, product_url: e.target.value }))} />
                <button type="button" onClick={addPriceItem} className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold">Add</button>
              </div>
              <div className="space-y-2">
                {(formData.prices || []).map((pr: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-xs">
                    <span><span className="font-semibold">{pr.retailer_name}</span> — PKR {Number(pr.price_pkr).toLocaleString()} {pr.variant ? `(${pr.variant})` : ''}</span>
                    <button type="button" onClick={() => removePriceItem(i)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            {/* Google Indexing Toggle */}
            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Google Indexing</h3>
                  <p className="text-xs text-gray-500 mt-0.5">When turned off, this page will have a <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">noindex</code> meta tag and be excluded from the sitemap.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((p: any) => ({ ...p, seo: { ...p.seo, is_indexable: !p.seo.is_indexable } }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.seo.is_indexable ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.seo.is_indexable ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className={`mt-2 text-xs font-semibold ${formData.seo.is_indexable ? 'text-green-600' : 'text-red-500'}`}>
                {formData.seo.is_indexable ? '✓ Indexing enabled — search engines may index this page' : '✗ Noindex — search engines are asked not to index this page'}
              </div>
            </section>

            <div className="flex justify-end">
              <button type="button" onClick={handleAIFillSEO} disabled={isAIFillingSEO} className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-md disabled:opacity-50 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                {isAIFillingSEO ? 'Generating...' : 'Generate SEO with AI'}
              </button>
            </div>
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Manual SEO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['meta_title', 'meta_description', 'meta_keywords', 'focus_keyword', 'canonical_url', 'og_title', 'og_description', 'og_image'].map(k =>
                  input(k, formData.seo[k], v => setGroup('seo', k, v)))}
              </div>
            </section>
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">AI-Generated SEO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {input('ai_seo_title', formData.seo.ai_seo_title, v => setGroup('seo', 'ai_seo_title', v))}
                {input('ai_meta_description', formData.seo.ai_meta_description, v => setGroup('seo', 'ai_meta_description', v))}
                {input('ai_snippet', formData.seo.ai_snippet, v => setGroup('seo', 'ai_snippet', v))}
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">AI Editorial Summary</label>
                <textarea value={formData.seo.ai_editorial_summary || ''} onChange={e => setGroup('seo', 'ai_editorial_summary', e.target.value)} className="w-full px-3 py-2 border rounded-md text-xs" rows={4} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pros (one per line)</label>
                  <textarea value={(formData.seo.ai_pros || []).join('\n')} onChange={e => setGroup('seo', 'ai_pros', e.target.value.split('\n').filter(Boolean))} className="w-full px-3 py-2 border rounded-md text-xs" rows={5} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cons (one per line)</label>
                  <textarea value={(formData.seo.ai_cons || []).join('\n')} onChange={e => setGroup('seo', 'ai_cons', e.target.value.split('\n').filter(Boolean))} className="w-full px-3 py-2 border rounded-md text-xs" rows={5} />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">AI Buying Advice</label>
                <textarea value={formData.seo.ai_buying_advice || ''} onChange={e => setGroup('seo', 'ai_buying_advice', e.target.value)} className="w-full px-3 py-2 border rounded-md text-xs" rows={3} />
              </div>
            </section>
          </div>
        )}
      </form>
    </div>
  );
}
