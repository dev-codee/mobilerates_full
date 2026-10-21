import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FlagshipSection from "./components/FlagshipSection";
import TrendingSection from "./components/TrendingSection";
import BrandsSection from "./components/BrandsSection";
import MobileFinderSection from "./components/MobileFinderSection";
import FeaturedComparisons from "./components/FeaturedComparisons";
import EarbudsSection from "./components/EarbudsSection";
import Footer from "./components/Footer";
import { getHomeData, getPopularComparisons, getEarbuds } from "./lib/api";
import AdSlot from "./components/AdSlot";

export const revalidate = 300; // Cache and revalidate page every 5 minutes

export const metadata: Metadata = cleanMetadata({
  title: "Compare Mobile Phone & Earbuds Prices",
  description: "Compare latest mobile phone and wireless earbuds prices across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Anker, and more.",
  alternates: {
    canonical: "https://mobilerates.info",
  },
  openGraph: {
    title: "Compare Mobile Phone & Earbuds Prices",
    description: "Compare latest mobile phone and wireless earbuds prices across all top retailers.",
    url: "https://mobilerates.info",
  },
});

export default async function Home() {
  // Fetch home data, comparisons, and trending earbuds in parallel
  const [homeData, popularComparisons, earbudsData] = await Promise.all([
    getHomeData(),
    getPopularComparisons(12),
    getEarbuds("limit=4").catch(() => null),
  ]);

  return (
    <>
      <Navbar />
      
      <main className="w-full flex-1">
        <HeroSection />
        
        <div className="w-full overflow-hidden mt-6">
          <FlagshipSection phones={homeData?.trending} />

          <div className="max-w-4xl mx-auto px-4 mt-6">
            <AdSlot placement="TOP_HEADER" layout="row" showSkeleton={false} />
          </div>

          <TrendingSection phones={homeData?.trending} />

          <div className="max-w-4xl mx-auto px-4 mt-12 mb-6">
            <AdSlot placement="BOTTOM_PAGE" layout="row" showSkeleton={false} />
          </div>
        </div>

        {/* Wireless Earbuds Showcase */}
        <EarbudsSection earbuds={earbudsData?.earbuds} />

        {/* Find a Mobile */}
        <MobileFinderSection />

        {/* Featured Brands */}
        <BrandsSection brands={homeData?.brands} />

        {/* Featured Comparisons */}
        <FeaturedComparisons comparisons={popularComparisons} />
      </main>

      <Footer />
    </>
  );
}
