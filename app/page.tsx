"use client";

import Link from "next/link";
import { useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import {
  Zap,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Bell,
  Wifi,
  Mail,
  Store,
  Clock,
  ShieldCheck,
  Smartphone,
  UserCheck,
  Nfc,
  Lock
} from "lucide-react";

function InteractiveSticker() {
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    if (!tapped) {
      setTapped(true);
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const playTone = (freq: number, startTime: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
          };
          playTone(880, ctx.currentTime);
          playTone(1046.50, ctx.currentTime + 0.1);
        }
      } catch (e) {}

      setTimeout(() => setTapped(false), 3000);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-blue-50/50 rounded-[3rem] border border-blue-100 shadow-inner w-full overflow-hidden h-full min-h-[340px]">
      <div className="text-center mb-8 z-30 transition-opacity duration-300">
        <h3 className="font-black text-slate-900 text-xl mb-1">Simulate a Tap</h3>
        <p className="text-slate-500 text-sm font-medium">Hover your mouse over the sticker</p>
      </div>
      
      {/* The Sticker */}
      <div 
        onMouseEnter={handleTap}
        className="relative w-36 h-36 bg-slate-900 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-105 z-30 ring-8 ring-blue-100"
      >
        <div className="w-28 h-28 rounded-full border-2 border-slate-700 flex flex-col items-center justify-center">
          <Zap className="text-blue-500 mb-1" size={28} />
          <span className="text-white font-black tracking-tight text-lg">TapPay</span>
        </div>
      </div>

      {/* The Fake Phone sliding in */}
      <div className={`absolute bottom-0 w-64 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20 ${tapped ? 'translate-y-4 opacity-100' : 'translate-y-64 opacity-0'}`}>
        <div className="w-full h-80 bg-white rounded-t-[2.5rem] border-[6px] border-b-0 border-slate-800 shadow-2xl flex flex-col items-center p-6">
          <div className="w-16 h-1.5 bg-slate-200 rounded-full mb-8" />
          <div className="w-16 h-16 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 size={32} />
          </div>
          <p className="font-black text-slate-900 text-3xl">RM 14.50</p>
          <p className="text-slate-500 text-sm mt-1 font-bold">Payment Successful</p>
          <div className="mt-6 w-full h-12 bg-slate-100 rounded-xl animate-pulse" />
          <div className="mt-3 w-3/4 h-8 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activePlanTab, setActivePlanTab] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-blue-200">
      
      <ParticleBackground />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/TapPay_Logo.png" alt="TapPay Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Tap<span className="text-blue-600">Pay</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-600">
          <Link href="/solutions" className="hover:text-blue-600 transition-colors">Our Value</Link>
          <a href="#how" className="hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2">
            Login
          </Link>
          <Link
            href="/demo"
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Try Free Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-8 pb-0 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text Content */}
          <div>
            {/* Tech Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-bold mb-6 shadow-sm">
              <Nfc size={16} className="text-blue-500" />
              Powered by Ultra-Fast NFC Technology ⚡
            </div>

            {/* Main Headline */}
            <h1 className="font-[family-name:var(--font-sora)] text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5 text-slate-900">
              Upgrade Your
              <span className="block text-blue-600">TNG QR to</span>
              <span className="block">NFC Tap-to-Pay.</span>
            </h1>

            <p className="text-lg text-slate-500 max-w-xl mb-8 leading-relaxed">
              One premium NFC sticker replaces your crumpled paper QR code. 
              Customers tap — <strong className="text-slate-700">Touch 'n Go opens instantly</strong>, no searching, no 5-second ads, no typing amounts.
            </p>

            {/* 3 Key Points */}
            <div className="grid grid-cols-1 gap-3 mb-8">
              <div className="flex items-center gap-3 text-slate-700 font-semibold">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Nfc size={16} /></div>
                NFC Sticker → TNG opens instantly on customer phone
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-semibold">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Smartphone size={16} /></div>
                Android Listener App announces every payment out loud
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-semibold">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><UserCheck size={16} /></div>
                <span>Requires a <strong>TNG Merchant Account</strong> for deeplink to work</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-1 transition-all"
              >
                Create Free Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 border border-blue-100 text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm"
              >
                Try Cashier Demo
              </Link>
            </div>

            {/* Merchant Account Notice */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <UserCheck size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                <strong>TNG Merchant Account required.</strong> The NFC deeplink only works if you have an official Touch 'n Go Merchant (Business) account so the app can pre-fill your payment details.
              </p>
            </div>
          </div>

          {/* Right: NFC Sticker Hero Image */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-400/10 blur-[80px] rounded-full" />
            <img
              src="/nfc_sticker_hero.png"
              alt="NFC Sticker being tapped at a Malaysian hawker stall"
              className="relative z-10 w-full max-w-lg rounded-[2rem] shadow-2xl shadow-blue-900/20 object-cover border-4 border-white/60"
            />
            {/* Floating badge */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-blue-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div className="font-black text-slate-900 text-lg leading-none">Payment Received</div>
                <div className="text-blue-600 font-bold text-sm mt-0.5">Touch 'n Go · RM 14.50</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Comparison & Simulation Grid */}
      <section id="how" className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Old Way */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm opacity-80 h-full">
            <div className="inline-flex items-center gap-2 text-slate-500 font-bold mb-6">
              <Clock size={20} /> The Old Way (Paper QR)
            </div>
            <ul className="space-y-4 text-slate-600 font-medium text-sm">
              <li className="flex gap-3"><span className="text-slate-400">1.</span> Customer unlocks phone</li>
              <li className="flex gap-3"><span className="text-slate-400">2.</span> Searches for the Touch 'n Go app</li>
              <li className="flex gap-3"><span className="text-slate-400">3.</span> Waits for a 5-second advertisement</li>
              <li className="flex gap-3"><span className="text-slate-400">4.</span> Scans a crumpled paper QR code</li>
              <li className="flex gap-3"><span className="text-slate-400">5.</span> Anxiously shows the screen to the boss while holding up the line</li>
            </ul>
          </div>

          {/* SIMULATION (Middle) */}
          <div className="flex justify-center h-full">
            <InteractiveSticker />
          </div>

          {/* New Way */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-xl shadow-blue-100 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold mb-6">
                <Zap size={20} /> The TapPay Way (NFC)
              </div>
              <ul className="space-y-6 text-slate-800 font-bold text-lg">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-1 rounded-full flex-shrink-0"><CheckCircle2 size={16} /></div>
                  Customer taps phone to your premium sticker
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-1 rounded-full flex-shrink-0"><CheckCircle2 size={16} /></div>
                  Payment screen opens instantly
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-1 rounded-full flex-shrink-0"><CheckCircle2 size={16} /></div>
                  Paid.
                </li>
              </ul>
              <p className="mt-8 text-blue-700 font-medium bg-blue-100/50 p-4 rounded-xl border border-blue-200/50 text-sm">
                Less anxiety for them, faster lines and more revenue for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 bg-white border-y border-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for Fast-Moving Stalls
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Store size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Premium Style</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Upgrade from a dirty paper QR code. Give your customers a modern, stylish payment method that elevates your stall's image.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <CreditCard size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Pay at the Table</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Customers can settle bills directly from their seats. They just click the button to pay—no need for the boss to walk over.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Complete Control</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Our real-time backend dashboard lets merchants control and monitor exactly how much customers need to pay. Just watch the payments roll in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Android Listener App */}
      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <div className="bg-blue-50 rounded-[3rem] p-8 md:p-16 border border-blue-100 shadow-xl shadow-blue-900/5 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-200/50 text-blue-700 text-sm font-bold mb-6">
              <Bell size={16} /> Exclusive App
            </div>
            <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
              Your Smart<br />Cashier Assistant.
            </h2>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed font-medium">
              We provide a dedicated Android Notification Listener app (compatible with Android phones and tablets). 
              Whenever a Touch 'n Go payment comes in, your device will flash a bright <strong className="text-blue-600">Blue Light</strong> and <strong className="text-blue-600">speak the exact amount out loud</strong>.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              Keep your hands busy cooking—you will hear exactly when you get paid, so you never miss a transaction.
            </p>

            {/* Disclaimer Accordion */}
            <details className="mt-8 group border border-slate-200 bg-white rounded-2xl shadow-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="font-bold text-slate-800 px-6 py-4 cursor-pointer hover:bg-slate-50 flex items-center justify-between transition-colors list-none">
                <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-blue-600" /> Important App Disclaimers</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 text-sm text-slate-600">
                <div>
                  <strong className="text-slate-900 block mb-1 text-[15px]">1. Auxiliary Tool Disclaimer</strong>
                  This product is intended solely as an auxiliary notification tool. Merchants must always verify final payments via their official banking or eWallet application. We are not liable for any losses caused by network delays, missed flashes, or device errors.
                </div>
                <div>
                  <strong className="text-slate-900 block mb-1 text-[15px]">2. Privacy Notice</strong>
                  The TapPay Listener App relies on standard Android notification listening permissions to detect payment alerts. It does <strong>not</strong> have access to your bank account, and it does <strong>not</strong> read passwords.
                </div>
                <div>
                  <strong className="text-slate-900 block mb-1 text-[15px]">3. App Distribution</strong>
                  Due to Google Play's strict policies regarding "Notification Listener" permissions, the app is provided as a direct APK download from our secure Web App dashboard for installation on your Android device.
                </div>
              </div>
            </details>
          </div>
          <div className="flex-1 w-full bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 rounded-3xl p-4 md:p-8 border border-blue-200 shadow-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
             {/* Decorative glow effect */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-400/15 blur-[80px] rounded-full z-0 pointer-events-none" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)] z-0 pointer-events-none" />
             
             <img src="/LED.result.png" alt="Android Listener App flashing blue" className="w-[65%] max-w-[260px] h-auto object-contain rounded-3xl shadow-2xl shadow-blue-900/20 border-[6px] border-white relative z-10 hover:scale-105 transition-transform duration-500" />
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 mt-8 text-center bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-blue-50 shadow-xl w-[85%] max-w-sm">
               <div className="text-2xl font-black text-slate-900">"Received RM 8.50"</div>
               <div className="text-blue-600 font-bold mt-1 text-sm flex items-center justify-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 Visual & Audio Alert
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Plans Tabbed Interface */}
      <section className="relative z-10 py-24 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold mb-6">
              <Store size={16} /> Scalable Solutions
            </div>
            <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-5xl font-bold mb-6">
              The TapPay Ecosystem
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              See exactly what you get. Choose the plan that fits your business scale.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            {/* Tabs Sidebar */}
            <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-1/3 overflow-x-auto pb-4 lg:pb-0 snap-x hide-scrollbar">
              <button 
                onClick={() => setActivePlanTab(1)}
                className={`snap-center flex-shrink-0 w-[280px] lg:w-full text-left p-6 rounded-3xl transition-all border ${activePlanTab === 1 ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Plan 1</div>
                <h3 className="text-xl font-bold text-white mb-2">Real-Time Inbox</h3>
                <p className="text-sm text-blue-100/70 leading-relaxed">The foundation. Know instantly when you get paid via phone or web dashboard.</p>
              </button>
              <button 
                onClick={() => setActivePlanTab(2)}
                className={`snap-center flex-shrink-0 w-[280px] lg:w-full text-left p-6 rounded-3xl transition-all border ${activePlanTab === 2 ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Plan 2</div>
                <h3 className="text-xl font-bold text-white mb-2">Table Management</h3>
                <p className="text-sm text-blue-100/70 leading-relaxed">Amount push-in. Cashier pushes the exact bill to the customer's phone.</p>
              </button>
              <button 
                onClick={() => setActivePlanTab(3)}
                className={`snap-center flex-shrink-0 w-[280px] lg:w-full text-left p-6 rounded-3xl transition-all border ${activePlanTab === 3 ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
              >
                <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Plan 3</div>
                <h3 className="text-xl font-bold text-white mb-2">Full Automation</h3>
                <p className="text-sm text-blue-100/70 leading-relaxed">Customers can call a waiter or ask for the bill directly from the menu.</p>
              </button>
            </div>

            {/* Content Area */}
            <div className="w-full lg:w-2/3 bg-slate-800 border border-slate-700 rounded-[2.5rem] p-6 md:p-12 min-h-[450px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              {activePlanTab === 1 && (
                <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-white rounded-[2rem] p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                      <div className="font-black text-slate-900 text-lg">Today's Sales</div>
                      <div className="text-blue-600 font-black text-lg">RM 1,240.00</div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0"><CheckCircle2 size={24} /></div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900 mb-0.5">Payment Received</div>
                          <div className="text-xs text-slate-500 font-medium">Just now • Touch 'n Go</div>
                        </div>
                        <div className="font-black text-green-700 text-lg">RM 14.50</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 opacity-50 grayscale transition-all">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 shrink-0"><CheckCircle2 size={24} /></div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900 mb-0.5">Payment Received</div>
                          <div className="text-xs text-slate-500 font-medium">5 mins ago • Touch 'n Go</div>
                        </div>
                        <div className="font-black text-slate-700 text-lg">RM 8.00</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlanTab === 2 && (
                <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-white rounded-[2rem] p-8 shadow-2xl text-center border-t-8 border-blue-600">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-full mb-6 ring-8 ring-blue-50/50">
                      <Smartphone size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3">Customer Scans Table 5</h3>
                    <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
                      The cashier pushes the exact bill amount to the customer's phone instantly. No manual typing.
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 shadow-inner">
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total to Pay</div>
                      <div className="text-5xl font-black text-blue-600 mb-6">RM 45.00</div>
                      <div className="w-full bg-slate-900/5 text-slate-400 font-bold py-4 rounded-xl border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2">
                        <Lock size={18} /> Pay with Touch 'n Go
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlanTab === 3 && (
                <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-white rounded-[2rem] p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                      <div className="font-black text-slate-900 text-xl">Table 4</div>
                      <div className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" /> Needs Bill
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center opacity-50 grayscale transition-all">
                        <Bell size={28} className="text-slate-400" />
                        <span className="font-bold text-slate-700">Call Waiter</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center shadow-lg shadow-blue-100/50">
                        <Zap size={28} className="text-blue-600" />
                        <span className="font-bold text-blue-700">Bill Please</span>
                      </div>
                    </div>
                    
                    <div className="mt-8 bg-slate-900 rounded-2xl p-5 text-white flex items-center justify-between shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500/20 p-2 rounded-full">
                          <Bell size={18} className="text-red-400" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">Cashier Alert</div>
                          <div className="text-xs text-slate-400">Table 4 requested bill</div>
                        </div>
                      </div>
                      <span className="bg-red-500 w-3 h-3 rounded-full animate-ping" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Customization */}
      <section id="custom" className="relative z-10 py-24 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Wifi size={32} />
          </div>
          <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            Make Your Sticker Work For You
          </h2>
          <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            NFC can do more than just payments. Want to instantly open your virtual menu? Auto-connect customers to your Wi-Fi? Call a waiter? Or promote an upcoming event? We can program it.
          </p>

          {/* NFC Photos Showcase */}
          <div className="grid md:grid-cols-2 gap-6 mb-3 max-w-3xl mx-auto">
            <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-md bg-slate-50 flex items-center justify-center p-2">
              <img src="/demo_NFC1.jpg" alt="Physical NFC Sticker Design" className="w-full h-auto max-h-64 object-contain rounded-2xl hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-md bg-slate-50 flex items-center justify-center p-2">
              <img src="/demo_NFC2.jpg" alt="Physical NFC Sticker Setup" className="w-full h-auto max-h-64 object-contain rounded-2xl hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 font-medium italic mb-12">
            * Product images are for illustration purposes only. Actual products may vary slightly.
          </p>
          
          <a href="mailto:tappaymy@hotmail.com" className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/30">
            <Mail size={20} />
            Email Us: tappaymy@hotmail.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 text-slate-500 font-medium text-center">
          <div className="flex items-center gap-2">
            <img src="/TapPay_Logo.png" alt="TapPay Logo" className="w-6 h-6 object-contain" />
            <span className="text-slate-900 font-bold tracking-tight text-lg">TapPay</span>
          </div>
          <p className="text-sm">
            © 2026 TapPay Malaysia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
