"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import {
  Zap,
  BarChart3,
  RefreshCw,
  Shield,
  Smartphone,
  CreditCard,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";



function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <>{count.toLocaleString()}</>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-emerald-200">
      
      <ParticleBackground />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Vibe<span className="text-emerald-600">Tap</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#how" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
            Login
          </Link>
          <Link
            href="/demo"
            className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
          >
            Try Free Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center pt-24 pb-32 px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Now live for Malaysian Merchants 🇲🇾
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6 text-slate-900">
          Tap. Pay. <span className="text-emerald-600">Done.</span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-medium">
          One NFC sticker. Any payment method. Smarter than a QR code.
          <br className="hidden md:block" />
          Switch between TNG, GrabPay & DuitNow effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
          <Link
            href="/demo"
            className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-1 transition-all"
          >
            Try Cashier Demo
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm"
          >
            Merchant Login
          </Link>
        </div>

        {/* Payment badges */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Works seamlessly with</span>
          <div className="mt-2 w-full max-w-2xl px-4">
            <img 
              src="/payment-badges.png.png" 
              alt="Supported Payment Methods: Touch n Go, DuitNow, GrabPay" 
              className="w-full h-auto object-contain drop-shadow-xl hover:-translate-y-1 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {[
            { value: 2847, label: "Active Merchants", suffix: "+" },
            { value: 184920, label: "Taps This Month", suffix: "+" },
            { value: 99, label: "Uptime Guarantee", suffix: ".9%" },
          ].map((stat) => (
            <div key={stat.label} className="py-4 md:py-0">
              <div className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
                <AnimatedCounter end={stat.value} />
                <span className="text-emerald-500">{stat.suffix}</span>
              </div>
              <div className="text-slate-500 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto font-medium">
            3 seconds from tap to payment. No app download needed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: <Smartphone size={28} />,
              title: "Customer Taps",
              desc: "They tap their phone on your VibeTap sticker. Their browser opens automatically.",
            },
            {
              step: "02",
              icon: <Zap size={28} />,
              title: "Smart Redirect",
              desc: "VibeTap looks up your current payment setting and redirects instantly — 302ms average.",
            },
            {
              step: "03",
              icon: <CreditCard size={28} />,
              title: "Payment Complete",
              desc: "Customer pays via TNG or DuitNow. You see the tap counted in your dashboard.",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className="relative p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform"
            >
              <div className="absolute top-6 right-8 text-5xl font-black text-slate-100">
                {item.step}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EFTPOS highlight (Dark contrasting section) */}
      <section className="relative z-10 py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold mb-6">
              <Zap size={14} className="fill-emerald-400" /> Killer Feature
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
              EFTPOS Mode<br />
              <span className="text-slate-400">Set Amount Before Tap.</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed font-medium">
              Pasar malam boss enters <strong className="text-white bg-slate-800 px-2 py-0.5 rounded">RM8.50</strong> on their phone.
              Customer taps the sticker. TNG opens with the amount pre-filled.
              The customer just needs to hit <strong className="text-emerald-400">PAY</strong>.
            </p>
            <div className="flex flex-col gap-4">
              {[
                "5-minute secure session timer",
                "One-use per session prevents double charges",
                "Works with any custom amount",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  {feat}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <span className="text-slate-400 font-bold">Active Table</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase">Awaiting Tap</span>
              </div>
              <div className="text-center mb-8">
                <p className="text-slate-400 mb-2">Total Amount</p>
                <div className="text-6xl font-black text-white flex justify-center items-start gap-2">
                  <span className="text-2xl text-emerald-400 mt-2">RM</span> 8.50
                </div>
              </div>
              <button className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <Smartphone size={20} /> Customer is tapping...
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Built for Commerce
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto font-medium">
            Everything you need to collect payments efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <RefreshCw size={24} />,
              title: "Dynamic Links",
              desc: "Change your destination URL instantly from your dashboard. No need to replace physical stickers.",
            },
            {
              icon: <BarChart3 size={24} />,
              title: "Live Analytics",
              desc: "Track daily taps and monitor your busiest business hours in real-time.",
            },
            {
              icon: <Shield size={24} />,
              title: "Secure Hardware",
              desc: "Lock your NFC tags permanently so they can never be overwritten by bad actors.",
            },
            {
              icon: <CreditCard size={24} />,
              title: "Universal Support",
              desc: "Compatible with Touch 'n Go, GrabPay, DuitNow, Boost, and standard URL redirects.",
            },
            {
              icon: <Smartphone size={24} />,
              title: "No App Install",
              desc: "Works natively on all modern iOS and Android devices equipped with NFC.",
            },
            {
              icon: <Zap size={24} />,
              title: "Instant Loading",
              desc: "Optimized infrastructure ensures your payment links open in milliseconds.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-slate-700">
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to go cashless?
            </h2>
            <p className="text-slate-300 text-xl mb-10 max-w-xl mx-auto font-medium">
              Join thousands of Malaysian merchants collecting digital payments with a single tap.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                Launch Free Demo
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Zap size={14} className="text-emerald-400" />
            </div>
            <span className="text-slate-900 font-bold tracking-tight">VibeTap</span>
            <span className="ml-2">© 2025 · Made in Malaysia 🇲🇾</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
