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
  ShieldCheck
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
    <div className="relative flex flex-col items-center justify-center p-8 bg-blue-50/50 rounded-[3rem] border border-blue-100 my-16 shadow-inner w-full max-w-md mx-auto overflow-hidden h-[340px]">
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
          <p className="font-black text-slate-900 text-3xl">RM 8.50</p>
          <p className="text-slate-500 text-sm mt-1 font-bold">Payment Successful</p>
          <div className="mt-6 w-full h-12 bg-slate-100 rounded-xl animate-pulse" />
          <div className="mt-3 w-3/4 h-8 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
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
          <a href="#how" className="hover:text-blue-600 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#custom" className="hover:text-blue-600 transition-colors">Customization</a>
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
      <section className="relative z-10 flex flex-col items-center text-center pt-24 pb-20 px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Now live for Malaysian Merchants 🇲🇾
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6 text-slate-900">
          Skip the QR Code.<br/>
          <span className="text-blue-600">Tap and Get Paid.</span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-medium">
          The premium Touch 'n Go payment experience for fast-moving stalls. 
          No more waiting, no more ads—just tap, pay, and keep the line moving.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
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

        <InteractiveSticker />
      </section>

      {/* The Problem vs Solution */}
      <section id="how" className="relative z-10 py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Old Way */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm opacity-80">
            <div className="inline-flex items-center gap-2 text-slate-500 font-bold mb-6">
              <Clock size={20} /> The Old Way (Paper QR)
            </div>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex gap-3"><span className="text-slate-400">1.</span> Customer unlocks phone</li>
              <li className="flex gap-3"><span className="text-slate-400">2.</span> Searches for the Touch 'n Go app</li>
              <li className="flex gap-3"><span className="text-slate-400">3.</span> Waits for a 5-second advertisement</li>
              <li className="flex gap-3"><span className="text-slate-400">4.</span> Scans a crumpled paper QR code</li>
              <li className="flex gap-3"><span className="text-slate-400">5.</span> Types the amount manually</li>
              <li className="flex gap-3"><span className="text-slate-400">6.</span> Anxiously shows the screen to the boss while holding up the line</li>
            </ul>
          </div>

          {/* New Way */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold mb-6">
                <Zap size={20} /> The TapPay Way (NFC)
              </div>
              <ul className="space-y-6 text-slate-800 font-bold text-lg">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-1 rounded-full"><CheckCircle2 size={16} /></div>
                  Customer taps phone to your premium sticker
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-1 rounded-full"><CheckCircle2 size={16} /></div>
                  Payment screen opens instantly
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-1 rounded-full"><CheckCircle2 size={16} /></div>
                  Paid.
                </li>
              </ul>
              <p className="mt-8 text-blue-700 font-medium bg-blue-100/50 p-4 rounded-xl border border-blue-200/50">
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
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
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
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 leading-tight">
              Your Smart<br />Cashier Assistant.
            </h2>
            <p className="text-slate-600 text-lg mb-6 leading-relaxed font-medium">
              We provide a dedicated Android Notification Listener app (compatible with Android phones and tablets). 
              Whenever a Touch 'n Go payment comes in, your device will flash a bright <strong className="text-blue-600">Blue Light</strong> and <strong className="text-blue-600">speak the exact amount out loud</strong>.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              Keep your hands busy cooking—you will hear exactly when you get paid, so you never miss a transaction.
            </p>
          </div>
          <div className="flex-1 w-full bg-slate-50 rounded-3xl p-4 md:p-8 border border-blue-100 shadow-lg relative flex flex-col items-center justify-center min-h-[300px]">
             <img src="/LED.result.png" alt="Android Listener App flashing blue" className="w-full h-auto max-h-[400px] object-contain rounded-2xl shadow-sm border border-slate-200" />
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

      {/* Customization */}
      <section id="custom" className="relative z-10 py-24 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Wifi size={32} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
            Make Your Sticker Work For You
          </h2>
          <p className="text-lg text-slate-600 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            NFC can do more than just payments. Want to instantly open your virtual menu? Auto-connect customers to your Wi-Fi? Call a waiter? Or promote an upcoming event? We can program it.
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
