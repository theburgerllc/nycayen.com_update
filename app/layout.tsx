import "./globals.css";
import Script from "next/script";
import Navigation from "./components/Navigation";
import WebVitalsReporter from "./components/WebVitalsReporter";
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';

// Optimize font loading
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nycayenmoore.com'),
  title: {
    default: "Nycayen Moore | Luxury Hair Artistry & Wig Design in NYC",
    template: "%s | Nycayen Moore Hair Artistry"
  },
  description: "Transform your beauty vision with Nycayen Moore's luxury hair artistry and custom wig design services in NYC. Expert cuts, color, and bridal styling with 12+ years experience.",
  keywords: [
    "hair stylist NYC",
    "luxury hair salon",
    "wig design NYC", 
    "bridal hair stylist",
    "hair color specialist",
    "custom wigs",
    "Nycayen Moore",
    "hair artistry"
  ],
  authors: [{ name: "Nycayen Moore" }],
  creator: "Nycayen Moore",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nycayenmoore.com",
    title: "Nycayen Moore | Luxury Hair Artistry & Wig Design in NYC",
    description: "Transform your beauty vision with expert hair artistry and custom wig design services in NYC. 12+ years of luxury styling experience.",
    siteName: "Nycayen Moore Hair Artistry",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nycayen Moore - Professional Hair Stylist NYC"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Nycayen Moore | Luxury Hair Artistry NYC",
    description: "Expert hair styling and custom wig design in NYC",
    images: ["/images/og-image.jpg"],
    creator: "@nycayenmoore"
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
  ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  }),
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Nycayen Moore Hair Artistry',
  image: 'https://nycayenmoore.com/images/nycayen-headshot.jpg',
  '@id': 'https://nycayenmoore.com',
  url: 'https://nycayenmoore.com',
  telephone: '+1-234-567-8900',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Professional Hair Studio',
    addressLocality: 'New York',
    addressRegion: 'NY',
    postalCode: '10001',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.7831,
    longitude: -73.9712,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Tuesday',
      'Wednesday', 
      'Thursday',
      'Friday',
      'Saturday'
    ],
    opens: '09:00',
    closes: '19:00',
  },
  sameAs: [
    'https://www.instagram.com/nycayenmoore',
    'https://www.facebook.com/nycayenmoore',
  ],
  priceRange: '$$$',
  description: 'Luxury hair artistry and custom wig design services in NYC with over 12 years of professional experience.',
  serviceArea: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 40.7831,
      longitude: -73.9712,
    },
    geoRadius: '50000',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`bg-bg font-inter text-white antialiased ${inter.className}`}>
        <WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
        <Navigation />
        {children}
        <Script
          src="//code.tidio.co/rlmuazdh9xqfjbiicz6swwgfhdhgyyca.js"
          strategy="lazyOnload"
        />
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(registration => console.log('SW registered'))
                  .catch(error => console.log('SW registration failed'));
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
