/**
 * Maps EV brand slugs to their country/region of origin.
 * Used to display a region badge (with flag) on cards and detail pages.
 */

export interface BrandRegion {
  country: string;
  flag: string;
  /** Broader market grouping for filtering */
  region: 'Chinese' | 'American' | 'European' | 'Japanese' | 'Korean' | 'Pakistani' | 'Indian' | 'Australian' | 'Other';
}

const BRAND_REGION_MAP: Record<string, BrandRegion> = {
  // Chinese brands
  byd: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  'byd-auto': { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  changan: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  'changan-auto': { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  nio: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  xpeng: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  li: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  'li-auto': { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  geely: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  zeekr: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  haval: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  ora: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  'great-wall': { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  gwm: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  mg: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  seres: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  jac: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  'jac-motors': { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  chery: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  dfsk: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  hongqi: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  aiways: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  leapmotor: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  neta: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  skywell: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  maxus: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  ldv: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  foton: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  saic: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  wuling: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  voyah: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  avatr: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  im: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  'im-motors': { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  dongfeng: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  gac: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  aion: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  lynk: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  'lynk-co': { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  polestar: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  xiaomi: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  huawei: { country: 'China', flag: '🇨🇳', region: 'Chinese' },

  // American brands
  tesla: { country: 'USA', flag: '🇺🇸', region: 'American' },
  rivian: { country: 'USA', flag: '🇺🇸', region: 'American' },
  lucid: { country: 'USA', flag: '🇺🇸', region: 'American' },
  ford: { country: 'USA', flag: '🇺🇸', region: 'American' },
  gmc: { country: 'USA', flag: '🇺🇸', region: 'American' },
  chevrolet: { country: 'USA', flag: '🇺🇸', region: 'American' },
  cadillac: { country: 'USA', flag: '🇺🇸', region: 'American' },
  jeep: { country: 'USA', flag: '🇺🇸', region: 'American' },
  chrysler: { country: 'USA', flag: '🇺🇸', region: 'American' },
  dodge: { country: 'USA', flag: '🇺🇸', region: 'American' },
  fisker: { country: 'USA', flag: '🇺🇸', region: 'American' },
  canoo: { country: 'USA', flag: '🇺🇸', region: 'American' },
  lordstown: { country: 'USA', flag: '🇺🇸', region: 'American' },
  scout: { country: 'USA', flag: '🇺🇸', region: 'American' },

  // European brands
  bmw: { country: 'Germany', flag: '🇩🇪', region: 'European' },
  mercedes: { country: 'Germany', flag: '🇩🇪', region: 'European' },
  'mercedes-benz': { country: 'Germany', flag: '🇩🇪', region: 'European' },
  audi: { country: 'Germany', flag: '🇩🇪', region: 'European' },
  porsche: { country: 'Germany', flag: '🇩🇪', region: 'European' },
  volkswagen: { country: 'Germany', flag: '🇩🇪', region: 'European' },
  vw: { country: 'Germany', flag: '🇩🇪', region: 'European' },
  opel: { country: 'Germany', flag: '🇩🇪', region: 'European' },
  smart: { country: 'Germany', flag: '🇩🇪', region: 'European' },
  volvo: { country: 'Sweden', flag: '🇸🇪', region: 'European' },
  renault: { country: 'France', flag: '🇫🇷', region: 'European' },
  peugeot: { country: 'France', flag: '🇫🇷', region: 'European' },
  citroen: { country: 'France', flag: '🇫🇷', region: 'European' },
  ds: { country: 'France', flag: '🇫🇷', region: 'European' },
  fiat: { country: 'Italy', flag: '🇮🇹', region: 'European' },
  'alfa-romeo': { country: 'Italy', flag: '🇮🇹', region: 'European' },
  maserati: { country: 'Italy', flag: '🇮🇹', region: 'European' },
  ferrari: { country: 'Italy', flag: '🇮🇹', region: 'European' },
  lamborghini: { country: 'Italy', flag: '🇮🇹', region: 'European' },
  lotus: { country: 'UK', flag: '🇬🇧', region: 'European' },
  jaguar: { country: 'UK', flag: '🇬🇧', region: 'European' },
  'land-rover': { country: 'UK', flag: '🇬🇧', region: 'European' },
  mini: { country: 'UK', flag: '🇬🇧', region: 'European' },
  bentley: { country: 'UK', flag: '🇬🇧', region: 'European' },
  'rolls-royce': { country: 'UK', flag: '🇬🇧', region: 'European' },
  cupra: { country: 'Spain', flag: '🇪🇸', region: 'European' },
  seat: { country: 'Spain', flag: '🇪🇸', region: 'European' },
  skoda: { country: 'Czech Republic', flag: '🇨🇿', region: 'European' },
  dacia: { country: 'Romania', flag: '🇷🇴', region: 'European' },

  // Japanese brands
  toyota: { country: 'Japan', flag: '🇯🇵', region: 'Japanese' },
  honda: { country: 'Japan', flag: '🇯🇵', region: 'Japanese' },
  nissan: { country: 'Japan', flag: '🇯🇵', region: 'Japanese' },
  mazda: { country: 'Japan', flag: '🇯🇵', region: 'Japanese' },
  subaru: { country: 'Japan', flag: '🇯🇵', region: 'Japanese' },
  lexus: { country: 'Japan', flag: '🇯🇵', region: 'Japanese' },
  mitsubishi: { country: 'Japan', flag: '🇯🇵', region: 'Japanese' },
  suzuki: { country: 'Japan', flag: '🇯🇵', region: 'Japanese' },

  // Korean brands
  hyundai: { country: 'South Korea', flag: '🇰🇷', region: 'Korean' },
  kia: { country: 'South Korea', flag: '🇰🇷', region: 'Korean' },
  genesis: { country: 'South Korea', flag: '🇰🇷', region: 'Korean' },

  // Pakistani brands / assembled in Pakistan
  'united-auto': { country: 'Pakistan', flag: '🇵🇰', region: 'Pakistani' },
  'jolta-electric': { country: 'Pakistan', flag: '🇵🇰', region: 'Pakistani' },
  jolta: { country: 'Pakistan', flag: '🇵🇰', region: 'Pakistani' },
  vlektra: { country: 'Pakistan', flag: '🇵🇰', region: 'Pakistani' },
  yadea: { country: 'China', flag: '🇨🇳', region: 'Chinese' },
  evee: { country: 'Pakistan', flag: '🇵🇰', region: 'Pakistani' },
  metro: { country: 'Pakistan', flag: '🇵🇰', region: 'Pakistani' },

  // Indian brands
  tata: { country: 'India', flag: '🇮🇳', region: 'Indian' },
  mahindra: { country: 'India', flag: '🇮🇳', region: 'Indian' },
  'ola-electric': { country: 'India', flag: '🇮🇳', region: 'Indian' },
  ola: { country: 'India', flag: '🇮🇳', region: 'Indian' },
  ather: { country: 'India', flag: '🇮🇳', region: 'Indian' },
};

/**
 * Get the region info for a brand. Falls back to `made_in` field if available,
 * otherwise returns null.
 */
export function getBrandRegion(brandSlug?: string, madeIn?: string): BrandRegion | null {
  if (brandSlug) {
    const normalized = brandSlug.toLowerCase().trim();
    const match = BRAND_REGION_MAP[normalized];
    if (match) return match;
  }

  // Fallback: if we have a made_in field, try to parse it
  if (madeIn) {
    const lower = madeIn.toLowerCase().trim();
    if (lower.includes('china')) return { country: 'China', flag: '🇨🇳', region: 'Chinese' };
    if (lower.includes('usa') || lower.includes('united states') || lower.includes('america')) return { country: 'USA', flag: '🇺🇸', region: 'American' };
    if (lower.includes('germany')) return { country: 'Germany', flag: '🇩🇪', region: 'European' };
    if (lower.includes('japan')) return { country: 'Japan', flag: '🇯🇵', region: 'Japanese' };
    if (lower.includes('korea')) return { country: 'South Korea', flag: '🇰🇷', region: 'Korean' };
    if (lower.includes('pakistan')) return { country: 'Pakistan', flag: '🇵🇰', region: 'Pakistani' };
    if (lower.includes('india')) return { country: 'India', flag: '🇮🇳', region: 'Indian' };
    if (lower.includes('uk') || lower.includes('britain') || lower.includes('england')) return { country: 'UK', flag: '🇬🇧', region: 'European' };
    if (lower.includes('france')) return { country: 'France', flag: '🇫🇷', region: 'European' };
    if (lower.includes('italy')) return { country: 'Italy', flag: '🇮🇹', region: 'European' };
    if (lower.includes('sweden')) return { country: 'Sweden', flag: '🇸🇪', region: 'European' };
    if (lower.includes('australia')) return { country: 'Australia', flag: '🇦🇺', region: 'Australian' };
  }

  return null;
}
