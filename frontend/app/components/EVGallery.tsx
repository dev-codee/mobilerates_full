"use client";

import { useState } from "react";
import Image from "next/image";
import AppIcon from "./AppIcon";

interface EVGalleryProps {
  images?: { url: string; is_primary?: boolean; alt_text?: string }[];
  altText: string;
  vehicleName?: string;
}

export default function EVGallery({ images = [], altText, vehicleName }: EVGalleryProps) {
  const validImages = images.filter((img) => img && img.url);
  const initialIndex = validImages.findIndex((img) => img.is_primary);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fallback if no images
  if (!validImages || validImages.length === 0) {
    return (
      <div className="bg-surface-white rounded-2xl border border-border-subtle p-6 flex flex-col gap-4">
        <div className="aspect-[16/10] w-full rounded-xl bg-surface-container-lowest flex items-center justify-center p-6 relative overflow-hidden">
          <Image
            src="/placeholder-car.svg"
            alt={altText}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  const currentImage = validImages[selectedIndex] || validImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="bg-surface-white rounded-2xl border border-border-subtle p-4 md:p-6 flex flex-col gap-4 shadow-sm">
        {/* Main Stage */}
        <div className="relative w-full aspect-[16/10] rounded-xl bg-surface-container-lowest border border-border-subtle/50 flex items-center justify-center overflow-hidden group">
          <Image
            src={currentImage.url}
            alt={currentImage.alt_text || altText}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            priority
          />

          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface-white/90 backdrop-blur border border-border-subtle text-text-main hover:bg-primary hover:text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <AppIcon name="chevron_left" size={20} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface-white/90 backdrop-blur border border-border-subtle text-text-main hover:bg-primary hover:text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <AppIcon name="chevron_right" size={20} />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="View Fullscreen"
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-surface-white/80 backdrop-blur border border-border-subtle text-text-muted hover:text-primary hover:bg-surface-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <AppIcon name="fullscreen" size={18} />
          </button>

          {/* Index Pill */}
          {validImages.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-[11px] font-semibold text-white">
              {selectedIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails Strip */}
        {validImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin pt-1">
            {validImages.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Select image ${index + 1}`}
                className={`relative w-20 h-14 md:w-24 md:h-16 rounded-lg border-2 flex-shrink-0 bg-surface-container-lowest overflow-hidden transition-all p-1 ${
                  selectedIndex === index
                    ? "border-primary ring-2 ring-primary/20 scale-105"
                    : "border-border-subtle hover:border-primary/60 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || `Thumbnail ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close"
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <AppIcon name="close" size={24} />
          </button>

          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center">
            <Image
              src={currentImage.url}
              alt={currentImage.alt_text || altText}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {vehicleName && (
            <p className="text-white/80 text-sm font-medium mt-4">
              {vehicleName} ({selectedIndex + 1} of {validImages.length})
            </p>
          )}

          {validImages.length > 1 && (
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center gap-1 text-sm font-semibold transition-colors"
              >
                <AppIcon name="chevron_left" size={18} /> Prev
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center gap-1 text-sm font-semibold transition-colors"
              >
                Next <AppIcon name="chevron_right" size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
