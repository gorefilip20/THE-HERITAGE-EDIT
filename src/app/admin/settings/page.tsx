"use client";

import { useState, useEffect } from "react";
import {
  Save,
  CreditCard,
  Truck,
  Globe,
  Bell,
  Shield,
  Check,
  Loader2,
} from "lucide-react";

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  currency: string;
  timezone: string;
  freeShippingThresholdCents: number;
  domesticShippingCents: number;
  internationalShippingCents: number;
  expressShippingCents: number;
  estimatedDomesticDays: string;
  estimatedInternationalDays: string;
  lowStockThreshold: number;
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
  notifySignups: boolean;
  notifyFailedPayments: boolean;
  paystackEnabled: boolean;
  flutterwaveEnabled: boolean;
}

const DEFAULTS: StoreSettings = {
  storeName: "The Heritage Edit",
  storeEmail: "hello@theheritageedit.com",
  currency: "NGN",
  timezone: "Africa/Lagos",
  freeShippingThresholdCents: 50000,
  domesticShippingCents: 1500,
  internationalShippingCents: 3500,
  expressShippingCents: 5000,
  estimatedDomesticDays: "3-5",
  estimatedInternationalDays: "7-14",
  lowStockThreshold: 5,
  notifyNewOrders: true,
  notifyLowStock: true,
  notifySignups: true,
  notifyFailedPayments: true,
  paystackEnabled: true,
  flutterwaveEnabled: true,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings({ ...DEFAULTS, ...data.settings });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      /* ignore */
    }
    setSaving(false);
  }

  function update<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const inputClass =
    "w-full h-10 px-3 border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Settings</h1>
          <p className="text-sm text-neutral-500">Configure your store preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase hover:bg-[#0D2C22]/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saved ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-[#0D2C22]/5 text-[#0D2C22] font-medium"
                      : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3 bg-white border border-neutral-200 shadow-sm p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => update("storeName", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Store Email
                  </label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => update("storeEmail", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className={inputClass}
                  >
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GHS">GHS - Ghanaian Cedi</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => update("lowStockThreshold", Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Payment Providers</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 flex items-center justify-center">
                      <CreditCard size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Paystack</p>
                      <p className="text-xs text-neutral-400">Accept Nigerian payments (cards, bank, USSD)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paystackEnabled}
                      onChange={(e) => update("paystackEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-[#0D2C22]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#0D2C22] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center">
                      <CreditCard size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Flutterwave</p>
                      <p className="text-xs text-neutral-400">Accept international card payments</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.flutterwaveEnabled}
                      onChange={(e) => update("flutterwaveEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-[#0D2C22]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#0D2C22] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Shipping Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Domestic Rate (kobo/cents)
                  </label>
                  <input
                    type="number"
                    value={settings.domesticShippingCents}
                    onChange={(e) => update("domesticShippingCents", Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    International Rate (kobo/cents)
                  </label>
                  <input
                    type="number"
                    value={settings.internationalShippingCents}
                    onChange={(e) => update("internationalShippingCents", Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Express Rate (kobo/cents)
                  </label>
                  <input
                    type="number"
                    value={settings.expressShippingCents}
                    onChange={(e) => update("expressShippingCents", Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Free Shipping Threshold (kobo/cents)
                  </label>
                  <input
                    type="number"
                    value={settings.freeShippingThresholdCents}
                    onChange={(e) => update("freeShippingThresholdCents", Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Estimated Domestic (days)
                  </label>
                  <input
                    type="text"
                    value={settings.estimatedDomesticDays}
                    onChange={(e) => update("estimatedDomesticDays", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                    Estimated International (days)
                  </label>
                  <input
                    type="text"
                    value={settings.estimatedInternationalDays}
                    onChange={(e) => update("estimatedInternationalDays", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Notification Preferences</h3>
              <div className="space-y-3">
                {([
                  { key: "notifyNewOrders" as const, label: "New order notifications", desc: "Get notified when a new order is placed" },
                  { key: "notifyLowStock" as const, label: "Low stock alerts", desc: "Alert when product stock falls below threshold" },
                  { key: "notifySignups" as const, label: "Customer sign-ups", desc: "Notify when new customers register" },
                  { key: "notifyFailedPayments" as const, label: "Payment failures", desc: "Alert on failed payment attempts" },
                ] as const).map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-neutral-200">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{item.label}</p>
                      <p className="text-xs text-neutral-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[item.key]}
                        onChange={(e) => update(item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-[#0D2C22]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#0D2C22] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Security</h3>
              <div className="space-y-4">
                <div className="p-4 border border-neutral-200">
                  <h4 className="text-sm font-medium text-neutral-800 mb-2">Admin Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        defaultValue="admin@theheritageedit.com"
                        className="w-full h-10 px-3 border border-neutral-200 bg-neutral-50 text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                        Role
                      </label>
                      <input
                        type="text"
                        defaultValue="SUPER_ADMIN"
                        className="w-full h-10 px-3 border border-neutral-200 bg-neutral-50 text-sm"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-amber-200 bg-amber-50">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Change Password</h4>
                  <p className="text-xs text-amber-600 mb-3">Update your admin password regularly for security</p>
                  <button className="px-4 py-2 bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
