"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Zap, CheckCircle2, Star, Package, Smartphone,
  Tag, Mail, ArrowRight, Sparkles, Wifi,
  UtensilsCrossed, Bell, Lightbulb,
} from "lucide-react";

// ── Starter Kit feature lists ──────────────────────────────────────────────
const starterFeatures = [
  "5x Physical NFC Stickers (Standard)",
  "Plan 1: Real-time Payment Inbox",
  "Cheaper price for SaaS of Listening App",
];

const proFeatures = [
  "12x Physical NFC Stickers (Standard)",
  "Plan 1: Real-time Payment Inbox",
  "Plan 2: Table Management & Amount Push In",
  "Plan 3: Call for Staff & Call for Bill",
  "Android Listener App (Auto Sync with email)",
  "Cheaper price for SaaS of Listening App",
];

// ── SaaS plan feature lists ────────────────────────────────────────────────
const liteFeatures = [
  "2x Physical NFC Stickers (Standard)",
  "Plan 1: Real-time Payment Inbox",
  "Payment History Log",
];

const basicSaasFeatures = [
  "Plan 1: Real-time Payment Inbox",
  "Payment History Log",
  "Cheaper price for SaaS of Listening App",
];

const advancedSaasFeatures = [
  "Everything in Basic",
  "Table Management & Amount Push In",
  "Call for Staff & Call for Bill",
  "Call for Bills Button",
  "Cheaper price for SaaS of Listening App",
];

