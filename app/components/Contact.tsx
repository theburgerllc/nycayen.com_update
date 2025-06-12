"use client";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Instagram, Clock, Send, CheckCircle } from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";

export default function Contact() {
  const [state, handleSubmit] = useForm("mjkrwekw");

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "(212) 555-0123",
      href: "tel:+12125550123"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email", 
      value: "hello@nycayen.com",
      href: "mailto:hello@nycayen.com"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Location",
      value: "Manhattan, NYC",
      href: "#"
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      label: "Instagram",
      value: "@nycayenmoore",
      href: "https://instagram.com/nycayenmoore"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Hours",
      value: "Tue-Sat 9AM-7PM",
      href: "#"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-playfair text-white mb-6">
            Let's Create Something <span className="text-amber-400 italic">Beautiful</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to transform your look? Get in touch to schedule your luxury hair experience
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-playfair text-white mb-8">Get in Touch</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Questions about services? Ready to book your appointment? I'd love to hear from you. 
              Fill out the form or reach out directly using the contact information below.
            </p>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 bg-stone-900/50 rounded-lg hover:bg-stone-900/70 transition-colors"
                >
                  <div className="text-amber-400">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">{info.label}</p>
                    {info.href && info.href !== "#" ? (
                      <a 
                        href={info.href}
                        className="text-white hover:text-amber-400 transition-colors font-medium"
                        target={info.href.startsWith('http') ? '_blank' : '_self'}
                        rel={info.href.startsWith('http') ? 'noopener noreferrer' : ''}
                      >
                        {info.value}
                      </a>
                    ) : (
                      <span className="text-white font-medium">{info.value}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-stone-900 p-8 rounded-2xl"
          >
            {state.succeeded ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                <h3 className="text-2xl font-playfair text-white mb-4">Thank You!</h3>
                <p className="text-gray-300 mb-6">
                  Your message has been received. I'll get back to you within 24 hours to discuss your hair goals.
                </p>
                <div className="space-y-4">
                  <p className="text-amber-400 font-medium">What happens next?</p>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• I'll review your inquiry and service needs</li>
                    <li>• You'll receive a personal response within 24 hours</li>
                    <li>• We'll schedule your consultation or appointment</li>
                  </ul>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                      placeholder="Your full name"
                    />
                    <ValidationError prefix="Name" field="name" errors={state.errors} className="mt-1 text-sm text-red-400" />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                      placeholder="your.email@example.com"
                    />
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-sm text-red-400" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                      placeholder="(212) 555-0123"
                    />
                    <ValidationError prefix="Phone" field="phone" errors={state.errors} className="mt-1 text-sm text-red-400" />
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                      Service Interest
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                    >
                      <option value="Precision Cuts">Precision Cuts</option>
                      <option value="Color Artistry">Color Artistry</option>
                      <option value="Wig Design & Styling">Wig Design & Styling</option>
                      <option value="Bridal Hair">Bridal Hair</option>
                      <option value="Hair Extensions">Hair Extensions</option>
                      <option value="Consultation">Consultation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell me about your hair goals, any specific requests, or questions you have..."
                  />
                  <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 text-sm text-red-400" />
                </div>

                <button
                  type="submit"
                  disabled={state.submitting}
                  className="w-full btn-primary py-4 text-center flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}