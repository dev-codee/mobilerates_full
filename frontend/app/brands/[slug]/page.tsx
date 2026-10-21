import { notFound } from "next/navigation";
import { getBrands, getPhones } from "@/app/lib/api";
import PhonesPage, { generateMetadata as phonesMetadata } from "@/app/phones/page";

export const revalidate = 600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function brandSearchParams({ params, searchParams }: Props) {
  const { slug } = await params;
  const brands = await getBrands("phone");
  if (!brands.some((brand) => brand.slug === slug)) notFound();
  return { ...(await searchParams), brand: slug };
}

export async function generateMetadata(props: Props) {
  const metadata = await phonesMetadata({ searchParams: Promise.resolve(await brandSearchParams(props)) });
  const { slug } = await props.params;
  const { phones } = await getPhones(`brand=${encodeURIComponent(slug)}&limit=all`);
  if (!phones.some(phone => phone.seo?.is_indexable === true)) {
    return { ...metadata, robots: { index: false, follow: true } };
  }
  return metadata;
}

export default async function BrandPage(props: Props) {
  return PhonesPage({ searchParams: Promise.resolve(await brandSearchParams(props)) });
}
