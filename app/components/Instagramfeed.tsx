// app/sections/InstagramFeed.tsx
"use client";
import { useEffect } from "react";

export default function InstagramFeed() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://embedsocial.com/embedscript/ri.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section id="instagram" className="py-20 bg-black text-center">
      <h2 className="text-3xl font-playfair text-white mb-8">Follow My Work on Instagram</h2>
      <div
        className="embedsocial-instagram"
        data-ref="YOUR_WIDGET_ID"
        style={{ maxWidth: '800px', margin: '0 auto' }}
      />
    </section>
  );
}
