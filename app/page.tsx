"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

const PAYMENT_ICONS = [
  { name: "Touch 'n Go", bg: "#00ADEF", text: "TNG", logo: "TNG" },
  { name: "GrabPay", bg: "#00B14F", text: "Grab", logo: "Grab" },
  { name: "DuitNow", bg: "#E63946", text: "DuitNow", logo: "DuitNow" },
  { name: "Boost", bg: "#FF6B35", text: "Boost", logo: "Boost" },
];

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
    <div className="min-h-screen text-black font-sans overflow-x-hidden relative">
      
      {/* Neo-brutalist cosmic sky background inspired by the image */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-gradient-to-b from-[#ffb6a3] via-[#a3d5ff] to-[#4b8bf4]">
        {/* CSS Noise Texture */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Simple CSS Stars */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px)', backgroundSize: '100px 100px', backgroundPosition: '0 0', opacity: 0.3 }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px)', backgroundSize: '60px 60px', backgroundPosition: '20px 20px', opacity: 0.2 }} />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 border-4 border-black bg-white px-3 py-1 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          <Zap size={20} className="text-black fill-yellow-400" />
          <span className="text-xl font-black tracking-tight uppercase">
            Vibe<span className="text-blue-600">Tap</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-black font-bold uppercase tracking-wider border-4 border-black bg-white px-6 py-2 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
          <a href="#features" className="hover:text-red-500 transition-colors">Features</a>
          <a href="#how" className="hover:text-red-500 transition-colors">How It Works</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-black font-bold hover:underline uppercase tracking-wide">
            Login
          </Link>
          <Link
            href="/demo"
            className="border-4 border-black bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-sm font-black uppercase tracking-wider transition-transform active:translate-y-1 active:translate-x-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            Try Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center pt-24 pb-32 px-6 max-w-5xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 border-4 border-black bg-white text-black font-bold uppercase mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
          <span className="w-3 h-3 border-2 border-black rounded-full bg-red-500 animate-pulse" />
          Now live in Malaysia 🇲🇾
        </div>

        <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-8 uppercase text-white" style={{ textShadow: '4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000' }}>
          Tap.<br/>
          <span className="text-yellow-400 inline-block rotate-2">Pay.</span><br/>
          Done.
        </h1>

        <div className="border-4 border-black bg-white p-6 rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl mb-12 rotate-1">
          <p className="text-xl md:text-2xl font-bold text-black leading-relaxed">
            One NFC sticker. Any payment method. Smarter than a QR code.
          </p>
          <p className="font-semibold text-gray-700 mt-2">
            Switch between TNG, GrabPay & DuitNow without changing your sticker.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-16">
          <Link
            href="/demo"
            className="group flex items-center justify-center gap-3 border-4 border-black bg-blue-500 text-white px-8 py-4 rounded-sm font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all uppercase"
          >
            Try Cashier Demo
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {/* Payment badges */}
        <div className="border-4 border-black bg-white p-4 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 inline-flex flex-col items-center gap-3">
          <span className="font-black uppercase tracking-widest text-sm">Accepts</span>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {PAYMENT_ICONS.map((p) => (
              <div
                key={p.name}
                className="px-4 py-2 border-4 border-black text-white font-black uppercase tracking-wider text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                style={{ backgroundColor: p.bg }}
              >
                {p.logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 bg-white border-y-8 border-black">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 text-center">
          {[
            { value: 2847, label: "Merchants", suffix: "+", color: "text-blue-600" },
            { value: 184920, label: "Monthly Taps", suffix: "+", color: "text-red-500" },
            { value: 99, label: "Uptime", suffix: ".9%", color: "text-yellow-500" },
          ].map((stat, i) => (
            <div key={stat.label} className={`border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${i%2===0 ? 'rotate-2' : '-rotate-1'} bg-white`}>
              <div className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`} style={{ textShadow: '2px 2px 0 #000' }}>
                <AnimatedCounter end={stat.value} />
                {stat.suffix}
              </div>
              <div className="font-bold uppercase text-black">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 border-4 border-black bg-white inline-block p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2">
          <h2 className="text-4xl md:text-5xl font-black uppercase">
            How It <span className="text-blue-600">Works</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: <Smartphone size={32} />,
              title: "Customer Taps NFC",
              desc: "They tap their phone on your VibeTap sticker. Their browser opens automatically.",
              bg: "bg-yellow-400",
              rotate: "-rotate-2"
            },
            {
              step: "02",
              icon: <Zap size={32} />,
              title: "Smart Redirect",
              desc: "VibeTap looks up your current payment setting and redirects instantly — 302ms average.",
              bg: "bg-cyan-400",
              rotate: "rotate-2"
            },
            {
              step: "03",
              icon: <CreditCard size={32} />,
              title: "Payment Complete",
              desc: "Customer pays via TNG, GrabPay, or DuitNow. You see the tap counted in your dashboard.",
              bg: "bg-red-400",
              rotate: "-rotate-1"
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`relative p-8 border-4 border-black ${item.bg} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${item.rotate} hover:rotate-0 transition-transform`}
            >
              <div className="absolute -top-6 -right-6 text-6xl font-black text-black/20" style={{ WebkitTextStroke: '2px black' }}>
                {item.step}
              </div>
              <div className="w-16 h-16 border-4 border-black bg-white rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase border-b-4 border-black pb-2">{item.title}</h3>
              <p className="font-bold text-black leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EFTPOS highlight */}
      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto">
        <div className="border-8 border-black bg-white p-10 md:p-16 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rotate-1">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 border-4 border-black bg-yellow-400 font-black uppercase mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
              ⚡ Killer Feature
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase leading-tight">
              EFTPOS Mode<br/><span className="text-blue-600">Set Amount Before Tap</span>
            </h2>
            <p className="font-bold text-xl mb-8 leading-relaxed bg-black text-white p-4">
              Pasar malam boss enters RM8.50 on their phone.
              Customer taps the sticker. TNG opens with the amount pre-filled.
              The customer just needs to hit PAY.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {[
                "5-min session timer",
                "One-use per session",
                "Any amount works",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 font-bold uppercase border-2 border-black px-3 py-2 bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <CheckCircle2 size={20} className="text-green-500 shrink-0 fill-black" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="inline-block border-8 border-black bg-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase">
            Ready to go<br/>
            <span className="text-red-500">cashless?</span>
          </h2>
          <p className="font-bold text-xl mb-10 max-w-xl mx-auto">
            Join thousands of Malaysian merchants collecting digital payments with a single tap.
          </p>
          <Link
            href="/demo"
            className="group inline-flex items-center gap-3 border-4 border-black bg-yellow-400 text-black px-10 py-5 font-black text-2xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
          >
            Launch Live Demo
            <ArrowRight size={28} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-8 border-black bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-bold uppercase">
          <div className="flex items-center gap-3 border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
            <Zap size={16} className="text-black fill-yellow-400" />
            <span>VibeTap © 2025 · Made in Malaysia 🇲🇾</span>
          </div>
          <div className="flex gap-6 border-4 border-black px-6 py-2 bg-blue-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
