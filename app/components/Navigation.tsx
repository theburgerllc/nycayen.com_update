"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import MiniCart to avoid SSR issues
const MiniCart = dynamic(() => import("../shop/components/MiniCart"), {
  ssr: false,
});

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    const throttledHandleScroll = (() => {
      let ticking = false;
      return () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };
    })();
    
    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, []);

  const navLinks = [
    { href: "#hero", label: "Home" },
    { href: "#services", label: "Services" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#about", label: "About" },
    { href: "/shop", label: "Shop" },
    { href: "/booking", label: "Book Now" },
    { href: "#contact", label: "Contact" }
  ];

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        const headerHeight = 80; // Account for fixed header height
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <>
      {/* Desktop & Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isOpen
            ? "glass border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">N</span>
              </div>
              <span className="text-white font-playfair text-xl font-semibold">
                Nycayen Moore
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                link.href.startsWith('#') ? (
                  <button
                    key={link.href}
                    onClick={() => handleLinkClick(link.href)}
                    className="text-white hover:text-amber-400 transition-colors font-medium"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white hover:text-amber-400 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Cart and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Shopping Cart */}
              <MiniCart className="hidden lg:block" />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-white hover:text-amber-400 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 z-50 glass border-l border-white/10 lg:hidden"
            >
              <div className="p-6 pt-24">
                {/* Profile Section */}
                <div className="text-center mb-8 pb-8 border-b border-white/10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-black font-bold text-2xl">N</span>
                  </div>
                  <h3 className="text-white font-playfair text-lg">Nycayen Moore</h3>
                  <p className="text-gray-400 text-sm">Hair Artistry & Wig Design</p>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-6 mb-8">
                  {navLinks.map((link, index) => (
                    link.href.startsWith('#') ? (
                      <motion.button
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleLinkClick(link.href)}
                        className="block w-full text-left text-white hover:text-amber-400 transition-colors font-medium text-lg py-2"
                      >
                        {link.label}
                      </motion.button>
                    ) : (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="block w-full text-left text-white hover:text-amber-400 transition-colors font-medium text-lg py-2"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    )
                  ))}
                </nav>

                {/* Mobile Shopping Cart */}
                <div className="pb-6 border-b border-white/10 mb-6">
                  <MiniCart />
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                  <Link
                    href="/booking"
                    className="w-full btn-primary py-4 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Book Appointment
                  </Link>
                  <a
                    href="tel:+1234567890"
                    className="w-full btn-outline py-4 text-center flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    Call Now
                  </a>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <p className="text-gray-400 text-sm">NYC Hair Studio</p>
                  <p className="text-gray-400 text-sm">Available by Appointment</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}