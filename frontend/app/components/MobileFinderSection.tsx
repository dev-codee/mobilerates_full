"use client";
import { useCurrency } from "@/app/context/CurrencyContext";
import Price from "@/app/components/Price";


import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppIcon from "./AppIcon";

const PRICE_MIN = 0;
const PRICE_MAX = 500000;
const PRICE_STEP = 1000;

const features: { label: string; href: string; icon: string }[] = [
  { label: "5G Phones", href: "/phones?network=5G", icon: "signal_cellular_alt" },
  { label: "8GB & Above RAM", href: "/phones?ram=8,12,16", icon: "memory" },
  { label: "256GB & Above Storage", href: "/phones?storage=256,512,1024", icon: "storage" },
  { label: "120Hz Refresh Rate", href: "/phones?refresh_rate=120", icon: "sync" },
  { label: "5000mAh & Above Battery", href: "/phones?battery=5000", icon: "battery_charging_full" },
  { label: "AMOLED Display", href: "/phones?display=AMOLED", icon: "smartphone" },
];

const quickPicks: { label: string; href: string; icon: string }[] = [
  { label: "All Phones", href: "/phones", icon: "smartphone" },
  { label: "5G Phones", href: "/phones?network=5G", icon: "signal_cellular_alt" },
  { label: "Trending", href: "/phones?sort=trending", icon: "flame" },
  { label: "Latest", href: "/phones?sort=latest", icon: "sparkles" },
];

const priceChips = [15000, 20000, 25000, 30000, 40000, 50000, 80000, 100000];

export default function MobileFinderSection() {
  const router = useRouter();
  const { currency, rates, convertAmount } = useCurrency();
  const filterCurrency = currency === "PKR" || (rates.PKR && rates[currency]) ? currency : "PKR";
  const display = (value: number) => Number((convertAmount(value, "PKR", filterCurrency) ?? value).toFixed(2));
  const [minVal, setMinVal] = useState(PRICE_MIN);
  const [maxVal, setMaxVal] = useState(PRICE_MAX);

  const clamp = (n: number) => Math.min(PRICE_MAX, Math.max(PRICE_MIN, n));

  const handleMinRange = (v: number) => setMinVal(Math.min(v, maxVal - PRICE_STEP));
  const handleMaxRange = (v: number) => setMaxVal(Math.max(v, minVal + PRICE_STEP));

  const handleMinInput = (raw: string) => {
    const n = clamp(convertAmount(Number(raw) || 0, filterCurrency, "PKR") ?? 0);
    setMinVal(Math.min(n, maxVal - PRICE_STEP));
  };
  const handleMaxInput = (raw: string) => {
    const n = clamp(convertAmount(Number(raw) || 0, filterCurrency, "PKR") ?? 0);
    setMaxVal(Math.max(n, minVal + PRICE_STEP));
  };

  const leftPct = ((minVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const rightPct = ((maxVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const findMobiles = () => {
    const params = new URLSearchParams();
    if (minVal > PRICE_MIN) params.set("min_price", String(minVal));
    if (maxVal < PRICE_MAX) params.set("max_price", String(maxVal));
    const qs = params.toString();
    router.push(qs ? `/phones?${qs}` : "/phones");
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-6 mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Finder + Features */}
        <div className="lg:col-span-2 bg-surface-white border border-border-subtle rounded-xl p-5 md:p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price finder */}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-text-main tracking-tight mb-4">
              Let&apos;s Find a Mobile for You!
            </h2>

            <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
              <h3 className="text-sm font-bold text-text-main mb-4">Price</h3>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-semibold text-text-muted">{filterCurrency}</span>
                <input
                  type="number"
                  step="any"
                  aria-label="Minimum price"
                  value={display(minVal)}
                  min={display(PRICE_MIN)}
                  max={display(PRICE_MAX)}
                  onChange={(e) => handleMinInput(e.target.value)}
                  className="w-full bg-surface-white border border-border-subtle rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <span className="text-sm text-text-muted px-1">to</span>
                <span className="text-sm font-semibold text-text-muted">{filterCurrency}</span>
                <input
                  type="number"
                  step="any"
                  aria-label="Maximum price"
                  value={display(maxVal)}
                  min={display(PRICE_MIN)}
                  max={display(PRICE_MAX)}
                  onChange={(e) => handleMaxInput(e.target.value)}
                  className="w-full bg-surface-white border border-border-subtle rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Dual range slider */}
              <div className="mobile-rates-dual-range relative h-5 mb-5">
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full bg-border-subtle" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-price-green"
                  style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
                />
                <input
                  type="range"
                  aria-label="Minimum price slider"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={minVal}
                  onChange={(e) => handleMinRange(Number(e.target.value))}
                />
                <input
                  type="range"
                  aria-label="Maximum price slider"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={maxVal}
                  onChange={(e) => handleMaxRange(Number(e.target.value))}
                />
              </div>

              <button
                onClick={findMobiles}
                className="w-full py-3 bg-primary hover:bg-on-primary-fixed-variant text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Find Mobiles
              </button>
            </div>
          </div>

          {/* Popular features */}
          <div>
            <h3 className="text-base font-bold text-text-main mb-3">Mobiles by Popular Features</h3>
            <ul className="divide-y divide-border-subtle">
              {features.map((f) => (
                <li key={f.href}>
                  <Link
                    href={f.href}
                    className="flex items-center gap-3 py-3 group"
                  >
                    <span className="w-8 h-8 flex-shrink-0 rounded-md bg-surface-container-low text-text-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <AppIcon name={f.icon} size={18} />
                    </span>
                    <span className="text-sm font-medium text-text-main group-hover:text-primary transition-colors">
                      {f.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Quick picks + price chips */}
        <div className="lg:col-span-1 bg-surface-white border border-border-subtle rounded-xl p-5 md:p-6 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-text-main tracking-tight mb-4">
            What Are You Looking to Buy?
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickPicks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="flex items-center gap-2 px-3 py-3 rounded-lg border border-border-subtle bg-surface-container-lowest hover:border-primary hover:shadow-sm transition-all group"
              >
                <span className="w-8 h-8 flex-shrink-0 rounded-md bg-white border border-border-subtle flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                  <AppIcon name={q.icon} size={18} />
                </span>
                <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors flex items-center gap-0.5">
                  {q.label}
                  <AppIcon name="chevron_right" size={16} className="text-text-muted" />
                </span>
              </Link>
            ))}
          </div>

          <h3 className="text-base font-bold text-text-main mb-3">Mobiles by Price</h3>
          <div className="grid grid-cols-4 gap-2">
            {priceChips.map((p) => (
              <Link
                key={p}
                href={`/phones?max_price=${p}`}
                className="text-center px-2 py-2 rounded-md border border-border-subtle bg-surface-white text-xs font-semibold text-text-main hover:border-primary hover:text-primary transition-colors"
              >
                <Price amount={p} estimate={false} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Slider thumb styling (scoped) */}
      <style>{`
        .mobile-rates-dual-range input[type="range"] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          background: transparent;
          -webkit-appearance: none;
          appearance: none;
          pointer-events: none;
        }
        .mobile-rates-dual-range input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 3px solid #22c55e;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .mobile-rates-dual-range input[type="range"]::-moz-range-thumb {
          pointer-events: auto;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: #ffffff;
          border: 3px solid #22c55e;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .mobile-rates-dual-range input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
        }
        .mobile-rates-dual-range input[type="range"]::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </section>
  );
}
