import Price, { CurrencyText } from "@/app/components/Price";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Breadcrumb from "@/app/components/Breadcrumb";
import AppIcon from "@/app/components/AppIcon";
import { getBrands, getHomeData, getPages, type Brand, type Phone } from "@/app/lib/api";

export const revalidate = 3600;

export const metadata: Metadata = cleanMetadata({
  title: "HTML Sitemap — All Mobile Phones, Brands & Prices",
  description:
    "Browse the full sitemap — mobile phones, popular brands, price ranges, comparisons and more, all in one place.",
  alternates: {
    canonical: "https://mobilerates.info/site-map",
  },
  openGraph: {
    title: "HTML Sitemap",
    description: "Browse all mobile phone pages, brands, and price ranges.",
    url: "https://mobilerates.info/site-map",
  },
});

type LinkItem = { label: string; href: string };

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base md:text-lg font-bold text-text-main mt-6 mb-3">
      <span className="w-1 h-5 bg-primary rounded-full" />
      {children}
    </h2>
  );
}

function LinkGrid({ links }: { links: LinkItem[] }) {
  return (
    <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4">
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-text-muted hover:text-primary hover:underline transition-colors"
            >
              <CurrencyText text={l.label} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function SiteMapPage() {
  const [brands, homeData, pages] = await Promise.all([getBrands("phone"), getHomeData(), getPages()]);

  const activeBrands = (brands ?? []).filter(
    (b: Brand) => (b.total_phones ?? b.phone_count ?? 0) > 0
  );

  const topMobiles: Phone[] = (homeData?.trending ?? []).slice(0, 10);

  const generalInfo: LinkItem[] = [
    { label: "News & Reviews", href: "/news" },
    ...pages.filter(page => page.status === 'PUBLISHED').map(page => ({ label: page.title, href: `/pages/${page.slug}` })),
  ];

  const mobilePhones: LinkItem[] = [
    { label: "Phone Finder", href: "/phones" },
    { label: "Trending Phones", href: "/phones?sort=trending" },
    { label: "Compare Mobiles", href: "/compare" },
    { label: "Mobile Phone Brands", href: "/brands" },
    { label: "Latest News", href: "/news" },
  ];

  const byPrice: LinkItem[] = [
    { label: "Mobiles under Rs. 15,000", href: "/phones?max_price=15000" },
    { label: "Mobiles under Rs. 30,000", href: "/phones?max_price=30000" },
    { label: "Mobiles under Rs. 50,000", href: "/phones?max_price=50000" },
    { label: "Mobiles under Rs. 80,000", href: "/phones?max_price=80000" },
    { label: "Mobiles under Rs. 150,000", href: "/phones?max_price=150000" },
  ];



  const brandLinks: LinkItem[] = activeBrands.map((b: Brand) => ({
    label: `${b.name} Mobiles`,
    href: `/brands/${b.slug}`,
  }));

  return (
    <>
      <Navbar />
      <main className="w-full bg-surface min-h-[60vh]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
          <Breadcrumb items={[{ label: "Sitemap" }]} />

          <h1 className="text-2xl md:text-3xl font-bold text-text-main mt-4 mb-2">
            Mobile Rates Sitemap
          </h1>
          <p className="text-sm text-text-muted mb-6">
            Everything on Mobile Rates in one place — phones, brands, price ranges and comparisons.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main column */}
            <div className="lg:col-span-2 bg-surface-white border border-border-subtle rounded-xl p-5 md:p-6 shadow-sm">
              <SectionHeading>General Info On Mobile Rates</SectionHeading>
              <LinkGrid links={generalInfo} />

              <SectionHeading>Mobile Phones</SectionHeading>
              <LinkGrid links={mobilePhones} />

              <SectionHeading>Mobiles By Price</SectionHeading>
              <LinkGrid links={byPrice} />


              <SectionHeading>Popular Mobile Brands</SectionHeading>
              {brandLinks.length > 0 ? (
                <LinkGrid links={brandLinks} />
              ) : (
                <p className="text-sm text-text-muted">No brands available.</p>
              )}

              <div className="mt-6 pt-4 border-t border-border-subtle text-xs text-text-muted">
                <span className="font-bold text-text-main">Mobile Rates</span> › Sitemap
              </div>
            </div>

            {/* Top Mobiles sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-surface-white border border-border-subtle rounded-xl p-4 shadow-sm lg:sticky lg:top-24">
                <h2 className="flex items-center gap-2 text-base font-bold text-text-main mb-4">
                  <span className="w-1 h-5 bg-primary rounded-full" />
                  Top Mobiles
                </h2>
                {topMobiles.length > 0 ? (
                  <ul className="divide-y divide-border-subtle">
                    {topMobiles.map((phone) => {
                      const img =
                        phone.images?.find((i) => i.is_primary)?.url ||
                        phone.images?.[0]?.url;
                      const rawPriceStr = String(phone.price_pkr || "");
                      const parsedPricePkr = Number(rawPriceStr.replace(/[^0-9.]/g, ''));
                      const validPrices = (phone.prices || []).map((p) => Number(p.price_pkr)).filter(p => !isNaN(p) && p > 0);
                      const price = (!isNaN(parsedPricePkr) && parsedPricePkr > 0) ? parsedPricePkr : (validPrices.length ? Math.min(...validPrices) : null);
                      return (
                        <li key={phone._id}>
                          <Link
                            href={`/${phone.slug}`}
                            className="flex items-center gap-3 py-2.5 group"
                          >
                            <div className="w-12 h-12 flex-shrink-0 bg-surface-container-low rounded-lg flex items-center justify-center overflow-hidden">
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={img}
                                  alt={phone.name}
                                  className="w-full h-full object-contain mix-blend-darken"
                                />
                              ) : (
                                <AppIcon name="smartphone" size={20} className="text-text-muted" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-sm font-semibold text-text-main group-hover:text-primary transition-colors line-clamp-1">
                                {phone.name}
                              </span>
                              <span className="block text-xs font-bold text-price-green mt-0.5">
                                <Price product={phone} />
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">No phones available.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
