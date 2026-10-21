"use client";

import { useState } from "react";
import Image from "next/image";
import type { PhoneImage } from "@/app/lib/api";

interface PhoneGalleryProps {
  images: PhoneImage[];
  altText: string;
}

export default function PhoneGallery({ images, altText }: PhoneGalleryProps) {
  // Find primary image or default to first
  const initialIndex = images.findIndex((img) => img.is_primary);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  // Fallback if no images
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

  const mainImage = images[selectedIndex];

  return (
    <div className="bg-surface-white rounded-xl border border-border-subtle p-6 flex flex-col gap-4 h-fit">
      {/* Main Image */}
      <div className="w-full h-[280px] md:h-[360px] rounded-lg bg-surface-container-lowest flex items-center justify-center p-8 relative mx-auto">
        <Image
          src={mainImage.url}
          alt={mainImage.alt_text || altText}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide pt-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 rounded-lg border-2 flex-shrink-0 bg-surface-container-lowest overflow-hidden transition-all p-2 ${
                selectedIndex === index
                  ? "border-primary"
                  : "border-border-subtle hover:border-primary opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt_text || `Thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
