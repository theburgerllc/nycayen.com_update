// app/sections/Portfolio.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BeforeAfter from "./BeforeAfter"; // Custom component below

const allItems = [
  { id: 1, category: "Cuts", before: "/port/b1-before.jpg", after: "/port/b1-after.jpg" },
  { id: 2, category: "Color", before: "/port/b2-before.jpg", after: "/port/b2-after.jpg" },
  { id: 3, category: "Wigs", before: "/port/b3-before.jpg", after: "/port/b3-after.jpg" },
  { id: 4, category: "Bridal", before: "/port/b4-before.jpg", after: "/port/b4-after.jpg" },
  { id: 5, category: "Cuts", before: "/port/b5-before.jpg", after: "/port/b5-after.jpg" },
  { id: 6, category: "Color", before: "/port/b6-before.jpg", after: "/port/b6-after.jpg" },
];

const categories = ["All", "Cuts", "Color", "Wigs", "Bridal"];

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const filtered = allItems.filter((i) => filter === "All" || i.category === filter);

  return (
    <section id="portfolio" className="py-20 bg-stone-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-playfair text-white mb-8">Portfolio</h2>
        <div className="flex justify-center gap-4 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full ${
                filter === c ? "bg-amber-500 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                <BeforeAfter before={item.before} after={item.after} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <a 
          href="https://instagram.com/nycayenmoore" 
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 btn-outline px-6 py-3"
        >
          View Full Portfolio on Instagram
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </div>
    </section>
  );
}
