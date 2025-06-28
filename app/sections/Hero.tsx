// app/sections/Hero.tsx
"use client"
import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ChevronDown, Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";
import Image from "next/image";

interface TimeBasedGreeting {
  greeting: string;
  message: string;
  gradient: string;
}

const getTimeBasedGreeting = (): TimeBasedGreeting => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Good Morning",
      message: "Start your day with a fresh new look",
      gradient: "from-amber-400/20 via-orange-300/10 to-yellow-400/20"
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: "Good Afternoon", 
      message: "Transform your style this afternoon",
      gradient: "from-blue-400/20 via-indigo-300/10 to-purple-400/20"
    };
  } else {
    return {
      greeting: "Good Evening",
      message: "Elevate your evening elegance",
      gradient: "from-purple-400/20 via-pink-300/10 to-rose-400/20"
    };
  }
};

export default function Hero() {
  const [greeting, setGreeting] = useState<TimeBasedGreeting>({ 
    greeting: "", 
    message: "", 
    gradient: "" 
  });
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
      setHasUserInteracted(true);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      setHasUserInteracted(true);
    }
  };

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const handleVideoError = () => {
    setIsVideoLoaded(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 30,
      scale: prefersReducedMotion ? 1 : 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    hover: { 
      scale: prefersReducedMotion ? 1 : 1.05,
      y: prefersReducedMotion ? 0 : -2,
      transition: { duration: 0.2 }
    },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 }
  };

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0, rotate: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video 
        ref={videoRef}
        src="/videos/hero-loop.mp4" 
        autoPlay 
        muted={isMuted}
        loop 
        playsInline
        preload="metadata"
        className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        poster="/images/hero-poster.jpg"
      />
      
      {/* Fallback Background */}
      {!isVideoLoaded && (
        <div className="absolute inset-0">
          <Image
            src="/images/hero-fallback.jpg"
            alt="Luxury hair salon interior"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={() => {
              // Fallback to gradient if image also fails
            }}
          />
        </div>
      )}
      
      {/* Dynamic Time-Based Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${greeting.gradient} mix-blend-overlay`}/>
      
      {/* Main Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"/>
      
      {/* Video Controls */}
      {isVideoLoaded && hasUserInteracted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-6 right-6 z-20 flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleVideoToggle}
            className="p-2 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            aria-label={isVideoPlaying ? "Pause video" : "Play video"}
          >
            {isVideoPlaying ? <Pause size={20} /> : <Play size={20} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleMuteToggle}
            className="p-2 bg-black/50 rounded-full backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </motion.button>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Sparkle Effects */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                className="absolute -top-8 -left-8 text-amber-400"
              >
                <Sparkles size={24} />
              </motion.div>
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                style={{ animationDelay: "1s" }}
                className="absolute -top-4 -right-12 text-amber-300"
              >
                <Sparkles size={20} />
              </motion.div>
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                style={{ animationDelay: "2s" }}
                className="absolute top-8 -left-16 text-amber-500"
              >
                <Sparkles size={16} />
              </motion.div>
            </>
          )}

          {/* Time-Based Greeting */}
          <motion.div variants={itemVariants} className="mb-4">
            <motion.span 
              className="inline-block text-amber-400 font-medium text-lg md:text-xl tracking-wide"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.5, 
                duration: 0.6,
                type: "spring",
                stiffness: 150 
              }}
            >
              {greeting.greeting}
            </motion.span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-playfair text-white leading-tight"
          >
            Transform Your{" "}
            <motion.span 
              className="text-amber-500 italic relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              Beauty Vision
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute -inset-2 bg-amber-500/20 rounded-lg -z-10"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                />
              )}
            </motion.span>
          </motion.h1>

          {/* Dynamic Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
          >
            {greeting.message}
          </motion.p>

          {/* Professional Tag */}
          <motion.p
            variants={itemVariants}
            className="mt-2 text-lg md:text-xl text-gray-300 font-light"
          >
            Expert Hair Artistry & Wig Design in NYC
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.a
              href="/booking"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="btn-primary px-8 py-4 text-lg font-semibold relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              <span className="relative z-10 flex items-center gap-2">
                Book Consultation
                {!prefersReducedMotion && (
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    →
                  </motion.span>
                )}
              </span>
            </motion.a>
            
            <motion.a
              href="#portfolio"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="btn-outline px-8 py-4 text-lg font-semibold border-2 border-white/30 hover:border-amber-400 hover:text-amber-400 transition-all duration-300"
            >
              Explore Portfolio
            </motion.a>
          </motion.div>

          {/* Stats or Features */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col sm:flex-row gap-8 justify-center items-center text-sm text-gray-300"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>12+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>500+ Happy Clients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span>Award-Winning Artistry</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.div
            animate={{ 
              y: prefersReducedMotion ? 0 : [0, 8, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => {
              document.getElementById('services')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
          >
            <span className="text-xs text-gray-400 uppercase tracking-wide">Scroll</span>
            <ChevronDown size={24} className="text-amber-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
