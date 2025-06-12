// app/sections/Portfolio.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import BeforeAfter from "./BeforeAfter"; // Custom component below

const allItems = [
  { id: 1, category: "Cuts", before: "/port/b1-before.jpg", after: "/port/b1-after.jpg" },
  { id: 2, category: "Color", before: "/port/b2-before.jpg", after: "/port/b2-after.jpg" },
  // ...4 more items...
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
        <a href="#portfolio" className="mt-8 inline-block btn-outline">
          View Full Portfolio
        </a>
      </div>
    </section>
  );
}
