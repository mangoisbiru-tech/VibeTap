"use client";
import Link from "next/link";
import { Zap, CheckCircle2, Star, Package, Smartphone, Tag, Mail, ArrowRight, Sparkles, Wifi, UtensilsCrossed, Bell, Lightbulb, ShieldCheck, X, Store, ArrowLeft } from "lucide-react";

import { useState } from "react";

const Check = ({ c = "text-blue-500" }: { c?: string }) => <CheckCircle2 size={16} className={`${c} mt-0.5 shrink-0`} />;

const KITS = [
  { id: "buffet", name: "Buffet Pack", price: 0, sub: "BYO Setup" },
  { id: "starter", name: "Starter Pack", price: 30, sub: "Solo Stall" },
  { id: "pro", name: "Pro Pack", price: 75, sub: "Cafe & Restaurant" },
];

const PLANS = [
  { id: "starter", name: "Starter", price: 12 },
  { id: "pro", name: "Pro", price: 35 },
];

const ADDONS = [
  { id: "app-listener", name: "Listener App", price: 10 },
  { id: "nfc", name: "Extra NFC Sticker", price: 5 },
];

const WHATSAPP_NUMBER = "601112345678";

const buffetFeatures = ["0x Physical NFC Stickers (BYO)", "Buffet Account Badge", "Access to Starter or Pro Plan features"];
const starterFeatures = ["3x Physical NFC Stickers (Standard)", "Plan 1: Real-time Payment Inbox", "Starter Account Badge"];
const proFeatures = ["8x Physical NFC Stickers (Standard)", "Plan 1: Real-time Payment Inbox", "Plan 2: Table Tracking & Instant Sound Alerts", "Plan 3: Call for Waiter & Bill Request", "Listener App (Included Free)", "Pro Account Badge"];

const starterMonthly = ["Plan 1: Real-time Payment Inbox", "Payment History Log", "Merchant Dashboard Access"];
const proMonthly = ["Everything in Starter", "Table Management & Amount Push In", "Call for Staff & Call for Bill", "Listener App Included (No extra charge)", "Priority Support"];

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

