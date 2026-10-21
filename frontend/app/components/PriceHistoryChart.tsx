"use client";

import Price from "@/app/components/Price";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useMemo, useState } from "react";
import type { PriceHistoryPoint } from "@/app/lib/api";
import AppIcon from "@/app/components/AppIcon";

interface PriceHistoryChartProps {
  points: PriceHistoryPoint[];
  phoneName: string;
}

// The SVG is stretched to a fixed pixel height via preserveAspectRatio="none",
// so these viewBox units are just a convenient internal coordinate space. Strokes
// use vector-effect="non-scaling-stroke" to stay crisp, and dots/tooltip are HTML
// overlays positioned by percentage so they never distort.
const VB_W = 600;
const VB_H = 200;
const PAD_X = 10;
const PAD_TOP = 14;
const PAD_BOTTOM = 14;


function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function PriceHistoryChart({ points, phoneName }: PriceHistoryChartProps) {
  const { rates, updatedAt } = useCurrency();
  const formatPrice = (amount: number) => <Price amount={amount} />;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    // Keep only valid, positive prices and sort chronologically.
    const clean = (points || [])
      .filter((p) => Number(p.price_pkr) > 0 && !isNaN(Date.parse(p.date)))
      .map((p) => ({ price: Number(p.price_pkr), time: Date.parse(p.date), date: p.date }))
      .sort((a, b) => a.time - b.time);

    if (clean.length < 2) return null;

    const prices = clean.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min || 1; // avoid divide-by-zero on a flat line

    const innerW = VB_W - PAD_X * 2;
    const innerH = VB_H - PAD_TOP - PAD_BOTTOM;

    const coords = clean.map((p, i) => {
      const x = PAD_X + (i / (clean.length - 1)) * innerW;
      const t = max === min ? 0.5 : (p.price - min) / span; // flat series sits mid-height
      const y = PAD_TOP + (1 - t) * innerH;
      return { ...p, x, y, xPct: (x / VB_W) * 100, yPct: (y / VB_H) * 100 };
    });

    const first = clean[0].price;
    const last = clean[clean.length - 1].price;
    const change = last - first;
    const changePct = first ? (change / first) * 100 : 0;

    return { coords, min, max, first, last, change, changePct };
  }, [points]);

  if (!chart) return null;

  const { coords, min, max, last, change, changePct } = chart;
  const dropped = change < 0;
  const unchanged = change === 0;
  const active = activeIndex != null ? coords[activeIndex] : null;
  const changeColor = unchanged ? "text-text-muted" : dropped ? "text-price-green" : "text-rose-600";

  const areaPath =
    `M ${coords[0].x.toFixed(1)} ${(VB_H - PAD_BOTTOM).toFixed(1)} ` +
    coords.map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ") +
    ` L ${coords[coords.length - 1].x.toFixed(1)} ${(VB_H - PAD_BOTTOM).toFixed(1)} Z`;
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");

  return (
    <section className="bg-white border border-border-subtle rounded-xl shadow-sm overflow-hidden">
      {/* Collapsible header / toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-4 md:px-6 text-left hover:bg-surface-container-low/40 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <AppIcon name="trending_up" size={20} className="text-primary shrink-0" />
          <span className="font-headline-md text-base md:text-lg font-bold text-text-main truncate">
            Price History
          </span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          {/* Compact summary shown even while collapsed */}
          <span className="hidden sm:flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-text-main">{formatPrice(last)}</span>
            <span className={`text-xs font-semibold inline-flex items-center gap-0.5 ${changeColor}`}>
              {!unchanged && <AppIcon name={dropped ? "arrow_downward" : "arrow_upward"} size={12} />}
              {changePct >= 0 ? "+" : ""}
              {changePct.toFixed(1)}%
            </span>
          </span>
          <AppIcon
            name="expand_more"
            size={20}
            className={`text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-border-subtle">
          {/* Summary stats */}
          <div className="grid grid-cols-3 divide-x divide-border-subtle border-b border-border-subtle">
            <div className="p-3 text-center">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Current</span>
              <span className="text-sm font-bold text-text-main">{formatPrice(last)}</span>
            </div>
            <div className="p-3 text-center">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Lowest</span>
              <span className="text-sm font-bold text-price-green">{formatPrice(min)}</span>
            </div>
            <div className="p-3 text-center">
              <span className="text-[10px] text-text-muted uppercase tracking-wider block">Change</span>
              <span className={`text-sm font-bold inline-flex items-center gap-0.5 ${changeColor}`}>
                {!unchanged && <AppIcon name={dropped ? "arrow_downward" : "arrow_upward"} size={13} />}
                {changePct >= 0 ? "+" : ""}
                {changePct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Chart — fixed height, full width */}
          <div className="px-4 md:px-6 pt-4">
            <div
              className="relative w-full h-[180px]"
              onMouseLeave={() => setActiveIndex(null)}
            >
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                role="img"
                aria-label={`Price history graph for ${phoneName}`}
              >
                <defs>
                  <linearGradient id="priceHistoryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary, #2563eb)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--color-primary, #2563eb)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#priceHistoryFill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--color-primary, #2563eb)"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Active guide line */}
              {active && (
                <div
                  className="absolute top-0 bottom-0 w-px border-l border-dashed border-border-subtle pointer-events-none"
                  style={{ left: `${active.xPct}%` }}
                />
              )}

              {/* Dots (HTML overlay → always circular) */}
              {coords.map((c, i) => (
                <span
                  key={i}
                  className={`absolute rounded-full bg-white border-2 border-primary -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all ${
                    activeIndex === i ? "w-3 h-3" : "w-2 h-2"
                  }`}
                  style={{ left: `${c.xPct}%`, top: `${c.yPct}%` }}
                />
              ))}

              {/* Hit areas for hover/touch */}
              {coords.map((c, i) => (
                <span
                  key={`hit-${i}`}
                  className="absolute top-0 bottom-0 -translate-x-1/2 cursor-pointer"
                  style={{ left: `${c.xPct}%`, width: `${100 / (coords.length - 1)}%` }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onTouchStart={() => setActiveIndex(i)}
                />
              ))}

              {/* Tooltip */}
              {active && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2 z-10 px-2.5 py-1.5 rounded-lg bg-text-main text-white text-xs shadow-lg whitespace-nowrap"
                  style={{
                    left: `clamp(48px, ${active.xPct}%, calc(100% - 48px))`,
                    top: 4,
                  }}
                >
                  <div className="font-bold">{formatPrice(active.price)}</div>
                  <div className="text-white/70 text-[10px]">{formatDate(active.date)}</div>
                </div>
              )}
            </div>
          </div>

          {rates.PKR && <p className="px-4 md:px-6 text-xs text-text-muted">Historical Pakistan prices converted using one exchange-rate snapshot{updatedAt ? ` (${updatedAt.slice(0, 10)})` : ''}. Percentage changes reflect the original PKR prices.</p>}
         {/* Date range footer */}
          <div className="px-4 md:px-6 py-3 flex items-center justify-between text-[10px] md:text-xs text-text-muted">
            <span>{formatDate(coords[0].date)}</span>
            <span>Highest: {formatPrice(max)}</span>
            <span>{formatDate(coords[coords.length - 1].date)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
