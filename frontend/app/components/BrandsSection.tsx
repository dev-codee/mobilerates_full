"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import AppIcon from "./AppIcon";
import type { Brand } from "@/app/lib/api";

interface BrandsSectionProps {
  brands?: Brand[];
}

export default function BrandsSection({ brands }: BrandsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Only show brands that actually have devices. The /home endpoint returns
  // `phone_count` while /brands returns `total_phones`, so accept either.
  const displayBrands = (brands ?? []).filter(
    (b) => (b.total_phones ?? b.phone_count ?? 0) > 0
  );

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayBrands.length]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (displayBrands.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6">
      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-text-main tracking-tight">
            Featured Mobile Brands
          </h2>
          <Link
            href="/brands"
            className="inline-flex items-center text-primary text-sm font-semibold hover:underline"
          >
            View All
            <AppIcon name="chevron_right" size={18} className="ml-0.5" />
          </Link>
        </div>

        {/* Scroller */}
        <div className="relative">
          {canLeft && (
            <button
              type="button"
              aria-label="Scroll brands left"
              onClick={() => scrollByCards(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 w-11 h-11 rounded-full bg-white/90 border border-border-subtle shadow-md flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
            >
              <AppIcon name="chevron_left" size={20} />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {displayBrands.map((brand) => (
              <Link
                key={brand._id}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center flex-shrink-0 w-[92px] md:w-[104px]"
              >
                <div className="w-full aspect-square rounded-xl bg-surface-container-lowest border border-border-subtle flex items-center justify-center p-4 group-hover:border-primary/40 group-hover:shadow-sm transition-all">
                  <BrandLogo name={brand.name} slug={brand.slug} logo={brand.logo} />
                </div>
                <span className="mt-2 text-sm text-text-muted group-hover:text-primary transition-colors text-center line-clamp-1">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>

          {canRight && (
            <button
              type="button"
              aria-label="Scroll brands right"
              onClick={() => scrollByCards(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 w-11 h-11 rounded-full bg-white/90 border border-border-subtle shadow-md flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
            >
              <AppIcon name="chevron_right" size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
