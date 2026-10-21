"use client";

import { useState } from "react";
import Image from "next/image";
import type { EarbudImage } from "@/app/lib/api";

interface EarbudGalleryProps {
  images: EarbudImage[];
  altText: string;
  colors?: string[];
}

export default function EarbudGallery({ images, altText, colors }: EarbudGalleryProps) {
  const initialIndex = Math.max(
    0,
    images.findIndex((img) => img.is_primary)
  );
  const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-surface-white rounded-xl border border-border-subtle p-6 flex flex-col gap-4">
        <div className="aspect-square w-full rounded-lg bg-surface-container-lowest flex items-center justify-center p-8">
          <Image
            src="/placeholder-phone.svg"
            alt={altText}
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  const mainImage = images[selectedIndex] || images[0];

  return (
    <div className="bg-surface-white rounded-xl border border-border-subtle p-5 md:p-6 flex flex-col gap-4 h-fit sticky top-20">
      {/* Main Image Viewport */}
      <div className="w-full h-[280px] md:h-[360px] rounded-xl bg-surface-container-lowest flex items-center justify-center p-6 relative mx-auto overflow-hidden">
        <Image
          src={mainImage.url}
          alt={mainImage.alt_text || altText}
          fill
          sizes="(max-width: 768px) 100vw, 450px"
          className="object-contain mix-blend-multiply transition-all duration-300 hover:scale-105"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none pt-1">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 shrink-0 bg-surface-container-lowest overflow-hidden transition-all p-1.5 ${
                selectedIndex === index
                  ? "border-primary shadow-xs ring-2 ring-primary/20"
                  : "border-border-subtle hover:border-primary/50 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `View ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      )}

      {/* Color options if available */}
      {colors && colors.length > 0 && (
        <div className="pt-2 border-t border-border-subtle flex items-center gap-2 flex-wrap text-xs text-text-muted">
          <span className="font-semibold text-text-main">Available Colors:</span>
          {colors.map((c, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-surface-container-low border border-border-subtle text-text-main font-medium capitalize"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
