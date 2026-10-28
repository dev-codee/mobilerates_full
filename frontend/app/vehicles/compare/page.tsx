import { toComparisonOption } from "@/app/lib/comparison-options";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import {
  getVehicles,
  getVehicleComparisonData,
  getPopularVehicleComparisons,
} from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import VehicleCompareClient from "@/app/components/VehicleCompareClient";
import PopularVehicleComparisons from "@/app/components/PopularVehicleComparisons";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  return cleanMetadata({
  robots: { index: Object.keys(params).length === 0, follow: true },
  title: "Compare Electric Vehicles Side-by-Side — Prices & Specifications",
  description:
    "Compare electric vehicle prices, range, charging speed, battery, performance, and features side by side.",
  alternates: {
    canonical: "https://mobilerates.info/vehicles/compare",
  },
  openGraph: {
    title: "Compare Electric Vehicles Side-by-Side",
    description:
      "Compare EV prices, range, charging speed, battery, and specs side by side.",
    url: "https://mobilerates.info/vehicles/compare",
  },
  });
}

export default async function VehicleComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawVehicles = resolvedParams.vehicle;

  let selectedSlugs: string[] = [];
  if (rawVehicles) {
    selectedSlugs = Array.isArray(rawVehicles) ? rawVehicles : [rawVehicles];
  } else if (resolvedParams.slugs) {
    selectedSlugs =
      typeof resolvedParams.slugs === "string" ? resolvedParams.slugs.split(",") : [];
  }

  selectedSlugs = selectedSlugs.map((s) => s.trim()).filter((s) => s.length > 0);

  // Redirect to canonical URL if exactly 2 vehicles are compared
  if (selectedSlugs.length === 2) {
    const { permanentRedirect } = await import("next/navigation");
    permanentRedirect(`/vehicles/compare/${[...selectedSlugs].sort().join("-vs-")}`);
  }

  const [comparisonResult, allVehiclesResult, popularResult] = await Promise.allSettled([
    getVehicleComparisonData(selectedSlugs),
    getVehicles("limit=1000&view=selector"),
    getPopularVehicleComparisons(8),
  ]);

  if (allVehiclesResult.status === "rejected") throw allVehiclesResult.reason;
  if (comparisonResult.status === "rejected") throw comparisonResult.reason;

  const comparisonVehicles =
    comparisonResult.status === "fulfilled" && Array.isArray(comparisonResult.value)
      ? comparisonResult.value
      : [];
  const allVehicles =
    allVehiclesResult.status === "fulfilled" && allVehiclesResult.value?.data
      ? allVehiclesResult.value.data
      : [];
  const popularComparisons =
    popularResult.status === "fulfilled" && Array.isArray(popularResult.value)
      ? popularResult.value
      : [];

  return (
    <>
      <Navbar />
      <main className="w-full bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
          <Breadcrumb
            items={[{ label: "Vehicles", href: "/vehicles" }, { label: "Compare" }]}
          />
        </div>
        <VehicleCompareClient initialVehicles={comparisonVehicles} allVehicles={allVehicles.map(toComparisonOption)} />

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
          {popularComparisons && popularComparisons.length > 0 && (
            <div className="flex flex-col gap-6">
              <PopularVehicleComparisons comparisons={popularComparisons} />
              <div className="flex justify-center">
                <Link
                  href="/vehicles"
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Browse All EVs
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
