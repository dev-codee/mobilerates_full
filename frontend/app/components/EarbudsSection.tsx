import Link from "next/link";
import EarbudCard from "./EarbudCard";
import type { Earbud } from "@/app/lib/api";
import AppIcon from "./AppIcon";

interface EarbudsSectionProps {
  earbuds?: Earbud[];
}

export default function EarbudsSection({ earbuds }: EarbudsSectionProps) {
  const displayEarbuds = earbuds?.slice(0, 4) ?? [];

  if (displayEarbuds.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-14 px-4 md:px-6 bg-surface-white border-y border-border-subtle/50">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-primary/10 text-primary">
                <AppIcon name="headphones" size={16} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                TWS & Audio
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              Popular Wireless Earbuds
            </h2>
            <p className="text-sm text-text-muted mt-1.5">
              Compare prices, active noise cancellation, and battery life on top earbuds.
            </p>
          </div>

          <Link
            href="/earbuds"
            className="hidden md:inline-flex items-center text-primary text-sm font-bold tracking-wide hover:underline gap-1.5"
          >
            Explore All Earbuds
            <AppIcon name="chevron_right" size={18} />
          </Link>
        </div>

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayEarbuds.map((earbud) => (
            <EarbudCard key={earbud._id} earbud={earbud} sizes="(max-width: 639px) calc(100vw - 90px), (max-width: 767px) calc(50vw - 86px), (max-width: 1023px) calc(50vw - 102px), (max-width: 1447px) calc(25vw - 96px), 264px" />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/earbuds"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors gap-1.5"
          >
            Explore All Earbuds
            <AppIcon name="chevron_right" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
