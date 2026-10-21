"use client";
import ReferencePriceFields from "@/app/admin/components/ReferencePriceFields";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Wand2, Sparkles, Trash2, Plus, AlertCircle, Headphones } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ImageUploader from '../../../components/ImageUploader';

const WEARING_TYPES = ['In-Ear', 'Semi-In-Ear / Open-Ear', 'Earhook', 'Over-Ear / Neckband'];
const STATUSES = ['available', 'upcoming', 'discontinued', 'out_of_stock', 'rumored', 'released'];
const APPROVAL_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'];

const TABS = [
  'basic', 'audio', 'anc_mics', 'battery', 'connectivity', 'physical_controls', 'pricing', 'seo'
];

const emptyEarbud = () => ({
  name: '',
  brand_slug: '',
  model_number: '',
  release_date: '',
  description: '',
  status: 'available',
  wearing_type: 'In-Ear',
  colors: '',
  country_availability: '',
  made_in: '',
  tags: '',
  video_url: '',
  price_pkr: '', price_usd: '', price_usd_source: '',
  images: [] as any[],
  specs: {
    audio: {
      driver_type: '',
      driver_size_mm: '',
      frequency_min_hz: '20',
      frequency_max_hz: '20000',
      impedance_ohms: '',
      sensitivity_db: '',
      hi_res_audio: false,
      spatial_audio: '',
      sound_features: '',
    },
    noise_cancellation: {
      has_anc: false,
      anc_depth_db: '',
      anc_type: '',
      transparency_mode: false,
      enc_call_noise_reduction: true,
      mic_count_total: '',
      mic_count_per_earbud: '',
      wind_noise_reduction: false,
      mic_tech_features: '',
    },
    battery: {
      earbud_battery_mah: '',
      case_battery_mah: '',
      playtime_earbuds_anc_off_hrs: '',
      playtime_earbuds_anc_on_hrs: '',
      total_playtime_with_case_hrs: '',
      charging_port: 'USB Type-C',
      fast_charging: false,
      fast_charge_summary: '',
      earbud_charge_time_mins: '',
      case_charge_time_mins: '',
      wireless_charging: false,
    },
    connectivity: {
      bluetooth_version: '5.3',
      bluetooth_range_meters: '10',
      codecs: 'SBC, AAC',
      multipoint_pairing: false,
      google_fast_pair: false,
      low_latency_gaming_mode: false,
      latency_ms: '',
      app_support: '',
    },
    physical: {
      water_resistance: '',
      case_water_resistance: '',
      earbud_weight_g: '',
      case_weight_g: '',
      total_weight_g: '',
      earbud_dimensions_mm: '',
      case_dimensions_mm: '',
    },
    controls: {
      control_type: 'Touch Controls',
      volume_control: true,
      in_ear_detection: true,
      voice_assistant: '',
      extra_features: '',
    },
    in_the_box: '',
  },
  prices: [] as any[],
  seo: {
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    ai_seo_title: '',
    ai_meta_description: '',
    ai_faq: [] as { question: string; answer: string }[],
    ai_summary: '',
    ai_pros: [] as string[],
    ai_cons: [] as string[],
    ai_buying_advice: '',
    ai_snippet: '',
    ai_suggested_tags: [] as string[],
    ai_keywords: [] as string[],
    is_indexable: false,
  },
  approvalStatus: 'APPROVED',
  is_published: true,
});

interface AdminEarbudFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

