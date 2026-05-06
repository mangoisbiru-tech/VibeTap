"use client";
import Link from "next/link";
import { 
  Zap, 
  Smartphone, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Store, 
  Nfc, 
  UtensilsCrossed, 
  HeartHandshake,
  BarChart3,
  Users
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      <ParticleBackground />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <img src="/TapPay_Logo.png" alt="TapPay" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Tap<span className="text-blue-600">Pay</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
        </div>
        <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20">
          Get Started
        </Link>
      </nav>

      {/* Hero Header */}
      <section className="relative z-10 pt-20 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-bold mb-8">
          <Zap size={16} /> Our Value: Why Merchants Upgrade to TapPay
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-8">
          The End of the <br />
          <span className="text-red-500">Scanning Era.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          QR codes were a great start, but they are slow, error-prone, and frustrating. 
          TapPay moves your business into the <strong className="text-blue-600">Tap-to-Pay</strong> era.
        </p>
      </section>

      {/* The Pain vs Solution */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black">QR Codes are killing your peak-hour sales.</h2>
            <div className="space-y-6">
              {[
                { title: "The 'Blurry' Problem", desc: "Customers struggle to scan in low light or with old cameras. Result: 15-second delay per customer." },
                { title: "The 'Typing' Error", desc: "Manual amount entry leads to mistakes. Customers 'accidentally' pay RM1.50 instead of RM15." },
                { title: "The 'Ads' Friction", desc: "Most e-wallets show ads before the scan button. TapPay skips the noise." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0"><X size={20} /></div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="relative bg-white rounded-[3rem] border border-blue-100 p-10 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30"><Zap size={28} /></div>
                <h3 className="text-2xl font-black">The TapPay Solution</h3>
              </div>
              <ul className="space-y-8">
                {[
                  { icon: <Nfc />, title: "Instant NFC Deep-linking", desc: "Customer taps sticker. TNG opens in 0.5s. No ads. No scanning." },
                  { icon: <BarChart3 />, title: "Auto-Filled Amounts", desc: "You set the amount on your dashboard. Customer just clicks 'Pay'." },
                  { icon: <Smartphone />, title: "Voice Alerts", desc: "Your Android phone announces the payment amount out loud instantly." }
                ].map((v, i) => (
                  <li key={i} className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">{v.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{v.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Built for Every Business</h2>
            <p className="text-slate-400">Whether you're a one-man stall or a multi-branch cafe.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Store className="text-amber-400" />, 
                title: "Pasar Malam & Hawkers", 
                benefit: "Fast Checkout", 
                desc: "Handle long queues in seconds. No more asking customers to 're-scan' because of bad lighting." 
              },
              { 
                icon: <UtensilsCrossed className="text-blue-400" />, 
                title: "Cafes & Restaurants", 
                benefit: "Table Management", 
                desc: "Put stickers on every table. Customers can call for staff or pay for their exact table bill instantly." 
              },
              { 
                icon: <Users className="text-green-400" />, 
                title: "Retail & Services", 
                benefit: "Modern Image", 
                desc: "Give your shop a premium feel. Replace ugly printed paper with a sleek, high-tech NFC badge." 
              }
            ].map((v, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{v.icon}</div>
                <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">{v.benefit}</div>
                <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-8">
            <HeartHandshake size={40} />
          </div>
          <h2 className="text-4xl font-black mb-6">Stop Waiting. Start Serving.</h2>
          <p className="text-xl text-slate-500 mb-10">Join 200+ Malaysian merchants who have upgraded to TapPay.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              See Pricing <ArrowRight size={20} />
            </Link>
            <Link href="/signup" className="bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              Create Account
            </Link>
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
