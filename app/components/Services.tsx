// app/sections/Services.tsx
"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { memo, useMemo, useCallback } from "react";

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

// Memoized ServiceCard component
const ServiceCard = memo(function ServiceCard({ 
  service, 
  index 
}: { 
  service: typeof services[0]; 
  index: number; 
}) {
  const animationVariants = useMemo(() => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { delay: index * 0.2 },
  }), [index]);

  const memoizedFeatures = useMemo(() => 
    service.features.map((feature) => (
      <li key={feature} className="flex items-center">
        <ArrowRight className="mr-2 text-amber-400" size={16} />
        {feature}
      </li>
    )), [service.features]
  );

  return (
    <motion.div
      key={service.title}
      initial={animationVariants.initial}
      whileInView={animationVariants.whileInView}
      viewport={{ once: true }}
      transition={animationVariants.transition}
      className="glass rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
    >
      <h3 className="text-xl font-semibold text-amber-500 mb-4">{service.title}</h3>
      <p className="text-4xl font-playfair text-white mb-6">
        ${service.price}+
      </p>
      <ul className="text-gray-200 space-y-2 mb-6">
        {memoizedFeatures}
      </ul>
      <Link 
        href="/booking" 
        className="mt-auto inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-full transition"
      >
        Book Now <ArrowRight size={20} />
      </Link>
    </motion.div>
  );
});

export default memo(function Services() {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-black to-stone-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-playfair text-white mb-8">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
