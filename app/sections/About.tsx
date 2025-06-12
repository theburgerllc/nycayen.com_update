"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Award, Heart, Sparkles, Star } from "lucide-react";

export default function About() {
  const pillars = [
    {
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      title: "Artistry",
      description: "Every style is a masterpiece, crafted with precision and creative vision."
    },
    {
      icon: <Star className="w-8 h-8 text-amber-400" />,
      title: "Excellence",
      description: "Committed to the highest standards in hair styling and wig design."
    },
    {
      icon: <Heart className="w-8 h-8 text-amber-400" />,
      title: "Care",
      description: "Your hair health and satisfaction are at the heart of everything we do."
    }
  ];

  const certifications = [
    "Licensed NYC Cosmetologist",
    "Advanced Wig Styling Specialist", 
    "Color Theory Certification",
    "Bridal Hair Design Expert",
    "Texture Specialist Certification"
  ];

  return (
    <section id="about" className="py-20 bg-stone-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-playfair text-white mb-6">
            Meet <span className="text-amber-400 italic">Nycayen</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Luxury hair artistry with over a decade of experience transforming beauty visions into reality
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Headshot */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent rounded-2xl transform rotate-3"></div>
              <Image
                src="/images/nycayen-headshot.jpg"
                alt="Nycayen Moore - Professional Hair Stylist"
                width={400}
                height={500}
                className="relative rounded-2xl shadow-2xl object-cover w-full h-[500px]"
                priority
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="text-lg">
                Welcome to my world of luxury hair artistry. I'm Nycayen Moore, and for over 12 years, 
                I've been passionate about transforming hair into works of art that enhance natural beauty 
                and boost confidence.
              </p>
              <p>
                Based in the heart of New York City, my expertise spans from precision cuts and vibrant 
                color transformations to custom wig design and styling. Every client receives personalized 
                attention and a style that's uniquely theirs.
              </p>
              <p>
                Whether you're preparing for your wedding day, need a stunning new look, or want to explore 
                the versatility of luxury wigs, I'm here to bring your vision to life with artistry, 
                precision, and care.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <span className="px-4 py-2 bg-amber-400/10 text-amber-400 rounded-full text-sm font-medium">
                12+ Years Experience
              </span>
              <span className="px-4 py-2 bg-amber-400/10 text-amber-400 rounded-full text-sm font-medium">
                NYC Based
              </span>
              <span className="px-4 py-2 bg-amber-400/10 text-amber-400 rounded-full text-sm font-medium">
                Luxury Specialist
              </span>
            </div>
          </motion.div>
        </div>

        {/* Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-3xl font-playfair text-center text-white mb-12">
            My Philosophy
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-black/30 rounded-2xl hover:bg-black/40 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  {pillar.icon}
                </div>
                <h4 className="text-xl font-playfair text-white mb-3">{pillar.title}</h4>
                <p className="text-gray-300">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-3xl font-playfair text-white mb-8">
            Certifications & Expertise
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-4 bg-amber-400/10 rounded-lg"
              >
                <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm font-medium">{cert}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}