export default function AdminEarbudForm({ initialData, onSubmit, isEditing = false }: AdminEarbudFormProps) {
  const router = useRouter();
  const [brands, setBrands] = useState<{ slug: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIFilling, setIsAIFilling] = useState(false);
  const [isAIFillingSEO, setIsAIFillingSEO] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  // New price entry state
  const [newPrice, setNewPrice] = useState({
    retailer_name: '',
    retailer_slug: '',
    price_pkr: '',
    variant: '',
    stock_status: 'available',
    product_url: ''
  });

  const [formData, setFormData] = useState<any>(() => {
    const base = emptyEarbud();
    if (!initialData) return base;

    const data = { ...initialData };
    if (Array.isArray(data.colors)) data.colors = data.colors.join(', ');
    if (Array.isArray(data.country_availability)) data.country_availability = data.country_availability.join(', ');
    if (Array.isArray(data.tags)) data.tags = data.tags.join(', ');

    const merged: any = {
      ...base,
      ...data,
      specs: { ...base.specs, ...(data.specs || {}) },
      seo: { ...base.seo, ...(data.seo || {}), is_indexable: isEditing && data.seo?.is_indexable === true },
    };

    for (const section of Object.keys(base.specs)) {
      if (section === 'in_the_box') continue;
      merged.specs[section] = {
        ...(base.specs as any)[section],
        ...((data.specs || {})[section] || {})
      };
    }

    // in_the_box handling
    if (Array.isArray(data.specs?.in_the_box)) {
      merged.specs.in_the_box = data.specs.in_the_box.map((x: any) => typeof x === 'object' ? Object.values(x).join(', ') : x).join(', ');
    } else if (data.specs?.in_the_box && typeof data.specs.in_the_box === 'object') {
      merged.specs.in_the_box = Object.values(data.specs.in_the_box).join(', ');
    } else {
      merged.specs.in_the_box = data.specs?.in_the_box || '';
    }

    // Convert array specs to comma strings for input fields
    const s = merged.specs;
    if (Array.isArray(s.audio?.sound_features)) s.audio.sound_features = s.audio.sound_features.join(', ');
    if (Array.isArray(s.noise_cancellation?.mic_tech_features)) s.noise_cancellation.mic_tech_features = s.noise_cancellation.mic_tech_features.join(', ');
    if (Array.isArray(s.connectivity?.codecs)) s.connectivity.codecs = s.connectivity.codecs.join(', ');
    if (Array.isArray(s.controls?.voice_assistant)) s.controls.voice_assistant = s.controls.voice_assistant.join(', ');
    if (Array.isArray(s.controls?.extra_features)) s.controls.extra_features = s.controls.extra_features.join(', ');

    return merged;
  });

  // Fetch earbud brands
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/brands?category=earbud`)
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data) setBrands(d.data);
      })
      .catch(console.error);
  }, []);

  // Fetch revisions if editing
  useEffect(() => {
    if (isEditing && initialData?._id) {
      setLoadingRevisions(true);
      const token = Cookies.get('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      fetch(`${apiUrl}/admin/earbuds/${initialData._id}/revisions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) setRevisions(d.data);
        })
        .catch(console.error)
        .finally(() => setLoadingRevisions(false));
    }
  }, [isEditing, initialData?._id]);

  // Updaters
  const setTop = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const setSpec = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      specs: {
        ...prev.specs,
        [section]: {
          ...prev.specs[section],
          [field]: value
        }
      }
    }));
  };

  const setSEO = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  // AI Fill specs
  const handleAIFill = async () => {
    if (!formData.name) {
      notify("Please enter an earbud name first (e.g. 'Sony WF-1000XM5')");
      return;
    }
    setIsAIFilling(true);
    try {
      const token = Cookies.get('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/admin/earbuds/ai-fill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          brand_slug: formData.brand_slug
        })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const ai = data.data;
        setFormData((prev: any) => {
          const merged = { ...prev };
          if (ai.brand_slug && !merged.brand_slug) merged.brand_slug = ai.brand_slug;
          if (ai.model_number && !merged.model_number) merged.model_number = ai.model_number;
          if (ai.wearing_type) merged.wearing_type = ai.wearing_type;
          if (ai.description && !merged.description) merged.description = ai.description;
          if (Array.isArray(ai.colors)) merged.colors = ai.colors.join(', ');
          if (Array.isArray(ai.tags)) merged.tags = ai.tags.join(', ');
          if (ai.price_pkr && !merged.price_pkr) merged.price_pkr = ai.price_pkr;

          if (ai.specs) {
            const s = ai.specs;
            merged.specs = {
              ...merged.specs,
              audio: {
                ...merged.specs.audio,
                ...(s.audio || {}),
                sound_features: Array.isArray(s.audio?.sound_features) ? s.audio.sound_features.join(', ') : (s.audio?.sound_features || merged.specs.audio.sound_features)
              },
              noise_cancellation: {
                ...merged.specs.noise_cancellation,
                ...(s.noise_cancellation || {}),
                mic_tech_features: Array.isArray(s.noise_cancellation?.mic_tech_features) ? s.noise_cancellation.mic_tech_features.join(', ') : (s.noise_cancellation?.mic_tech_features || merged.specs.noise_cancellation.mic_tech_features)
              },
              battery: {
                ...merged.specs.battery,
                ...(s.battery || {})
              },
              connectivity: {
                ...merged.specs.connectivity,
                ...(s.connectivity || {}),
                codecs: Array.isArray(s.connectivity?.codecs) ? s.connectivity.codecs.join(', ') : (s.connectivity?.codecs || merged.specs.connectivity.codecs)
              },
              physical: {
                ...merged.specs.physical,
                ...(s.physical || {})
              },
              controls: {
                ...merged.specs.controls,
                ...(s.controls || {}),
                voice_assistant: Array.isArray(s.controls?.voice_assistant) ? s.controls.voice_assistant.join(', ') : (s.controls?.voice_assistant || merged.specs.controls.voice_assistant),
                extra_features: Array.isArray(s.controls?.extra_features) ? s.controls.extra_features.join(', ') : (s.controls?.extra_features || merged.specs.controls.extra_features)
              },
              in_the_box: Array.isArray(s.in_the_box) ? s.in_the_box.join(', ') : (s.in_the_box || merged.specs.in_the_box)
            };
          }
          return merged;
        });
        notify("AI successfully researched and populated earbud specs!");
      } else {
        notify(`Failed to auto-fill: ${data.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      console.error(e);
      notify(`Error during AI auto-fill: ${e.message}`);
    } finally {
      setIsAIFilling(false);
    }
  };

  // AI Fill SEO
  const handleAIFillSEO = async () => {
    if (!formData.name) {
      notify("Please enter an earbud name first.");
      return;
    }
    setIsAIFillingSEO(true);
    try {
      const token = Cookies.get('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/admin/earbuds/ai-fill-seo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          brand_slug: formData.brand_slug,
          price_pkr: formData.price_pkr,
          specs: formData.specs
        })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const aiSEO = data.data;
        setFormData((prev: any) => ({
          ...prev,
          seo: {
            ...prev.seo,
            ai_seo_title: aiSEO.ai_seo_title || prev.seo.ai_seo_title,
            ai_meta_description: aiSEO.ai_meta_description || prev.seo.ai_meta_description,
            ai_suggested_tags: aiSEO.ai_suggested_tags || prev.seo.ai_suggested_tags,
            ai_keywords: aiSEO.ai_keywords || prev.seo.ai_keywords,
          }
        }));
        notify("AI successfully generated SEO content!");
      } else {
        notify(`Failed to auto-fill SEO: ${data.message}`);
      }
    } catch (e: any) {
      console.error(e);
      notify(`Error during AI SEO generation: ${e.message}`);
    } finally {
      setIsAIFillingSEO(false);
    }
  };

  // Add retailer price
  const handleAddPrice = () => {
    if (!newPrice.retailer_name || !newPrice.price_pkr) {
      notify("Please enter Retailer Name and Price");
      return;
    }
    const slug = newPrice.retailer_slug || newPrice.retailer_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const item = {
      retailer_name: newPrice.retailer_name,
      retailer_slug: slug,
      price_pkr: Number(newPrice.price_pkr),
      variant: newPrice.variant || '',
      stock_status: newPrice.stock_status || 'available',
      product_url: newPrice.product_url || ''
    };
    setFormData((prev: any) => ({
      ...prev,
      prices: [...(prev.prices || []), item]
    }));
    setNewPrice({
      retailer_name: '',
      retailer_slug: '',
      price_pkr: '',
      variant: '',
      stock_status: 'available',
      product_url: ''
    });
  };

  const handleRemovePrice = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      prices: prev.prices.filter((_: any, i: number) => i !== index)
    }));
  };

  // Helper to parse array inputs
  const parseList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.flatMap((item: any) => {
        if (typeof item === 'string') return [item.trim()];
        if (item && typeof item === 'object') return Object.values(item).map((v: any) => String(v).trim());
        return [];
      }).filter(Boolean);
    }
    if (typeof val === 'string') {
      return val.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (typeof val === 'object') {
      return Object.values(val).map((v: any) => String(v).trim()).filter(Boolean);
    }
    return [];
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      notify("Earbud Name is required");
      return;
    }
    if (!formData.brand_slug) {
      notify("Brand is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build clean payload
      const payload: any = {
        name: formData.name.trim(),
        brand_slug: formData.brand_slug.trim().toLowerCase().replace(/\s+/g, '-'),
        model_number: formData.model_number || undefined,
        release_date: formData.release_date || undefined,
        description: formData.description || undefined,
        status: formData.status || 'available',
        wearing_type: formData.wearing_type || 'In-Ear',
        colors: parseList(formData.colors),
        country_availability: parseList(formData.country_availability),
        made_in: formData.made_in || undefined,
        tags: parseList(formData.tags),
        video_url: formData.video_url || undefined,
        price_pkr: formData.price_pkr ? Number(formData.price_pkr) : null,
        price_usd: formData.price_usd === '' || formData.price_usd == null ? null : Number(formData.price_usd),
        price_usd_source: formData.price_usd_source || '',
        images: formData.images || [],
        prices: formData.prices || [],
        approvalStatus: formData.approvalStatus || 'APPROVED',
        is_published: !!formData.is_published,
        seo: {
          ...formData.seo,
          meta_keywords: typeof formData.seo?.meta_keywords === 'string' ? formData.seo.meta_keywords : undefined,
        },
        specs: {
          audio: {
            driver_type: formData.specs?.audio?.driver_type || undefined,
            driver_size_mm: formData.specs?.audio?.driver_size_mm ? Number(formData.specs.audio.driver_size_mm) : undefined,
            frequency_min_hz: formData.specs?.audio?.frequency_min_hz ? Number(formData.specs.audio.frequency_min_hz) : 20,
            frequency_max_hz: formData.specs?.audio?.frequency_max_hz ? Number(formData.specs.audio.frequency_max_hz) : 20000,
            impedance_ohms: formData.specs?.audio?.impedance_ohms ? Number(formData.specs.audio.impedance_ohms) : undefined,
            sensitivity_db: formData.specs?.audio?.sensitivity_db ? Number(formData.specs.audio.sensitivity_db) : undefined,
            hi_res_audio: !!formData.specs?.audio?.hi_res_audio,
            spatial_audio: formData.specs?.audio?.spatial_audio || undefined,
            sound_features: parseList(formData.specs?.audio?.sound_features),
          },
          noise_cancellation: {
            has_anc: !!formData.specs?.noise_cancellation?.has_anc,
            anc_depth_db: formData.specs?.noise_cancellation?.anc_depth_db ? Number(formData.specs.noise_cancellation.anc_depth_db) : undefined,
            anc_type: formData.specs?.noise_cancellation?.anc_type || undefined,
            transparency_mode: !!formData.specs?.noise_cancellation?.transparency_mode,
            enc_call_noise_reduction: !!formData.specs?.noise_cancellation?.enc_call_noise_reduction,
            mic_count_total: formData.specs?.noise_cancellation?.mic_count_total ? Number(formData.specs.noise_cancellation.mic_count_total) : undefined,
            mic_count_per_earbud: formData.specs?.noise_cancellation?.mic_count_per_earbud ? Number(formData.specs.noise_cancellation.mic_count_per_earbud) : undefined,
            wind_noise_reduction: !!formData.specs?.noise_cancellation?.wind_noise_reduction,
            mic_tech_features: parseList(formData.specs?.noise_cancellation?.mic_tech_features),
          },
          battery: {
            earbud_battery_mah: formData.specs?.battery?.earbud_battery_mah ? Number(formData.specs.battery.earbud_battery_mah) : undefined,
            case_battery_mah: formData.specs?.battery?.case_battery_mah ? Number(formData.specs.battery.case_battery_mah) : undefined,
            playtime_earbuds_anc_off_hrs: formData.specs?.battery?.playtime_earbuds_anc_off_hrs ? Number(formData.specs.battery.playtime_earbuds_anc_off_hrs) : undefined,
            playtime_earbuds_anc_on_hrs: formData.specs?.battery?.playtime_earbuds_anc_on_hrs ? Number(formData.specs.battery.playtime_earbuds_anc_on_hrs) : undefined,
            total_playtime_with_case_hrs: formData.specs?.battery?.total_playtime_with_case_hrs ? Number(formData.specs.battery.total_playtime_with_case_hrs) : undefined,
            charging_port: formData.specs?.battery?.charging_port || 'USB Type-C',
            fast_charging: !!formData.specs?.battery?.fast_charging,
            fast_charge_summary: formData.specs?.battery?.fast_charge_summary || undefined,
            earbud_charge_time_mins: formData.specs?.battery?.earbud_charge_time_mins ? Number(formData.specs.battery.earbud_charge_time_mins) : undefined,
            case_charge_time_mins: formData.specs?.battery?.case_charge_time_mins ? Number(formData.specs.battery.case_charge_time_mins) : undefined,
            wireless_charging: !!formData.specs?.battery?.wireless_charging,
          },
          connectivity: {
            bluetooth_version: formData.specs?.connectivity?.bluetooth_version || undefined,
            bluetooth_range_meters: formData.specs?.connectivity?.bluetooth_range_meters ? Number(formData.specs.connectivity.bluetooth_range_meters) : 10,
            codecs: parseList(formData.specs?.connectivity?.codecs),
            multipoint_pairing: !!formData.specs?.connectivity?.multipoint_pairing,
            google_fast_pair: !!formData.specs?.connectivity?.google_fast_pair,
            low_latency_gaming_mode: !!formData.specs?.connectivity?.low_latency_gaming_mode,
            latency_ms: formData.specs?.connectivity?.latency_ms ? Number(formData.specs.connectivity.latency_ms) : undefined,
            app_support: formData.specs?.connectivity?.app_support || undefined,
          },
          physical: {
            water_resistance: formData.specs?.physical?.water_resistance || undefined,
            case_water_resistance: formData.specs?.physical?.case_water_resistance || undefined,
            earbud_weight_g: formData.specs?.physical?.earbud_weight_g ? Number(formData.specs.physical.earbud_weight_g) : undefined,
            case_weight_g: formData.specs?.physical?.case_weight_g ? Number(formData.specs.physical.case_weight_g) : undefined,
            total_weight_g: formData.specs?.physical?.total_weight_g ? Number(formData.specs.physical.total_weight_g) : undefined,
            earbud_dimensions_mm: formData.specs?.physical?.earbud_dimensions_mm || undefined,
            case_dimensions_mm: formData.specs?.physical?.case_dimensions_mm || undefined,
          },
          controls: {
            control_type: formData.specs?.controls?.control_type || 'Touch Controls',
            volume_control: !!formData.specs?.controls?.volume_control,
            in_ear_detection: !!formData.specs?.controls?.in_ear_detection,
            voice_assistant: parseList(formData.specs?.controls?.voice_assistant),
            extra_features: parseList(formData.specs?.controls?.extra_features),
          },
          in_the_box: parseList(formData.specs?.in_the_box),
        }
      };

      await onSubmit(payload);
    } catch (err: any) {
      console.error(err);
      notify(`Error submitting form: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      {/* Top Header Sticky Bar */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-4 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/admin/earbuds" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Headphones className="w-6 h-6 text-amber-500" />
              {isEditing ? `Edit ${formData.name || 'Earbuds'}` : 'Add New Wireless Earbuds'}
            </h2>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleAIFill}
            disabled={isAIFilling}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-xs font-semibold shadow-sm transition-all"
          >
            <Wand2 className="w-4 h-4 mr-1.5" />
            {isAIFilling ? 'AI Researching...' : 'Auto-fill with AI'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md disabled:opacity-50 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Saving...' : 'Save Earbuds'}
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
        {isEditing && (
          <button
            type="button"
            onClick={() => setActiveTab('revisions')}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'revisions' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Revisions
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: BASIC */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b pb-2">General Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Earbud Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sony WF-1000XM5"
                      value={formData.name}
                      onChange={e => setTop('name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Audionic, Sony, Soundpeats, Apple"
                      value={formData.brand_slug}
                      onChange={e => setTop('brand_slug', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Model Number</label>
                    <input
                      type="text"
                      placeholder="e.g. YY2963"
                      value={formData.model_number}
                      onChange={e => setTop('model_number', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Wearing Type</label>
                    <select
                      value={formData.wearing_type}
                      onChange={e => setTop('wearing_type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500 bg-white"
                    >
                      {WEARING_TYPES.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Release Date</label>
                    <input
                      type="date"
                      value={formData.release_date ? new Date(formData.release_date).toISOString().split('T')[0] : ''}
                      onChange={e => setTop('release_date', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <ReferencePriceFields value={formData.price_usd} source={formData.price_usd_source} onPrice={v => setFormData((p: any) => ({ ...p, price_usd: v }))} onSource={v => setFormData((p: any) => ({ ...p, price_usd_source: v }))} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Headline Price (PKR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 64999"
                      value={formData.price_pkr}
                      onChange={e => setTop('price_pkr', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Availability Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setTop('status', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500 bg-white"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Colors (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Black, Silver, White"
                      value={formData.colors}
                      onChange={e => setTop('colors', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Made In</label>
                    <input
                      type="text"
                      placeholder="e.g. China, Vietnam, Malaysia"
                      value={formData.made_in}
                      onChange={e => setTop('made_in', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="ANC, Wireless Charging, Hi-Res, Flagship"
                      value={formData.tags}
                      onChange={e => setTop('tags', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Video Review URL (YouTube)</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.video_url}
                      onChange={e => setTop('video_url', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-2">
                <h3 className="text-base font-bold text-gray-900 border-b pb-2">Description / Editorial Review</h3>
                <textarea
                  rows={8}
                  placeholder="Enter detailed review, pros/cons, sound quality description..."
                  value={formData.description}
                  onChange={e => setTop('description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </section>
            </div>

            {/* Sidebar Column: Images & Publishing */}
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3">Product Images</h3>
                <ImageUploader
                  onImagesChange={(images) => setTop('images', images)}
                  existingImages={formData.images}
                />
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 mb-2">Publishing & Approval</h3>
                <div>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.is_published}
                      onChange={e => setTop('is_published', e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Publish Immediately</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Approval Workflow Status</label>
                  <select
                    value={formData.approvalStatus}
                    onChange={e => setTop('approvalStatus', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-xs bg-white focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    {APPROVAL_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIO */}
        {activeTab === 'audio' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">Audio & Acoustic Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Driver Type</label>
                <input
                  type="text"
                  placeholder="e.g. Dynamic Driver X, Coaxial Dual Driver"
                  value={formData.specs?.audio?.driver_type || ''}
                  onChange={e => setSpec('audio', 'driver_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Driver Size (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 11"
                  value={formData.specs?.audio?.driver_size_mm || ''}
                  onChange={e => setSpec('audio', 'driver_size_mm', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Impedance (ohms)</label>
                <input
                  type="number"
                  placeholder="e.g. 32"
                  value={formData.specs?.audio?.impedance_ohms || ''}
                  onChange={e => setSpec('audio', 'impedance_ohms', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Min Frequency (Hz)</label>
                <input
                  type="number"
                  placeholder="20"
                  value={formData.specs?.audio?.frequency_min_hz || ''}
                  onChange={e => setSpec('audio', 'frequency_min_hz', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Max Frequency (Hz)</label>
                <input
                  type="number"
                  placeholder="20000"
                  value={formData.specs?.audio?.frequency_max_hz || ''}
                  onChange={e => setSpec('audio', 'frequency_max_hz', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sensitivity (dB)</label>
                <input
                  type="number"
                  placeholder="e.g. 105"
                  value={formData.specs?.audio?.sensitivity_db || ''}
                  onChange={e => setSpec('audio', 'sensitivity_db', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Spatial Audio Technology</label>
                <input
                  type="text"
                  placeholder="e.g. 360 Reality Audio, Spatial Audio with Head Tracking"
                  value={formData.specs?.audio?.spatial_audio || ''}
                  onChange={e => setSpec('audio', 'spatial_audio', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.audio?.hi_res_audio}
                    onChange={e => setSpec('audio', 'hi_res_audio', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Hi-Res Audio Wireless Certified</span>
                </label>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sound Features (comma separated)</label>
                <input
                  type="text"
                  placeholder="Custom EQ, Bass Boost+, DSEE Extreme, Adaptive Sound"
                  value={formData.specs?.audio?.sound_features || ''}
                  onChange={e => setSpec('audio', 'sound_features', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ANC & MICS */}
        {activeTab === 'anc_mics' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">Noise Cancellation & Microphones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.noise_cancellation?.has_anc}
                    onChange={e => setSpec('noise_cancellation', 'has_anc', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span className="text-sm font-bold text-gray-900">Active Noise Cancellation (ANC)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ANC Depth (dB)</label>
                <input
                  type="number"
                  placeholder="e.g. 48"
                  value={formData.specs?.noise_cancellation?.anc_depth_db || ''}
                  onChange={e => setSpec('noise_cancellation', 'anc_depth_db', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ANC Type / Technology</label>
                <input
                  type="text"
                  placeholder="e.g. Adaptive Hybrid ANC, Dual Noise Sensor"
                  value={formData.specs?.noise_cancellation?.anc_type || ''}
                  onChange={e => setSpec('noise_cancellation', 'anc_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.noise_cancellation?.transparency_mode}
                    onChange={e => setSpec('noise_cancellation', 'transparency_mode', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Transparency / Ambient Mode</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.noise_cancellation?.enc_call_noise_reduction}
                    onChange={e => setSpec('noise_cancellation', 'enc_call_noise_reduction', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>ENC Call Noise Reduction</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.noise_cancellation?.wind_noise_reduction}
                    onChange={e => setSpec('noise_cancellation', 'wind_noise_reduction', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Wind Noise Reduction</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Total Mic Count</label>
                <input
                  type="number"
                  placeholder="e.g. 6"
                  value={formData.specs?.noise_cancellation?.mic_count_total || ''}
                  onChange={e => setSpec('noise_cancellation', 'mic_count_total', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mics Per Earbud</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={formData.specs?.noise_cancellation?.mic_count_per_earbud || ''}
                  onChange={e => setSpec('noise_cancellation', 'mic_count_per_earbud', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Microphone Tech Features (comma separated)</label>
                <input
                  type="text"
                  placeholder="AI DNN algorithm, Bone conduction sensor, Precision voice pickup"
                  value={formData.specs?.noise_cancellation?.mic_tech_features || ''}
                  onChange={e => setSpec('noise_cancellation', 'mic_tech_features', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BATTERY & CHARGING */}
        {activeTab === 'battery' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">Battery Stamina & Charging</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Earbud Battery (mAh)</label>
                <input
                  type="number"
                  placeholder="e.g. 55"
                  value={formData.specs?.battery?.earbud_battery_mah || ''}
                  onChange={e => setSpec('battery', 'earbud_battery_mah', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Charging Case Battery (mAh)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.specs?.battery?.case_battery_mah || ''}
                  onChange={e => setSpec('battery', 'case_battery_mah', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Playtime ANC Off (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 10"
                  value={formData.specs?.battery?.playtime_earbuds_anc_off_hrs || ''}
                  onChange={e => setSpec('battery', 'playtime_earbuds_anc_off_hrs', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Playtime ANC On (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 7"
                  value={formData.specs?.battery?.playtime_earbuds_anc_on_hrs || ''}
                  onChange={e => setSpec('battery', 'playtime_earbuds_anc_on_hrs', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Total Playtime with Case (hrs)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 40"
                  value={formData.specs?.battery?.total_playtime_with_case_hrs || ''}
                  onChange={e => setSpec('battery', 'total_playtime_with_case_hrs', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Charging Port</label>
                <input
                  type="text"
                  placeholder="USB Type-C"
                  value={formData.specs?.battery?.charging_port || 'USB Type-C'}
                  onChange={e => setSpec('battery', 'charging_port', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Earbud Charge Time (mins)</label>
                <input
                  type="number"
                  placeholder="e.g. 60"
                  value={formData.specs?.battery?.earbud_charge_time_mins || ''}
                  onChange={e => setSpec('battery', 'earbud_charge_time_mins', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Case Charge Time (mins)</label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={formData.specs?.battery?.case_charge_time_mins || ''}
                  onChange={e => setSpec('battery', 'case_charge_time_mins', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.battery?.fast_charging}
                    onChange={e => setSpec('battery', 'fast_charging', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Fast Charging</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.battery?.wireless_charging}
                    onChange={e => setSpec('battery', 'wireless_charging', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Qi Wireless Charging</span>
                </label>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fast Charge Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 10 mins charge = 2 hours playtime"
                  value={formData.specs?.battery?.fast_charge_summary || ''}
                  onChange={e => setSpec('battery', 'fast_charge_summary', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONNECTIVITY */}
        {activeTab === 'connectivity' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">Bluetooth & Connectivity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bluetooth Version</label>
                <input
                  type="text"
                  placeholder="e.g. 5.3"
                  value={formData.specs?.connectivity?.bluetooth_version || ''}
                  onChange={e => setSpec('connectivity', 'bluetooth_version', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Range (meters)</label>
                <input
                  type="number"
                  placeholder="10"
                  value={formData.specs?.connectivity?.bluetooth_range_meters || ''}
                  onChange={e => setSpec('connectivity', 'bluetooth_range_meters', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Latency (ms)</label>
                <input
                  type="number"
                  placeholder="e.g. 55"
                  value={formData.specs?.connectivity?.latency_ms || ''}
                  onChange={e => setSpec('connectivity', 'latency_ms', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bluetooth Codecs (comma separated)</label>
                <input
                  type="text"
                  placeholder="SBC, AAC, LDAC, LC3, aptX Adaptive"
                  value={formData.specs?.connectivity?.codecs || ''}
                  onChange={e => setSpec('connectivity', 'codecs', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Official Mobile App</label>
                <input
                  type="text"
                  placeholder="e.g. Sony Headphones Connect"
                  value={formData.specs?.connectivity?.app_support || ''}
                  onChange={e => setSpec('connectivity', 'app_support', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-4 md:col-span-3 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.connectivity?.multipoint_pairing}
                    onChange={e => setSpec('connectivity', 'multipoint_pairing', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Dual Device Multipoint Connection</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.connectivity?.google_fast_pair}
                    onChange={e => setSpec('connectivity', 'google_fast_pair', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Google Fast Pair / Swift Pair</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.connectivity?.low_latency_gaming_mode}
                    onChange={e => setSpec('connectivity', 'low_latency_gaming_mode', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Low Latency Gaming Mode</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PHYSICAL & CONTROLS */}
        {activeTab === 'physical_controls' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">Physical Specifications & Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Earbud IP Rating</label>
                <input
                  type="text"
                  placeholder="e.g. IP54, IPX4, IP57"
                  value={formData.specs?.physical?.water_resistance || ''}
                  onChange={e => setSpec('physical', 'water_resistance', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Case IP Rating</label>
                <input
                  type="text"
                  placeholder="e.g. IPX2"
                  value={formData.specs?.physical?.case_water_resistance || ''}
                  onChange={e => setSpec('physical', 'case_water_resistance', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Earbud Weight (g)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 4.8"
                  value={formData.specs?.physical?.earbud_weight_g || ''}
                  onChange={e => setSpec('physical', 'earbud_weight_g', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Case Weight (g)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 42"
                  value={formData.specs?.physical?.case_weight_g || ''}
                  onChange={e => setSpec('physical', 'case_weight_g', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Total Weight (g)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 51.6"
                  value={formData.specs?.physical?.total_weight_g || ''}
                  onChange={e => setSpec('physical', 'total_weight_g', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Control Type</label>
                <input
                  type="text"
                  placeholder="Touch Controls / Force Sensor"
                  value={formData.specs?.controls?.control_type || 'Touch Controls'}
                  onChange={e => setSpec('controls', 'control_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.controls?.volume_control}
                    onChange={e => setSpec('controls', 'volume_control', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Volume Control on Buds</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.specs?.controls?.in_ear_detection}
                    onChange={e => setSpec('controls', 'in_ear_detection', e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>In-Ear Wear Detection (Auto-Pause)</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Voice Assistants (comma separated)</label>
                <input
                  type="text"
                  placeholder="Siri, Google Assistant, Alexa"
                  value={formData.specs?.controls?.voice_assistant || ''}
                  onChange={e => setSpec('controls', 'voice_assistant', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Items In The Box (comma separated)</label>
                <input
                  type="text"
                  placeholder="Earbuds (L/R), Charging Case, S/M/L Silicone Tips, Type-C Cable, Manual"
                  value={formData.specs?.in_the_box || ''}
                  onChange={e => setTop('specs', { ...formData.specs, in_the_box: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PRICING */}
        {activeTab === 'pricing' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">Multi-Retailer Price Comparison</h3>
            
            {/* List of current retailer prices */}
            {formData.prices && formData.prices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600 font-semibold">
                      <th className="py-2 px-3">Retailer</th>
                      <th className="py-2 px-3">Price (PKR)</th>
                      <th className="py-2 px-3">Stock Status</th>
                      <th className="py-2 px-3">Variant</th>
                      <th className="py-2 px-3">Store URL</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.prices.map((p: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50/50">
                        <td className="py-2 px-3 font-semibold text-gray-900">{p.retailer_name}</td>
                        <td className="py-2 px-3 font-bold text-gray-900">Rs. {Number(p.price_pkr).toLocaleString()}</td>
                        <td className="py-2 px-3 capitalize text-gray-600">{p.stock_status || 'available'}</td>
                        <td className="py-2 px-3 text-gray-600">{p.variant || '-'}</td>
                        <td className="py-2 px-3 text-gray-500 font-mono text-[10px] max-w-xs truncate">{p.product_url || '-'}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemovePrice(idx)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No retailer prices added yet.</p>
            )}

            {/* Add new retailer price card */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Add Retailer Price</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Retailer Name (e.g. PriceOye, Daraz)</label>
                  <input
                    type="text"
                    placeholder="PriceOye"
                    value={newPrice.retailer_name}
                    onChange={e => setNewPrice(p => ({ ...p, retailer_name: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    placeholder="64999"
                    value={newPrice.price_pkr}
                    onChange={e => setNewPrice(p => ({ ...p, price_pkr: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Stock Status</label>
                  <select
                    value={newPrice.stock_status}
                    onChange={e => setNewPrice(p => ({ ...p, stock_status: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="available">Available / In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Variant (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Black / USB-C"
                    value={newPrice.variant}
                    onChange={e => setNewPrice(p => ({ ...p, variant: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Product URL</label>
                  <input
                    type="url"
                    placeholder="https://priceoye.pk/..."
                    value={newPrice.product_url}
                    onChange={e => setNewPrice(p => ({ ...p, product_url: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddPrice}
                  className="flex items-center px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Price
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SEO & AI */}
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

            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">SEO & Search Engine Presence</h3>
                  <p className="text-xs text-gray-500">Configure title tags, meta descriptions, and AI generated rich snippets.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAIFillSEO}
                  disabled={isAIFillingSEO}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  {isAIFillingSEO ? 'Generating...' : 'Auto-fill SEO with AI'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Manual Meta Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony WF-1000XM5 Price & Specs"
                    value={formData.seo?.meta_title || ''}
                    onChange={e => setSEO('meta_title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {(formData.seo?.meta_title || '').length}/60 characters
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-700 mb-1">AI Generated SEO Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony WF-1000XM5 Price & Full Specs 2026"
                    value={formData.seo?.ai_seo_title || ''}
                    onChange={e => setSEO('ai_seo_title', e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-md text-xs focus:outline-none focus:border-indigo-500 bg-indigo-50/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    placeholder="Check latest Sony WF-1000XM5 wireless earbuds price..."
                    value={formData.seo?.meta_description || ''}
                    onChange={e => setSEO('meta_description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {(formData.seo?.meta_description || '').length}/160 characters
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-indigo-700 mb-1">AI Meta Description</label>
                  <textarea
                    rows={2}
                    placeholder="Compelling description generated by AI..."
                    value={formData.seo?.ai_meta_description || ''}
                    onChange={e => setSEO('ai_meta_description', e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-md text-xs focus:outline-none focus:border-indigo-500 bg-indigo-50/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Focus Keyword</label>
                  <input
                    type="text"
                    placeholder="e.g. sony wf-1000xm5 price"
                    value={formData.seo?.focus_keyword || ''}
                    onChange={e => setSEO('focus_keyword', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Canonical URL</label>
                  <input
                    type="url"
                    placeholder="https://mobilerates.info/sony-wf-1000xm5"
                    value={formData.seo?.canonical_url || ''}
                    onChange={e => setSEO('canonical_url', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 9: REVISIONS (Edit Mode) */}
        {activeTab === 'revisions' && isEditing && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2">Revision & Audit History</h3>
            {loadingRevisions ? (
              <div className="text-xs text-gray-500">Loading revisions...</div>
            ) : revisions.length === 0 ? (
              <div className="text-xs text-gray-500">No revisions recorded for this earbud.</div>
            ) : (
              <div className="space-y-3">
                {revisions.map(rev => (
                  <div key={rev._id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-xs">
                    <div className="flex items-center justify-between font-semibold text-gray-900">
                      <span>{rev.changedBy?.name || 'System'} ({rev.changedBy?.role || 'SYSTEM'})</span>
                      <span className="text-gray-400 font-normal">{new Date(rev.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-indigo-600 font-semibold mt-1">
                      Action: {rev.action}
                    </div>
                    {rev.note && (
                      <div className="text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 mt-1">
                        Note: {rev.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
