// app/sections/InstagramFeed.tsx
"use client";
import { useEffect, useState } from "react";
import { Instagram, ExternalLink } from "lucide-react";

export default function InstagramFeed() {
  const [widgetId, setWidgetId] = useState<string | null>(null);

  useEffect(() => {
    // Get Instagram widget ID from environment variable
    const id = process.env.NEXT_PUBLIC_INSTAGRAM_WIDGET_ID;
    setWidgetId(id || null);

    if (id) {
      const script = document.createElement("script");
      script.src = "https://embedsocial.com/embedscript/ri.js";
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        // Cleanup script on unmount
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <section id="instagram" className="py-20 bg-black text-center">
      <h2 className="text-3xl font-playfair text-white mb-8">
        Follow My Work on Instagram
      </h2>
      <div className="mx-auto max-w-4xl px-4">
        {widgetId ? (
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <div
              className="embedsocial-instagram"
              data-ref={widgetId}
              style={{ maxWidth: '100%' }}
            />
          </div>
        ) : (
          // Fallback UI when no widget ID is provided
          <div className="bg-stone-900 rounded-2xl p-12 border border-stone-700">
            <Instagram className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h3 className="text-xl font-playfair text-white mb-4">
              Follow @nycayenmoore
            </h3>
            <p className="text-gray-300 mb-6">
              See my latest work and behind-the-scenes content on Instagram
            </p>
            <a
              href="https://instagram.com/nycayenmoore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-primary px-6 py-3"
            >
              <Instagram size={20} />
              Follow on Instagram
              <ExternalLink size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
