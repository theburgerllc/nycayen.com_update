// app/sections/Testimonials.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, Pause, Play, Heart } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Executive",
    image: "/images/testimonials/sarah.jpg",
    text: "Nycayen transformed my damaged hair into something absolutely beautiful. Her attention to detail and expertise with color correction is incredible! I've never felt more confident.",
    rating: 5,
    service: "Color Artistry",
    date: "2 weeks ago",
    verified: true
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    role: "Business Owner",
    image: "/images/testimonials/maria.jpg", 
    text: "The best wig styling in NYC. Professional, caring, and absolutely talented. Maria helped me through chemo with the most natural-looking wigs that gave me confidence.",
    rating: 5,
    service: "Wig Design",
    date: "1 month ago",
    verified: true
  },
  {
    id: 3,
    name: "Jennifer Chen",
    role: "Fashion Designer",
    image: "/images/testimonials/jennifer.jpg",
    text: "My go-to stylist for all special occasions. Nycayen always exceeds expectations and creates looks that perfectly match my vision. Simply amazing work!",
    rating: 5,
    service: "Precision Cuts",
    date: "3 days ago",
    verified: true
  },
  {
    id: 4,
    name: "Ashley Williams",
    role: "Photographer", 
    image: "/images/testimonials/ashley.jpg",
    text: "I've worked with many stylists for photo shoots, but Nycayen's creativity and technical skills are unmatched. Every style she creates is picture-perfect.",
    rating: 5,
    service: "Styling",
    date: "1 week ago",
    verified: true
  },
  {
    id: 5,
    name: "Rebecca Thompson",
    role: "Teacher",
    image: "/images/testimonials/rebecca.jpg",
    text: "After years of struggling with my hair texture, Nycayen gave me a cut that works with my natural patterns. Low maintenance but always looks salon-fresh!",
    rating: 5,
    service: "Precision Cuts",
    date: "2 months ago",
    verified: true
  }
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, []);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isHovered && !prefersReducedMotion) {
      const interval = setInterval(next, 5000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isHovered, next, prefersReducedMotion]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.9,
    }),
    center: {
      x: '0%',
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.3 : 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.9,
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.4,
      },
    }),
  };

  const headerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-stone-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      {!prefersReducedMotion && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </>
      )}

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16"
        >
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.2, 
              duration: 0.6,
              type: "spring",
              stiffness: 150 
            }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-playfair text-white">
              Client Love
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Real stories from clients who've experienced the transformative power of expert hair artistry
          </motion.p>
        </motion.div>

        {/* Main Carousel */}
        <div 
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="relative"
              >
                <TestimonialCard testimonial={testimonials[current]} />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.8)' }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-amber-400 transition-colors z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.8)' }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-amber-400 transition-colors z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </motion.button>

            {/* Play/Pause Control */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayPause}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-amber-400 transition-colors z-10"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>
          </div>

          {/* Dots Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => goToSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === current 
                    ? "bg-amber-400 w-8" 
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          {isPlaying && !isHovered && !prefersReducedMotion && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-amber-400 z-10"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ 
                duration: 5,
                ease: 'linear',
                repeat: Infinity,
              }}
            />
          )}
        </div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="p-6 bg-stone-800/50 rounded-lg backdrop-blur-sm">
            <p className="text-3xl font-playfair text-amber-400 mb-2">500+</p>
            <p className="text-gray-300">Happy Clients</p>
          </div>
          <div className="p-6 bg-stone-800/50 rounded-lg backdrop-blur-sm">
            <p className="text-3xl font-playfair text-amber-400 mb-2">4.9★</p>
            <p className="text-gray-300">Average Rating</p>
          </div>
          <div className="p-6 bg-stone-800/50 rounded-lg backdrop-blur-sm">
            <p className="text-3xl font-playfair text-amber-400 mb-2">12+</p>
            <p className="text-gray-300">Years Experience</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Individual Testimonial Card Component
function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 rounded-2xl shadow-2xl">
      <div className="grid md:grid-cols-3 gap-8 items-center">
        {/* Quote Icon */}
        <div className="hidden md:flex justify-center">
          <Quote className="w-16 h-16 text-amber-400/30" />
        </div>

        {/* Testimonial Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Stars */}
          <div className="flex justify-center md:justify-start gap-1">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-lg md:text-xl text-gray-200 leading-relaxed italic">
            "{testimonial.text}"
          </blockquote>

          {/* Author Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-white font-semibold">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </div>
              {testimonial.verified && (
                <div className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Verified
                </div>
              )}
            </div>
            
            <div className="text-right">
              <p className="text-amber-400 text-sm font-medium">{testimonial.service}</p>
              <p className="text-gray-500 text-xs">{testimonial.date}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
