// app/sections/Contact.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // placeholder: integrate email/Square later
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-20 bg-black text-white">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-playfair mb-4">Get in Touch</h2>
          <p>Questions? Ready to book? Fill in the form and we’ll contact you soon.</p>
          <div className="mt-8 space-y-4">
            <p><strong>Phone:</strong> (555) 123-4567</p>
            <p><strong>Email:</strong> hello@nycayen.com</p>
            <p><strong>Location:</strong> Manhattan, NYC</p>
            <p><strong>Instagram:</strong> @nycayenmoore</p>
            <p><strong>Hours:</strong> Mon–Fri 9AM–7PM, Sat 8AM–6PM, Sun 10AM–5PM</p>
          </div>
        </div>
        <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-stone-900 p-8 rounded-lg">
          {submitted ? (
            <p className="text-amber-400">Thank you! We'll reach out soon.</p>
          ) : (
            <>
              <div>
                <label className="block text-gray-300">Name</label>
                <input required type="text" className="mt-1 w-full p-3 rounded bg-gray-800 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-gray-300">Email</label>
                <input required type="email" className="mt-1 w-full p-3 rounded bg-gray-800 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-gray-300">Service</label>
                <select className="mt-1 w-full p-3 rounded bg-gray-800 focus:ring-amber-500">
                  <option>Precision Cuts</option>
                  <option>Color Artistry</option>
                  <option>Wig Design</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300">Message</label>
                <textarea required rows={4} className="mt-1 w-full p-3 rounded bg-gray-800 focus:ring-amber-500"></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-light text-black rounded-full font-semibold">
                Book Appointment
              </button>
            </>
          )}
        </motion.form>
      </div>
    </section>
  );
}
