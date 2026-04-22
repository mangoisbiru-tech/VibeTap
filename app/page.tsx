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
  { name: "Touch 'n Go", color: "#00ADEF", abbr: "TNG" },
  { name: "GrabPay", color: "#00B14F", abbr: "Grab" },
  { name: "DuitNow", color: "#E63946", abbr: "DuitNow" },
  { name: "Boost", color: "#FF6B35", abbr: "Boost" },
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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #6C47FF 0%, transparent 70%)",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
        <div
          className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #00D4FF 0%, transparent 70%)",
            transform: `translateY(${scrollY * -0.08}px)`,
          }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C47FF] to-[#00D4FF] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Vibe<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] to-[#00D4FF]">Tap</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-gradient-to-r from-[#6C47FF] to-[#7C5CFF] hover:from-[#7C5CFF] hover:to-[#8C6CFF] text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center pt-24 pb-32 px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Now live in Malaysia 🇲🇾
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
          <span className="text-white">Tap.</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] via-[#A78BFA] to-[#00D4FF]">
            Pay.
          </span>{" "}
          <span className="text-white">Done.</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          One NFC sticker. Any payment method. Smarter than a QR code.
          <br />
          Switch between TNG, GrabPay & DuitNow — without changing your sticker.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/signup"
            className="group flex items-center gap-2 bg-gradient-to-r from-[#6C47FF] to-[#00D4FF] text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all"
          >
            Get Your NFC Sticker
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm transition-all"
          >
            Merchant Login
          </Link>
        </div>

        {/* Payment badges */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-gray-500 text-sm">Works with</span>
          {PAYMENT_ICONS.map((p) => (
            <div
              key={p.name}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium backdrop-blur-sm hover:border-white/20 transition-colors"
              style={{ color: p.color }}
            >
              {p.abbr}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 px-6 text-center">
          {[
            { value: 2847, label: "Merchants Active", suffix: "+" },
            { value: 184920, label: "Taps This Month", suffix: "+" },
            { value: 99, label: "Uptime", suffix: ".9%" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] to-[#00D4FF] mb-2">
                <AnimatedCounter end={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] to-[#00D4FF]">
              Works
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            3 seconds from tap to payment. No app download needed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: <Smartphone size={28} />,
              title: "Customer Taps NFC",
              desc: "They tap their phone on your VibeTap sticker. Their browser opens automatically.",
              color: "#6C47FF",
            },
            {
              step: "02",
              icon: <Zap size={28} />,
              title: "Smart Redirect",
              desc: "VibeTap looks up your current payment setting and redirects instantly — 302ms average.",
              color: "#00D4FF",
            },
            {
              step: "03",
              icon: <CreditCard size={28} />,
              title: "Payment Complete",
              desc: "Customer pays via TNG, GrabPay, or DuitNow. You see the tap counted in your dashboard.",
              color: "#A78BFA",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all backdrop-blur-sm"
            >
              <div
                className="absolute top-4 right-6 text-6xl font-black opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ color: item.color }}
              >
                {item.step}
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${item.color}20`, color: item.color }}
              >
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] to-[#00D4FF]">
              Malaysian Merchants
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: <RefreshCw size={22} />,
              title: "Change Payment Method Anytime",
              desc: "Sticker is locked forever. But your destination URL? Change it in 10 seconds from your phone.",
              color: "#6C47FF",
            },
            {
              icon: <BarChart3 size={22} />,
              title: "Real-Time Analytics",
              desc: "See exactly how many taps you get per day, week, or month. Know your busiest hours.",
              color: "#00D4FF",
            },
            {
              icon: <Zap size={22} />,
              title: "EFTPOS Mode",
              desc: "Cashier enters RM5. Customer taps. Payment app opens pre-filled with the amount. Magic.",
              color: "#A78BFA",
            },
            {
              icon: <Shield size={22} />,
              title: "Always Available",
              desc: "99.9% uptime guarantee. Your sticker works even during peak hours at pasar malam.",
              color: "#FF6B6B",
            },
            {
              icon: <Smartphone size={22} />,
              title: "No App Required",
              desc: "Works on any Android or iPhone with NFC. No install, no friction, no barriers.",
              color: "#00B14F",
            },
            {
              icon: <CreditCard size={22} />,
              title: "Multi-Payment Support",
              desc: "Link to TNG eWallet, GrabPay, DuitNow QR, Boost, or any URL-based payment.",
              color: "#FF6B35",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ background: `${f.color}20`, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EFTPOS highlight */}
      <section className="relative z-10 py-16 px-6 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm p-10 md:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6C47FF, transparent)" }} />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium mb-6">
              ⚡ Killer Feature
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              EFTPOS Mode — Set Amount Before Tap
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Pasar malam boss enters <strong className="text-white">RM8.50</strong> on their phone.
              Customer taps the sticker. TNG opens with the amount pre-filled.
              The customer just needs to hit <strong className="text-white">PAY</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                "5-minute session timer",
                "One-use per session",
                "Works with any amount",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-6">
          Ready to go{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] to-[#00D4FF]">
            cashless?
          </span>
        </h2>
        <p className="text-gray-400 text-xl mb-10 max-w-xl mx-auto">
          Join thousands of Malaysian merchants collecting digital payments with a single tap.
        </p>
        <Link
          href="/signup"
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#6C47FF] to-[#00D4FF] text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all"
        >
          Start Free Today
          <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4FF] flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span>VibeTap © 2025 · Made in Malaysia 🇲🇾</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
