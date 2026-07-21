"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, Package, CheckCircle, Clock, MapPin, Phone, Mail } from "lucide-react";

interface TrackingEvent {
  id: string;
  status: "pending" | "processing" | "shipped" | "in-transit" | "out-for-delivery" | "delivered";
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
}

interface TrackingData {
  orderId: string;
  status: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  events: TrackingEvent[];
  recipient: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  currentLocation?: {
    city: string;
    state: string;
    country: string;
  };
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "in-transit", label: "In Transit", icon: Truck },
  { key: "out-for-delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderTracking() {
  const params = useParams();
  const orderId = params.id as string;
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch tracking data
    fetch(`/api/orders/${orderId}/tracking`)
      .then((r) => r.json())
      .then((d) => setTracking(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-12">Loading tracking information...</div>;
  }

  if (!tracking) {
    return <div className="text-center py-12">Tracking information not found</div>;
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === tracking.status);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-border">
        <div className="luxury-container py-6">
          <Link href="/account" className="inline-flex items-center gap-2 text-[13px] font-sans text-neutral-500 hover:text-obsidian mb-4">
            <ArrowLeft size={14} />
            Back to Orders
          </Link>
          <h1 className="text-display-md font-serif italic text-obsidian">Order Tracking</h1>
          <p className="text-[13px] font-sans text-neutral-500 mt-2">Order #{tracking.orderId}</p>
        </div>
      </div>

      <div className="luxury-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Tracking */}
          <div className="lg:col-span-2">
            {/* Status Timeline */}
            <div className="mb-12">
              <h2 className="text-lg font-serif text-obsidian mb-8">Delivery Status</h2>

              {/* Visual Timeline */}
              <div className="relative mb-12">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />

                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative mb-8 pl-20"
                    >
                      <div
                        className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-heritage-green text-white"
                            : "bg-neutral-100 text-neutral-400"
                        } ${isCurrent ? "ring-4 ring-heritage-green/20" : ""}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div
                        className={`transition-all ${
                          isCompleted ? "text-obsidian" : "text-neutral-400"
                        }`}
                      >
                        <p className="font-medium">{step.label}</p>
                        {isCurrent && (
                          <p className="text-[12px] font-sans text-heritage-green mt-1">
                            Current status
                          </p>
                        )}
                        {isCompleted && idx < currentStepIndex && (
                          <p className="text-[12px] font-sans text-neutral-500 mt-1">
                            Completed
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Estimated Delivery */}
              <div className="bg-green-50 border border-green-200 p-6">
                <p className="text-[11px] font-sans font-medium tracking-wider uppercase text-green-700 mb-2">
                  Estimated Delivery
                </p>
                <p className="text-2xl font-serif text-green-900 mb-2">
                  {new Date(tracking.estimatedDelivery).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-[12px] font-sans text-green-700">
                  Carrier: {tracking.carrier} • Tracking: {tracking.trackingNumber}
                </p>
              </div>
            </div>

            {/* Tracking Events */}
            <div>
              <h2 className="text-lg font-serif text-obsidian mb-6">Tracking History</h2>
              <div className="space-y-4">
                {tracking.events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-border p-4 hover:border-obsidian transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-obsidian">{event.title}</p>
                          <p className="text-[11px] font-sans text-neutral-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-[13px] font-sans text-neutral-600 mb-2">
                          {event.description}
                        </p>
                        {event.location && (
                          <p className="text-[12px] font-sans text-neutral-500 flex items-center gap-1">
                            <MapPin size={12} />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Current Location */}
            {tracking.currentLocation && (
              <div className="bg-neutral-50 p-6 mb-6">
                <h3 className="font-medium text-obsidian mb-4">Current Location</h3>
                <div className="space-y-2 text-[13px]">
                  <p className="text-neutral-600">
                    <span className="font-medium">{tracking.currentLocation.city},</span>{" "}
                    {tracking.currentLocation.state}
                  </p>
                  <p className="text-neutral-500">{tracking.currentLocation.country}</p>
                </div>
              </div>
            )}

            {/* Recipient Info */}
            <div className="bg-neutral-50 p-6 mb-6">
              <h3 className="font-medium text-obsidian mb-4">Delivery Address</h3>
              <div className="space-y-3 text-[13px]">
                <div>
                  <p className="font-medium text-obsidian">{tracking.recipient.name}</p>
                  <p className="text-neutral-600 mt-1">{tracking.recipient.address}</p>
                </div>
                <div className="pt-3 border-t border-slate-border space-y-2">
                  <a
                    href={`tel:${tracking.recipient.phone}`}
                    className="flex items-center gap-2 text-heritage-green hover:text-heritage-green-600"
                  >
                    <Phone size={14} />
                    {tracking.recipient.phone}
                  </a>
                  <a
                    href={`mailto:${tracking.recipient.email}`}
                    className="flex items-center gap-2 text-heritage-green hover:text-heritage-green-600"
                  >
                    <Mail size={14} />
                    {tracking.recipient.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full h-10 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-wider uppercase hover:bg-neutral-50 transition-colors">
                Contact Carrier
              </button>
              <button className="w-full h-10 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-wider uppercase hover:bg-neutral-50 transition-colors">
                Report Issue
              </button>
              <Link
                href={`/account/orders/${tracking.orderId}`}
                className="block text-center h-10 border border-obsidian text-obsidian text-[11px] font-sans font-semibold tracking-wider uppercase hover:bg-neutral-50 transition-colors pt-2"
              >
                View Order Details
              </Link>
            </div>

            {/* SMS/WhatsApp Updates */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200">
              <p className="text-[11px] font-sans font-medium text-blue-900 mb-3">
                Get SMS & WhatsApp Updates
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12px]">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-blue-900">SMS Updates</span>
                </label>
                <label className="flex items-center gap-2 text-[12px]">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-blue-900">WhatsApp Updates</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
