// app/sections/BeforeAfter.tsx
"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface BeforeAfterProps {
  before: string;
  after: string;
}

export default function BeforeAfter({ before, after }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState({ before: false, after: false });

  const handleImageError = (type: 'before' | 'after') => {
    setImageErrors(prev => ({ ...prev, [type]: true }));
  };

  // Fallback placeholder for missing images
  const PlaceholderImage = ({ type }: { type: 'before' | 'after' }) => (
    <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-700 flex items-center justify-center">
      <div className="text-center text-white/60">
        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-amber-600/20 flex items-center justify-center">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium">{type === 'before' ? 'Before' : 'After'}</p>
        <p className="text-xs">Portfolio Image</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-64 relative overflow-hidden rounded-lg shadow-lg bg-stone-800 group">
      {/* Before image */}
      {!imageErrors.before ? (
        <Image 
          src={before} 
          alt="Before transformation" 
          fill 
          className="object-cover" 
          onError={() => handleImageError('before')}
        />
      ) : (
        <PlaceholderImage type="before" />
      )}
      
      {/* After image with draggable reveal */}
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.1}
        dragMomentum={false}
        className="absolute inset-0 overflow-hidden cursor-ew-resize"
        ref={containerRef}
        initial={{ x: 0 }}
        whileHover={{ scale: 1.01 }}
        style={{ 
          clipPath: "inset(0 50% 0 0)",
          willChange: "transform"
        }}
      >
        {!imageErrors.after ? (
          <Image 
            src={after} 
            alt="After transformation" 
            fill 
            className="object-cover" 
            onError={() => handleImageError('after')}
          />
        ) : (
          <PlaceholderImage type="after" />
        )}
      </motion.div>
      
      {/* Drag indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
          ← Drag to compare →
        </div>
      </div>
      
      {/* Before/After labels */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
        After
      </div>
    </div>
  );
}
