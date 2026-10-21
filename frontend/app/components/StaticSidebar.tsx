import { rebrandSiteContent } from "@/app/lib/branding";
import Link from 'next/link';
import { getPages } from '@/app/lib/api';

export default async function StaticSidebar({ activeSlug }: { activeSlug?: string }) {
  const pages = await getPages();
  const publishedPages = pages.filter((p: any) => p.status === 'PUBLISHED');

  return (
    <aside className="w-full md:w-72 flex-shrink-0 border-r border-border-subtle bg-surface-white md:min-h-[calc(100vh-64px)]">
      <div className="p-6 sticky top-0 md:top-24">
        <h3 className="font-headline-sm text-lg font-bold text-text-main mb-4 uppercase tracking-wider">
          Information
        </h3>
        <nav className="space-y-2 flex flex-col">
          <Link
            href="/news"
            className={`px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
              activeSlug === 'news'
                ? 'bg-primary/10 text-primary'
                : 'text-text-muted hover:bg-surface-container-low hover:text-text-main'
            }`}
          >
            News & Reviews
          </Link>
          
          {publishedPages.filter((p: any) => p.pageType === 'PARENT' || p.pageType === 'STANDALONE' || !p.pageType).map((page: any) => {
            const isParent = page.pageType === 'PARENT';
            const children = publishedPages.filter((p: any) => p.pageType === 'CHILD' && p.parentPage === page._id);
            
            return (
              <div key={page.slug} className="flex flex-col">
                <Link
                  href={`/pages/${page.slug}`}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                    activeSlug === page.slug
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-muted hover:bg-surface-container-low hover:text-text-main'
                  }`}
                >
                  {rebrandSiteContent(page.title || "")}
                </Link>
                {isParent && children.length > 0 && (
                  <div className="flex flex-col ml-4 mt-1 border-l-2 border-border-subtle pl-2">
                    {children.map((child: any) => (
                      <Link
                        key={child.slug}
                        href={`/pages/${child.slug}`}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                          activeSlug === child.slug
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-muted hover:bg-surface-container-low hover:text-text-main'
                        }`}
                      >
                        {rebrandSiteContent(child.title || "")}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
