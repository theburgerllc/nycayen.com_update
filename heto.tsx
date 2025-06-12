// app/sections/Hero.tsx
"use client"
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden">
      <video src="/videos/hero-loop.mp4" autoPlay muted loop className="absolute inset-0 object-cover w-full h-full"/>
      <div className="absolute inset-0 bg-black/50 mix-blend-multiply"/>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl font-playfair text-white"
        >
          Transform Your <span className="text-amber-500 italic">Beauty Vision</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-4 text-lg md:text-xl text-gray-200 max-w-xl"
        >
          Expert Hair Artistry & Wig Design in NYC
        </motion.p>
        <motion.div initial="hidden" animate="visible" variants={{
          visible: { opacity: 1, transition: { delay: 1 }},
          hidden: { opacity: 0 }
        }} className="mt-8 flex gap-4">
          <a href="#contact" className="btn-primary px-6 py-3">Book Consultation</a>
          <a href="#portfolio" className="btn-outline px-6 py-3">Explore Portfolio</a>
        </motion.div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10">
          <ChevronDown size={32} className="text-amber-500 animate-bounce"/>
        </motion.div>
      </div>
    </section>
  );
}