export default function PricingPage() {
  const [promoExpired] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-blue-200">

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0">
        <Link href="/" className="flex items-center gap-3">
          <img src="/TapPay_Logo.png" alt="TapPay Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Tap<span className="text-blue-600">Pay</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <a href="#packs" className="hover:text-blue-600 transition-colors">Packages</a>
          <a href="#saas" className="hover:text-blue-600 transition-colors">SaaS Plans</a>
          <a href="#addons" className="hover:text-blue-600 transition-colors">Add-ons</a>
        </div>
        <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20">
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-slate-50 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-400/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Simple, transparent pricing
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6 text-slate-900">
            Pick Your Plan.<br />
            <span className="text-blue-600">Start Collecting.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            From a single stall to a full cafe — we have the right package for you.
            No hidden fees. No complicated contracts.
          </p>
        </div>
      </section>

      {/* ── STARTER KITS ── */}
      <section id="packs" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Starter Kits</h2>
          <p className="text-slate-500 font-medium">Hardware + Software bundled. Pay once, get started immediately.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* STARTER PACK */}
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-lg p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Starter Pack</p>
                <h3 className="text-xl font-black text-slate-900">Solo Stall</h3>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-slate-900">RM 35</span>
                <span className="text-slate-400 font-medium mb-2">one-time</span>
              </div>
              {!promoExpired ? (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-green-700 font-bold text-sm flex items-center gap-2">
                    <Sparkles size={15} />🎉 Launch Promo: 2 months Plan 1 FREE
                  </p>
                  <p className="text-green-600 text-xs mt-1 font-medium">
                    Then RM 15/month after promo ends. 1st month included in pack.
                  </p>
                </div>
              ) : (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <p className="text-slate-600 text-sm font-medium">Includes 1 month of Plan 1. Then RM 15/month.</p>
                </div>
              )}
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {starterFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-slate-700 font-medium">
                  <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white py-3.5 rounded-2xl font-bold transition-all">
              Get Starter Pack <ArrowRight size={18} />
            </Link>
          </div>

          {/* PRO PACK */}
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl shadow-blue-600/30 p-8 flex flex-col text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -top-1 -right-1">
              <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1.5 rounded-bl-2xl rounded-tr-3xl">
                <Star size={12} fill="currentColor" /> Most Popular
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Pro Pack</p>
                <h3 className="text-xl font-black text-white">Cafe & Restaurant</h3>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white">RM 95</span>
                <span className="text-blue-200 font-medium mb-2">one-time</span>
              </div>
              {!promoExpired ? (
                <div className="mt-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
                  <p className="text-yellow-300 font-bold text-sm flex items-center gap-2">
                    <Sparkles size={15} />🎉 Launch Promo: 2 months Plan 1,2,3 + App FREE
                  </p>
                  <p className="text-blue-100 text-xs mt-1 font-medium">
                    Then RM 35/month + RM 5/month App. 1st month included.
                  </p>
                </div>
              ) : (
                <div className="mt-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                  <p className="text-blue-100 text-sm font-medium">Includes 1 month Plan 1,2,3 + App. Then RM 40/month.</p>
                </div>
              )}
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-white font-medium">
                  <CheckCircle2 size={18} className="text-yellow-300 mt-0.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 py-3.5 rounded-2xl font-bold transition-all">
              Get Pro Pack <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MONTHLY SAAS PLANS ── */}
      <section id="saas" className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Monthly SaaS Plans</h2>
            <p className="text-slate-500 font-medium">Already have accounts verified and stickers?</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            {/* LITE PACK */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 flex flex-col">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lite Pack</p>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Lite</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">Just getting started</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">RM 25</span>
                <span className="text-slate-400 mb-1 font-medium">/month</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {liteFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                    <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full text-center bg-slate-900 hover:bg-slate-700 text-white py-3 rounded-2xl font-bold transition-all text-sm">
                Subscribe Lite
              </Link>
            </div>

            {/* BASIC / PLAN 1 */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 flex flex-col">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Plan 1</p>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Basic</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">For the solo stall owner</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">RM 15</span>
                <span className="text-slate-400 mb-1 font-medium">/month</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {basicSaasFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                    <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full text-center bg-slate-900 hover:bg-slate-700 text-white py-3 rounded-2xl font-bold transition-all text-sm">
                Subscribe Basic
              </Link>
            </div>

            {/* ADVANCED / PLAN 1,2,3 */}
            <div className="bg-blue-50 rounded-3xl border border-blue-200 p-8 flex flex-col">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Plan 1, 2 & 3</p>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Advanced</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">For cafes & restaurants</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-blue-700">RM 35</span>
                <span className="text-slate-400 mb-1 font-medium">/month</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {advancedSaasFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm">
                    <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold transition-all text-sm">
                Subscribe Advanced
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADD-ONS ── */}
      <section id="addons" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Add-ons</h2>
          <p className="text-slate-500 font-medium">Power up your plan with the extras you actually need.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Listener App - Starter */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Smartphone size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Add-on</p>
              <h3 className="font-black text-slate-900 text-lg leading-tight">Listener App</h3>
              <p className="text-slate-500 text-xs font-medium mt-1">For Starter Pack users</p>
            </div>
            <div className="mt-auto">
              <span className="text-3xl font-black text-slate-900">RM 10</span>
              <span className="text-slate-400 text-sm font-medium">/month</span>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Auto-sync TNG payments to your dashboard. Flash + voice alert on Android.
              </p>
            </div>
          </div>

          {/* Listener App - Pro */}
          <div className="bg-blue-50 rounded-3xl border border-blue-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-200 text-blue-700 flex items-center justify-center">
              <Bell size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Add-on</p>
              <h3 className="font-black text-slate-900 text-lg leading-tight">Listener App</h3>
              <p className="text-blue-600 text-xs font-bold mt-1">For Pro Pack users</p>
            </div>
            <div className="mt-auto">
              <span className="text-3xl font-black text-blue-700">RM 5</span>
              <span className="text-slate-400 text-sm font-medium">/month</span>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Same full Listener App — discounted for Pro Pack subscribers.
              </p>
            </div>
          </div>

          {/* Standard Sticker */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Tag size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hardware</p>
              <h3 className="font-black text-slate-900 text-lg leading-tight">NFC Sticker</h3>
              <p className="text-slate-500 text-xs font-medium mt-1">Standard (plain)</p>
            </div>
            <div className="mt-auto">
              <span className="text-3xl font-black text-slate-900">RM 4.99</span>
              <span className="text-slate-400 text-sm font-medium">/piece</span>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Replacement or extra stickers. Minimum order may apply.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALTERNATIVE NFC EXTRA SERVICES ── */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
                  <Sparkles size={12} /> Custom Service
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                  Alternative NFC<br />Extra Services
                </h2>
                <p className="text-slate-400 font-medium mb-6 leading-relaxed">
                  Want something more? We can set up your NFC stickers for a whole lot more than just payments.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: <UtensilsCrossed size={15} />, label: "Digital E-Menu" },
                    { icon: <Bell size={15} />, label: "Call Waiter Button" },
                    { icon: <Wifi size={15} />, label: "WiFi Auto-Connect" },
                    { icon: <Sparkles size={15} />, label: "Event Promotions" },
                    { icon: <Lightbulb size={15} />, label: "Your Ideas to Shine" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                      <span className="text-blue-400">{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 text-sm">
                  Pricing depends on what you need. Drop us an email and we'll figure it out together.
                </p>
              </div>
              <div className="shrink-0">
                <a
                  href="mailto:tappaymy@hotmail.com"
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 rounded-2xl font-bold text-base transition-all shadow-xl shadow-blue-900/30"
                >
                  <Mail size={20} /> Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Quick Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-medium border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left px-4 py-4 rounded-l-2xl text-slate-600 font-bold">Feature</th>
                <th className="text-center px-4 py-4 text-slate-600 font-bold">Starter<br /><span className="font-black text-slate-900">RM 35</span></th>
                <th className="text-center px-4 py-4 text-blue-700 font-bold">Pro<br /><span className="font-black text-blue-700">RM 95</span></th>
                <th className="text-center px-4 py-4 text-slate-600 font-bold">Lite<br /><span className="font-black text-slate-900">RM 25/mo</span></th>
                <th className="text-center px-4 py-4 text-slate-600 font-bold">Basic<br /><span className="font-black text-slate-900">RM 15/mo</span></th>
                <th className="text-center px-4 py-4 rounded-r-2xl text-slate-600 font-bold">Advanced<br /><span className="font-black text-slate-900">RM 35/mo</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                ["NFC Stickers", "5x", "12x", "2x", "—", "—"],
                ["Payment Inbox", "✓", "✓", "✓", "✓", "✓"],
                ["Table Mgmt & Amount Push", "—", "✓", "—", "—", "✓"],
                ["Call for Staff & Bill", "—", "✓", "—", "—", "✓"],
                ["Call for Bills Button", "—", "—", "—", "—", "✓"],
                ["Listener App", "+RM10/mo", "+RM5/mo", "+RM10/mo", "+RM10/mo", "+RM5/mo"],
                ["Launch Promo", "2 mo FREE", "2 mo FREE", "—", "—", "—"],
              ].map(([feature, ...cols], i) => (
                <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-3.5 text-slate-700 font-semibold rounded-l-xl">{feature}</td>
                  {cols.map((val, j) => (
                    <td key={j} className={`px-4 py-3.5 text-center rounded-${j === cols.length - 1 ? "r" : "none"}-xl ${j === 1 ? "text-blue-700 font-bold" : val === "✓" ? "text-green-600 font-bold" : val === "—" ? "text-slate-300" : "text-slate-600"}`}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to go cashless the smart way?</h2>
          <p className="text-slate-500 font-medium mb-8">Start with the Starter Pack and upgrade anytime.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-600/20">
              Create Free Account <ArrowRight size={20} />
            </Link>
            <a href="mailto:tappaymy@hotmail.com" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all">
              <Mail size={20} /> Ask a Question
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-slate-500 font-medium text-center">
          <div className="flex items-center gap-2">
            <img src="/TapPay_Logo.png" alt="TapPay Logo" className="w-6 h-6 object-contain" />
            <span className="text-slate-900 font-bold tracking-tight text-lg">TapPay</span>
          </div>
          <p className="text-sm">© 2026 TapPay Malaysia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
