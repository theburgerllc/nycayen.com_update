// app/sections/InstagramFeed.tsx
"use client";
import { InstagramIntegration } from '../instagram/components/InstagramIntegration';

export default function InstagramFeed() {
  return (
    <section id="instagram" className="py-20 bg-black">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair text-white mb-4">
            Follow My Work on Instagram
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            See my latest hair transformations, behind-the-scenes content, and styling inspiration
          </p>
        </div>

        {/* Instagram Integration */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
          <InstagramIntegration
            maxPosts={12}
            gridColumns={3}
            showCaptions={false}
            showLightbox={true}
            aspectRatio="square"
            enableFallback={true}
            enableAnalytics={true}
            title=""
            description=""
            className="instagram-section"
          />
        </div>

        {/* Call to action */}
        <div className="text-center mt-8">
          <a
            href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-8 py-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Follow @{process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
