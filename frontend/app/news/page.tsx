import { isIndexableArticle } from "@/app/lib/editorial";
import { serializeJsonLd } from "@/app/lib/schema";
import { rebrandSiteContent } from "@/app/lib/branding";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import StaticSidebar from '@/app/components/StaticSidebar';
import { getApiBaseUrl } from '@/app/lib/api';
import { generateCollectionPageSchema } from '@/app/lib/schema';
import AppIcon from '@/app/components/AppIcon';

export async function generateMetadata(): Promise<Metadata> {
  const blogs = await getBlogs();
  return cleanMetadata({
  robots: { index: blogs.length > 0, follow: true },
  title: 'Tech News & Smartphone Reviews',
  description: 'Latest mobile phone news, smartphone reviews, leaks, buying guides, and comparisons.',
  alternates: {
    canonical: 'https://mobilerates.info/news',
  },
  openGraph: {
    title: 'Tech News & Smartphone Reviews',
    description: 'Latest mobile phone news, reviews, and comparisons.',
    url: 'https://mobilerates.info/news',
  },
  });
}

interface NewsPreview {
  _id: string; slug: string; title: string; excerpt?: string; createdAt: string; publish_date?: string;
  status: string; featured?: boolean; categories?: { _id: string; name: string }[];
}

async function getBlogs() {
  try {
    const API_BASE_URL = getApiBaseUrl();
    const res = await fetch(`${API_BASE_URL}/blogs?status=PUBLISHED`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`News fetch failed: ${res.status}`);
    const data = await res.json();
    const blogs = Array.isArray(data) ? data : data.data;
    if (!Array.isArray(blogs)) throw new Error("Invalid news response");
    return (blogs as NewsPreview[]).filter(isIndexableArticle);
  } catch (error) {
    throw error;
  }
}

export default async function NewsPage() {
  const blogs = await getBlogs();

  const featuredBlogs = blogs.filter((b) => b.featured);
  const regularBlogs = blogs.filter((b) => b._id !== featuredBlogs[0]?._id);

  return (
    <div className="min-h-screen bg-surface-white flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(generateCollectionPageSchema("Tech News & Reviews", "Latest tech news, reviews and mobile updates", "/news")),
        }}
      />
      <Navbar />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* News Layout Grid: Main Content (8 cols) + Dynamic Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main News Content */}
          <div className="lg:col-span-8">
            <div className="mb-8 border-b border-border-subtle pb-6 max-w-4xl">
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight">Tech News & Reviews</h1>
              <p className="text-text-muted text-sm md:text-base mt-2">The latest updates, leaks, and deep dives from the mobile world.</p>
            </div>

            {featuredBlogs.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-bold text-on-surface mb-4">Featured Story</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-surface-container-low h-64 md:h-auto flex items-center justify-center p-8 text-text-muted">
                    <AppIcon name="newspaper" size={48} />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex gap-2 mb-3">
                      {(featuredBlogs[0].categories || []).map((c) => (
                        <span key={c._id} className="text-xs font-bold uppercase tracking-wider text-primary">{c.name}</span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-on-surface mb-3 leading-snug">
                      <Link href={`/news/${featuredBlogs[0].slug}`} className="hover:text-primary transition-colors">
                        {rebrandSiteContent(featuredBlogs[0].title || "")}
                      </Link>
                    </h3>
                    <p className="text-text-muted mb-4 line-clamp-3">{rebrandSiteContent(featuredBlogs[0].excerpt || "")}</p>
                    <div className="mt-auto flex items-center text-sm text-text-muted">
                      <span>{new Date(featuredBlogs[0].publish_date || featuredBlogs[0].createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-6">Latest Articles</h2>
              {regularBlogs.length === 0 ? (
                <p className="text-text-muted">No articles found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularBlogs.map((blog) => (
                    <div key={blog._id} className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
                      <div className="bg-surface-container-low h-48 flex items-center justify-center text-text-muted">
                        <AppIcon name="article" size={36} />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex gap-2 mb-2">
                          {(blog.categories || []).map((c) => (
                            <span key={c._id} className="text-[10px] font-bold uppercase tracking-wider text-primary">{c.name}</span>
                          ))}
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-on-surface mb-2 line-clamp-2 leading-snug">
                          <Link href={`/news/${blog.slug}`} className="hover:text-primary transition-colors">
                            {rebrandSiteContent(blog.title || "")}
                          </Link>
                        </h3>
                        <p className="text-text-muted text-sm line-clamp-2 mb-4 flex-1">{rebrandSiteContent(blog.excerpt || "")}</p>
                        <div className="mt-auto text-xs text-text-muted">
                          {new Date(blog.publish_date || blog.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-4">
            <StaticSidebar activeSlug="news" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
