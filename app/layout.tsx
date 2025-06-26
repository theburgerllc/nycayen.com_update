import "./globals.css";
import Script from "next/script";
import Navigation from "./components/Navigation";
import WebVitalsReporter from "./components/WebVitalsReporter";
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { AnalyticsProvider } from './components/AnalyticsProvider';

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
        <AnalyticsProvider>
          <WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
          <Navigation />
          {children}
        </AnalyticsProvider>
        {/* Google Tag Manager */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'}');
            `,
          }}
        />
        
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX'}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX'}', {
              page_title: document.title,
              page_location: window.location.href,
              debug_mode: ${process.env.NODE_ENV === 'development'},
              anonymize_ip: true,
              allow_enhanced_conversions: true,
              allow_google_signals: true,
              cookie_flags: 'secure;samesite=strict'
            });
          `}
        </Script>

        {/* Hotjar */}
        {process.env.NEXT_PUBLIC_HOTJAR_ID && (
          <Script id="hotjar" strategy="afterInteractive">
            {`
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `}
          </Script>
        )}

        {/* Microsoft Clarity */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
            `}
          </Script>
        )}

        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

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
