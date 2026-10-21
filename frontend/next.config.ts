import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Inline CSS into <style> in the <head> instead of a render-blocking
    // <link>. Recommended for atomic CSS (Tailwind): styles arrive with the
    // HTML so the browser can paint immediately, cutting LCP render delay.
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ],
      },
      ...["/admin/:path*", "/admin-login", "/login", "/profile/:path*", "/search"].map(source => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      })),
      {
        source: "/(fonts|icons)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    // Specific legacy paths come first; every destination is region-free.
    return [
      { source: "/:brand-phone-price-:region", destination: "https://mobilerates.info/brands/:brand", permanent: true },
      { source: "/:brand-phone-price", destination: "https://mobilerates.info/brands/:brand", permanent: true },
      { source: "/:slug-price-in-:region", destination: "https://mobilerates.info/:slug", permanent: true },
      { source: "/:slug-price", destination: "https://mobilerates.info/:slug", permanent: true },
      { source: "/phones/:slug", destination: "https://mobilerates.info/:slug", permanent: true },
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?:www\\.)?zozo\\.pk" }],
        destination: "https://mobilerates.info/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.mobilerates\\.info" }],
        destination: "https://mobilerates.info/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
