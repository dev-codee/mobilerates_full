import { isIndexableArticle } from "@/app/lib/editorial";
import { serializeJsonLd } from "@/app/lib/schema";
import { rebrandSiteContent } from "@/app/lib/branding";
import { cleanMetadata, contentDescription, withoutSiteBrand } from "@/app/lib/seo";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cache } from 'react';
import { getApiBaseUrl } from '@/app/lib/api';

const getBlog = cache(async (slug: string) => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/blogs/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`news fetch failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch blog', error);
    throw error;
  }
});

function validDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);
  if (!blog || blog.status !== "PUBLISHED") return cleanMetadata({ title: 'Not Found', robots: { index: false, follow: false } });
  
  const canonicalUrl = `https://mobilerates.info/news/${resolvedParams.slug}`;
  const title = blog.seo?.meta_title || `${blog.title} — Mobile News & Reviews`;
  const description = blog.seo?.meta_description || blog.excerpt || contentDescription(blog.body, blog.title);
  const image = blog.coverImage || '/social-preview.png';

  return cleanMetadata({
    title,
    description,
    robots: { index: isIndexableArticle(blog), follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: validDate(blog.publish_date) || validDate(blog.createdAt),
      modifiedTime: validDate(blog.updatedAt) || validDate(blog.createdAt),
      images: [{ url: image, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  });
}

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);

  if (!blog || blog.status !== 'PUBLISHED') {
    notFound();
  }

  const publishedDate = validDate(blog.publish_date) || validDate(blog.createdAt);
  const modifiedDate = validDate(blog.updatedAt) || publishedDate;
  const relatedProducts = (Array.isArray(blog.related_products) ? blog.related_products : [])
    .filter((product: { slug?: string; name?: string } | null): product is { slug: string; name: string } =>
      !!product && typeof product.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(product.slug)
      && typeof product.name === 'string' && !!product.name.trim());

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": `https://mobilerates.info/news/${blog.slug}`,
    "headline": withoutSiteBrand(blog.title),
    "description": withoutSiteBrand(blog.excerpt || contentDescription(blog.body, blog.title)),
    "image": blog.coverImage ? [blog.coverImage] : [],
    ...(publishedDate ? { datePublished: publishedDate } : {}),
    ...(modifiedDate ? { dateModified: modifiedDate } : {}),
    ...(blog.author ? { author: { "@type": /^(?:zozo(?:\.pk)?|mobile\s*rates(?:\.info)?)(?:\s+(?:team|editorial(?: team)?))?$/i.test(blog.author.trim()) ? "Organization" : "Person", name: rebrandSiteContent(blog.author) } } : {}),
    "publisher": {
      "@type": "Organization",
      "@id": "https://mobilerates.info/#organization",
      "name": "Mobile Rates",
      "url": "https://mobilerates.info"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(newsArticleSchema) }}
      />
      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12">
      <div className="mb-8">
        <Link href="/news" className="text-primary hover:underline text-sm font-medium mb-6 inline-block">
          ← Back to News
        </Link>
        <div className="flex gap-2 mb-4">
          {(blog.categories ?? []).map((c: { _id: string; name: string }) => (
            <span key={c._id} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
              {c.name}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-4">{rebrandSiteContent(blog.title)}</h1>
        {blog.excerpt && (
          <p className="text-xl text-text-muted mb-6">{rebrandSiteContent(blog.excerpt)}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted border-t border-b border-border-subtle py-3">
          {blog.author && <span>By {rebrandSiteContent(blog.author)}</span>}
          {publishedDate && (
            <span>Published on <time dateTime={publishedDate}>{new Date(publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time></span>
          )}
          {modifiedDate && publishedDate && new Date(modifiedDate) > new Date(publishedDate) && (
            <span>Updated on <time dateTime={modifiedDate}>{new Date(modifiedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time></span>
          )}
        </div>
        {blog.coverImage && (
          <div className="relative aspect-video w-full mt-6 rounded-xl overflow-hidden bg-surface-container-low">
            <Image src={blog.coverImage} alt={rebrandSiteContent(blog.title)} fill sizes="(max-width: 800px) 100vw, 800px" className="object-contain" loading="eager" fetchPriority="high" unoptimized />
          </div>
        )}
      </div>

      <div 
        className="prose prose-lg max-w-none text-on-surface prose-headings:text-on-surface prose-a:text-primary hover:prose-a:text-primary-hover"
        dangerouslySetInnerHTML={{ __html: rebrandSiteContent(blog.body) }}
      />
      {relatedProducts.length > 0 && (
        <section className="mt-10 border-t border-border-subtle pt-6" aria-labelledby="related-products-heading">
          <h2 id="related-products-heading" className="text-xl font-bold text-on-surface mb-4">Related Products</h2>
          <ul className="space-y-2">
            {relatedProducts.map((product: { slug: string; name: string }) => (
              <li key={product.slug}><Link href={`/${product.slug}`} className="text-primary hover:underline">{rebrandSiteContent(product.name)}</Link></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  </>
  );
}
