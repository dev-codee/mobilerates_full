import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/admin-login', '/api/', '/profile/'],
    },
    sitemap: 'https://mobilerates.info/sitemap.xml',
  };
}
