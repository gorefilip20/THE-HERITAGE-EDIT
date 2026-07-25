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
    try {
      const response = await fetch("https://formspree.io/f/maqrjzvj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitted(true);
      }
    } catch {
      // Submission failed silently
    } finally {
      setLoading(false);
    }
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
              <div className="flex items-start gap-4 p-4 bg-white border border-neutral-200">
                <div className="p-2 bg-emerald-50">
                  <Mail size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Email</p>
                  <a href="mailto:hello@theheritageedit.com" className="text-sm text-neutral-500 hover:text-[#0D2C22] transition-colors">
                    hello@theheritageedit.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white border border-neutral-200">
                <div className="p-2 bg-blue-50">
                  <Phone size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Phone</p>
                  <p className="text-sm text-neutral-500">+234 901 234 5678</p>
                </div>
              </div>
              <a
                href="https://wa.me/2349012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-white border border-neutral-200 hover:border-heritage-green transition-colors"
              >
                <div className="p-2 bg-green-50">
                  <svg className="w-[18px] h-[18px] text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">WhatsApp</p>
                  <p className="text-sm text-neutral-500">Chat with our concierge team</p>
                </div>
              </a>
              <div className="flex items-start gap-4 p-4 bg-white border border-neutral-200">
                <div className="p-2 bg-purple-50">
                  <MapPin size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">Location</p>
                  <p className="text-sm text-neutral-500">Lagos, Nigeria</p>
                  <p className="text-sm text-neutral-500">London, United Kingdom</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white border border-neutral-200">
                <div className="p-2 bg-amber-50">
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
                <div className="bg-white border border-neutral-200 p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-serif text-neutral-800 mb-2">Message Sent!</h3>
                  <p className="text-sm text-neutral-500 max-w-md mx-auto">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 p-6 md:p-8">
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
                          className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
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
                          className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
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
                        className="w-full h-11 px-3 border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
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
                        className="w-full px-3 py-3 border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all resize-none"
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#0D2C22] text-white text-xs font-semibold tracking-wider uppercase hover:shadow-lg hover:shadow-[#0D2C22]/20 transition-all disabled:opacity-50"
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
