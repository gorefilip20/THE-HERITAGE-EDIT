"use client";

import { useState } from "react";
import { Settings, Save, CreditCard, Truck, Globe, Bell, Shield, Check } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    storeName: "The Heritage Edit",
    storeEmail: "hello@theheritageedit.com",
    currency: "NGN",
    timezone: "Africa/Lagos",
    freeShippingThreshold: "500",
  });

  const [paymentSettings, setPaymentSettings] = useState({
    paystackEnabled: true,
    flutterwaveEnabled: true,
    paystackPublicKey: "pk_live_***",
    flutterwavePublicKey: "FLWPUBK_***",
  });

  const [shippingSettings, setShippingSettings] = useState({
    domesticRate: "15",
    internationalRate: "35",
    expressRate: "50",
    estimatedDomestic: "3-5",
    estimatedInternational: "7-14",
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Settings</h1>
          <p className="text-sm text-neutral-500">Configure your store preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 transition-colors"
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all ${
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

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Store Name</label>
                  <input
                    type="text"
                    value={generalSettings.storeName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Store Email</label>
                  <input
                    type="email"
                    value={generalSettings.storeEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Currency</label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22]"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="GHS">GHS - Ghanaian Cedi</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Free Shipping Threshold ($)</label>
                  <input
                    type="number"
                    value={generalSettings.freeShippingThreshold}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, freeShippingThreshold: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Payment Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
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
                      checked={paymentSettings.flutterwaveEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, flutterwaveEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-[#0D2C22]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#0D2C22] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <CreditCard size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Paystack</p>
                      <p className="text-xs text-neutral-400">Accept African payment methods</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.paystackEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, paystackEnabled: e.target.checked })}
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
              <h3 className="text-lg font-semibold text-neutral-800">Shipping Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Domestic Rate ($)</label>
                  <input
                    type="number"
                    value={shippingSettings.domesticRate}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, domesticRate: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">International Rate ($)</label>
                  <input
                    type="number"
                    value={shippingSettings.internationalRate}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, internationalRate: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Express Rate ($)</label>
                  <input
                    type="number"
                    value={shippingSettings.expressRate}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, expressRate: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Estimated Domestic (days)</label>
                  <input
                    type="text"
                    value={shippingSettings.estimatedDomestic}
                    onChange={(e) => setShippingSettings({ ...shippingSettings, estimatedDomestic: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Notification Settings</h3>
              <div className="space-y-3">
                {[
                  { label: "New order notifications", desc: "Get notified when a new order is placed" },
                  { label: "Low stock alerts", desc: "Alert when product stock falls below threshold" },
                  { label: "Customer sign-ups", desc: "Notify when new customers register" },
                  { label: "Payment failures", desc: "Alert on failed payment attempts" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-neutral-200">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{item.label}</p>
                      <p className="text-xs text-neutral-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-[#0D2C22]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#0D2C22] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-neutral-200">
                  <h4 className="text-sm font-medium text-neutral-800 mb-2">Admin Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Admin Email</label>
                      <input type="email" defaultValue="admin@theheritageedit.com" className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm" readOnly />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">Role</label>
                      <input type="text" defaultValue="SUPER_ADMIN" className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm" readOnly />
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Change Password</h4>
                  <p className="text-xs text-amber-600 mb-3">Update your admin password regularly for security</p>
                  <button className="px-4 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors">
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
