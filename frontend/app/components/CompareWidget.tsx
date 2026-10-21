"use client";

import { useRouter } from "next/navigation";
import AppIcon from "./AppIcon";

export default function CompareWidget() {
  const router = useRouter();

  return (
    <section className="w-full py-16 px-4 md:px-6 bg-surface-white border-t border-border-subtle">
      <div className="max-w-4xl mx-auto bg-surface-container-lowest border border-border-subtle rounded-xl p-8 md:p-12 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.05)] relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-container/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            Compare & Decide
          </h2>
          <p className="text-base text-text-muted mt-2">
            Pit two devices against each other side-by-side to find the ultimate
            winner.
          </p>
        </div>

        {/* Phone Selectors */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
          {/* Select Phone A */}
          <button
            onClick={() => router.push("/compare")}
            className="w-full md:w-2/5 bg-surface-white border border-border-subtle rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-primary transition-colors group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center border border-border-subtle text-outline">
                <AppIcon name="smartphone" size={24} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-text-muted">
                  Device 1
                </span>
                <span className="text-base text-on-surface font-medium group-hover:text-primary transition-colors">
                  Select Phone A
                </span>
              </div>
            </div>
            <AppIcon name="search" size={20} className="text-outline" />
          </button>

          {/* VS Badge */}
          <div className="w-12 h-12 shrink-0 rounded-full bg-surface-container-low border border-border-subtle flex items-center justify-center z-10 -my-4 md:my-0 md:-mx-4 shadow-sm">
            <span className="text-sm font-semibold tracking-wide text-on-surface-variant">
              VS
            </span>
          </div>

          {/* Select Phone B */}
          <button
            onClick={() => router.push("/compare")}
            className="w-full md:w-2/5 bg-surface-white border border-border-subtle rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-primary transition-colors group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center border border-border-subtle text-outline">
                <AppIcon name="smartphone" size={24} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-text-muted">
                  Device 2
                </span>
                <span className="text-base text-on-surface font-medium group-hover:text-primary transition-colors">
                  Select Phone B
                </span>
              </div>
            </div>
            <AppIcon name="search" size={20} className="text-outline" />
          </button>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center relative z-10">
          <button
            onClick={() => router.push("/compare")}
            className="bg-primary-container text-white rounded-lg px-10 py-4 font-semibold text-sm hover:bg-primary transition-colors shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
          >
            Compare Now
            <AppIcon name="compare_arrows" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
