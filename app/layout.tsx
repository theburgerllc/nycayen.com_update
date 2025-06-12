// app/layout.tsx
import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Nycayen Moore | Hair Artistry",
  description: "Luxury hair & wig design in NYC by Nycayen Moore",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* preconnect to fonts, meta tags */}
      </head>
      <body className="bg-bg font-inter text-white">
        {children}
        <Script
          src="//code.tidio.co/YOUR_PUBLIC_KEY_HERE.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
