"use client";

import { useState } from "react";
import Image from "next/image";
import AppIcon from "./AppIcon";

interface BrandLogoProps {
  name: string;
  slug: string;
  logo?: string;
}

export default function BrandLogo({ name, slug, logo }: BrandLogoProps) {
  const [error, setError] = useState(false);
  
  // Use locally generated SVG fallback if logo is missing or broken.
  const src = logo || `/brands/${slug.toLowerCase()}.svg`;

  if (error && !logo) {
    return (
      <AppIcon name="smartphone" size={32} className="text-text-muted" />
    );
  }

  return (
    <Image
      src={error ? `/brands/${slug.toLowerCase()}.svg` : src}
      alt={`${name} logo`}
      width={64}
      height={64}
      className="object-contain"
      onError={() => setError(true)}
    />
  );
}
