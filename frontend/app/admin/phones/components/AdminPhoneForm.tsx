"use client";
import ReferencePriceFields from "@/app/admin/components/ReferencePriceFields";
import { notify } from "@/app/lib/notifications";


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Wand2, Search, ExternalLink, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ImageUploader from '../../../components/ImageUploader';
import AdminPhoneComments from './AdminPhoneComments';
import MarkdownEditor from '../../../components/MarkdownEditor';

const EXTRA_SPEC_FIELDS = [
  'dimensions', 'weight', 'build', 'sim', 'type', 'size', 'resolution',
  'protection', 'os', 'chipset', 'cpu', 'gpu', 'card slot', 'internal',
  'triple', 'features', 'video', 'single', 'loudspeaker', '3_5mm_jack',
  'wlan', 'bluetooth', 'positioning', 'nfc', 'radio', 'usb', 'sensors',
  'charging', 'colors', 'models', 'sar', 'sar eu', 'price'
];

const DISPLAY_FEATURES = ["OLED", "AMOLED", "POLED", "LCD", "IPS", "LTPO", "Mini LED", "Foldable"];
const VIDEO_FEATURES = ["8K", "4K", "HDR", "Dolby Vision", "Slow Motion", "Time Lapse", "Night Video", "Director Mode", "LOG", "Pro Video"];
const SIM_TYPES = ["Single", "Dual", "Triple", "Nano", "eSIM", "Hybrid"];
const NETWORK_FEATURES = ["2G", "3G", "4G", "5G", "VoLTE", "VoWiFi", "SA", "NSA", "Satellite", "Bands"];
const AI_FEATURES_LIST = ["Circle To Search", "Gemini", "Galaxy AI", "Apple Intelligence", "Live Translate", "Magic Eraser", "AI Photo", "AI Video", "AI Call", "AI Notes", "AI Writing", "AI Wallpaper", "AI Voice", "AI Search", "AI Assistant", "AI Summary", "AI Interpreter"];

const DEFAULT_EXTRA_SPECS = {
  price_section: { store_name: "", store_logo: "", store_url: "", affiliate_url: "", current_price: "", old_price: "", discount_percent: "", coupon: "", cashback: "", cod: false, warranty: "", delivery_time: "", stock_status: "In Stock", price_source: "" },
  features_listing: { display_features: [], pixels: "", ppi: "", aspect_ratio: "", touch_sampling: "", hdr: false, hdr10: false, hdr10_plus: false, dolby_vision: false, always_on_display: false, screen_to_body: "", color_depth: "", pwm: "", screen_design: "Flat/Curved", notch_type: "Dynamic Island/Punch Hole/Notch/Waterdrop" },
  processor: { brand: "", fabrication: "", cpu_name: "", cpu_clock: "", cpu_cores: "", gpu_clock: "", ai_engine: "", npu: "", isp: "" },
  ram_storage: { ram_type: "", ram_speed: "", storage_type: "", max_expansion: "" },
  cameras_detailed: { sensor_name: "", mp: "", aperture: "", ois: false, eis: false, pdaf: false, laser_af: false, focal_length: "", pixel_size: "", sensor_size: "", lens_type: "", features: "" },
  video_recording_features: [],
  battery_detailed: { type: "Li-Ion", removable: false, reverse_charging: false, pd: false, pps: false, charger_included: false },
  body_detailed: { frame: "", back_material: "", ip_rating: "", mil_std: "" },
  sim_detailed: { types: [] },
  network_detailed: { features: [] },
  connectivity_detailed: { wifi: "", infrared: false, gps: "", glonass: false, otg: false, uwb: false, fm: false, headphone_jack: false },
  audio: { stereo: false, dolby: false, hi_res: false, snapdragon_sound: false, speakers: "", microphones: "" },
  sensors: { fingerprint: "Under display, optical/ultrasonic", face_unlock: false, accelerometer: false, compass: false, gyroscope: false, barometer: false, hall_sensor: false, ambient_light: false, proximity: false },
  software: { ui: "", security_patch: "", upgrade_promise: "", years_updates: "", bootloader: "", rootable: false },
  ai_features: [],
  benchmarks: { antutu: "", geekbench: "", "3dmark": "", pcmark: "", gfxbench: "", ai_benchmark: "", dxomark: "", battery_test: "", charging_test: "" },
  gaming: { pubg_fps: "", cod_fps: "", free_fire_fps: "", genshin_fps: "", heating: "", throttle: "", cooling: "", game_mode: false, triggers: false },
  ai_generated_content: { ai_summary: "", ai_pros: "", ai_cons: "", ai_verdict: "", ai_comparison: "", ai_buying_advice: "", ai_faq: "", ai_meta_title: "", ai_meta_description: "", ai_keywords: "", ai_highlights: "" },
  seo: { slug: "", canonical: "", og_title: "", og_image: "", twitter_card: "", schema: "", breadcrumb: "", faq_schema: false, review_schema: false },
  affiliate: { commission_percent: "", geo_redirect: false, deep_link: "" },
  moderation: { fact_checked: false, verified_specs: false, ai_verified: true, editor_approved: false },
  ai_automation: { auto_summary: true, auto_pros_cons: true, auto_buying_advice: true, auto_faqs: true, auto_comparison: true, auto_seo_title: true, auto_meta_description: true, auto_alt_text: true, auto_tag: true, auto_categorize: true, auto_link_related: true, auto_detect_duplicate: true, auto_calc_value: true, auto_recalc_score: true, auto_extract_specs: true, auto_schema: true },
  colors: ""
};

