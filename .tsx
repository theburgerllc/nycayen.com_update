// app/layout.tsx (Next 14 App Router)
import "./globals.css";
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Meta tags, fonts, preconnect */}
      </head>
      <body className="bg-bg font-inter text-white">
        {children}
        <Script
          strategy="lazyOnload"
          src="//code.tidio.co/YOUR_TIDIO_PUBLIC_KEY.js"
        />
      </body>
    </html>
  );
}
