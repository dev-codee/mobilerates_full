import { serializeJsonLd } from "@/app/lib/schema";
import { rebrandSiteContent } from "@/app/lib/branding";
import { cleanMetadata, contentDescription } from "@/app/lib/seo";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import StaticSidebar from '@/app/components/StaticSidebar';
import { getApiBaseUrl } from '@/app/lib/api';
import { generateWebPageSchema } from '@/app/lib/schema';

async function getPage(slug: string) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/pages/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`pages fetch failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch page', error);
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams.slug);
  if (!page || page.status !== "PUBLISHED") return cleanMetadata({ title: 'Page Not Found', robots: { index: false, follow: false } });
  
  const canonicalUrl = `https://mobilerates.info/pages/${resolvedParams.slug}`;
  const title = page.seo?.meta_title || page.title;
  const description = page.seo?.meta_description || page.excerpt || contentDescription(page.body, page.title);

  return cleanMetadata({
    title,
    description,
    keywords: page.seo?.keywords,
    robots: { index: page.seo?.is_indexable !== false, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
  });
}

export default async function StaticPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams.slug);

  if (!page || page.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateWebPageSchema(page.seo?.meta_title || page.title, page.seo?.meta_description || page.excerpt || contentDescription(page.body, page.title), `/pages/${page.slug}`)),
        }}
      />
      <Navbar />
      <div className="w-full flex flex-col md:flex-row bg-surface">
        <StaticSidebar activeSlug={page.slug} />
        
        <main className="flex-1 bg-surface-white p-8 md:p-12 min-h-[calc(100vh-64px)]">
          <div className="mb-8 max-w-4xl border-b border-border-subtle pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight mb-4">{rebrandSiteContent(page.title)}</h1>
      </div>

      <div 
        className="prose prose-sm md:prose-base max-w-4xl text-on-surface prose-headings:text-on-surface prose-a:text-primary hover:prose-a:text-primary-hover"
        dangerouslySetInnerHTML={{ __html: rebrandSiteContent(page.body) }}
      />
      </main>
      </div>
      <Footer />
    </>
  );
}