export default function AdminPhoneForm({ initialData, onSubmit, isEditing = false }: { initialData?: any, onSubmit: (data: any) => Promise<void>, isEditing?: boolean }) {
  const router = useRouter();
  const [brands, setBrands] = useState<{ slug: string, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIFilling, setIsAIFilling] = useState(false);
  const [isAIFillingSEO, setIsAIFillingSEO] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchResults, setResearchResults] = useState<any>(null);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'ai_content', 'detailed_specs', 'seo'
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [addingBrand, setAddingBrand] = useState(false);

  const [newPrice, setNewPrice] = useState({
    retailer_name: '',
    price_pkr: '',
    stock_status: 'available',
    product_url: '',
    variant: ''
  });

  const addPriceItem = () => {
    if (!newPrice.retailer_name || !newPrice.price_pkr) {
      notify("Retailer Name and Price are required.");
      return;
    }
    const priceNum = Number(newPrice.price_pkr);
    if (isNaN(priceNum)) {
      notify("Price must be a valid number.");
      return;
    }

    const itemToAdd = {
      retailer_name: newPrice.retailer_name,
      retailer_slug: newPrice.retailer_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price_pkr: priceNum,
      stock_status: newPrice.stock_status,
      product_url: newPrice.product_url || undefined,
      variant: newPrice.variant || undefined
    };

    setFormData((p: any) => ({
      ...p,
      prices: [...(p.prices || []), itemToAdd]
    }));

    setNewPrice({
      retailer_name: '',
      price_pkr: '',
      stock_status: 'available',
      product_url: '',
      variant: ''
    });
  };

  const removePriceItem = (index: number) => {
    setFormData((p: any) => ({
      ...p,
      prices: (p.prices || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const [formData, setFormData] = useState<any>(() => {
    const defaultData = {
      name: '', brand_slug: '', model_number: '', release_date: '', status: 'available', images: [] as any[], price_pkr: '', price_usd: '', price_usd_source: '',
      series: '', category: '', subcategory: '', country_availability: '', carrier_version: '', region_version: '', manufacturer: '', made_in: '', tags: [] as string[], video_url: '',
      specs: {
        display: { size_inches: '', resolution: '', type: '', refresh_rate_hz: '', protection: '', peak_brightness_nits: '', features: [] },
        performance: { chipset: '', cpu: '', gpu: '', ram_options_gb: '', storage_options_gb: '', expandable_storage: false },
        camera: { rear_summary: '', front_summary: '', video_recording: '', video_features: [] },
        battery: { capacity_mah: '', charging_watts: '', fast_charging: false, wireless_charging: false },
        body: { height_mm: '', width_mm: '', thickness_mm: '', weight_g: '', materials: '', water_resistance: '' },
        connectivity: { network: '', sim: '', usb: '', bluetooth: '', nfc: false, network_features: [], sim_types: [] },
        os: '',
        ai_features: [],
        extra_specs: { ...EXTRA_SPEC_FIELDS.reduce((acc, field) => ({ ...acc, [field]: '' }), {}), ...DEFAULT_EXTRA_SPECS }
      },
      prices: [] as any[], seo: { meta_title: '', meta_description: '', meta_keywords: '', focus_keyword: '', long_tail_keywords: [] as string[], canonical_url: '', og_title: '', og_description: '', og_image: '', ai_seo_title: '', ai_meta_description: '', ai_faq: [] as any[], ai_summary: '', ai_pros: [] as string[], ai_cons: [] as string[], ai_buying_advice: '', ai_snippet: '', ai_suggested_tags: [] as string[], ai_keywords: [] as string[], is_indexable: false }, is_published: false
    };

    if (initialData) {
      const dataToLoad = { ...initialData };
      if (Array.isArray(dataToLoad.country_availability)) {
        dataToLoad.country_availability = dataToLoad.country_availability.join(', ');
      }
      return {
        ...defaultData,
        ...dataToLoad,
        seo: { ...defaultData.seo, ...(dataToLoad.seo || {}), is_indexable: isEditing && dataToLoad.seo?.is_indexable === true },
        specs: {
          ...defaultData.specs,
          ...dataToLoad.specs,
          extra_specs: {
            ...defaultData.specs.extra_specs,
            ...(dataToLoad.specs?.extra_specs || {})
          }
        }
      };
    }
    return defaultData;
  });

  const fetchBrands = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return fetch(`${apiUrl}/brands`)
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/admin/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, type: 'phone' })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        await fetchBrands();
        setFormData((p: any) => ({ ...p, brand_slug: data.data.slug }));
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

  // Duplicate checker & Revisions state
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  const checkDuplicate = async (nameVal: string, modelVal: string) => {
    if (!nameVal && !modelVal) return;
    try {
      const token = Cookies.get('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/check-duplicate?name=${encodeURIComponent(nameVal)}&model_number=${encodeURIComponent(modelVal)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const filtered = data.data.filter((x: any) => x._id !== initialData?._id);
        setDuplicates(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name || formData.model_number) {
        checkDuplicate(formData.name, formData.model_number);
      } else {
        setDuplicates([]);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.name, formData.model_number]);

  useEffect(() => {
    if (activeTab === 'history' && isEditing && initialData?._id) {
      const fetchRevisions = async () => {
        setLoadingRevisions(true);
        try {
          const token = Cookies.get('admin_token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/phones/${initialData._id}/revisions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setRevisions(data.data || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingRevisions(false);
        }
      };
      fetchRevisions();
    }
  }, [activeTab, isEditing, initialData?._id]);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSpecChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, specs: { ...prev.specs, [section]: { ...(prev.specs as any)[section], [field]: value } } }));
  };

  const handleNestedExtraSpec = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      specs: {
        ...prev.specs,
        extra_specs: {
          ...prev.specs.extra_specs,
          [section]: {
            ...((prev.specs.extra_specs as any)[section] || {}),
            [field]: value
          }
        }
      }
    }));
  };

  const toggleArrayItem = (category: string | null, field: string, item: string) => {
    setFormData((prev: any) => {
      if (!category) {
        const arr = prev.specs[field] || [];
        const newArr = arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item];
        return { ...prev, specs: { ...prev.specs, [field]: newArr } };
      }
      const arr = prev.specs[category]?.[field] || [];
      const newArr = arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item];
      return { ...prev, specs: { ...prev.specs, [category]: { ...prev.specs[category], [field]: newArr } } };
    });
  };

  const handleAIFill = async () => {
    if (!formData.name) {
      notify("Please enter a Phone Name first (e.g. 'iPhone 15 Pro Max')");
      return;
    }
    setIsAIFilling(true);
    try {
      const token = Cookies.get('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/admin/phones/ai-fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phoneName: formData.name })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const ai = data.data;
        setFormData((prev: any) => ({
          ...prev,
          brand_slug: ai.brand_slug || prev.brand_slug,
          model_number: ai.model_number || prev.model_number,
          release_date: ai.release_date || prev.release_date,
          status: ai.status || prev.status,
          tags: ai.tags && ai.tags.length > 0 ? ai.tags : prev.tags,
          specs: {
            ...prev.specs,
            display: { ...prev.specs.display, ...ai.specs?.display },
            performance: { ...prev.specs.performance, ...ai.specs?.performance },
            camera: { ...prev.specs.camera, ...ai.specs?.camera },
            battery: { ...prev.specs.battery, ...ai.specs?.battery },
            body: { ...prev.specs.body, ...ai.specs?.body },
            connectivity: { ...prev.specs.connectivity, ...ai.specs?.connectivity },
            os: ai.specs?.os || prev.specs.os,
            ai_features: ai.specs?.ai_features || prev.specs.ai_features,
            extra_specs: {
              ...prev.specs.extra_specs,
              ...(ai.specs?.extra_specs || {})
            }
          }
        }));
        
        // Find empty fields to warn admin
        const findEmptyFields = (obj: any, prefix = ''): string[] => {
          let empty: string[] = [];
          for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              empty = [...empty, ...findEmptyFields(obj[key], prefix ? `${prefix}.${key}` : key)];
            } else if (obj[key] === '' || obj[key] === null || obj[key] === undefined || (Array.isArray(obj[key]) && obj[key].length === 0)) {
              empty.push(prefix ? `${prefix}.${key}` : key);
            }
          }
          return empty;
        };

        const missing = findEmptyFields(ai.specs || {});
        let msg = "AI successfully researched and populated the phone fields!";
        if (missing.length > 0) {
          msg += `\n\nNOTE: The AI safely left ${missing.length} fields empty because it could not verify them from trusted sources. Please fill them manually if applicable:\n\n${missing.slice(0, 15).join(', ')}${missing.length > 15 ? '...' : ''}`;
        }
        
        notify(msg);
      } else {
        notify("Failed to auto-fill: " + data.message);
      }
    } catch (error) {
      console.error(error);
      notify("Error occurred during AI auto-fill.");
    } finally {
      setIsAIFilling(false);
    }
  };

  const handleResearchSpecs = async () => {
    if (!formData.name) {
      notify("Please enter a Phone Name first (e.g. 'Samsung Galaxy S25 Ultra')");
      return;
    }
    setIsResearching(true);
    try {
      const token = Cookies.get('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/admin/phones/research-specs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phoneName: formData.name, modelNumber: formData.model_number })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setResearchResults(data.data);
        setShowResearchModal(true);
      } else {
        notify("Research failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      notify("Error occurred during research. Make sure n8n is running.");
    } finally {
      setIsResearching(false);
    }
  };

  const applyResearchToForm = () => {
    try {
    if (!researchResults?.specs) return;
    const s = researchResults.specs;
    const getValue = (key: string) => s[key]?.value || null;

    const parseNum = (val: any) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'number') return isNaN(val) ? null : val;
      const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
      return isNaN(n) ? null : n;
    };

    const parseBool = (val: any): boolean | null => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'boolean') return val;
      const lower = String(val).toLowerCase();
      if (lower === 'yes' || lower === 'true') return true;
      if (lower === 'no' || lower === 'false') return false;
      return null;
    };

    const splitToArray = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(String).filter(Boolean);
      return String(val).split(',').map((s: string) => s.trim()).filter(Boolean);
    };

    setFormData((prev: any) => ({
      ...prev,
      model_number: getValue('model_number') || prev.model_number,
      specs: {
        ...prev.specs,
        display: {
          ...prev.specs.display,
          ...(getValue('display_size_inches') && { size_inches: parseNum(getValue('display_size_inches')) }),
          ...(getValue('display_type') && { type: getValue('display_type') }),
          ...(getValue('resolution') && { resolution: getValue('resolution') }),
          ...(getValue('refresh_rate_hz') && { refresh_rate_hz: parseNum(getValue('refresh_rate_hz')) }),
          ...(getValue('peak_brightness_nits') && { peak_brightness_nits: parseNum(getValue('peak_brightness_nits')) }),
          ...(getValue('display_protection') && { protection: getValue('display_protection') }),
          ...(getValue('display_features') && { features: splitToArray(getValue('display_features')) }),
        },
        performance: {
          ...prev.specs.performance,
          ...(getValue('chipset') && { chipset: getValue('chipset') }),
          ...(getValue('cpu') && { cpu: getValue('cpu') }),
          ...(getValue('gpu') && { gpu: getValue('gpu') }),
          // Keep as comma-separated string to match the form's text input format
          ...(getValue('ram_gb') && { ram_options_gb: String(parseNum(getValue('ram_gb')) ?? getValue('ram_gb')) }),
          ...(getValue('storage_gb') && { storage_options_gb: String(parseNum(getValue('storage_gb')) ?? getValue('storage_gb')) }),
          ...(parseBool(getValue('expandable_storage')) !== null && { expandable_storage: parseBool(getValue('expandable_storage')) }),
        },
        camera: {
          ...prev.specs.camera,
          ...(getValue('rear_camera_main_mp') && { rear_summary: getValue('rear_camera_main_mp') }),
          ...(getValue('front_camera_mp') && { front_summary: getValue('front_camera_mp') }),
          ...(getValue('rear_camera_video') && { video_recording: getValue('rear_camera_video') }),
          ...(getValue('rear_camera_features') && { video_features: splitToArray(getValue('rear_camera_features')) }),
        },
        battery: {
          ...prev.specs.battery,
          ...(getValue('battery_mah') && { capacity_mah: parseNum(getValue('battery_mah')) }),
          ...(getValue('charging_watts') && { charging_watts: parseNum(getValue('charging_watts')) }),
          ...(parseBool(getValue('fast_charging')) !== null && { fast_charging: parseBool(getValue('fast_charging')) }),
          ...(parseBool(getValue('wireless_charging')) !== null && { wireless_charging: parseBool(getValue('wireless_charging')) }),
        },
        body: {
          ...prev.specs.body,
          ...(getValue('height_mm') && { height_mm: parseNum(getValue('height_mm')) }),
          ...(getValue('width_mm') && { width_mm: parseNum(getValue('width_mm')) }),
          ...(getValue('thickness_mm') && { thickness_mm: parseNum(getValue('thickness_mm')) }),
          ...(getValue('weight_g') && { weight_g: parseNum(getValue('weight_g')) }),
          ...(getValue('build_materials') && { materials: getValue('build_materials') }),
          ...(getValue('water_resistance') && { water_resistance: getValue('water_resistance') }),
        },
        connectivity: {
          ...prev.specs.connectivity,
          ...(getValue('network_generations') && { network: getValue('network_generations') }),
          ...(getValue('sim_type') && { sim: getValue('sim_type') }),
          ...(getValue('usb_type') && { usb: getValue('usb_type') + (getValue('usb_version') ? ' ' + getValue('usb_version') : '') }),
          ...(getValue('bluetooth') && { bluetooth: getValue('bluetooth') }),
          ...(parseBool(getValue('nfc')) !== null && { nfc: parseBool(getValue('nfc')) }),
          ...(getValue('wifi') && { network_features: splitToArray(getValue('wifi')) }),
        },
        ...(getValue('operating_system') && { os: getValue('operating_system') + (getValue('os_version') ? ' ' + getValue('os_version') : '') }),
      }
    }));
    setShowResearchModal(false);
    notify(`Specs applied to form! Confidence: ${researchResults.confidence?.toUpperCase()}. Please review all fields before saving.`);
    } catch (err: any) {
      console.error('applyResearchToForm error:', err);
      notify(`Failed to apply specs: ${err?.message || err}. Check browser console for details.`);
    }
  };

  const handleAIFillSEO = async () => {
    if (!formData.name) {
      notify("Please enter a Phone Name first (e.g. 'iPhone 15 Pro Max')");
      return;
    }
    setIsAIFillingSEO(true);
    try {
      const token = Cookies.get('admin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/admin/phones/ai-fill-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          phoneName: formData.name,
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
            ai_faq: aiSEO.ai_faq || prev.seo.ai_faq,
            ai_summary: aiSEO.ai_summary || prev.seo.ai_summary,
            ai_pros: aiSEO.ai_pros || prev.seo.ai_pros,
            ai_cons: aiSEO.ai_cons || prev.seo.ai_cons,
            ai_buying_advice: aiSEO.ai_buying_advice || prev.seo.ai_buying_advice,
            ai_snippet: aiSEO.ai_snippet || prev.seo.ai_snippet,
            ai_suggested_tags: aiSEO.ai_suggested_tags || prev.seo.ai_suggested_tags,
            ai_keywords: aiSEO.ai_keywords || prev.seo.ai_keywords
          }
        }));
        notify("AI successfully generated SEO content!");
      } else {
        notify("Failed to auto-fill SEO: " + data.message);
      }
    } catch (error) {
      console.error(error);
      notify("Error occurred during AI SEO generation.");
    } finally {
      setIsAIFillingSEO(false);
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = JSON.parse(JSON.stringify(formData));
      payload.price_usd = formData.price_usd === '' || formData.price_usd == null ? null : Number(formData.price_usd);
      payload.price_usd_source = formData.price_usd_source || '';
      if (payload.price_usd !== null && (!Number.isFinite(payload.price_usd) || payload.price_usd < 0)) { notify('Enter a valid USD price'); return; }
      // Cleanup arrays and types
      if (payload.price_pkr !== undefined && payload.price_pkr !== '') {
        payload.price_pkr = Number(payload.price_pkr);
        if (isNaN(payload.price_pkr)) {
          payload.price_pkr = null;
        }
      } else {
        payload.price_pkr = null;
      }
      if (typeof payload.specs.performance.ram_options_gb === 'string') {
        payload.specs.performance.ram_options_gb = payload.specs.performance.ram_options_gb.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      }
      if (typeof payload.specs.performance.storage_options_gb === 'string') {
        payload.specs.performance.storage_options_gb = payload.specs.performance.storage_options_gb.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      }
      if (typeof payload.country_availability === 'string' && payload.country_availability) {
        payload.country_availability = payload.country_availability.split(',').map((x: string) => x.trim()).filter(Boolean);
      } else if (!payload.country_availability) {
        payload.country_availability = [];
      }

      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label: string, value: any, onChange: (val: any) => void, type = "text", placeholder = "") => (
    <div key={label} className="mb-[5px]">
      <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{label.replace(/_/g, ' ')}</label>
      {type === 'checkbox' ? (
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="h-4 w-4 text-indigo-600" />
      ) : type === 'textarea' ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" placeholder={placeholder} rows={4} />
      ) : (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" placeholder={placeholder} />
      )}
    </div>
  );

  const renderTextFields = (specSection: string, defaultSpecs: any, excludeKeys: string[] = []) => {
    const textKeys = Object.keys(defaultSpecs).filter(k => typeof defaultSpecs[k] !== 'boolean' && !excludeKeys.includes(k));
    return textKeys.map(key => renderInput(key, (formData.specs.extra_specs as any)[specSection]?.[key], v => handleNestedExtraSpec(specSection, key, v), 'text'));
  };

  const renderBooleanFields = (specSection: string, defaultSpecs: any, excludeKeys: string[] = []) => {
    const boolKeys = Object.keys(defaultSpecs).filter(k => typeof defaultSpecs[k] === 'boolean' && !excludeKeys.includes(k));
    if (boolKeys.length === 0) return null;
    return (
      <div className="mt-[5px] flex flex-wrap gap-[5px]">
        {boolKeys.map(key => (
          <label key={key} className="flex items-center space-x-1.5 text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={!!(formData.specs.extra_specs as any)[specSection]?.[key]} onChange={e => handleNestedExtraSpec(specSection, key, e.target.checked)} className="h-3.5 w-3.5 text-indigo-600 rounded border-gray-300" />
            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-4 z-50">
        <div className="flex items-center space-x-4">
          <Link href="/admin/phones" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Mobile' : 'Add New Mobile'}</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleResearchSpecs} disabled={isResearching} className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-md hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50">
            <Search className="w-4 h-4 mr-2" />
            {isResearching ? 'Researching...' : 'Research Specs'}
          </button>
          <button onClick={handleAIFill} disabled={isAIFilling} className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50">
            <Wand2 className="w-4 h-4 mr-2" />
            {isAIFilling ? 'AI Researching...' : 'Auto-fill with AI'}
          </button>
          <button onClick={onFormSubmit} disabled={isSubmitting} className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Phone'}
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['basic', 'detailed_specs', 'ai_content', 'seo_affiliate', ...(isEditing ? ['history', 'comments'] : [])].map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <form onSubmit={onFormSubmit} className="space-y-8">

        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {duplicates.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-xs">Warning: Potential Duplicates Detected!</span>
                  <div className="text-xs space-y-1">
                    {duplicates.map(d => (
                      <div key={d._id}>• <span className="font-semibold">{d.name}</span> ({d.model_number || 'No Model No.'}) - Status: {d.status}</div>
                    ))}
                  </div>
                </div>
              )}
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Core Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('Phone Name', formData.name, v => setFormData((p: any) => ({ ...p, name: v })))}
                  <ReferencePriceFields value={formData.price_usd} source={formData.price_usd_source} onPrice={v => setFormData((p: any) => ({ ...p, price_usd: v }))} onSource={v => setFormData((p: any) => ({ ...p, price_usd_source: v }))} />
                  {renderInput('Price (PKR) - Header Display Price', formData.price_pkr, v => setFormData((p: any) => ({ ...p, price_pkr: v })), 'number')}
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
                          className="flex-1 px-2 py-1.5 border rounded-md text-xs" placeholder="New brand name (e.g. Realme)" />
                        <button type="button" onClick={handleAddBrand} disabled={addingBrand}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold disabled:opacity-50">
                          {addingBrand ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    ) : (
                      <select value={formData.brand_slug} onChange={e => setFormData((p: any) => ({ ...p, brand_slug: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-xs">
                        <option value="">Select Brand</option>
                        {formData.brand_slug && !brands.some(b => b.slug === formData.brand_slug) && (
                          <option value={formData.brand_slug}>{formData.brand_slug} (unlisted)</option>
                        )}
                        {brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData((p: any) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-xs">
                      <option value="available">Available</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="discontinued">Discontinued</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="rumored">Rumored</option>
                      <option value="released">Released</option>
                    </select>
                  </div>
                  {renderInput('Model Number', formData.model_number, v => setFormData((p: any) => ({ ...p, model_number: v })))}
                  {renderInput('Release Date', formData.release_date, v => setFormData((p: any) => ({ ...p, release_date: v })), 'date')}
                  {renderInput('Series', formData.series, v => setFormData((p: any) => ({ ...p, series: v })))}
                  {renderInput('Category', formData.category, v => setFormData((p: any) => ({ ...p, category: v })))}
                  {renderInput('Subcategory', formData.subcategory, v => setFormData((p: any) => ({ ...p, subcategory: v })))}
                  {renderInput('Country Availability (comma separated)', formData.country_availability, v => setFormData((p: any) => ({ ...p, country_availability: v })))}
                  {renderInput('Carrier Version', formData.carrier_version, v => setFormData((p: any) => ({ ...p, carrier_version: v })))}
                  {renderInput('Region Version', formData.region_version, v => setFormData((p: any) => ({ ...p, region_version: v })))}
                  {renderInput('Manufacturer', formData.manufacturer, v => setFormData((p: any) => ({ ...p, manufacturer: v })))}
                  {renderInput('Made In', formData.made_in, v => setFormData((p: any) => ({ ...p, made_in: v })))}
                  {renderInput('Tags (comma separated)', formData.tags?.join(', ') || '', v => setFormData((p: any) => ({ ...p, tags: v.split(',').map((t: string) => t.trim()).filter(Boolean) })))}
                  {renderInput('Video URL (Youtube)', formData.video_url, v => setFormData((p: any) => ({ ...p, video_url: v })))}
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Description</h3>
                <div>
                  <MarkdownEditor
                    value={formData.description || ''}
                    onChange={v => setFormData((p: any) => ({ ...p, description: v }))}
                    height={420}
                  />
                  <p className="text-[11px] text-gray-500 mt-2 font-medium">Use the toolbar for bold, italic, links, headings and lists. This is displayed on the product page. Tip: a <code>## Pros &amp; Cons</code> section renders as pros/cons cards, and a <code>## FAQ</code> section with <code>Q:</code> / <code>A:</code> lines renders as an accordion.</p>
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Primary Specs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderInput('Display Size (in)', formData.specs.display.size_inches, v => handleSpecChange('display', 'size_inches', v), 'number')}
                  {renderInput('Display Type', formData.specs.display.type, v => handleSpecChange('display', 'type', v))}
                  {renderInput('Chipset', formData.specs.performance.chipset, v => handleSpecChange('performance', 'chipset', v))}
                  {renderInput('RAM (GB, comma)', formData.specs.performance.ram_options_gb, v => handleSpecChange('performance', 'ram_options_gb', v))}
                  {renderInput('Storage (GB, comma)', formData.specs.performance.storage_options_gb, v => handleSpecChange('performance', 'storage_options_gb', v))}
                  {renderInput('Battery (mAh)', formData.specs.battery.capacity_mah, v => handleSpecChange('battery', 'capacity_mah', v), 'number')}
                </div>
              </section>

              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Prices</h3>
                
                {/* List of current prices */}
                {formData.prices && formData.prices.length > 0 ? (
                  <div className="mb-4 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50 text-gray-600">
                          <th className="py-2 px-3 font-bold">Retailer</th>
                          <th className="py-2 px-3 font-bold">Price (PKR)</th>
                          <th className="py-2 px-3 font-bold">Stock Status</th>
                          <th className="py-2 px-3 font-bold">Variant</th>
                          <th className="py-2 px-3 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.prices.map((pr: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-gray-50/50">
                            <td className="py-2 px-3 font-semibold text-gray-800">{pr.retailer_name}</td>
                            <td className="py-2 px-3 text-gray-700">Rs. {pr.price_pkr.toLocaleString()}</td>
                            <td className="py-2 px-3 capitalize text-gray-700">{pr.stock_status || 'available'}</td>
                            <td className="py-2 px-3 text-gray-700">{pr.variant || '-'}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => removePriceItem(idx)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
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
                  <p className="text-xs text-gray-500 mb-4">No prices added yet.</p>
                )}

                {/* Add new price form */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Retailer Name (e.g. PriceOye, Daraz)</label>
                    <input
                      type="text"
                      value={newPrice.retailer_name}
                      onChange={e => setNewPrice(p => ({ ...p, retailer_name: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                      placeholder="Retailer Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Price (PKR)</label>
                    <input
                      type="number"
                      value={newPrice.price_pkr}
                      onChange={e => setNewPrice(p => ({ ...p, price_pkr: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 150000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Variant (Optional)</label>
                    <input
                      type="text"
                      value={newPrice.variant}
                      onChange={e => setNewPrice(p => ({ ...p, variant: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 8GB/256GB"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Stock Status</label>
                    <select
                      value={newPrice.stock_status}
                      onChange={e => setNewPrice(p => ({ ...p, stock_status: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="available">Available</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Product URL (Optional)</label>
                    <input
                      type="text"
                      value={newPrice.product_url}
                      onChange={e => setNewPrice(p => ({ ...p, product_url: e.target.value }))}
                      className="w-full px-2 py-1.5 border rounded-md text-xs bg-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. https://priceoye.pk/..."
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={addPriceItem}
                      className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Add Price
                    </button>
                  </div>
                </div>
              </section>
            </div>
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Images</h3>
                <ImageUploader onImagesChange={(images) => setFormData((prev: any) => ({ ...prev, images }))} existingImages={formData.images} />
              </section>
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Publishing</h3>
                {renderInput('Publish Immediately', formData.is_published, v => setFormData((p: any) => ({ ...p, is_published: v })), 'checkbox')}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData((p: any) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-xs">
                    <option value="available">Available</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="rumored">Rumored</option>
                    <option value="released">Released</option>
                    <option value="discontinued">Discontinued</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Approval Workflow Status</label>
                  <div className="px-3 py-2 bg-gray-50 border rounded-md text-xs font-semibold capitalize text-gray-700">
                    {formData.approvalStatus || 'DRAFT'}
                  </div>
                </div>
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Integration Sync</h4>
                  {renderInput('Import Source', formData.importSource, v => setFormData((p: any) => ({ ...p, importSource: v })))}
                  {renderInput('Last Sync Date', formData.lastSync, v => setFormData((p: any) => ({ ...p, lastSync: v })), 'datetime-local')}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Sync Status</label>
                    <select value={formData.syncStatus || ''} onChange={e => setFormData((p: any) => ({ ...p, syncStatus: e.target.value || undefined }))} className="w-full px-3 py-2 border rounded-md text-xs">
                      <option value="">No Sync / Local Only</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['Featured', 'Trending', 'Best Seller', 'Recommended', 'Staff Pick', 'Sponsored', 'Editor Choice', 'AI Recommended', 'Flagship'].map(tag => (
                      <label key={tag} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                        <input type="checkbox" checked={formData.tags?.includes(tag) || false} onChange={e => {
                          const newTags = e.target.checked 
                            ? [...(formData.tags || []), tag] 
                            : (formData.tags || []).filter((t: string) => t !== tag);
                          setFormData((p: any) => ({ ...p, tags: newTags }));
                        }} />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* DETAILED SPECS TAB */}
        {activeTab === 'detailed_specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Display Extended</h3>
              <div className="space-y-2">
                {renderInput('Resolution', formData.specs.display?.resolution, v => handleSpecChange('display', 'resolution', v))}
                {renderInput('Refresh Rate (Hz)', formData.specs.display?.refresh_rate_hz, v => handleSpecChange('display', 'refresh_rate_hz', v), 'number')}
                {renderInput('Protection', formData.specs.display?.protection, v => handleSpecChange('display', 'protection', v))}
                {renderInput('Peak Brightness (nits)', formData.specs.display?.peak_brightness_nits, v => handleSpecChange('display', 'peak_brightness_nits', v), 'number')}
                {renderTextFields('features_listing', DEFAULT_EXTRA_SPECS.features_listing, ['display_features'])}
              </div>
              {renderBooleanFields('features_listing', DEFAULT_EXTRA_SPECS.features_listing, ['display_features'])}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Display Features</label>
                <div className="flex flex-wrap gap-2">
                  {DISPLAY_FEATURES.map(feat => (
                    <label key={feat} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                      <input type="checkbox" checked={formData.specs.display?.features?.includes(feat) || false} onChange={() => toggleArrayItem('display', 'features', feat)} />
                      <span>{feat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Processor & RAM</h3>
              <div className="space-y-2">
                {renderInput('CPU', formData.specs.performance?.cpu, v => handleSpecChange('performance', 'cpu', v))}
                {renderInput('GPU', formData.specs.performance?.gpu, v => handleSpecChange('performance', 'gpu', v))}
                {renderInput('Expandable Storage', formData.specs.performance?.expandable_storage, v => handleSpecChange('performance', 'expandable_storage', v), 'checkbox')}
                {Object.keys(DEFAULT_EXTRA_SPECS.processor).map(key => renderInput(key, (formData.specs.extra_specs as any).processor[key], v => handleNestedExtraSpec('processor', key, v)))}
                {Object.keys(DEFAULT_EXTRA_SPECS.ram_storage).map(key => renderInput(key, (formData.specs.extra_specs as any).ram_storage[key], v => handleNestedExtraSpec('ram_storage', key, v)))}
              </div>
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Cameras & Video</h3>
              <div className="space-y-2">
                {renderInput('Rear Summary', formData.specs.camera?.rear_summary, v => handleSpecChange('camera', 'rear_summary', v))}
                {renderInput('Front Summary', formData.specs.camera?.front_summary, v => handleSpecChange('camera', 'front_summary', v))}
                {renderInput('Video Recording', formData.specs.camera?.video_recording, v => handleSpecChange('camera', 'video_recording', v))}
                {renderTextFields('cameras_detailed', DEFAULT_EXTRA_SPECS.cameras_detailed)}
              </div>
              {renderBooleanFields('cameras_detailed', DEFAULT_EXTRA_SPECS.cameras_detailed)}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Video Features</label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_FEATURES.map(feat => (
                    <label key={feat} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                      <input type="checkbox" checked={formData.specs.camera?.video_features?.includes(feat) || false} onChange={() => toggleArrayItem('camera', 'video_features', feat)} />
                      <span>{feat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Connectivity & Sensors</h3>
              <div className="space-y-2">
                {renderInput('Network', formData.specs.connectivity?.network, v => handleSpecChange('connectivity', 'network', v))}
                {renderInput('SIM', formData.specs.connectivity?.sim, v => handleSpecChange('connectivity', 'sim', v))}
                {renderInput('USB', formData.specs.connectivity?.usb, v => handleSpecChange('connectivity', 'usb', v))}
                {renderInput('Bluetooth', formData.specs.connectivity?.bluetooth, v => handleSpecChange('connectivity', 'bluetooth', v))}
                {renderInput('NFC', formData.specs.connectivity?.nfc, v => handleSpecChange('connectivity', 'nfc', v), 'checkbox')}
                {renderTextFields('connectivity_detailed', DEFAULT_EXTRA_SPECS.connectivity_detailed)}
                {renderTextFields('sensors', DEFAULT_EXTRA_SPECS.sensors)}
              </div>
              {renderBooleanFields('connectivity_detailed', DEFAULT_EXTRA_SPECS.connectivity_detailed)}
              {renderBooleanFields('sensors', DEFAULT_EXTRA_SPECS.sensors)}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">SIM Types</label>
                <div className="flex flex-wrap gap-2">
                  {SIM_TYPES.map(feat => (
                    <label key={feat} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                      <input type="checkbox" checked={formData.specs.connectivity?.sim_types?.includes(feat) || false} onChange={() => toggleArrayItem('connectivity', 'sim_types', feat)} />
                      <span>{feat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Network Features</label>
                <div className="flex flex-wrap gap-2">
                  {NETWORK_FEATURES.map(feat => (
                    <label key={feat} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded border">
                      <input type="checkbox" checked={formData.specs.connectivity?.network_features?.includes(feat) || false} onChange={() => toggleArrayItem('connectivity', 'network_features', feat)} />
                      <span>{feat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">Battery & Body Extended</h3>
              <div className="space-y-2">
                {renderInput('Charging Watts', formData.specs.battery?.charging_watts, v => handleSpecChange('battery', 'charging_watts', v), 'number')}
                {renderInput('Fast Charging', formData.specs.battery?.fast_charging, v => handleSpecChange('battery', 'fast_charging', v), 'checkbox')}
                {renderInput('Wireless Charging', formData.specs.battery?.wireless_charging, v => handleSpecChange('battery', 'wireless_charging', v), 'checkbox')}
                {renderInput('Height (mm)', formData.specs.body?.height_mm, v => handleSpecChange('body', 'height_mm', v), 'number')}
                {renderInput('Width (mm)', formData.specs.body?.width_mm, v => handleSpecChange('body', 'width_mm', v), 'number')}
                {renderInput('Thickness (mm)', formData.specs.body?.thickness_mm, v => handleSpecChange('body', 'thickness_mm', v), 'number')}
                {renderInput('Weight (g)', formData.specs.body?.weight_g, v => handleSpecChange('body', 'weight_g', v), 'number')}
                {renderInput('Materials', formData.specs.body?.materials, v => handleSpecChange('body', 'materials', v))}
                {renderInput('Water Resistance', formData.specs.body?.water_resistance, v => handleSpecChange('body', 'water_resistance', v))}
                {renderTextFields('battery_detailed', DEFAULT_EXTRA_SPECS.battery_detailed)}
                {renderTextFields('body_detailed', DEFAULT_EXTRA_SPECS.body_detailed)}
              </div>
              {renderBooleanFields('battery_detailed', DEFAULT_EXTRA_SPECS.battery_detailed)}
              {renderBooleanFields('body_detailed', DEFAULT_EXTRA_SPECS.body_detailed)}
            </section>

            <section className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-bold mb-3">OS & Software</h3>
              <div className="space-y-2">
                {renderInput('OS', formData.specs.os, v => setFormData((p: any) => ({ ...p, specs: { ...p.specs, os: v } })))}
                {renderTextFields('software', DEFAULT_EXTRA_SPECS.software)}
              </div>
              {renderBooleanFields('software', DEFAULT_EXTRA_SPECS.software)}
            </section>

          </div>
        )}

        {/* AI CONTENT TAB */}
        {activeTab === 'ai_content' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-5 rounded-xl border shadow-sm md:col-span-2">
              <h3 className="font-bold mb-3">AI Features Supported</h3>
              <div className="flex flex-wrap gap-3">
                {AI_FEATURES_LIST.map(feat => (
                  <label key={feat} className="flex items-center space-x-2 text-xs bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                    <input type="checkbox" checked={formData.specs.ai_features?.includes(feat) || false} onChange={() => toggleArrayItem(null, 'ai_features', feat)} className="text-purple-600 rounded" />
                    <span>{feat}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* AI-Generated SEO Fields */}
            <section className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-indigo-900">AI-Generated SEO Content</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAIFillSEO} disabled={isAIFillingSEO} className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md text-xs font-semibold hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 flex items-center">
                    <Wand2 className="w-3 h-3 mr-1" />
                    {isAIFillingSEO ? 'Generating...' : 'Generate AI SEO'}
                  </button>
                  <button type="button" onClick={() => {
                    setFormData((p: any) => ({ ...p, seo: {
                      ...p.seo,
                      meta_title: p.seo.ai_seo_title || p.seo.meta_title,
                      meta_description: p.seo.ai_meta_description || p.seo.meta_description,
                      meta_keywords: (p.seo.ai_keywords || []).join(', ') || p.seo.meta_keywords,
                    }}));
                    notify('AI content copied to manual fields!');
                  }} className="px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 rounded-md text-xs font-semibold hover:bg-indigo-100">
                    Copy AI → Manual
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">AI SEO Title</label>
                    <input type="text" value={formData.seo.ai_seo_title || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, ai_seo_title: e.target.value } }))} className="w-full px-3 py-2 border border-indigo-200 rounded-md text-xs bg-white" />
                    <div className={`text-[10px] mt-1 ${(formData.seo.ai_seo_title || '').length > 60 ? 'text-red-500' : 'text-indigo-400'}`}>{(formData.seo.ai_seo_title || '').length}/60</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">AI Meta Description</label>
                    <textarea value={formData.seo.ai_meta_description || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, ai_meta_description: e.target.value } }))} className="w-full px-3 py-2 border border-indigo-200 rounded-md text-xs bg-white" rows={3} />
                    <div className={`text-[10px] mt-1 ${(formData.seo.ai_meta_description || '').length > 160 ? 'text-red-500' : 'text-indigo-400'}`}>{(formData.seo.ai_meta_description || '').length}/160</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">AI Keywords (comma-separated)</label>
                    <textarea value={(formData.seo.ai_keywords || []).join(', ')} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, ai_keywords: e.target.value.split(',').map((k: string) => k.trim()).filter(Boolean) } }))} className="w-full px-3 py-2 border border-indigo-200 rounded-md text-xs bg-white" rows={2} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">AI Suggested Tags (comma-separated)</label>
                    <textarea value={(formData.seo.ai_suggested_tags || []).join(', ')} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, ai_suggested_tags: e.target.value.split(',').map((k: string) => k.trim()).filter(Boolean) } }))} className="w-full px-3 py-2 border border-indigo-200 rounded-md text-xs bg-white" rows={2} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">AI FAQ (Question → Answer pairs)</label>
                    <div className="space-y-2">
                      {(formData.seo.ai_faq || []).map((faq: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-1 p-2 bg-white rounded border border-indigo-100">
                          <input type="text" value={faq.question || ''} onChange={e => {
                            const faqs = [...(formData.seo.ai_faq || [])];
                            faqs[idx] = { ...faqs[idx], question: e.target.value };
                            setFormData((p: any) => ({ ...p, seo: { ...p.seo, ai_faq: faqs } }));
                          }} className="w-full px-2 py-1 border rounded text-xs" placeholder="Question" />
                          <textarea value={faq.answer || ''} onChange={e => {
                            const faqs = [...(formData.seo.ai_faq || [])];
                            faqs[idx] = { ...faqs[idx], answer: e.target.value };
                            setFormData((p: any) => ({ ...p, seo: { ...p.seo, ai_faq: faqs } }));
                          }} className="w-full px-2 py-1 border rounded text-xs" rows={2} placeholder="Answer" />
                          <button type="button" onClick={() => {
                            const faqs = (formData.seo.ai_faq || []).filter((_: any, i: number) => i !== idx);
                            setFormData((p: any) => ({ ...p, seo: { ...p.seo, ai_faq: faqs } }));
                          }} className="text-red-500 text-[10px] font-bold self-end">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const faqs = [...(formData.seo.ai_faq || []), { question: '', answer: '' }];
                        setFormData((p: any) => ({ ...p, seo: { ...p.seo, ai_faq: faqs } }));
                      }} className="text-xs text-indigo-600 font-semibold hover:underline">+ Add FAQ</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="bg-white p-5 rounded-xl border shadow-sm md:col-span-2">
              <h3 className="font-bold mb-3">AI Automations (Moderation Flags)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(DEFAULT_EXTRA_SPECS.ai_automation).map(key => renderInput(key, (formData.specs.extra_specs as any).ai_automation[key], v => handleNestedExtraSpec('ai_automation', key, v), 'checkbox'))}
              </div>
            </section>
          </div>
        )}

        {/* SEO & AFFILIATE TAB */}
        {activeTab === 'seo_affiliate' && (
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

            {/* Manual SEO Fields */}
            <section className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Manual SEO Fields</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Title</label>
                    <input type="text" value={formData.seo.meta_title || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, meta_title: e.target.value } }))} className="w-full px-3 py-2 border rounded-md text-xs" placeholder="e.g. Samsung Galaxy S25 Ultra Price | Specs & Reviews" />
                    <div className={`text-[10px] mt-1 ${(formData.seo.meta_title || '').length > 60 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {(formData.seo.meta_title || '').length}/60 characters
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Description</label>
                    <textarea value={formData.seo.meta_description || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, meta_description: e.target.value } }))} className="w-full px-3 py-2 border rounded-md text-xs" rows={3} placeholder="Compelling description for search results..." />
                    <div className={`text-[10px] mt-1 ${(formData.seo.meta_description || '').length > 160 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {(formData.seo.meta_description || '').length}/160 characters
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Meta Keywords</label>
                    <input type="text" value={formData.seo.meta_keywords || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, meta_keywords: e.target.value } }))} className="w-full px-3 py-2 border rounded-md text-xs" placeholder="samsung galaxy s25, price, specs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Focus Keyword</label>
                    <input type="text" value={formData.seo.focus_keyword || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, focus_keyword: e.target.value } }))} className="w-full px-3 py-2 border rounded-md text-xs border-indigo-300 bg-indigo-50/30" placeholder="samsung galaxy s25 ultra price" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Long-tail Keywords (comma-separated)</label>
                    <textarea value={(formData.seo.long_tail_keywords || []).join(', ')} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, long_tail_keywords: e.target.value.split(',').map((k: string) => k.trim()).filter(Boolean) } }))} className="w-full px-3 py-2 border rounded-md text-xs" rows={2} placeholder="samsung galaxy s25 ultra price 2025, best samsung phone under 300000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Canonical URL</label>
                    <input type="text" value={formData.seo.canonical_url || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, canonical_url: e.target.value } }))} className="w-full px-3 py-2 border rounded-md text-xs" placeholder="https://mobilerates.info/samsung-galaxy-s25-ultra" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">OG Title</label>
                    <input type="text" value={formData.seo.og_title || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, og_title: e.target.value } }))} className="w-full px-3 py-2 border rounded-md text-xs" placeholder="Social media share title" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">OG Description</label>
                    <textarea value={formData.seo.og_description || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, og_description: e.target.value } }))} className="w-full px-3 py-2 border rounded-md text-xs" rows={2} placeholder="Social media share description" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">OG Image URL</label>
                    <input type="text" value={formData.seo.og_image || ''} onChange={e => setFormData((p: any) => ({ ...p, seo: { ...p.seo, og_image: e.target.value } }))} className="w-full px-3 py-2 border rounded-md text-xs" placeholder="https://..." />
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* REVISION HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold">Revision History & Change Logs</h3>
            {loadingRevisions ? (
              <div className="text-gray-500 text-xs">Loading revisions...</div>
            ) : revisions.length === 0 ? (
              <div className="text-gray-500 text-xs">No revisions recorded for this mobile.</div>
            ) : (
              <div className="space-y-4">
                {revisions.map(rev => (
                  <div key={rev._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-gray-900">
                        {rev.changedBy?.name || 'System'} ({rev.changedBy?.role || 'SYSTEM'})
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-indigo-600 font-semibold mt-1">
                      Action: {rev.action}
                    </div>
                    {rev.note && (
                      <div className="text-xs text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100 mt-2">
                        Rejection Note: "{rev.note}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMMENTS TAB */}
        {activeTab === 'comments' && isEditing && formData._id && (
          <AdminPhoneComments phoneId={formData._id} />
        )}

      </form>

      {/* Research Specs Modal */}
      {showResearchModal && researchResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Research Results — {researchResults.product_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    researchResults.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    researchResults.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {researchResults.confidence?.toUpperCase()} CONFIDENCE
                  </span>
                  <span className="text-xs text-gray-500">{researchResults.sources_used} sources checked</span>
                </div>
              </div>
              <button onClick={() => setShowResearchModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Review Warning */}
            {researchResults.review_required && (
              <div className="mx-6 mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-800">
                  <strong>Manual review recommended.</strong> Some specs have conflicts or low confidence.
                  {researchResults.conflicts_found?.length > 0 && ` Conflicting fields: ${researchResults.conflicts_found.join(', ')}.`}
                  {researchResults.missing_fields?.length > 0 && ` Missing fields: ${researchResults.missing_fields.join(', ')}.`}
                </p>
              </div>
            )}

            {/* Specs Table */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold text-gray-600 w-1/4">Field</th>
                    <th className="text-left py-2 font-semibold text-gray-600 w-1/2">Value</th>
                    <th className="text-left py-2 font-semibold text-gray-600">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {researchResults.specs && Object.entries(researchResults.specs).map(([key, data]: [string, any]) => (
                    <tr key={key} className={`border-b last:border-0 ${data?.conflict ? 'bg-orange-50' : ''}`}>
                      <td className="py-2 pr-3 font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</td>
                      <td className="py-2 pr-3">
                        {data?.value ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            <span className="text-gray-900">{String(data.value)}</span>
                            {data.conflict && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">CONFLICT</span>}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Not found</span>
                        )}
                      </td>
                      <td className="py-2">
                        {data?.source ? (
                          <a href={data.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate max-w-[160px]">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            {(() => { try { return new URL(data.source).hostname.replace('www.', ''); } catch { return data.source; } })()}
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-xs text-gray-500">Review specs above and verify sources before applying.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowResearchModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={applyResearchToForm} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
                  Apply to Form
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
