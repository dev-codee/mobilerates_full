"use client";

import { rebrandSiteContent } from "@/app/lib/branding";


import { useState, Suspense, useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Price from "./Price";
import CurrencySelector from "./CurrencySelector";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { createPortal } from "react-dom";
import BrandLogo from "./BrandLogo";
import AppIcon from "./AppIcon";

export default function NavbarClient({
  dynamicPages = [],
  popularBrands = [],
}: {
  dynamicPages?: any[];
  popularBrands?: { slug: string; name: string; total_phones?: number }[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // "Best Phones for" dropdown — rendered via portal so it isn't clipped by the
  // nav's overflow-x-auto (which forces overflow-y clipping) or the header's
  // backdrop-filter containing block.
  const bestRef = useRef<HTMLDivElement>(null);
  const [bestOpen, setBestOpen] = useState(false);
  const [bestPos, setBestPos] = useState({ top: 0, left: 0 });
  const bestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const evsRef = useRef<HTMLDivElement>(null);
  const [evsOpen, setEvsOpen] = useState(false);
  const [evsPos, setEvsPos] = useState({ top: 0, left: 0 });
  const evsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [activeBrandSlug, setActiveBrandSlug] = useState<string>(
    popularBrands[0]?.slug || "samsung"
  );
  const [mobileExpandedBrand, setMobileExpandedBrand] = useState<string | null>(null);

  useEffect(() => {
    if (popularBrands.length > 0 && !popularBrands.some((b) => b.slug === activeBrandSlug)) {
      setActiveBrandSlug(popularBrands[0].slug);
    }
  }, [popularBrands, activeBrandSlug]);

  const activeBrand =
    popularBrands.find((b) => b.slug === activeBrandSlug) ||
    popularBrands[0] || { slug: "samsung", name: "Samsung", total_phones: 0 };

  const MEGA_WIDTH = 780;
  const openBest = () => {
    if (bestTimer.current) clearTimeout(bestTimer.current);
    const r = bestRef.current?.getBoundingClientRect();
    if (r) {
      // Anchor below the trigger, clamped so the wide panel stays in the viewport.
      const maxLeft = window.innerWidth - MEGA_WIDTH - 12;
      const left = Math.max(12, Math.min(r.left, maxLeft));
      setBestPos({ top: r.bottom, left });
    }
    setBestOpen(true);
  };
  const closeBestSoon = () => {
    if (bestTimer.current) clearTimeout(bestTimer.current);
    bestTimer.current = setTimeout(() => setBestOpen(false), 120);
  };

  const openEvs = () => {
    if (evsTimer.current) clearTimeout(evsTimer.current);
    const r = evsRef.current?.getBoundingClientRect();
    if (r) {
      const maxLeft = window.innerWidth - 200 - 12;
      const left = Math.max(12, Math.min(r.left, maxLeft));
      setEvsPos({ top: r.bottom, left });
    }
    setEvsOpen(true);
  };
  const closeEvsSoon = () => {
    if (evsTimer.current) clearTimeout(evsTimer.current);
    evsTimer.current = setTimeout(() => setEvsOpen(false), 120);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseNavLinks = [
    { label: "Home", href: "/" },
    { label: "Top Phones", href: "#top-phones" },
    { label: "Earbuds", href: "/earbuds" },
    { label: "EVs", href: "#evs" },
    { label: "Compare", href: "/compare" },
    { label: "Brands", href: "/brands" },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const [path, query] = href.split('?');
    if (href === '/compare' && pathname.startsWith('/compare')) return true;
    if (href === '/earbuds' && pathname.startsWith('/earbuds')) return true;
    if (path !== pathname) return false;
    if (query) {
       const params = new URLSearchParams(query);
       for (const [key, value] of params.entries()) {
         if (searchParams.get(key) !== value) return false;
       }
       return true;
    }
    if (href === '/phones' && searchParams.get('sort')) return false;
    return true;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle shadow-sm bg-surface-white/95 backdrop-blur-md">
      {/* Top Row: Logo, Search, Actions */}
      <div className="flex justify-between items-center px-4 md:px-6 h-16 w-full max-w-[1280px] mx-auto gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/mobile-rates-logo.svg"
            alt="Mobile Rates"
            width={280}
            height={56}
            priority
            className="h-9 md:h-10 w-[180px] md:w-[200px] object-contain"
          />
        </Link>

        {/* Centered Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl justify-center px-4">
          <SearchBar className="w-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/search"
            className="md:hidden text-on-surface hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low"
            aria-label="Search"
          >
            <AppIcon name="search" size={20} />
          </Link>
          
          {user ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container-low border border-border-subtle p-1 pr-3 rounded-full transition-colors"
              >
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-on-surface max-w-[100px] truncate">{user.name}</span>
                <AppIcon name="expand_more" size={16} className="text-text-muted" />
              </button>
              
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 bg-surface-white border border-border-subtle shadow-xl rounded-xl py-2 min-w-[200px] z-50">
                  <div className="px-4 py-2 border-b border-border-subtle mb-2">
                    <p className="text-xs text-text-muted">Signed in as</p>
                    <p className="text-sm font-bold text-on-surface truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                  >
                    <AppIcon name="logout" size={18} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center bg-surface-white border border-border-subtle text-on-surface px-6 py-2 rounded-full text-sm font-semibold tracking-wide hover:bg-surface-container-low transition-colors h-11"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-on-surface p-2 rounded-full hover:bg-surface-container-low transition-colors"
            aria-label="Toggle menu"
          >
            <AppIcon name={mobileOpen ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Desktop Nav */}
      <div className="hidden md:block border-t border-border-subtle">
        <Suspense fallback={<nav className="flex justify-center items-center px-4 md:px-6 h-12 w-full max-w-[1280px] mx-auto gap-4 overflow-x-auto"></nav>}>
          <nav className="flex justify-center items-center px-4 md:px-6 h-12 w-full max-w-[1280px] mx-auto gap-4 overflow-x-auto custom-scrollbar">
            {baseNavLinks.map((link) => {
              // Insert the Dropdown at Top Phones and EVs
              const isBest = link.label === "Top Phones";
              const isEvs = link.label === "EVs";
              const renderDropdown = isBest || isEvs;
              const ref = isBest ? bestRef : (isEvs ? evsRef : null);
              const open = isBest ? bestOpen : evsOpen;
              const openFn = isBest ? openBest : openEvs;
              const closeFn = isBest ? closeBestSoon : closeEvsSoon;
              const setOpenFn = isBest ? setBestOpen : setEvsOpen;
              const active = isActive(link.href);

              return (
                <div key={link.label} className="h-full flex items-center shrink-0 gap-4">
                  {!renderDropdown ? (
                    <Link
                      href={link.href}
                      className={`h-full flex items-center transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 ${
                        active 
                          ? "text-primary border-primary bg-surface-container-low/50" 
                          : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <div
                      ref={ref as any}
                      className="relative h-full flex items-center shrink-0"
                      onMouseEnter={openFn}
                      onMouseLeave={closeFn}
                    >
                      <button
                        onClick={() => (open ? setOpenFn(false) : openFn())}
                        aria-expanded={open}
                        className={`h-full flex items-center gap-1 transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 border-transparent ${
                          open
                            ? "text-primary bg-surface-container-low/50"
                            : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                        }`}
                      >
                        {link.label}
                        <AppIcon
                          name="expand_more"
                          size={16}
                          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Dynamic Parent/Child Pages */}
            {dynamicPages.filter(p => p.pageType === 'PARENT' || (p.pageType === 'STANDALONE')).map((page) => {
              if (page.pageType === 'STANDALONE') {
                const active = isActive(`/pages/${page.slug}`);
                return (
                  <Link
                    key={page._id}
                    href={`/pages/${page.slug}`}
                    className={`h-full flex items-center shrink-0 transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 ${
                      active ? "text-primary border-primary bg-surface-container-low/50" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                    }`}
                  >
                    {rebrandSiteContent(page.title || "")}
                  </Link>
                );
              }

              // PARENT PAGE with dropdown
              const children = dynamicPages.filter(p => p.pageType === 'CHILD' && p.parentPage === page._id);
              return (
                <div key={page._id} className="relative h-full group flex items-center shrink-0">
                  <button className="h-full flex items-center gap-1 transition-colors text-sm font-semibold tracking-wide uppercase px-3 border-b-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent">
                    {rebrandSiteContent(page.title || "")}
                    <AppIcon name="expand_more" size={16} />
                  </button>
                  {children.length > 0 && (
                    <div className="absolute top-full left-0 hidden group-hover:flex flex-col bg-surface-white border border-border-subtle shadow-lg rounded-xl py-2 min-w-[200px] z-50">
                      {children.map(child => (
                        <Link
                          key={child._id}
                          href={`/pages/${child.slug}`}
                          className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                        >
                          {rebrandSiteContent(child.title || "")}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </Suspense>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-white border-t border-border-subtle animate-[slideDown_0.2s_ease-out]">
          <Suspense fallback={<nav className="flex flex-col p-4 gap-1"></nav>}>
            <nav className="flex flex-col p-4 gap-1 overflow-y-auto max-h-[calc(100vh-64px)] custom-scrollbar">
              
              {baseNavLinks.slice(0, 1).map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide uppercase border-l-4 ${
                      active ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Top Phones Menu */}
              <div className="flex flex-col mb-2 pb-2 border-b border-border-subtle">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Top 10 Brands
                  </span>
                  <Link
                    href="/brands"
                    onClick={() => setMobileOpen(false)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    All Brands
                  </Link>
                </div>

                <div className="flex flex-col gap-1 px-2">
                  {popularBrands.map((brand) => {
                    const isExpanded = mobileExpandedBrand === brand.slug;
                    return (
                      <div
                        key={brand.slug}
                        className="flex flex-col rounded-xl overflow-hidden border border-border-subtle/70 bg-surface-container-lowest/40"
                      >
                        <button
                          type="button"
                          onClick={() => setMobileExpandedBrand(isExpanded ? null : brand.slug)}
                          className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-surface-container-low flex items-center justify-center p-0.5 shrink-0">
                              <BrandLogo name={brand.name} slug={brand.slug} />
                            </div>
                            <span>{brand.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {brand.total_phones ? (
                              <span className="text-[10px] text-text-muted bg-surface-container-low px-1.5 py-0.5 rounded-full font-normal">
                                {brand.total_phones}
                              </span>
                            ) : null}
                            <AppIcon
                              name="expand_more"
                              size={18}
                              className={`text-text-muted transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="flex flex-col bg-surface-white border-t border-border-subtle px-2 py-1.5 gap-1 text-xs">
                            <Link
                              href={`/phones?brand=${brand.slug}&sort=popular`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <AppIcon name="trending_up" size={16} className="text-amber-500" />
                                <span>Popular {brand.name} Phones</span>
                              </div>
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                                Trending
                              </span>
                            </Link>
                            <Link
                              href={`/phones?brand=${brand.slug}&status=upcoming`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <AppIcon name="schedule" size={16} className="text-blue-500" />
                                <span>Upcoming {brand.name} Phones</span>
                              </div>
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                                Coming Soon
                              </span>
                            </Link>
                            <Link
                              href={`/phones?brand=${brand.slug}&sort=latest`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <AppIcon name="bolt" size={16} className="text-emerald-500" />
                                <span>Latest {brand.name} Launches</span>
                              </div>
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                New
                              </span>
                            </Link>
                            <Link
                              href={`/brands/${brand.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-primary font-semibold hover:bg-primary/5 transition-colors border-t border-border-subtle/50 mt-0.5"
                            >
                              <span>View All {brand.name} Phones</span>
                              <AppIcon name="arrow_forward" size={14} />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Link
                    href="/phones?status=upcoming"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AppIcon name="event" size={16} />
                      <span>All Upcoming Phones</span>
                    </div>
                    <AppIcon name="arrow_forward" size={14} />
                  </Link>
                </div>
              </div>

              {/* Mobile EVs Menu */}
              <div className="flex flex-col mb-2 pb-2 border-b border-border-subtle">
                <span className="px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                  EVs
                </span>
                {['Car', 'Bike', 'Scooter', 'Cycle', 'Rickshaw'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/vehicles?category=${cat}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                  >
                    {cat}s
                  </Link>
                ))}
                <Link
                  href="/vehicles/compare"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                >
                  <AppIcon name="compare_arrows" size={18} className="text-text-muted" />
                  Compare EVs
                </Link>
                <Link
                  href="/vehicles/comparisons"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-lg transition-colors text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                >
                  <AppIcon name="widgets" size={18} className="text-text-muted" />
                  All EV Comparisons
                </Link>
              </div>

              {/* Mobile Earbuds */}
              <Link
                href="/earbuds"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide uppercase border-l-4 ${
                  isActive('/earbuds') ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                }`}
              >
                <AppIcon name="headphones" size={18} className="text-text-muted" />
                Earbuds
              </Link>

              {baseNavLinks.filter(l => ['Compare', 'Brands'].includes(l.label)).map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide uppercase border-l-4 ${
                      active ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              {/* Mobile Dynamic Pages */}
              {dynamicPages.filter(p => p.pageType === 'PARENT' || (p.pageType === 'STANDALONE')).map((page) => {
                if (page.pageType === 'STANDALONE') {
                  const active = isActive(`/pages/${page.slug}`);
                  return (
                    <Link
                      key={page._id}
                      href={`/pages/${page.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide uppercase border-l-4 ${
                        active ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                      }`}
                    >
                      {rebrandSiteContent(page.title || "")}
                    </Link>
                  );
                }

                const children = dynamicPages.filter(p => p.pageType === 'CHILD' && p.parentPage === page._id);
                return (
                  <div key={page._id} className="flex flex-col gap-1 pl-2">
                    <span className="px-2 py-2 text-xs font-bold text-text-muted uppercase tracking-widest">{rebrandSiteContent(page.title || "")}</span>
                    {children.map(child => {
                      const active = isActive(`/pages/${child.slug}`);
                      return (
                        <Link
                          key={child._id}
                          href={`/pages/${child.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-semibold border-l-4 ${
                            active ? "text-primary bg-surface-container-low border-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low border-transparent"
                          }`}
                        >
                          {rebrandSiteContent(child.title || "")}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}

              {user ? (
                <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.name} width={40} height={40} className="rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface">{user.name}</span>
                      <span className="text-xs text-text-muted truncate">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-semibold tracking-wide text-error hover:bg-error/10"
                  >
                    <AppIcon name="logout" size={18} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center justify-center bg-surface-white border border-border-subtle text-on-surface px-6 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-surface-container-low transition-colors"
                >
                  Login
                </Link>
              )}
            </nav>
          </Suspense>
        </div>
      )}

      {/* Top Phones mega-menu with Brand Tabs */}
      {mounted && bestOpen && createPortal(
        <div
          style={{ position: "fixed", top: bestPos.top, left: bestPos.left, width: MEGA_WIDTH, zIndex: 60 }}
          onMouseEnter={openBest}
          onMouseLeave={closeBestSoon}
          className="bg-surface-white border border-border-subtle shadow-2xl rounded-2xl overflow-hidden max-w-[calc(100vw-24px)] max-h-[calc(100vh-140px)] flex flex-col"
        >
          <div className="flex flex-col md:flex-row flex-1 min-h-[380px]">
            {/* Left Rail: 10 Popular Brands */}
            <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r border-border-subtle bg-surface-container-lowest/60 p-3 flex flex-col">
              <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-border-subtle">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Popular Brands
                </span>
                <span className="text-[10px] font-semibold text-text-muted bg-surface-container-low px-1.5 py-0.5 rounded">
                  Top 10
                </span>
              </div>
              <div className="flex flex-col gap-0.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {popularBrands.map((brand) => {
                  const isSelected = brand.slug === activeBrand.slug;
                  return (
                    <button
                      key={brand.slug}
                      type="button"
                      onMouseEnter={() => setActiveBrandSlug(brand.slug)}
                      onClick={() => setActiveBrandSlug(brand.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                        isSelected
                          ? "bg-primary text-white shadow-sm font-semibold"
                          : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center p-0.5 shrink-0 ${
                            isSelected ? "bg-white/20" : "bg-surface-container-low"
                          }`}
                        >
                          <BrandLogo name={brand.name} slug={brand.slug} />
                        </div>
                        <span className="truncate leading-none">{brand.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {brand.total_phones ? (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-surface-container-low text-text-muted"
                            }`}
                          >
                            {brand.total_phones}
                          </span>
                        ) : null}
                        <AppIcon
                          name="chevron_right"
                          size={16}
                          className={isSelected ? "text-white" : "text-text-muted"}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Content Area: Active Brand Hub with Tabs & Links */}
            <div className="flex-1 p-5 flex flex-col justify-between bg-surface-white">
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-lowest border border-border-subtle flex items-center justify-center p-1.5 shrink-0">
                      <BrandLogo name={activeBrand.name} slug={activeBrand.slug} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 leading-tight">
                        {activeBrand.name} Phones
                        {activeBrand.total_phones ? (
                          <span className="text-xs font-normal text-text-muted bg-surface-container-low px-2 py-0.5 rounded-full">
                            {activeBrand.total_phones} models
                          </span>
                        ) : null}
                      </h3>
                      <p className="text-xs text-text-muted">
                        Official prices, upcoming phones & popular models
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/brands/${activeBrand.slug}`}
                    onClick={() => setBestOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-primary/10 text-primary text-xs font-semibold transition-colors shrink-0"
                  >
                    <span>All {activeBrand.name}</span>
                    <AppIcon name="arrow_forward" size={14} />
                  </Link>
                </div>

                {/* Brand Quick Tabs / Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {/* Popular Phones Tab */}
                  <Link
                    href={`/phones?brand=${activeBrand.slug}&sort=popular`}
                    onClick={() => setBestOpen(false)}
                    className="group flex items-start gap-3 p-3.5 rounded-xl border border-border-subtle hover:border-primary/40 hover:bg-surface-container-low/60 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <AppIcon name="trending_up" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                          Popular Phones
                        </span>
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                          Trending
                        </span>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        Most viewed & popular {activeBrand.name} phones
                      </p>
                    </div>
                  </Link>

                  {/* Upcoming Phones Tab */}
                  <Link
                    href={`/phones?brand=${activeBrand.slug}&status=upcoming`}
                    onClick={() => setBestOpen(false)}
                    className="group flex items-start gap-3 p-3.5 rounded-xl border border-border-subtle hover:border-primary/40 hover:bg-surface-container-low/60 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <AppIcon name="schedule" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                          Upcoming Phones
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        Expected releases & rumors for upcoming {activeBrand.name} devices
                      </p>
                    </div>
                  </Link>

                  {/* Latest Releases Tab */}
                  <Link
                    href={`/phones?brand=${activeBrand.slug}&sort=latest`}
                    onClick={() => setBestOpen(false)}
                    className="group flex items-start gap-3 p-3.5 rounded-xl border border-border-subtle hover:border-primary/40 hover:bg-surface-container-low/60 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <AppIcon name="bolt" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                          Latest Launches
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          New
                        </span>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        Recently launched {activeBrand.name} models with specs & pricing
                      </p>
                    </div>
                  </Link>

                  {/* Price & Budget Segment Tab */}
                  <div className="flex flex-col p-3 rounded-xl border border-border-subtle bg-surface-container-lowest/50">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AppIcon name="payments" size={16} className="text-primary" />
                      <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                        {activeBrand.name} by Price
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Link
                        href={`/phones?brand=${activeBrand.slug}&max_price=35000`}
                        onClick={() => setBestOpen(false)}
                        className="px-2 py-1 rounded-lg bg-surface-white border border-border-subtle hover:border-primary hover:text-primary text-[11px] font-medium text-text-muted text-center transition-colors truncate"
                      >
                        Under <Price amount={35000} estimate={false} />
                      </Link>
                      <Link
                        href={`/phones?brand=${activeBrand.slug}&min_price=35000&max_price=70000`}
                        onClick={() => setBestOpen(false)}
                        className="px-2 py-1 rounded-lg bg-surface-white border border-border-subtle hover:border-primary hover:text-primary text-[11px] font-medium text-text-muted text-center transition-colors truncate"
                      >
                        <Price amount={35000} estimate={false} /> – <Price amount={70000} estimate={false} />
                      </Link>
                      <Link
                        href={`/phones?brand=${activeBrand.slug}&min_price=70000&max_price=120000`}
                        onClick={() => setBestOpen(false)}
                        className="px-2 py-1 rounded-lg bg-surface-white border border-border-subtle hover:border-primary hover:text-primary text-[11px] font-medium text-text-muted text-center transition-colors truncate"
                      >
                        <Price amount={70000} estimate={false} /> – <Price amount={120000} estimate={false} />
                      </Link>
                      <Link
                        href={`/phones?brand=${activeBrand.slug}&min_price=120000`}
                        onClick={() => setBestOpen(false)}
                        className="px-2 py-1 rounded-lg bg-surface-white border border-border-subtle hover:border-primary hover:text-primary text-[11px] font-medium text-text-muted text-center transition-colors truncate"
                      >
                        <Price amount={120000} estimate={false} />+ Flagships
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Links */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <Link
                  href="/phones?status=upcoming"
                  onClick={() => setBestOpen(false)}
                  className="flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <AppIcon name="event" size={15} />
                  <span>View All Upcoming Phones</span>
                </Link>

                <Link
                  href="/brands"
                  onClick={() => setBestOpen(false)}
                  className="flex items-center gap-1 text-on-surface-variant hover:text-primary font-medium transition-colors"
                >
                  <span>All Brands Directory</span>
                  <AppIcon name="arrow_forward" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EVs mega-menu */}
      {mounted && evsOpen && createPortal(
        <div
          style={{ position: "fixed", top: evsPos.top, left: evsPos.left, width: 200, zIndex: 60 }}
          onMouseEnter={openEvs}
          onMouseLeave={closeEvsSoon}
          className="bg-surface-white border border-border-subtle shadow-xl rounded-xl p-3 flex flex-col gap-1"
        >
          {['Car', 'Bike', 'Scooter', 'Cycle', 'Rickshaw'].map(cat => (
             <Link key={cat} href={`/vehicles?category=${cat}`} onClick={() => setEvsOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
               {cat}s
             </Link>
           ))}
           <div className="my-1 border-t border-border-subtle" />
           <Link href="/vehicles/compare" onClick={() => setEvsOpen(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
             <AppIcon name="compare_arrows" size={18} className="text-text-muted" />
             Compare EVs
           </Link>
           <Link href="/vehicles/comparisons" onClick={() => setEvsOpen(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">
             <AppIcon name="widgets" size={18} className="text-text-muted" />
             All EV Comparisons
           </Link>
        </div>,
        document.body
      )}
    <CurrencySelector />
    </header>
  );
}
