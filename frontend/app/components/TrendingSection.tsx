import Link from "next/link";
import PhoneCard from "./PhoneCard";
import type { Phone } from "@/app/lib/api";
import AppIcon from "./AppIcon";

// ─── Component ────────────────────────────────────────────────────────────────

interface TrendingSectionProps {
  phones?: Phone[];
}

export default function TrendingSection({ phones }: TrendingSectionProps) {
  const displayPhones = phones?.slice(0, 4) ?? [];

  return (
    <section className="w-full py-16 px-4 md:px-6 bg-background">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Trending Mobile Phones
            </h2>
            <p className="text-base text-text-muted mt-2">
              The most searched devices this week.
            </p>
          </div>
          <Link
            href="/phones?sort=trending"
            className="hidden md:inline-flex items-center text-primary text-sm font-semibold tracking-wide hover:underline gap-1"
          >
            View All
            <AppIcon name="chevron_right" size={18} />
          </Link>
        </div>

        {/* Grid or Empty State */}
        {displayPhones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPhones.map((phone) => (
              <PhoneCard key={phone._id} phone={phone} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-white border border-border-subtle rounded-xl flex flex-col items-center">
            <AppIcon name="smartphone" size={48} className="text-outline mb-4 opacity-60" />
            <p className="text-text-muted text-base">
              No trending phones available right now.
            </p>
          </div>
        )}

        {/* Mobile View All */}
        {displayPhones.length > 0 && (
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/phones?sort=trending"
              className="inline-flex items-center text-primary text-sm font-semibold tracking-wide hover:underline gap-1"
            >
              View All Phones
              <AppIcon name="chevron_right" size={18} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
