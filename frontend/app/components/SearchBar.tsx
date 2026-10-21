"use client";
import Price from "@/app/components/Price";


import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SearchResultItem } from "../lib/api";
import AppIcon from "./AppIcon";

export default function SearchBar({ className = "w-72" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${apiUrl}/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResults(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const getItemHref = (item: SearchResultItem) => `/${item.slug}`;

  const isEarbud = (item: SearchResultItem) => {
    return item.item_type === "earbud" || !!item.specs?.audio;
  };

  return (
    <div className={`relative hidden md:block ${className}`} ref={wrapperRef}>
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search phones, earbuds..."
          className="w-full bg-surface-container-low text-on-surface border border-border-subtle rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
        />
        <AppIcon
          name="search"
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      </form>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[400px] bg-surface-white border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50">
          {query.trim() === "" ? (
            <div className="p-6 text-sm text-text-muted text-center flex flex-col items-center gap-2">
              <AppIcon name="search" size={32} className="opacity-50" />
              Type to search phones & earbuds...
            </div>
          ) : loading ? (
            <div className="p-6 text-sm text-text-muted text-center flex flex-col items-center gap-2">
              <AppIcon name="progress_activity" size={32} className="animate-spin opacity-50 text-primary" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {results.map((item) => {
                const earbudItem = isEarbud(item);
                const href = getItemHref(item);

                return (
                  <Link
                    key={`${item.slug}-${item.item_type || 'phone'}`}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-3 hover:bg-surface-container-lowest border-b border-border-subtle/50 last:border-b-0 transition-colors"
                  >
                    <div className="w-12 h-12 shrink-0 bg-surface-container rounded-lg flex items-center justify-center p-1 overflow-hidden">
                      {item.images?.[0]?.url ? (
                        <img
                          src={item.images[0].url}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <AppIcon
                          name={earbudItem ? "headphones" : "smartphone"}
                          size={24}
                          className="text-text-muted"
                        />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-text-main truncate">
                          {item.name}
                        </span>
                        {earbudItem && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary shrink-0">
                            Earbuds
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-muted truncate mt-0.5">
                        <Price product={item} />
                      </span>
                    </div>
                  </Link>
                );
              })}
              <button
                onClick={handleSearch}
                className="w-full block text-center p-3 text-sm text-primary font-bold hover:bg-surface-container-lowest transition-colors bg-surface-container-low/30 border-t border-border-subtle/50 cursor-pointer"
              >
                View all results
              </button>
            </div>
          ) : (
            <div className="p-6 text-sm text-text-muted text-center flex flex-col items-center gap-2">
              <AppIcon name="search_off" size={32} className="opacity-50" />
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
