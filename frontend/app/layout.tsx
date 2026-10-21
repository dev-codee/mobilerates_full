import { CurrencyProvider } from "./context/CurrencyContext";
import NotificationHost from "@/app/components/NotificationHost";
import { serializeJsonLd } from "@/app/lib/schema";
import { cleanMetadata } from "@/app/lib/seo";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  variable: "--font-inter",
  src: "../public/fonts/inter-latin-variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

import { generateOrganizationSchema, generateWebSiteSchema } from "./lib/schema";

export const metadata: Metadata = cleanMetadata({
  metadataBase: new URL('https://mobilerates.info'),
  title: {
    default: "Compare Mobile Phone Prices",
    template: "%s",
  },
  description: "Compare latest mobile phone prices across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Vivo, and more.",
  keywords: "mobile phones, prices, compare, Samsung, Apple, Xiaomi, Vivo, Oppo, Infinix, Tecno",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    url: "https://mobilerates.info",
    title: "Compare Mobile Phone Prices",
    description: "Compare latest mobile phone prices across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Vivo, and more.",
    siteName: "Mobile phone prices and specifications",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Phone prices and specifications",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Mobile Phone Prices",
    description: "Compare latest mobile phone prices across all top retailers.",
    images: ["/social-preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Old Google Search Console verification.
  // verification: {
  //   google: "Vvyd5gNTQ-gef20eLQuyFvY8sRS2GkSegQtt16W6PZE",
  // },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', type: 'image/png' },
    ],
  },
});

import { AuthProvider } from './context/AuthContext';
import ActivityTracker from './components/ActivityTracker';

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Speed up the LCP image (phone photos are served from Cloudinary) */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-11419881899"
        />
        <Script id="google-tag">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-N2HNBTG692');
            gtag('config', 'AW-11419881899');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(generateOrganizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(generateWebSiteSchema()) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <CurrencyProvider>
          <NotificationHost />
          <ActivityTracker />
          {children}
        </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
