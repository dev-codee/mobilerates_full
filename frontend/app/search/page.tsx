import type { Metadata } from "next";
import { searchProducts, type SearchResultItem, type Phone, type Earbud } from "@/app/lib/api";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PhoneCard from "@/app/components/PhoneCard";
import EarbudCard from "@/app/components/EarbudCard";
import Breadcrumb from "@/app/components/Breadcrumb";
import AppIcon from "@/app/components/AppIcon";

export const metadata: Metadata = { title: "Search Results", robots: { index: false, follow: true } };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q as string;

  const results: SearchResultItem[] = q ? await searchProducts(q) : [];

  const phones = results.filter(
    (item) => item.item_type !== "earbud" && !item.specs?.audio
  ) as unknown as Phone[];

  const earbuds = results.filter(
    (item) => item.item_type === "earbud" || !!item.specs?.audio
  ) as unknown as Earbud[];

  return (
    <>
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 bg-surface min-h-[60vh]">
        <Breadcrumb items={[{ label: "Search Results" }]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-text-main">
              Search Results for &quot;{q}&quot;
            </h1>
            <p className="text-xs md:text-sm text-text-muted mt-1">
              {results.length} total product{results.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="flex flex-col gap-10">
            {/* Phones Section */}
            {phones.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                  <AppIcon name="smartphone" size={20} className="text-primary" />
                  Mobile Phones ({phones.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {phones.map((phone) => (
                    <PhoneCard key={phone._id} phone={phone} variant="grid" />
                  ))}
                </div>
              </div>
            )}

            {/* Earbuds Section */}
            {earbuds.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                  <AppIcon name="headphones" size={20} className="text-primary" />
                  Wireless Earbuds ({earbuds.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {earbuds.map((earbud) => (
                    <EarbudCard key={earbud._id} earbud={earbud} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface-white rounded-xl border border-border-subtle p-12 flex flex-col items-center justify-center text-center">
            <AppIcon name="search_off" size={64} className="text-outline mb-4 opacity-60" />
            <h2 className="font-headline-md text-xl font-bold text-text-main mb-2">
              No Results Found
            </h2>
            <p className="text-text-muted max-w-md mx-auto">
              We couldn&apos;t find any phones or earbuds matching &quot;{q}&quot;. Try searching for a different brand or model.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
