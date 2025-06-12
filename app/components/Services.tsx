// app/sections/Services.tsx
"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Precision Cuts",
    price: 85,
    features: [
      "Face‑shape tailored design",
      "Styling tips included",
      "Clean finish",
    ],
  },
  {
    title: "Color Artistry",
    price: 120,
    features: [
      "Subtle highlights to bold ombré",
      "Toner & gloss included",
      "Hair health focused",
    ],
  },
  {
    title: "Wig Design",
    price: 200,
    features: [
      "Custom fitting & styling",
      "Maintenance guidance",
      "Premium cap materials",
    ],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-black to-stone-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-playfair text-white mb-8">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((svc, idx) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="glass rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() =>
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <h3 className="text-xl font-semibold text-amber-500 mb-4">{svc.title}</h3>
              <p className="text-4xl font-playfair text-white mb-6">
                ${svc.price}+
              </p>
              <ul className="text-gray-200 space-y-2 mb-6">
                {svc.features.map((f) => (
                  <li key={f} className="flex items-center">
                    <ArrowRight className="mr-2 text-amber-400" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="mt-auto inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-light text-white rounded-full transition">
                Book Now <ArrowRight size={20} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
