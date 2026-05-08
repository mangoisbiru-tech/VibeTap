"use client";
import Link from "next/link";
import { Zap, CheckCircle2, Star, Package, Smartphone, Tag, Mail, ArrowRight, Sparkles, Wifi, UtensilsCrossed, Bell, Lightbulb, ShieldCheck, X, Store } from "lucide-react";

import { useState } from "react";

const Check = ({ c = "text-blue-500" }: { c?: string }) => <CheckCircle2 size={16} className={`${c} mt-0.5 shrink-0`} />;

const KITS = [
  { id: "buffet", name: "Buffet Pack", price: 0, sub: "BYO Setup" },
  { id: "lite", name: "Lite Pack", price: 25, sub: "Entry Level" },
  { id: "starter", name: "Starter Pack", price: 35, sub: "Solo Stall" },
  { id: "pro", name: "Pro Pack", price: 75, sub: "Cafe & Restaurant" },
];

const PLANS = [
  { id: "lite", name: "Lite", price: 12 },
  { id: "starter", name: "Starter", price: 12 },
  { id: "pro", name: "Pro", price: 32 },
];

const ADDONS = [
  { id: "app-buffet", name: "Listener App (Buffet)", price: 14 },
  { id: "app-lite", name: "Listener App (Lite)", price: 12 },
  { id: "app-starter", name: "Listener App (Starter)", price: 10 },
  { id: "app-pro", name: "Listener App (Pro)", price: 7 },
  { id: "nfc", name: "NFC Sticker", price: 4.99 },
];

const WHATSAPP_NUMBER = "601112345678";

const buffetFeatures = ["0x Physical NFC Stickers (BYO)", "Buffet Account Badge"];
const liteKitFeatures = ["2x Physical NFC Stickers (Standard)", "Plan 1: Real-time Payment Inbox", "Lite Account Badge"];
const starterFeatures = ["5x Physical NFC Stickers (Standard)", "Plan 1: Real-time Payment Inbox", "Cheaper price for the add-on: Listening App", "Starter Account Badge"];
const proFeatures = ["8x Physical NFC Stickers (Standard)", "Plan 1: Real-time Payment Inbox", "Plan 2: Table Tracking & Instant Sound Alerts", "Plan 3: Call for Waiter & Bill Request", "Cheaper price for the add-on: Listening App after promotion ended", "Pro Account Badge"];

const liteMonthly = ["Plan 1: Real-time Payment Inbox", "Payment History Log"];
const starterMonthly = ["Plan 1: Real-time Payment Inbox", "Payment History Log", "Cheaper price for the add-on: Listening App"];
const proMonthly = ["Everything in Starter", "Table Management & Amount Push In", "Call for Staff & Call for Bill", "Call for Bills Button", "Cheaper price for the add-on: Listening App"];

function PromoBox({ msg, sub, dark = false }: { msg: string; sub: string; dark?: boolean }) {
  return dark ? (
    <div className="mt-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
      <p className="text-yellow-300 font-bold text-sm flex items-center gap-2"><Sparkles size={14} />{msg}</p>
      <p className="text-blue-100 text-xs mt-1">{sub}</p>
    </div>
  ) : (
    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
      <p className="text-green-700 font-bold text-sm flex items-center gap-2"><Sparkles size={14} />{msg}</p>
      <p className="text-green-600 text-xs mt-1">{sub}</p>
    </div>
  );
}

