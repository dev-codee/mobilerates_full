"use client";

import { useCurrency } from "@/app/context/CurrencyContext";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Brand } from "@/app/lib/api";
import AppIcon from "./AppIcon";

const RAM_OPTIONS = ["4", "6", "8", "12", "16"];
const PROCESSOR_OPTIONS = ["Snapdragon", "MediaTek", "Apple", "Exynos"];
const DISPLAY_OPTIONS = ["AMOLED", "OLED", "LCD", "IPS"];
const CAMERA_OPTIONS = ["50 MP & above", "64 MP & above", "108 MP & above"];
const NETWORK_OPTIONS = ["5G", "4G"];
const OS_UPDATE_OPTIONS = ["2 Years", "3 Years", "4+ Years"];
const BATTERY_OPTIONS = ["4000 mAh & above", "5000 mAh & above", "6000 mAh & above"];
const VIDEO_OPTIONS = ["4K", "8K"];

interface FilterState {
  brands: string[];
  minPrice: string;
  maxPrice: string;
  rams: string[];
  processors: string[];
  displays: string[];
  cameras: string[];
  networks: string[];
  osUpdates: string[];
  batteries: string[];
  videos: string[];
}

export default function SidebarFilter({
  brands,
  totalResults,
}: {
  brands: Brand[];
  totalResults?: number;
}) {
  const router = useRouter();
  const { currency, convertAmount, rates } = useCurrency();
  const filterCurrency = currency === "PKR" || (rates.PKR && rates[currency]) ? currency : "PKR";
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Initialize state
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [selectedRams, setSelectedRams] = useState<string[]>([]);
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
  const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);

  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [selectedOsUpdates, setSelectedOsUpdates] = useState<string[]>([]);
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  // Brand search query inside filter box
  const [brandSearch, setBrandSearch] = useState("");

  useEffect(() => {
    const getParamArray = (param: string) => {
      const val = searchParams.get(param);
      return val ? val.split(",") : [];
    };

    setSelectedBrands(getParamArray("brand"));
    setSelectedRams(getParamArray("ram"));
    setSelectedProcessors(getParamArray("processor"));
    setSelectedDisplays(getParamArray("display"));
    setSelectedCameras(getParamArray("camera"));
    setSelectedNetworks(getParamArray("network"));
    setSelectedOsUpdates(getParamArray("os_updates"));
    setSelectedBatteries(getParamArray("battery"));
    setSelectedVideos(getParamArray("video"));

    setMinPrice(searchParams.get("min_price") ? String(Number((convertAmount(Number(searchParams.get("min_price")), "PKR", filterCurrency) ?? 0).toFixed(2))) : "");
    setMaxPrice(searchParams.get("max_price") ? String(Number((convertAmount(Number(searchParams.get("max_price")), "PKR", filterCurrency) ?? 0).toFixed(2))) : "");
  }, [searchParams, filterCurrency, rates]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  // Calculate active filter count
  const activeCount =
    selectedBrands.length +
    selectedRams.length +
    selectedProcessors.length +
    selectedDisplays.length +
    selectedCameras.length +
    selectedNetworks.length +
    selectedOsUpdates.length +
    selectedBatteries.length +
    selectedVideos.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  const updateFilters = (state: Partial<FilterState>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Helper to update param
    const updateParam = (key: string, arr?: string[]) => {
      if (arr && arr.length > 0) params.set(key, arr.join(","));
      else if (arr) params.delete(key);
    };

    if (state.brands !== undefined) updateParam("brand", state.brands);
    if (state.rams !== undefined) updateParam("ram", state.rams);
    if (state.processors !== undefined) updateParam("processor", state.processors);
    if (state.displays !== undefined) updateParam("display", state.displays);
    if (state.cameras !== undefined) updateParam("camera", state.cameras);
    if (state.networks !== undefined) updateParam("network", state.networks);
    if (state.osUpdates !== undefined) updateParam("os_updates", state.osUpdates);
    if (state.batteries !== undefined) updateParam("battery", state.batteries);
    if (state.videos !== undefined) updateParam("video", state.videos);

    if (state.minPrice !== undefined) {
      if (state.minPrice) params.set("min_price", state.minPrice);
      else params.delete("min_price");
    }

    if (state.maxPrice !== undefined) {
      if (state.maxPrice) params.set("max_price", state.maxPrice);
      else params.delete("max_price");
    }

    // Reset page if pagination exists
    params.delete("page");

    // Check if ONLY a single brand is selected and no other filters
    const filterKeys = Array.from(params.keys());
    if (
      filterKeys.length === 1 &&
      filterKeys[0] === "brand" &&
      params.get("brand")?.split(",").length === 1
    ) {
      router.push(`/brands/${params.get("brand")}`);
      return;
    }

    router.push(`/phones?${params.toString()}`);
  };

  const handleToggle = (
    currentList: string[],
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    stateKey: keyof FilterState
  ) => {
    const updated = currentList.includes(value)
      ? currentList.filter((item) => item !== value)
      : [...currentList, value];
    setter(updated);
    updateFilters({ [stateKey]: updated });
  };

  const handlePriceApply = () => {
    const min = minPrice === '' ? '' : convertAmount(Number(minPrice), filterCurrency, 'PKR');
    const max = maxPrice === '' ? '' : convertAmount(Number(maxPrice), filterCurrency, 'PKR');
    if (min === null || max === null || (min !== '' && min < 0) || (max !== '' && max < 0) || (min !== '' && max !== '' && min > max)) return;
    updateFilters({ minPrice: String(min), maxPrice: String(max) });
  };

  const handleClearAll = () => {
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setSelectedRams([]);
    setSelectedProcessors([]);
    setSelectedDisplays([]);
    setSelectedCameras([]);
    setSelectedNetworks([]);
    setSelectedOsUpdates([]);
    setSelectedBatteries([]);
    setSelectedVideos([]);

    // Clear filter params while preserving sort
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);

    const qs = params.toString();
    router.push(qs ? `/phones?${qs}` : "/phones");
  };

  const filteredBrandsList = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const boxClasses = "bg-surface-white rounded-xl p-4 border border-border-subtle shadow-sm";
  const titleClasses = "text-xs font-bold text-text-main mb-3 uppercase tracking-wider flex items-center justify-between";

  // Reusable Filter Content (rendered in both Desktop Sidebar and Mobile Drawer)
  const renderFilterSections = () => (
    <div className="space-y-4">
      {/* Price Range Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Price Range ({filterCurrency})</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0" step="any" aria-label={`Minimum price in ${filterCurrency}`}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
            />
            <span className="text-text-muted">-</span>
            <input
              type="number"
              placeholder="Max"
              min="0" step="any" aria-label={`Maximum price in ${filterCurrency}`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary text-text-main"
            />
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full py-2 bg-primary hover:bg-on-primary-fixed-variant text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Apply Price
          </button>
        </div>
      </div>

      {/* Brand Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>
          <span>Brand</span>
          {selectedBrands.length > 0 && (
            <span className="text-[10px] text-primary font-bold lowercase bg-primary/10 px-1.5 py-0.5 rounded">
              {selectedBrands.length} selected
            </span>
          )}
        </h3>
        {brands.length > 8 && (
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search brand..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-border-subtle rounded-md px-2.5 py-1 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>
        )}
        <div className="space-y-2 custom-scrollbar max-h-56 overflow-y-auto pr-2">
          {filteredBrandsList.map((brand) => (
            <label key={brand.slug} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.slug)}
                onChange={() => handleToggle(selectedBrands, brand.slug, setSelectedBrands, "brands")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {brand.name.toUpperCase()}
              </span>
            </label>
          ))}
          {filteredBrandsList.length === 0 && (
            <p className="text-xs text-text-muted py-2">No brand matching &quot;{brandSearch}&quot;</p>
          )}
        </div>
      </div>

      {/* Network Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Network</h3>
        <div className="space-y-2">
          {NETWORK_OPTIONS.map((net) => (
            <label key={net} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedNetworks.includes(net)}
                onChange={() => handleToggle(selectedNetworks, net, setSelectedNetworks, "networks")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {net}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* RAM Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>RAM</h3>
        <div className="space-y-2">
          {RAM_OPTIONS.map((ram) => (
            <label key={ram} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedRams.includes(ram)}
                onChange={() => handleToggle(selectedRams, ram, setSelectedRams, "rams")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {ram} GB
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Processor Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Processor</h3>
        <div className="space-y-2">
          {PROCESSOR_OPTIONS.map((proc) => (
            <label key={proc} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedProcessors.includes(proc)}
                onChange={() => handleToggle(selectedProcessors, proc, setSelectedProcessors, "processors")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {proc}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Display Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Display Type</h3>
        <div className="space-y-2">
          {DISPLAY_OPTIONS.map((disp) => (
            <label key={disp} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedDisplays.includes(disp)}
                onChange={() => handleToggle(selectedDisplays, disp, setSelectedDisplays, "displays")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {disp}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Battery Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Battery</h3>
        <div className="space-y-2">
          {BATTERY_OPTIONS.map((bat) => (
            <label key={bat} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedBatteries.includes(bat)}
                onChange={() => handleToggle(selectedBatteries, bat, setSelectedBatteries, "batteries")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {bat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Camera Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Camera</h3>
        <div className="space-y-2">
          {CAMERA_OPTIONS.map((cam) => (
            <label key={cam} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedCameras.includes(cam)}
                onChange={() => handleToggle(selectedCameras, cam, setSelectedCameras, "cameras")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {cam}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* OS Updates Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>OS Updates</h3>
        <div className="space-y-2">
          {OS_UPDATE_OPTIONS.map((os) => (
            <label key={os} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedOsUpdates.includes(os)}
                onChange={() => handleToggle(selectedOsUpdates, os, setSelectedOsUpdates, "osUpdates")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {os}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Video Recording Filter */}
      <div className={boxClasses}>
        <h3 className={titleClasses}>Video Recording</h3>
        <div className="space-y-2">
          {VIDEO_OPTIONS.map((vid) => (
            <label key={vid} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={selectedVideos.includes(vid)}
                onChange={() => handleToggle(selectedVideos, vid, setSelectedVideos, "videos")}
                className="w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs text-text-main group-hover:text-primary transition-colors">
                {vid}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar (Hidden on Mobile) ── */}
      <aside className="hidden md:block w-64 flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <AppIcon name="tune" size={18} className="text-primary" />
            <h2 className="font-bold text-base text-text-main">Filters</h2>
            {activeCount > 0 && (
              <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>

        {renderFilterSections()}
      </aside>

      {/* ── Mobile Trigger Button (Visible ONLY on Mobile) ── */}
      <div className="block md:hidden w-full mb-3">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-surface-white border border-border-subtle rounded-xl font-bold text-sm text-text-main shadow-sm hover:border-primary/50 transition-all cursor-pointer"
        >
          <AppIcon name="tune" size={18} className="text-primary" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile Drawer Modal ── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-sm bg-surface h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-border-subtle bg-surface-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <AppIcon name="tune" size={18} className="text-primary" />
                <h2 className="font-bold text-base text-text-main">Filters</h2>
                {activeCount > 0 && (
                  <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-full text-text-muted hover:text-text-main hover:bg-surface-container-low transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <AppIcon name="close" size={20} />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {renderFilterSections()}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border-subtle bg-surface-white flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 py-3 px-4 border border-border-subtle rounded-xl text-xs font-semibold text-text-main hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-3 px-4 bg-primary hover:bg-on-primary-fixed-variant text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
