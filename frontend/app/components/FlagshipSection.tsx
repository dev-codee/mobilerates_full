import Link from "next/link";
import PhoneCard from "./PhoneCard";
import type { Phone } from "@/app/lib/api";
import AppIcon from "./AppIcon";

interface FlagshipSectionProps {
  phones?: Phone[];
}

export default function FlagshipSection({ phones = [] }: FlagshipSectionProps) {
  // Take top 4 most expensive or highly rated phones from the list
  const flagships = [...phones]
    .sort((a, b) => (b.price_pkr || 0) - (a.price_pkr || 0))
    .slice(0, 4);

  return (
    <section className="w-full pt-10 pb-8 px-4 md:px-6 bg-surface-white border-b border-border-subtle relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight mb-2 flex items-center gap-2">
              <AppIcon name="workspace_premium" size={26} className="text-primary" />
              Flagship Phones
            </h2>
            <p className="text-sm text-text-muted">The ultimate premium smartphone experiences.</p>
          </div>
          <Link href="/phones" className="text-sm font-semibold text-primary hover:underline hidden sm:block">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flagships.map((phone, index) => (
            <PhoneCard key={phone._id} phone={phone} variant="grid" priority={index === 0} />
          ))}
          {flagships.length === 0 && (
            <div className="col-span-full py-10 text-center text-text-muted bg-surface-container-low rounded-xl">
              Loading flagship phones...
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center sm:hidden">
           <Link href="/phones" className="text-sm font-semibold text-primary hover:underline">
             View All Flagships →
           </Link>
        </div>
      </div>
    </section>
  );
}
