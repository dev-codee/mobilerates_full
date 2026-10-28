import { withoutSiteBrand } from "./seo";
// ─── JSON-LD Structured Data Generators ─────────────────────────────────────
// These helper functions generate Google-compliant JSON-LD structured data
// for better SEO and rich snippets in search results.

interface SchemaPhone {
  name: string;
  slug: string;
  brand_slug: string;
  description?: string;
  images?: { url: string; alt_text?: string }[];
  model_number?: string;
  release_date?: string;
  price_pkr?: number;
  prices?: { retailer_name: string; price_pkr: number; product_url?: string; stock_status?: string }[];
  rating?: { average?: number; count?: number };
  seo?: {
    meta_title?: string;
    meta_description?: string;
    ai_seo_title?: string;
    ai_meta_description?: string;
    ai_faq?: { question: string; answer: string }[];
  };
  video_url?: string;
  product_type?: string;
}

interface SchemaReview {
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const SITE_URL = 'https://mobilerates.info';

// Serialize CMS data safely inside script elements.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function validRating(rating?: { average?: number; count?: number }) {
  return !!rating && Number.isFinite(rating.average) && rating.average! >= 1 && rating.average! <= 5
    && Number.isInteger(rating.count) && rating.count! > 0;
}

function productOffers(product: SchemaPhone) {
  const availability: Record<string, string> = {
    'in stock': 'InStock', 'in_stock': 'InStock', 'instock': 'InStock',
    'out of stock': 'OutOfStock', 'out_of_stock': 'OutOfStock', 'outofstock': 'OutOfStock',
    'preorder': 'PreOrder', 'pre-order': 'PreOrder', 'discontinued': 'Discontinued',
  };
  const offers = (product.prices || []).filter(price =>
    Number.isFinite(price.price_pkr) && price.price_pkr > 0 && /^https?:\/\//i.test(price.product_url || '')
  ).map(price => {
    const stock = availability[(price.stock_status || '').trim().toLowerCase()];
    return {
      '@type': 'Offer', url: price.product_url, priceCurrency: 'PKR', price: price.price_pkr,
      ...(stock ? { availability: `https://schema.org/${stock}` } : {}),
      ...(price.retailer_name ? { seller: { '@type': 'Organization', name: price.retailer_name } } : {}),
    };
  });
  if (offers.length === 1) return offers[0];
  if (offers.length > 1) return {
    '@type': 'AggregateOffer', priceCurrency: 'PKR',
    lowPrice: Math.min(...offers.map(offer => offer.price)),
    highPrice: Math.max(...offers.map(offer => offer.price)), offerCount: offers.length, offers,
  };
  // A reference price is not a purchasable retailer offer.
  return undefined;
}

// ─── Product Schema ──────────────────────────────────────────────────────────

export function generateProductSchema(phone: SchemaPhone) {
  const primaryImage = phone.images?.find(img => img.url)?.url;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": phone.name,
    "description": withoutSiteBrand(
      phone.seo?.meta_description ||
      phone.seo?.ai_meta_description ||
      `${phone.name} Price, Specifications and Reviews`
    ).substring(0, 500),
    "brand": {
      "@type": "Brand",
      "name": (phone.brand_slug || "").toUpperCase().replace(/-/g, " ")
    },
    "url": `${SITE_URL}/${phone.slug}`,
    "category": phone.product_type || "Mobile Phone",
  };

  if (primaryImage) schema.image = primaryImage;

  if (phone.model_number) {
    schema.sku = phone.model_number;
    schema.mpn = phone.model_number;
  }

  if (phone.release_date) {
    schema.releaseDate = phone.release_date;
  }

  if (!phone.product_type && validRating(phone.rating)) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": phone.rating!.average!.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": phone.rating!.count
    };
  }

  const offers = productOffers(phone);
  if (offers) schema.offers = offers;

  return schema;
}

// ─── Vehicle Schema ──────────────────────────────────────────────────────────

