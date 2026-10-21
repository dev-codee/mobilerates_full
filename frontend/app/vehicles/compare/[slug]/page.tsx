import { cleanMetadata } from "@/app/lib/seo";
import { Metadata } from "next";
import {
  getVehicles,
  getVehicleComparisonData,
  trackVehicleComparison,
  getPopularVehicleComparisons,
} from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import VehicleCompareClient from "@/app/components/VehicleCompareClient";
import PopularVehicleComparisons from "@/app/components/PopularVehicleComparisons";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 60;

function parseCompareSlugs(slugParam: string): [string, string] | null {
  if (!slugParam) return null;
  try {
    const decoded = decodeURIComponent(slugParam);
    const parts = decoded.split("-vs-");
    if (parts.length >= 2) {
      const slug1 = parts[0]?.trim();
      const slug2 = parts.slice(1).join("-vs-")?.trim();
      if (slug1 && slug2 && slug1 !== slug2) {
        return [slug1, slug2];
      }
    }
  } catch (err) {
    console.error("Error parsing compare slugs:", err);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const parsedSlugs = parseCompareSlugs(resolvedParams?.slug);

    if (parsedSlugs) {
      const vehicles = await getVehicleComparisonData(parsedSlugs);
      if (vehicles && vehicles.length === 2) {
        const title = `${vehicles[0].name} vs ${vehicles[1].name} — Price & Specs Comparison`;
        const description = `Compare ${vehicles[0].name} vs ${vehicles[1].name} prices, full specifications, range, charging, battery, and performance.`;
        const canonicalUrl = `https://mobilerates.info/vehicles/compare/${[...parsedSlugs].sort()[0]}-vs-${[...parsedSlugs].sort()[1]}`;
        const img1 = vehicles[0].images?.[0]?.url;

        return cleanMetadata({
          title,
          description,
          robots: { index: vehicles.every(product => product.seo?.is_indexable === true), follow: true },
          alternates: { canonical: canonicalUrl },
          openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: img1 ? [{ url: img1, alt: `${vehicles[0].name} vs ${vehicles[1].name}` }] : [],
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
            images: img1 ? [img1] : [],
          },
        });
      }
    }
  } catch (err) {
    console.error("Metadata generation error:", err);
  }

  return cleanMetadata({
    title: "EV Comparison — Compare Electric Vehicle Prices",
    description: "Compare electric vehicle prices and specifications side by side.",
    alternates: { canonical: "https://mobilerates.info/vehicles/compare" },
  });
}

export default async function VehicleCompareCanonicalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const parsedSlugs = parseCompareSlugs(resolvedParams?.slug);

  if (!parsedSlugs) {
    notFound();
  }

  const [slug1, slug2] = parsedSlugs;
  const selectedSlugs = [slug1, slug2];
  const ordered = [...selectedSlugs].sort();
  if (selectedSlugs.join("-vs-") !== ordered.join("-vs-")) permanentRedirect(`/vehicles/compare/${ordered.join("-vs-")}`);

  const [comparisonResult, allVehiclesResult, popularResult] = await Promise.allSettled([
    getVehicleComparisonData(selectedSlugs),
    getVehicles("limit=1000"),
    getPopularVehicleComparisons(8),
  ]);

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

  if (comparisonResult.status === "rejected") throw comparisonResult.reason;
  if (comparisonVehicles.length !== 2) notFound();

  // Track this comparison (fire and forget)
  if (comparisonVehicles.length >= 2) {
    trackVehicleComparison(selectedSlugs).catch(console.error);
  }

  return (
    <>
      <Navbar />
      <main className="w-full bg-surface">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
          <Breadcrumb
            items={[
              { label: "Vehicles", href: "/vehicles" },
              { label: "Compare", href: "/vehicles/compare" },
              {
                label:
                  comparisonVehicles.length === 2
                    ? `${comparisonVehicles[0].name} vs ${comparisonVehicles[1].name}`
                    : `${slug1} vs ${slug2}`,
              },
            ]}
          />
        </div>

        <VehicleCompareClient initialVehicles={comparisonVehicles} allVehicles={allVehicles} />

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
          {popularComparisons && popularComparisons.length > 0 && (
            <PopularVehicleComparisons comparisons={popularComparisons} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
