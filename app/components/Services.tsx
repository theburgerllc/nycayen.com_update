// app/components/Services.tsx
"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Star, Clock, Sparkles, CheckCircle, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import React, { memo, useMemo, useState, useCallback } from "react";
import OptimizedImage from "./OptimizedImage";

const services = [
  {
    id: "precision-cuts",
    title: "Precision Cuts",
    price: 85,
    duration: "45-60 min",
    rating: 4.9,
    reviewCount: 127,
    image: "/images/services/precision-cuts.jpg",
    description: "Expertly crafted cuts tailored to your unique face shape and lifestyle. Our precision cutting techniques ensure a perfect finish every time.",
    features: [
      "Face‑shape tailored design",
      "Styling tips included",
      "Clean finish",
      "Free touch-up within 2 weeks",
      "Professional styling consultation"
    ],
    benefits: [
      "Enhanced facial features",
      "Low maintenance styling",
      "Professional appearance",
      "Confidence boost"
    ],
    process: [
      "Initial consultation and face shape analysis",
      "Precision cutting with premium tools",
      "Styling and finishing touches",
      "Maintenance tips and product recommendations"
    ],
    popular: true,
    category: "cutting"
  },
  {
    id: "color-artistry",
    title: "Color Artistry",
    price: 120,
    duration: "90-120 min",
    rating: 4.8,
    reviewCount: 89,
    image: "/images/services/color-artistry.jpg",
    description: "Transform your look with our expert color services. From subtle highlights to bold transformations, we create stunning results while maintaining hair health.",
    features: [
      "Subtle highlights to bold ombré",
      "Toner & gloss included",
      "Hair health focused",
      "Color-safe product recommendations",
      "Touch-up consultation included"
    ],
    benefits: [
      "Vibrant, long-lasting color",
      "Enhanced hair texture",
      "Personalized color matching",
      "Professional color maintenance"
    ],
    process: [
      "Color consultation and skin tone analysis",
      "Professional color application",
      "Toning and glossing treatment",
      "Styling and aftercare instructions"
    ],
    featured: true,
    category: "coloring"
  },
  {
    id: "wig-design",
    title: "Wig Design",
    price: 200,
    duration: "2-3 hours",
    rating: 5.0,
    reviewCount: 43,
    image: "/images/services/wig-design.jpg",
    description: "Custom wig design and fitting services. From medical wigs to fashion pieces, we create natural-looking solutions tailored to your needs.",
    features: [
      "Custom fitting & styling",
      "Maintenance guidance",
      "Premium cap materials",
      "Natural hairline creation",
      "Color matching service"
    ],
    benefits: [
      "Natural appearance",
      "Comfortable fit",
      "Versatile styling options",
      "Confidence restoration"
    ],
    process: [
      "Detailed consultation and measurements",
      "Custom cap construction or selection",
      "Hair application and styling",
      "Fitting adjustments and care instructions"
    ],
    premium: true,
    category: "wigs"
  },
];

