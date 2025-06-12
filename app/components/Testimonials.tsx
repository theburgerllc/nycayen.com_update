// app/sections/Testimonials.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    text: "Nycayen transformed my damaged hair into something beautiful. Her attention to detail is incredible!",
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    text: "The best wig styling in NYC. Professional, caring, and absolutely talented.",
  },
  {
    id: 3,
    name: "Jennifer Chen",
    text: "My go‑to stylist for all special occasions. Always exceeds expectations!",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () =>
    setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrent((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );

  return (
    <section id="testimonials" className="py-20 bg-stone-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-playfair text-white mb-8">
          What Clients Say
        </h2>
        <div className="relative max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {testimonials
              .filter((_, idx) => idx === current)
              .map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 bg-black/30 rounded-lg backdrop-blur shadow-lg"
                >
                  <div className="flex justify-center space-x-1 mb-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="text-amber-500" />
                      ))}
                  </div>
                  <p className="text-gray-200 italic mb-4">"{t.text}"</p>
                  <p className="text-white font-semibold">— {t.name}</p>
                </motion.div>
              ))}
          </AnimatePresence>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-white p-2 rounded-full shadow-lg"
          >
            ←
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-white p-2 rounded-full shadow-lg"
          >
            →
          </button>
        </div>
        <div className="flex justify-center space-x-2 mt-6">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === current ? "bg-amber-500" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
