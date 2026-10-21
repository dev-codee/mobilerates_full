"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most Popular" },
  { value: "trending", label: "Trending" },
  { value: "price_asc", label: "USD Price: Low to High" },
  { value: "price_desc", label: "USD Price: High to Low" },
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Backend default (no `sort`) is newest-first, same as "latest".
  const current = searchParams.get("sort") || "latest";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "latest") {
      params.set("sort", value);
    } else {
      // Keep the URL clean — "latest" is the implicit default.
      params.delete("sort");
    }

    // Re-sorting changes the ordering, so always return to the first page.
    params.delete("page");

    // Push to the current pathname (not a hard-coded `/phones`) so that on the
    // pretty brand landing URLs (`/brands/{brand}`) the brand is
    // preserved via the rewrite instead of being dropped.
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="font-label-sm text-label-sm text-text-muted whitespace-nowrap">Sort by:</label>
      <select
        id="sort"
        value={current}
        onChange={handleChange}
        className="bg-surface-white border border-border-subtle rounded-md py-2 pl-3 pr-10 font-body-sm text-body-sm text-text-main focus:ring-1 focus:ring-primary-container focus:border-primary-container cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
