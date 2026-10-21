"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppIcon from "./AppIcon";

const budgetPills = [
  { label: "Under 15k", value: 15000 },
  { label: "Under 30k", value: 30000 },
  { label: "Under 50k", value: 50000 },
  { label: "Under 80k", value: 80000 },
  { label: "Under 150k", value: 150000 },
];

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState<number | null>(null);
  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.append("q", query.trim());
    if (budget) params.append("max_price", budget.toString());
    
    const queryString = params.toString();
    if (queryString) {
       if (query.trim()) {
          router.push(`/search?${queryString}`);
       } else {
          router.push(`/phones?${queryString}`);
       }
    }
  }

  return (
    <section className="w-full pt-20 pb-16 px-4 md:px-6 text-center bg-surface-white border-b border-border-subtle">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-6 leading-[1.1] tracking-tight">
          Find the Right Phone
          <br />
          at the{" "}
          <span className="text-primary-container">Right Price</span>
        </h1>
        <p className="text-lg text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          Compare latest mobile phone prices across all top
          retailers. Make objective, data-driven purchasing decisions.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-surface-white border border-border-subtle rounded-xl p-2 shadow-[0_10px_15px_-3px_rgba(15,23,42,0.05)] flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto relative z-10 hover:shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08)] transition-shadow duration-300"
        >
          <div className="flex-1 flex items-center px-4 py-2 w-full">
            <AppIcon name="search" size={20} className="text-text-muted mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a mobile phone..."
              className="w-full bg-transparent border-none outline-none text-base text-on-surface placeholder:text-outline focus:ring-0 p-0"
              id="hero-search"
              aria-label="Search mobile phones"
            />
          </div>
          <div className="w-px h-8 bg-border-subtle hidden md:block" />
          <div className="px-4 py-2 w-full md:w-48 shrink-0">
            <label htmlFor="hero-budget" className="sr-only">Budget range</label>
            <select
              id="hero-budget"
              value={budget ?? ""}
              onChange={(event) => setBudget(event.target.value ? Number(event.target.value) : null)}
              className="w-full bg-transparent text-sm font-semibold text-on-surface-variant focus-visible:outline-2 focus-visible:outline-primary"
            >
              <option value="">Any Budget</option>
              {budgetPills.map((pill) => (
                <option key={pill.value} value={pill.value}>{pill.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto bg-primary-container text-white rounded-lg px-8 py-3 font-semibold text-sm hover:bg-primary transition-colors h-11 shadow-sm cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Budget Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {budgetPills.map((pill) => (
            <Link
              key={pill.value}
              href={`/phones?max_price=${pill.value}`}
              className="bg-surface-container-low border border-border-subtle text-on-surface-variant rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-primary-container hover:text-white hover:border-primary-container transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