function PlanVisualizer({ plan }: { plan: 'starter' | 'pro' }) {
  if (plan === 'starter') {
    return (
      <div className="w-full h-32 bg-slate-100 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
        <div className="w-20 h-28 bg-white rounded-t-xl border-2 border-slate-200 p-2 shadow-sm translate-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-1 bg-slate-100 rounded-full" />
            <div className="w-3 h-3 rounded-full bg-blue-100" />
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-full h-4 rounded-md bg-slate-50 border border-slate-100 flex items-center px-1.5 gap-1 animate-in slide-in-from-bottom duration-500 fill-mode-both`} style={{ animationDelay: `${i * 200}ms` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <div className="w-10 h-0.5 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-blue-100 shadow-sm">
          <div className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
          <span className="text-[8px] font-black text-slate-600 uppercase">Live Inbox</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-32 bg-blue-600 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border border-blue-400/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent animate-pulse" />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl animate-bounce">
          <Bell className="text-blue-600" size={24} />
        </div>
        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
          <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Staff Alert!</span>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
        <Store size={10} className="text-white" />
        <span className="text-[8px] font-black text-white uppercase">Table Tracking</span>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', email: '', phone: '' });
  const [nfcQuantity, setNfcQuantity] = useState(0);

  // Deployment trigger: ToyyibPay production keys verified
  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!checkoutData.email || !checkoutData.name) {
      setShowCheckoutModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/toyyibpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oneTimeTotal,
          monthlyTotal,
          selectedKit,
          selectedPlan,
          selectedAddons,
          nfcQuantity,
          ...checkoutData
        })
      });

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'Payment failed to initialize. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    } else if (id === 'starter') {
      setSelectedPlan('starter');
    } else if (id === 'buffet') {
      setSelectedPlan(null);
    }
    setSelectedAddons([]);
  };

  const isOptionDisabled = (type: 'plan' | 'addon', id: string) => {
    if (!selectedKit) return false;
    
    // Starter and Pro are all-in-one. Disable all other plan selections.
    if (selectedKit === 'starter' || selectedKit === 'pro') {
      if (type === 'plan') return true;
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

  const oneTimeTotal = (currentKit?.price || 0) + (nfcQuantity * 5);
  const isPromoActive = selectedKit && selectedKit !== 'buffet';
  const monthlyTotal = isPromoActive 
    ? 0 
    : (currentPlan?.price || 0) + activeAddons.filter(a => a.id !== 'nfc').reduce((sum, a) => sum + a.price, 0);
  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-900 font-sans overflow-x-hidden relative">
      
      {/* Decorative Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/5 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-400/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <nav className="sticky top-0 z-50 bg-[#F8FAFF]/80 backdrop-blur-xl border-b border-slate-200/50">
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



      {/* STARTER KITS */}
      <section id="packs" className="py-16 px-6 max-w-[90rem] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Starter Kits</h2>
          <p className="text-slate-500 font-medium">Badge acc + Monthly SAAS bundle</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">

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
              <div className="flex items-end gap-2"><span className="text-5xl font-black">RM 30</span><span className="text-slate-400 mb-2">one-time</span></div>
              <PromoBox msg="🎉 Starter Bundle" sub="Includes 3x stickers. Then RM 12/month for Starter SaaS." />
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
              <PromoBox dark msg="🎉 Pro Bundle" sub="Includes 8x stickers. Then RM 35/month (Listener App Included)." />
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

      {/* MONTHLY SAAS & ADD-ONS */}
      <section id="saas-addons" className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-[90rem] mx-auto">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 max-w-6xl mx-auto">
            
            {/* MONTHLY SAAS */}
            <div>
              <div className="text-left mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Monthly SaaS Plans</h2>
                <p className="text-slate-500 font-medium">Already have accounts verified and stickers?</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div 
                  onClick={() => !isOptionDisabled('plan', 'starter') && setSelectedPlan(selectedPlan === 'starter' ? null : 'starter')}
                  className={`rounded-3xl border-4 transition-all p-6 flex flex-col ${isOptionDisabled('plan', 'starter') ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent' : 'cursor-pointer'} ${selectedPlan === 'starter' ? 'bg-blue-50/50 border-blue-500 shadow-xl' : 'bg-slate-50 border-slate-200 hover:border-blue-200'}`}
                >
                  <PlanVisualizer plan="starter" />
                  <p className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1 bg-slate-200/50 inline-block px-2 py-0.5 rounded w-fit">Plan 1</p>
                  <h3 className="text-xl font-black mb-1">Starter</h3>
                  <p className="text-slate-500 text-xs mb-4">Solo stall owner</p>
                  <div className="flex items-end gap-1 mb-6"><span className="text-3xl font-black">RM 12</span><span className="text-slate-400 text-xs mb-1">/month</span></div>
                  <ul className="space-y-3 flex-1 mb-6">
                    {starterMonthly.map(f => <li key={f} className="flex items-start gap-2 text-slate-700 font-medium text-xs"><Check />{f}</li>)}
                  </ul>
                  <button className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${selectedPlan === 'starter' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'}`}>
                    {selectedPlan === 'starter' ? 'Selected' : 'Select'}
                  </button>
                </div>

                <div 
                  onClick={() => !isOptionDisabled('plan', 'pro') && setSelectedPlan(selectedPlan === 'pro' ? null : 'pro')}
                  className={`rounded-3xl border-4 transition-all p-6 flex flex-col ${isOptionDisabled('plan', 'pro') ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent' : 'cursor-pointer'} ${selectedPlan === 'pro' ? 'bg-blue-50/50 border-blue-500 shadow-xl' : 'bg-blue-50 border-blue-200 hover:border-blue-300'}`}
                >
                  <PlanVisualizer plan="pro" />
                  <p className="text-sm font-black text-blue-700 uppercase tracking-wider mb-1 bg-blue-100 inline-block px-2 py-0.5 rounded w-fit">Plan 1, 2 & 3</p>
                  <h3 className="text-xl font-black mb-1">Pro</h3>
                  <p className="text-slate-500 text-xs mb-4">Cafes & restaurants</p>
                  <div className="flex items-end gap-1 mb-6"><span className="text-3xl font-black text-blue-700">RM 35</span><span className="text-slate-400 text-xs mb-1">/month</span></div>
                  <ul className="space-y-3 flex-1 mb-6">
                    {proMonthly.map(f => <li key={f} className="flex items-start gap-2 text-slate-700 font-medium text-xs"><Check c="text-blue-600" />{f}</li>)}
                  </ul>
                  <button className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${selectedPlan === 'pro' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {selectedPlan === 'pro' ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            </div>

            {/* ADD-ONS */}
            <div>
              <div className="text-left mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Add-ons</h2>
                <p className="text-slate-500 font-medium">Power up your plan.</p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { id: "app-listener", icon: <Smartphone size={18} />, label: "Listener App", sub: "", price: "RM 10", unit: "/mo", desc: "Auto-sync TNG payments. Android only.", bg: "bg-white border-slate-200", iconBg: "bg-blue-100 text-blue-600", priceCls: "text-slate-900" },
                  { id: "nfc", icon: <Tag size={18} />, label: "NFC Sticker", sub: "Standard", price: "RM 5", unit: "/pc", desc: "Extra stickers.", bg: "bg-white border-slate-200", iconBg: "bg-slate-100 text-slate-600", priceCls: "text-slate-900" },
                ].map(({ id, icon, label, sub, price, unit, desc, bg, iconBg, priceCls }) => {
                  
                  if (id === 'nfc') {
                    return (
                      <div key={id} className={`rounded-2xl border-4 transition-all p-4 flex gap-4 items-center ${nfcQuantity > 0 ? 'bg-blue-50/50 border-blue-500 shadow-md' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                        <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${iconBg}`}>{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                          <div className="flex items-end gap-1 mb-1">
                            <span className={`text-lg font-black leading-none ${priceCls}`}>{price}</span>
                            <span className="text-slate-400 text-[10px] leading-none mb-0.5">{unit}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{desc}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); setNfcQuantity(Math.max(0, nfcQuantity - 1)); }} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 font-bold text-xs">-</button>
                          <span className="text-xs font-bold w-3 text-center">{nfcQuantity}</span>
                          <button onClick={(e) => { e.stopPropagation(); setNfcQuantity(Math.min(5, nfcQuantity + 1)); }} className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 font-bold text-xs">+</button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={id} 
                      onClick={() => toggleAddon(id)}
                      className={`rounded-2xl border-4 transition-all p-4 flex gap-4 items-center ${isOptionDisabled('addon', id) ? 'opacity-40 cursor-not-allowed bg-slate-100 border-transparent' : 'cursor-pointer'} ${selectedAddons.includes(id) ? 'bg-blue-50/50 border-blue-500 shadow-md' : `${bg} border-transparent hover:border-blue-200`}`}
                    >
                      <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${iconBg}`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label} {sub && <span className="lowercase normal-case font-bold text-slate-600">({sub})</span>}</p>
                        <div className="flex items-end gap-1 mb-1">
                          <span className={`text-lg font-black leading-none ${priceCls}`}>{price}</span>
                          <span className="text-slate-400 text-[10px] leading-none mb-0.5">{unit}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{desc}</p>
                      </div>
                      <div className="shrink-0">
                        <div className={`text-[9px] font-bold px-2 py-1.5 rounded self-center ${selectedAddons.includes(id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {isOptionDisabled('addon', id) && selectedAddons.includes(id) ? 'INCLUDED' : (selectedAddons.includes(id) ? 'SELECTED' : 'ADD')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SELECTION SUMMARY */}
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
                  {(activeAddons.length > 0 || nfcQuantity > 0) && (
                    <>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm font-bold text-slate-900">{activeAddons.length + (nfcQuantity > 0 ? 1 : 0)} Add-ons</span>
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

            <button 
              onClick={() => setShowCheckoutModal(true)}
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>Loading...</>
              ) : (
                <>Secure Checkout <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </div>

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black">Your Details</h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-slate-600">
                <ArrowLeft size={24} />
              </button>
            </div>
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={checkoutData.name}
                  onChange={e => setCheckoutData({...checkoutData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Business or Personal Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={checkoutData.email}
                  onChange={e => setCheckoutData({...checkoutData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="name@company.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  value={checkoutData.phone}
                  onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="0123456789"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                You will be redirected to ToyyibPay
              </p>
            </form>
          </div>
        </div>
      )}

      {/* EXTRA SERVICES */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-[90rem] mx-auto">
          <div className="bg-[#0B1120] rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            {/* Starry Night Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjgpIi8+PGNpcmNsZSBjeD0iMzAiIGN5PSI0MCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuNSkiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjIwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC42KSIvPjxjaXJjbGUgY3g9IjcwIiBjeT0iNjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC43KSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iNzAiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjQpIi8+PC9zdmc+')] opacity-70 pointer-events-none" />
            
            {/* Subtle Gradient Overlay to give depth without neon lights */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16 justify-between">
              <div className="flex-1 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest mb-6 border border-white/5">
                  <Sparkles size={14} className="text-yellow-100" /> Custom Service
                </div>
                <h2 className="text-3xl md:text-5xl font-serif italic font-black mb-4 tracking-tight text-white">Alternative NFC<br />Extra Services</h2>
                <p className="text-slate-300 mb-8 leading-relaxed text-lg font-medium">Want something more? We can set up your NFC stickers for a whole lot more than just payments.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 mb-8">
                  {[
                    { icon: <UtensilsCrossed size={18} />, label: "Digital E-Menu" },
                    { icon: <Bell size={18} />, label: "Call Waiter Button" },
                    { icon: <Wifi size={18} />, label: "WiFi Auto-Connect" },
                    { icon: <Sparkles size={18} />, label: "Event Promotions" },
                    { icon: <Lightbulb size={18} />, label: "Your Ideas to Shine" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-3 text-slate-200 text-base font-bold font-serif">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                        {icon}
                      </div>
                      {label}
                    </div>
                  ))}
                </div>
                <p className="text-slate-400 text-sm font-medium">Pricing depends on what you need. Drop us an email and we'll figure it out together.</p>
              </div>
              <div className="shrink-0 w-full lg:w-auto">
                <a href="mailto:tappaymy@outlook.com" className="flex items-center justify-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black transition-all hover:-translate-y-1 duration-300 text-xl w-full lg:w-auto">
                  <Mail size={24} /> Let's Talk
                </a>
              </div>
            </div>
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