// Service Modal Component
interface ServiceModalProps {
  service: typeof services[0] | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceModal = memo(function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!service) return null;

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.9,
      y: prefersReducedMotion ? 0 : 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.9,
      y: prefersReducedMotion ? 0 : 20,
      transition: { duration: 0.2 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:text-red-400 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </motion.button>

            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header with Image */}
              <div className="relative h-64 md:h-80">
                <OptimizedImage
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0} // Prioritize first service image
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Service Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {service.popular && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  )}
                  {service.featured && (
                    <span className="px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                  )}
                  {service.premium && (
                    <span className="px-3 py-1 bg-gold-500 text-white text-sm font-medium rounded-full">
                      Premium
                    </span>
                  )}
                </div>

                {/* Title and Rating */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-3xl md:text-4xl font-playfair text-white mb-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-200">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-sm">({service.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{service.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Price and Booking */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div>
                    <p className="text-4xl md:text-5xl font-playfair text-amber-500 mb-2">
                      ${service.price}+
                    </p>
                    <p className="text-gray-400">Starting price • {service.duration}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-3">
                    <Link
                      href="/booking"
                      className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-full transition-colors font-medium"
                    >
                      Book Now <ArrowRight size={20} />
                    </Link>
                    <button className="flex items-center gap-2 px-6 py-3 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white rounded-full transition-colors">
                      Learn More <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-white mb-3">About This Service</h4>
                  <p className="text-gray-300 leading-relaxed">{service.description}</p>
                </div>

                {/* Features, Benefits, Process Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Features */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400" />
                      Benefits
                    </h4>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <ArrowRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Process */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Process
                    </h4>
                    <ul className="space-y-3">
                      {service.process.map((step, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-300">
                          <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Enhanced ServiceCard component
const ServiceCard = memo(function ServiceCard({ 
  service, 
  index,
  onOpenModal 
}: { 
  service: typeof services[0]; 
  index: number;
  onOpenModal: (service: typeof services[0]) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const animationVariants = useMemo(() => ({
    initial: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 30,
      scale: prefersReducedMotion ? 1 : 0.95
    },
    whileInView: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        delay: index * 0.2,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
  }), [index, prefersReducedMotion]);

  const cardVariants = {
    rest: {
      scale: 1,
      y: 0,
      rotateY: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: {
      scale: prefersReducedMotion ? 1 : 1.03,
      y: prefersReducedMotion ? 0 : -8,
      rotateY: prefersReducedMotion ? 0 : 2,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: prefersReducedMotion ? 1 : 1.1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const overlayVariants = {
    rest: { opacity: 0, y: 20 },
    hover: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const memoizedFeatures = useMemo(() => 
    service.features.slice(0, 3).map((feature, idx) => (
      <li key={feature} className="flex items-center text-sm">
        <CheckCircle className="mr-2 text-amber-400 flex-shrink-0" size={14} />
        <span className="truncate">{feature}</span>
      </li>
    )), [service.features]
  );

  return (
    <motion.div
      initial={animationVariants.initial}
      whileInView={animationVariants.whileInView}
      viewport={{ once: true }}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative glass rounded-2xl overflow-hidden shadow-xl cursor-pointer perspective-1000"
      onClick={() => onOpenModal(service)}
    >
      {/* Service Badges */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        {service.popular && (
          <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
            Popular
          </span>
        )}
        {service.featured && (
          <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded-full">
            Featured
          </span>
        )}
        {service.premium && (
          <span className="px-2 py-1 bg-gold-500 text-white text-xs font-medium rounded-full">
            Premium
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <motion.div variants={imageVariants} className="w-full h-full">
          <OptimizedImage
            src={service.image}
            alt={service.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3} // Prioritize first 3 service images
            quality={85}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="font-medium">{service.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-amber-500 group-hover:text-amber-400 transition-colors">
            {service.title}
          </h3>
          <div className="text-right">
            <p className="text-2xl font-playfair text-white">
              ${service.price}+
            </p>
            <p className="text-xs text-gray-400">{service.duration}</p>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Features Preview */}
        <ul className="space-y-1.5 mb-6">
          {memoizedFeatures}
        </ul>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link 
            href="/booking" 
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-full transition-colors text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Book Now <ArrowRight size={16} />
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-full transition-colors text-sm"
            aria-label="View details"
          >
            Details
          </motion.button>
        </div>
      </div>

      {/* Hover Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            variants={overlayVariants}
            initial="rest"
            animate="hover"
            exit="rest"
            className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Sparkle Effect */}
      {!prefersReducedMotion && isHovered && (
        <motion.div
          className="absolute top-4 right-4 text-amber-400"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <Sparkles size={16} />
        </motion.div>
      )}
    </motion.div>
  );
});

export default memo(function Services() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const openModal = useCallback((service: typeof services[0]) => {
    setSelectedService(service);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedService(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  }, []);

  // Close modal on escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  }, [isModalOpen, closeModal]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Ensure body scroll is restored on unmount
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

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

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : -20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };

  return (
    <>
      <section id="services" className="py-20 bg-gradient-to-b from-black to-stone-900 relative overflow-hidden">
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
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-playfair text-white">
                Our Services
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Discover our premium hair services designed to transform your look and boost your confidence. 
              Each service is tailored to your unique style and delivered with expert precision.
            </motion.p>

            {/* Service Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              {["cutting", "coloring", "wigs"].map((category, index) => (
                <motion.span
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: prefersReducedMotion ? 1 : 1.05,
                    backgroundColor: 'rgba(245, 158, 11, 0.2)' 
                  }}
                  className="px-4 py-2 text-sm text-gray-400 bg-gray-800/50 rounded-full hover:text-amber-400 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Services Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, index) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                index={index}
                onOpenModal={openModal}
              />
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-gray-400 mb-6">
              Can't find what you're looking for? We offer custom consultations for unique requests.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Custom Consultation <ExternalLink size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Service Modal */}
      <ServiceModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
});