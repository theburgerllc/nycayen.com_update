// app/sections/BeforeAfter.tsx
"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function BeforeAfter({ before, after }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(0);

  return (
    <div className="w-full h-64 relative overflow-hidden rounded-lg shadow-lg">
      <Image src={before} alt="Before" fill className="object-cover" />
      <motion.div
        drag="x"
        dragConstraints={ref}
        className="absolute inset-0 overflow-hidden"
        ref={ref}
      >
        <Image src={after} alt="After" fill className="object-cover" />
      </motion.div>
    </div>
  );
}