interface SchemaVehicle extends SchemaPhone {
  ev_category?: string; vehicle_type?: string; model_name?: string; body_type?: string;
  seats?: number; doors?: number;
  specs?: { powertrain?: { drive_layout?: string } };
}

export function generateVehicleSchema(vehicle: SchemaVehicle) {
  const primaryImage = vehicle.images?.find((img) => img.url)?.url || vehicle.images?.[0]?.url;
  const isCar = (vehicle.ev_category || 'Car').toLowerCase() === 'car';
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": isCar ? "Car" : "Vehicle",
    "name": vehicle.name,
    "description": withoutSiteBrand(
      vehicle.seo?.meta_description ||
      vehicle.seo?.ai_meta_description ||
      `${vehicle.name} Price, Specifications and Features`
    ).substring(0, 500),
    "brand": {
      "@type": "Brand",
      "name": (vehicle.brand_slug || "").toUpperCase().replace('-', ' ')
    },
    "url": `${SITE_URL}/${vehicle.slug}`,
    "fuelType": vehicle.vehicle_type === 'PHEV' ? "Hybrid" : "Electric",
    "vehicleEngine": {
      "@type": "EngineSpecification",
      "engineType": vehicle.vehicle_type || "Electric Motor",
    },
  };

  if (primaryImage) schema.image = primaryImage;

  if (vehicle.model_name) schema.model = vehicle.model_name;
  if (vehicle.body_type) schema.bodyType = vehicle.body_type;
  if (vehicle.seats) schema.seatingCapacity = vehicle.seats;
  if (vehicle.doors) schema.numberOfDoors = vehicle.doors;
  if (vehicle.release_date) schema.releaseDate = vehicle.release_date;

  if (vehicle.specs?.powertrain?.drive_layout) {
    schema.driveWheelConfiguration = vehicle.specs.powertrain.drive_layout;
  }

  if (validRating(vehicle.rating)) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": vehicle.rating!.average!.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": vehicle.rating!.count
    };
  }

  const offers = productOffers(vehicle);
  if (offers) schema.offers = offers;

  return schema;
}

// ─── Review Schema ───────────────────────────────────────────────────────────

export function generateReviewSchema(reviews: SchemaReview[], phoneName: string) {
  if (!reviews || reviews.length === 0) return null;

  return reviews.slice(0, 5).map(review => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": phoneName
    },
    "author": {
      "@type": "Person",
      "name": review.userName
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "reviewBody": review.comment,
    "datePublished": review.createdAt
  }));
}

// ─── FAQ Schema ──────────────────────────────────────────────────────────────

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// ─── Breadcrumb Schema ───────────────────────────────────────────────────────

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const allItems = [{ label: "Home", href: "/" }, ...items];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href ? { "item": `${SITE_URL}${item.href}` } : {})
    }))
  };
}

// ─── Video Schema ────────────────────────────────────────────────────────────

export function generateVideoSchema(phone: SchemaPhone) {
  // The API has no actual video upload date; a product release date is not a substitute.
  void phone;
  return null;
}

// ─── Organization Schema ─────────────────────────────────────────────────────

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mobile Rates",
    "url": SITE_URL,
    "@id": `${SITE_URL}/#organization`,
    "logo": `${SITE_URL}/mobile-rates-logo.svg`,
    "description": "Compare mobile phone prices and specifications."
  };
}

// ─── WebSite Schema with SearchAction ────────────────────────────────────────

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "name": "Mobile Rates",
    "url": SITE_URL,

  };
}

// ─── WebPage Schema ──────────────────────────────────────────────────────────

export function generateWebPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": withoutSiteBrand(title),
    "description": withoutSiteBrand(description),
    "url": `${SITE_URL}${url}`,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "name": "Mobile Rates",
      "url": SITE_URL
    }
  };
}

// ─── CollectionPage Schema ───────────────────────────────────────────────────

export function generateCollectionPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": withoutSiteBrand(title),
    "description": withoutSiteBrand(description),
    "url": `${SITE_URL}${url}`
  };
}
