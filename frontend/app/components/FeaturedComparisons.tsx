"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AppIcon from "./AppIcon";

interface FeaturedComparisonsProps {
  comparisons?: any[];
}

export default function FeaturedComparisons({ comparisons }: FeaturedComparisonsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const validComparisons = (comparisons ?? []).filter(
    (comp) => comp.phones && comp.phones.length >= 2 && comp.phones[0] && comp.phones[1]
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
  }, [validComparisons.length]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  const seenPairs = new Set<string>();
  for (let index = validComparisons.length - 1; index >= 0; index--) {
    const key = validComparisons[index].phones.map((product: { slug: string }) => product.slug).sort().join("-vs-");
    if (seenPairs.has(key)) validComparisons.splice(index, 1);
    else seenPairs.add(key);
  }

  if (validComparisons.length === 0) return null;

  const imgOf = (phone: any) =>
    phone.images?.find((img: any) => img.is_primary)?.url ||
    phone.images?.[0]?.url ||
    "/placeholder-phone.svg";

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-6 mt-6 mb-10">
      <div className="bg-surface-white border border-border-subtle rounded-xl p-4 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-text-main tracking-tight">
            Featured Mobile Comparisons
          </h2>
          <Link
            href="/compare"
            className="inline-flex items-center text-primary text-sm font-semibold hover:underline gap-0.5"
          >
            Compare More
            <AppIcon name="chevron_right" size={18} />
          </Link>
        </div>

        {/* Scroller */}
        <div className="relative">
          {canLeft && (
            <button
              type="button"
              aria-label="Scroll comparisons left"
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
            {validComparisons.map((comp, index) => {
              const p1 = comp.phones[0];
              const p2 = comp.phones[1];
              return (
                <Link
                  key={comp._id ?? index}
                  href={`/compare/${p1.slug}-vs-${p2.slug}`}
                  className="group flex-shrink-0 w-[300px] md:w-[330px] bg-surface-container-lowest border border-border-subtle rounded-xl p-3 flex items-center justify-between gap-2 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  {/* Phone 1 */}
                  <div className="flex items-center gap-2 w-[42%] min-w-0">
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image src={imgOf(p1)} alt={p1.name} fill className="object-contain" sizes="48px" />
                    </div>
                    <span className="text-xs font-medium text-text-main line-clamp-3 group-hover:text-primary transition-colors">
                      {p1.name}
                    </span>
                  </div>

                  {/* VS */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-text-main text-white flex items-center justify-center font-bold text-[11px] italic">
                    VS
                  </div>

                  {/* Phone 2 */}
                  <div className="flex items-center gap-2 w-[42%] min-w-0 justify-end text-right">
                    <span className="text-xs font-medium text-text-main line-clamp-3 group-hover:text-primary transition-colors">
                      {p2.name}
                    </span>
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image src={imgOf(p2)} alt={p2.name} fill className="object-contain" sizes="48px" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {canRight && (
            <button
              type="button"
              aria-label="Scroll comparisons right"
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
