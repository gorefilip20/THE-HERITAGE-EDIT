"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Check, Clock } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="bg-[#FBFBFA]">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#0D2C22] to-[#2E1A47] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-amber-400 mb-4">
            Get in Touch
          </p>
          <h1 className="text-display-md font-serif mb-4">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-base text-white/60 max-w-xl mx-auto">
            Whether you have a question about our products, need styling advice, or want to collaborate, our team is here to help.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-serif text-[#0D2C22] mb-6">Contact Information</h3>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-neutral-200">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <Mail size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Email</p>
                  <a href="mailto:hello@theheritageedit.com" className="text-sm text-neutral-500 hover:text-[#0D2C22] transition-colors">
                    hello@theheritageedit.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-neutral-200">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Phone</p>
                  <p className="text-sm text-neutral-500">+1 (555) 000-0000</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-neutral-200">
                <div className="p-2 rounded-lg bg-purple-50">
                  <MapPin size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Location</p>
                  <p className="text-sm text-neutral-500">Lagos, Nigeria</p>
                  <p className="text-sm text-neutral-500">London, United Kingdom</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-neutral-200">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Business Hours</p>
                  <p className="text-sm text-neutral-500">Mon - Fri: 9:00 AM - 6:00 PM (WAT)</p>
                  <p className="text-sm text-neutral-500">Sat: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-serif text-neutral-800 mb-2">Message Sent!</h3>
                  <p className="text-sm text-neutral-500 max-w-md mx-auto">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8">
                  <h3 className="text-lg font-serif text-neutral-800 mb-6">Send us a Message</h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
                      >
                        <option value="">Select a topic</option>
                        <option value="order">Order Inquiry</option>
                        <option value="product">Product Question</option>
                        <option value="shipping">Shipping & Returns</option>
                        <option value="collaboration">Collaboration</option>
                        <option value="press">Press & Media</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                        Message
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={5}
                        className="w-full px-3 py-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#0D2C22] text-white text-xs font-semibold tracking-wider uppercase rounded-lg hover:shadow-lg hover:shadow-[#0D2C22]/20 transition-all disabled:opacity-50"
                    >
                      <Send size={14} />
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