export default function PricingPage() {
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const handleKitSelect = (id: string | null) => {
    if (selectedKit === id) {
      setSelectedKit(null);
      setSelectedPlan(null);
      setSelectedAddons([]);
      return;
    }

    setSelectedKit(id);
    if (id === 'pro') {
      setSelectedPlan('pro');
      setSelectedAddons(['app-pro']);
    } else if (id === 'starter') {
      setSelectedPlan('starter');
      setSelectedAddons(['app-starter']);
    } else if (id === 'lite') {
      setSelectedPlan('lite');
      setSelectedAddons(['app-lite']);
    } else if (id === 'buffet') {
      setSelectedPlan(null);
      setSelectedAddons([]);
    }
  };

  const isOptionDisabled = (type: 'plan' | 'addon', id: string) => {
    if (!selectedKit) return false;
    
    // Lite, Starter, and Pro are all-in-one. Disable all other plan/app selections.
    if (selectedKit === 'lite' || selectedKit === 'starter' || selectedKit === 'pro') {
      if (type === 'plan') return true;
      if (type === 'addon' && id.startsWith('app-')) return true;
      // Note: 'nfc' (Extra Sticker) remains enabled
    }
    
    if (selectedKit === 'buffet') {
      // Buffet users MUST choose their own plan and app
      // But they can ONLY choose the RM 14 listener app
      if (type === 'addon' && id.startsWith('app-') && id !== 'app-buffet') return true;
    }
    
    return false;
  };

  const toggleAddon = (id: string) => {
    if (isOptionDisabled('addon', id)) return;
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const currentKit = KITS.find(k => k.id === selectedKit);
  const currentPlan = PLANS.find(p => p.id === selectedPlan);
  const activeAddons = ADDONS.filter(a => selectedAddons.includes(a.id));

  const oneTimeTotal = (currentKit?.price || 0) + activeAddons.filter(a => a.id === 'nfc').reduce((sum, a) => sum + a.price, 0);
  const isPromoActive = selectedKit && selectedKit !== 'buffet';
  const monthlyTotal = isPromoActive 
    ? 0 
    : (currentPlan?.price || 0) + activeAddons.filter(a => a.id !== 'nfc').reduce((sum, a) => sum + a.price, 0);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/TapPay_Logo.png" alt="TapPay" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-slate-900">Tap<span className="text-blue-600">Pay</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/solutions" className="hover:text-blue-600 transition-colors">Our Value</Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </div>
          <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all">Get Started</Link>
        </div>
      </nav>

      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-bold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Stop losing time to QR scanning
          </div>
          <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-sora)] font-extrabold leading-[1.1] tracking-tight mb-8">
            Simple Pricing.<br />
            <span className="text-blue-600">Infinite ROI.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            The average merchant loses <span className="text-red-500 font-bold">15+ hours a month</span> waiting for customers to scan QRs. TapPay pays for itself in just 1 week of faster service.
          </p>
        </div>
      </section>

      {/* VALUE ANCHORS / COMPARISON */}
      <section className="pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-red-500 font-black text-sm uppercase tracking-widest mb-6">The Old Way (Paper QR)</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-slate-500 text-sm font-medium italic">
                <X size={18} className="text-red-300 mt-0.5 shrink-0" /> "Can you scan this? It's a bit blur..."
              </div>
              <div className="flex items-start gap-3 text-slate-500 text-sm font-medium italic">
                <X size={18} className="text-red-300 mt-0.5 shrink-0" /> "Wait, the app is loading... 5 seconds... 10 seconds..."
              </div>
              <div className="flex items-start gap-3 text-slate-500 text-sm font-medium italic">
                <X size={18} className="text-red-300 mt-0.5 shrink-0" /> "Oops, I typed RM 1.40 instead of RM 14.00."
              </div>
              <p className="pt-4 text-slate-900 font-bold border-t border-slate-100">Result: Long queues & revenue loss.</p>
            </div>
          </div>
          <div className="bg-blue-600 rounded-3xl p-8 shadow-2xl shadow-blue-600/20 text-white">
            <h3 className="text-blue-200 font-black text-sm uppercase tracking-widest mb-6">The TapPay Way (NFC)</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-blue-50 text-sm font-medium">
                <CheckCircle2 size={18} className="text-yellow-400 mt-0.5 shrink-0" /> "Just tap your phone here." (TNG opens in 0.5s)
              </div>
              <div className="flex items-start gap-3 text-blue-50 text-sm font-medium">
                <CheckCircle2 size={18} className="text-yellow-400 mt-0.5 shrink-0" /> Instant sound confirmation on your phone.
              </div>
              <div className="flex items-start gap-3 text-blue-50 text-sm font-medium">
                <CheckCircle2 size={18} className="text-yellow-400 mt-0.5 shrink-0" /> Sound alerts announce "Received RM 14!" instantly.
              </div>
              <p className="pt-4 text-white font-bold border-t border-blue-500/50">Result: Faster service & happy customers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY UPGRADE GRID */}
      <section className="py-20 px-6 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Why Merchants Upgrade</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Investing in TapPay isn't a cost—it's an upgrade to your shop's efficiency.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Zap className="text-yellow-400" />, title: "3x Faster Checkout", desc: "Reduce peak-hour queues by eliminating the 'open app -> scan -> wait' friction. Tap and pay instantly." },
              { icon: <ShieldCheck className="text-blue-400" />, title: "Instant Verification", desc: "Your phone announces the payment amount out loud. No more squinting at the customer's phone screen." },
              { icon: <Store className="text-green-400" />, title: "Premium Brand Image", desc: "A sleek NFC sticker looks 10x more professional than a faded, crumpled paper QR code on your counter." }
            ].map(v => (
              <div key={v.title} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">{v.icon}</div>
                <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STARTER KITS */}
      <section id="packs" className="py-16 px-6 max-w-[90rem] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Starter Kits</h2>
          <p className="text-slate-500 font-medium">Badge acc + Monthly SAAS bundle</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* BUFFET PACK */}
          <div 
            onClick={() => handleKitSelect('buffet')}
            className={`cursor-pointer rounded-3xl border-4 transition-all p-8 flex flex-col ${selectedKit === 'buffet' ? 'bg-blue-50/50 border-blue-500 shadow-xl' : 'bg-white border-slate-200 shadow-md hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center"><UtensilsCrossed size={22} /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Buffet Pack</p><h3 className="text-xl font-black">BYO Setup</h3></div>
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-2"><span className="text-5xl font-black">RM 0</span><span className="text-slate-400 mb-2">one-time</span></div>
              <PromoBox msg="🎉 Bring your own hardware" sub="Buy cheap NFC stickers online, configure them yourself, and connect to our software." />
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {buffetFeatures.map(f => <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm"><Check />{f}</li>)}
            </ul>
            <button className={`w-full py-3.5 rounded-2xl font-bold transition-all ${selectedKit === 'buffet' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {selectedKit === 'buffet' ? 'Selected' : 'Select'}
            </button>
          </div>

          {/* LITE KIT */}
          <div 
            onClick={() => handleKitSelect('lite')}
            className={`cursor-pointer rounded-3xl border-4 transition-all p-8 flex flex-col ${selectedKit === 'lite' ? 'bg-blue-50/50 border-blue-500 shadow-xl' : 'bg-white border-slate-200 shadow-md hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center"><Tag size={22} /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lite Pack</p><h3 className="text-xl font-black">Entry Level</h3></div>
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-2"><span className="text-5xl font-black">RM 25</span><span className="text-slate-400 mb-2">one-time</span></div>
              <PromoBox msg="🎉 Includes Plan 1 SaaS plan" sub="1st month free + 1 bonus month. Then RM 12/month for SaaS ONLY." />
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {liteKitFeatures.map(f => <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm"><Check />{f}</li>)}
            </ul>
            <button className={`w-full py-3.5 rounded-2xl font-bold transition-all ${selectedKit === 'lite' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {selectedKit === 'lite' ? 'Selected' : 'Select'}
            </button>
          </div>

          {/* STARTER PACK */}
          <div 
            onClick={() => handleKitSelect('starter')}
            className={`cursor-pointer rounded-3xl border-4 transition-all p-8 flex flex-col ${selectedKit === 'starter' ? 'bg-blue-50/50 border-blue-500 shadow-xl' : 'bg-white border-slate-200 shadow-md hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center"><Package size={22} /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Starter Pack</p><h3 className="text-xl font-black">Solo Stall</h3></div>
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-2"><span className="text-5xl font-black">RM 35</span><span className="text-slate-400 mb-2">one-time</span></div>
              <PromoBox msg="🎉 Includes Plan 1 SaaS plan" sub="1st month free + 1 bonus month. Then RM 12/month for SaaS ONLY." />
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {starterFeatures.map(f => <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm"><Check />{f}</li>)}
            </ul>
            <button className={`w-full py-3.5 rounded-2xl font-bold transition-all ${selectedKit === 'starter' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>
              {selectedKit === 'starter' ? 'Selected' : 'Select'}
            </button>
          </div>

          {/* PRO PACK */}
          <div 
            onClick={() => handleKitSelect('pro')}
            className={`relative cursor-pointer rounded-3xl border-4 transition-all p-8 flex flex-col overflow-hidden ${selectedKit === 'pro' ? 'bg-blue-600 border-yellow-400 shadow-2xl text-white' : 'bg-gradient-to-br from-blue-600 to-blue-700 border-transparent shadow-2xl text-white'}`}
          >
            <div className="absolute -top-1 -right-1">
              <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1.5 rounded-bl-2xl rounded-tr-3xl"><Star size={12} fill="currentColor" /> Most Popular</div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Zap size={22} /></div>
              <div><p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Pro Pack</p><h3 className="text-xl font-black">Cafe & Restaurant</h3></div>
            </div>
            <div className="mb-6">
              <div className="flex items-end gap-2"><span className="text-5xl font-black">RM 75</span><span className="text-blue-200 mb-2">one-time</span></div>
              <PromoBox dark msg="🎉 Includes Plan 1,2,3 SaaS" sub="1st month free + 1 bonus month. Then RM 32/month for SaaS with RM 7/month for the Add-on App." />
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {proFeatures.map(f => <li key={f} className="flex items-start gap-3 font-medium text-sm"><Check c={selectedKit === 'pro' ? "text-yellow-300" : "text-yellow-300"} />{f}</li>)}
            </ul>
            <button className={`w-full py-3.5 rounded-2xl font-bold transition-all ${selectedKit === 'pro' ? 'bg-yellow-400 text-yellow-900' : 'bg-white text-blue-700 hover:bg-blue-50'}`}>
              {selectedKit === 'pro' ? 'Selected' : 'Select'}
            </button>
          </div>
        </div>
      </section>

      {/* MONTHLY SAAS */}
      <section id="saas" className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Monthly SaaS Plans</h2>
            <p className="text-slate-500 font-medium">Already have accounts verified and stickers?</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div 
              onClick={() => !isOptionDisabled('plan', 'lite') && setSelectedPlan(selectedPlan === 'lite' ? null : 'lite')}
              className={`rounded-3xl border-4 transition-all p-8 flex flex-col ${isOptionDisabled('plan', 'lite') ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent' : 'cursor-pointer'} ${selectedPlan === 'lite' ? 'bg-blue-50/50 border-blue-500 shadow-xl' : 'bg-slate-50 border-slate-200'}`}
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Plan 1</p>
              <h3 className="text-2xl font-black mb-1">Lite</h3>
              <p className="text-slate-500 text-sm mb-6">Just getting started</p>
              <div className="flex items-end gap-1 mb-6"><span className="text-4xl font-black">RM 12</span><span className="text-slate-400 mb-1">/month</span></div>
              <ul className="space-y-3 flex-1 mb-8">
                {liteMonthly.map(f => <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm"><Check />{f}</li>)}
              </ul>
              <button className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${selectedPlan === 'lite' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>
                {selectedPlan === 'lite' ? 'Selected' : 'Select'}
              </button>
            </div>

            <div 
              onClick={() => !isOptionDisabled('plan', 'starter') && setSelectedPlan(selectedPlan === 'starter' ? null : 'starter')}
              className={`rounded-3xl border-4 transition-all p-8 flex flex-col ${isOptionDisabled('plan', 'starter') ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent' : 'cursor-pointer'} ${selectedPlan === 'starter' ? 'bg-blue-50/50 border-blue-500 shadow-xl' : 'bg-slate-50 border-slate-200'}`}
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Plan 1</p>
              <h3 className="text-2xl font-black mb-1">Starter</h3>
              <p className="text-slate-500 text-sm mb-6">Solo stall owner</p>
              <div className="flex items-end gap-1 mb-6"><span className="text-4xl font-black">RM 12</span><span className="text-slate-400 mb-1">/month</span></div>
              <ul className="space-y-3 flex-1 mb-8">
                {starterMonthly.map(f => <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm"><Check />{f}</li>)}
              </ul>
              <button className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${selectedPlan === 'starter' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>
                {selectedPlan === 'starter' ? 'Selected' : 'Select'}
              </button>
            </div>

            <div 
              onClick={() => !isOptionDisabled('plan', 'pro') && setSelectedPlan(selectedPlan === 'pro' ? null : 'pro')}
              className={`rounded-3xl border-4 transition-all p-8 flex flex-col ${isOptionDisabled('plan', 'pro') ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent' : 'cursor-pointer'} ${selectedPlan === 'pro' ? 'bg-blue-50/50 border-blue-500 shadow-xl' : 'bg-blue-50 border-blue-200'}`}
            >
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Plan 1, 2 & 3</p>
              <h3 className="text-2xl font-black mb-1">Pro</h3>
              <p className="text-slate-500 text-sm mb-6">Cafes & restaurants</p>
              <div className="flex items-end gap-1 mb-6"><span className="text-4xl font-black text-blue-700">RM 32</span><span className="text-slate-400 mb-1">/month</span></div>
              <ul className="space-y-3 flex-1 mb-8">
                {proMonthly.map(f => <li key={f} className="flex items-start gap-3 text-slate-700 font-medium text-sm"><Check c="text-blue-600" />{f}</li>)}
              </ul>
              <button className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${selectedPlan === 'pro' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {selectedPlan === 'pro' ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ADD-ONS */}
      <section id="addons" className="py-16 px-6 max-w-[90rem] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Add-ons</h2>
          <p className="text-slate-500 font-medium">Power up your plan with the extras you actually need.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { id: "app-buffet", icon: <Smartphone size={22} />, label: "Listener App", sub: "For Buffet Users", price: "RM 14", unit: "/month", desc: "Auto-sync TNG payments. Flash + voice alert on Android.", bg: "bg-white border-slate-200", iconBg: "bg-slate-100 text-slate-600", priceCls: "text-slate-900" },
            { id: "app-lite", icon: <Smartphone size={22} />, label: "Listener App", sub: "For Lite Pack users", price: "RM 12", unit: "/month", desc: "Auto-sync TNG payments. Flash + voice alert on Android.", bg: "bg-white border-slate-200", iconBg: "bg-slate-100 text-slate-600", priceCls: "text-slate-900" },
            { id: "app-starter", icon: <Bell size={22} />, label: "Listener App", sub: "For Starter Pack users", price: "RM 10", unit: "/month", desc: "Auto-sync TNG payments. Flash + voice alert on Android.", bg: "bg-white border-slate-200", iconBg: "bg-blue-100 text-blue-600", priceCls: "text-slate-900" },
            { id: "app-pro", icon: <Bell size={22} />, label: "Listener App", sub: "For Pro Pack users", price: "RM 7", unit: "/month", desc: "Same full Listener App — discounted for Pro Pack subscribers.", bg: "bg-blue-50 border-blue-200", iconBg: "bg-blue-200 text-blue-700", priceCls: "text-blue-700" },
            { id: "nfc", icon: <Tag size={22} />, label: "NFC Sticker", sub: "Standard (plain)", price: "RM 4.99", unit: "/piece", desc: "Replacement or extra stickers. Minimum order may apply.", bg: "bg-white border-slate-200", iconBg: "bg-slate-100 text-slate-600", priceCls: "text-slate-900" },
          ].map(({ id, icon, label, sub, price, unit, desc, bg, iconBg, priceCls }) => (
            <div 
              key={id} 
              onClick={() => {
                if (id.startsWith('app-')) {
                  // Mutually exclusive listener app selection
                  if (selectedAddons.includes(id)) {
                    setSelectedAddons(selectedAddons.filter(a => a !== id));
                  } else {
                    setSelectedAddons([...selectedAddons.filter(a => !a.startsWith('app-')), id]);
                  }
                } else {
                  toggleAddon(id);
                }
              }}
              className={`rounded-3xl border-4 transition-all p-6 flex flex-col gap-4 ${isOptionDisabled('addon', id) ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent' : 'cursor-pointer'} ${selectedAddons.includes(id) ? 'bg-blue-50/50 border-blue-500 shadow-xl' : `${bg} border-transparent hover:border-blue-200`}`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconBg}`}>{icon}</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-slate-600">{sub}</p>
              </div>
              <div className="flex items-end gap-1">
                <span className={`text-2xl font-black ${priceCls}`}>{price}</span>
                <span className="text-slate-400 text-xs mb-1">{unit}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed flex-1">{desc}</p>
              <div className={`text-[10px] font-bold px-2 py-1 rounded-md self-start ${selectedAddons.includes(id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {isOptionDisabled('addon', id) && selectedAddons.includes(id) ? 'INCLUDED' : (selectedAddons.includes(id) ? 'SELECTED' : 'ADD TO PLAN')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SELECTION SUMMARY */}
      {(selectedKit || selectedPlan || selectedAddons.length > 0) && (
        <div className="sticky bottom-0 z-[60] bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-6 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Selection Summary</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-bold text-slate-900">{currentKit?.name || 'No Kit'}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-bold text-slate-900">{currentPlan?.name || 'No Plan'} Plan</span>
                  </div>
                  {activeAddons.length > 0 && (
                    <>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm font-bold text-slate-900">{activeAddons.length} Add-ons</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">One-Time Hardware</p>
                  <p className="text-2xl font-black text-slate-900">RM {oneTimeTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monthly Subscription</p>
                  <p className="text-2xl font-black text-blue-600">
                    RM {monthlyTotal.toFixed(2)}
                    <span className="text-xs text-slate-400 ml-1">{isPromoActive ? '(First 2 Months Free)' : '/mo'}</span>
                  </p>
                </div>
              </div>
            </div>

            <Link 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20YK!%20I'd%20like%20to%20get:%0A-%20${currentKit?.name || 'No Kit'}%0A-%20${currentPlan?.name || 'No'}%20Plan%0A-${activeAddons.length > 0 ? activeAddons.map(a => `%0A-%20${a.name}`).join('') : ''}%0A%0AOne-time:%20RM%20${oneTimeTotal.toFixed(2)}%0AMonthly:%20RM%20${monthlyTotal.toFixed(2)}`}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
            >
              Confirm Selection <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      )}

      {/* EXTRA SERVICES */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
                  <Sparkles size={12} /> Custom Service
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">Alternative NFC<br />Extra Services</h2>
                <p className="text-slate-400 mb-6 leading-relaxed">Want something more? We can set up your NFC stickers for a whole lot more than just payments.</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: <UtensilsCrossed size={15} />, label: "Digital E-Menu" },
                    { icon: <Bell size={15} />, label: "Call Waiter Button" },
                    { icon: <Wifi size={15} />, label: "WiFi Auto-Connect" },
                    { icon: <Sparkles size={15} />, label: "Event Promotions" },
                    { icon: <Lightbulb size={15} />, label: "Your Ideas to Shine" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
                      <span className="text-blue-400">{icon}</span>{label}
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 text-sm">Pricing depends on what you need. Drop us an email and we'll figure it out together.</p>
              </div>
              <div className="shrink-0">
                <a href="mailto:tappaymy@outlook.com" className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 rounded-2xl font-bold transition-all">
                  <Mail size={20} /> Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Quick Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-medium border-collapse table-fixed min-w-[700px]">
            <colgroup>
              <col className="w-1/4" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left px-5 py-4 rounded-l-2xl text-slate-600 font-bold">Feature</th>
                <th className="text-center px-2 py-4 text-slate-600 font-bold leading-snug">Buffet User<br /><span className="font-black text-slate-900">RM 0</span></th>
                <th className="text-center px-2 py-4 text-slate-600 font-bold leading-snug">Lite Pack<br /><span className="font-black text-slate-900">RM 25</span></th>
                <th className="text-center px-2 py-4 text-slate-600 font-bold leading-snug">Starter Pack<br /><span className="font-black text-slate-900">RM 35</span></th>
                <th className="text-center px-2 py-4 rounded-r-2xl text-blue-700 font-bold leading-snug">Pro Pack<br /><span className="font-black text-blue-700">RM 75</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                ["NFC Stickers", "0x (BYO)", "2x", "5x", "8x"],
                ["Payment Inbox", "—", "✓", "✓", "✓"],
                ["Table Tracking & Sound Alerts", "—", "—", "—", "✓"],
                ["Call for Waiter & Bill Request", "—", "—", "—", "✓"],
                ["Listener App Add-on", "+RM14/mo", "+RM12/mo", "+RM10/mo", "+RM7/mo"],
                ["Included Plan", "—", "Plan 1", "Plan 1", "Plan 1, 2, 3"],
                ["Badge Acc", "Buffet", "Lite", "Starter", "Pro"],
                ["Monthly SaaS", "—", "RM 12/mo", "RM 12/mo", "RM 32/mo"],
              ].map(([feature, ...cols], i) => (
                <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-5 py-3.5 text-slate-700 font-semibold rounded-l-xl">{feature}</td>
                  {cols.map((val, j) => (
                    <td key={j} className={`px-2 py-3.5 text-center ${j === 3 ? "rounded-r-xl text-blue-700 font-bold" : val === "✓" ? "text-green-600 font-bold" : val === "—" ? "text-slate-300" : "text-slate-600"}`}>
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
      <section className="py-10 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to go cashless the smart way?</h2>
          <p className="text-slate-500 font-medium mb-8">Start with any kit and upgrade anytime.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:tappaymy@outlook.com" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-600/20">
              Contact Us for Payment <ArrowRight size={20} />
            </a>
            <a href="mailto:tappaymy@outlook.com" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all">
              <Mail size={20} /> Ask a Question
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 border-t border-slate-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-slate-500 text-center">
          <div className="flex items-center gap-2">
            <img src="/TapPay_Logo.png" alt="TapPay" className="w-6 h-6 object-contain" />
            <span className="text-slate-900 font-bold text-lg">TapPay</span>
          </div>
          <p className="text-sm">© 2026 TapPay Malaysia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
