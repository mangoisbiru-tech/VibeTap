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
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative">

      {/* Decorative Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-blob pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 blur-[150px] rounded-full animate-blob animation-delay-2000 pointer-events-none z-0" />
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-400/10 blur-[120px] rounded-full animate-blob animation-delay-4000 pointer-events-none z-0" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/TapPay_Logo.png" alt="TapPay" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Tap<span className="text-blue-600">Pay</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/solutions" className="hover:text-blue-600 transition-colors">Our Value</Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </div>
          <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative z-10 pt-16 pb-12 px-6 max-w-7xl mx-auto text-center">
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
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 italic">"Ever had this happen?"</h2>
          <p className="text-slate-500 text-lg">We've all been there. Here is why we built TapPay.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="text-amber-700" />,
              scenario: "The 'App Hunt' Stress",
              frustration: "It's your turn to pay. You're scrolling for the e-wallet app, it opens with a big ad, then you have to find the 'Scan' button while everyone behind you waits...",
              relief: "Just tap the NFC sticker. TNG opens instantly. Done in 1 second.",
              color: "bg-yellow-200 rotate-1 shadow-yellow-200/50"
            },
            {
              icon: <Users className="text-amber-700" />,
              scenario: "The Counter Queue",
              frustration: "You've finished your meal, but you have to walk to the counter, stand in line, and wait for the cashier just to scan a QR code.",
              relief: "Pay right at your table. No queuing, no walking. Total freedom.",
              color: "bg-yellow-100 -rotate-1 shadow-yellow-100/50"
            },
            {
              icon: <ShieldCheck className="text-amber-700" />,
              scenario: "The Dirty Button",
              frustration: "You need help or the bill, but the physical 'Call Waiter' button on the table looks greasy and unhygienic. You don't want to touch it.",
              relief: "NFC is 100% contactless. Tap with your phone to call for service or your bill.",
              color: "bg-yellow-200 rotate-1 shadow-yellow-200/50"
            }
          ].map((item, i) => (
            <div key={i} className={`group p-10 rounded-sm ${item.color} ${item.color.split(' ')[1]} flex flex-col gap-6 hover:scale-105 hover:rotate-0 transition-all duration-300 shadow-xl relative`}>
              {/* Sticky Tape Effect */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-slate-200 -rotate-2 border-x-4 border-slate-300 shadow-sm" />
              <div className="w-14 h-14 rounded-full bg-white/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{item.icon}</div>
              <div>
                <h3 className="text-2xl font-black mb-4 text-amber-900 leading-tight">{item.scenario}</h3>
                <div className="space-y-4">
                  <div className="flex gap-3 text-amber-800 text-sm leading-relaxed">
                    <X size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <p><span className="font-bold">Frustration:</span> {item.frustration}</p>
                  </div>
                  <div className="flex gap-3 text-blue-800 text-sm leading-relaxed bg-white/40 p-3 rounded-lg border border-white/40">
                    <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <p><span className="font-bold">TapPay Relief:</span> {item.relief}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-[#8b5e3c]/10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black">QR Codes are killing your peak-hour sales.</h2>
            <div className="space-y-6">
              {[
                { title: "The 'Typing' Error", desc: "Customers might enter the wrong amount, but your Listener App announces the payment out loud instantly. You catch errors before they leave." },
                { title: "The 'Verification' Lag", desc: "Waiting for customers to show their screen is awkward. TapPay gives you a voice confirmation so you can keep serving." },
                { title: "The 'Ads' Friction", desc: "Most e-wallets show ads before the scan button. TapPay skips the noise and opens the payment screen directly." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-3xl bg-white border border-[#8b5e3c]/10">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-800 flex items-center justify-center shrink-0"><X size={20} /></div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-[#2d1b10]">{item.title}</h3>
                    <p className="text-[#5c4033] text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#8b5e3c]/10 blur-[100px] rounded-full" />
            <div className="relative bg-white rounded-[3rem] border border-[#8b5e3c]/20 p-10 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#2d1b10] text-white flex items-center justify-center shadow-lg shadow-[#2d1b10]/30"><Zap size={28} /></div>
                <h3 className="text-2xl font-black text-[#2d1b10]">The TapPay Solution</h3>
              </div>
              <ul className="space-y-8">
                {[
                  { icon: <Nfc />, title: "Instant NFC Deep-linking", desc: "Customer taps sticker. TNG opens in 0.5s. No ads. No scanning." },
                  { icon: <Smartphone />, title: "Instant Audio Alerts", desc: "Your Android phone announces the payment amount out loud the moment they pay via TNG eWallet." },
                  { icon: <ShieldCheck />, title: "Real-time Verification", desc: "Check your Payment Inbox instantly to confirm the success of any TNG eWallet transaction." }
                ].map((v, i) => (
                  <li key={i} className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5e6d3] text-[#8b5e3c] flex items-center justify-center shrink-0 border border-[#8b5e3c]/20">{v.icon}</div>
                    <div>
                      <h4 className="font-bold text-[#2d1b10] mb-1">{v.title}</h4>
                      <p className="text-[#5c4033] text-sm leading-relaxed">{v.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - The Loop */}
      <section className="py-24 bg-transparent border-y border-slate-100/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Start in 3 Simple Steps</h2>
            <p className="text-slate-500">No complicated setup. Just paste and play.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                step: "01", 
                title: "Order Your NFC Kit", 
                desc: "Pick a Lite, Starter, or Pro pack. We'll mail your high-quality, weather-proof NFC stickers to your shop." 
              },
              { 
                step: "02", 
                title: "Setup Your App (Optional)", 
                desc: "If you purchased the Listener Add-on, download our app on any Android phone to receive instant sound alerts for every payment." 
              },
              { 
                step: "03", 
                title: "Start Tapping", 
                desc: "Paste stickers on your tables. When customers tap and pay via TNG eWallet, your phone announces it out loud!" 
              }
            ].map((v, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-blue-50 hover:border-blue-100 transition-all">
                <div className="text-5xl font-black text-slate-200 mb-6 group-hover:text-blue-200 transition-colors">{v.step}</div>
                <h3 className="text-xl font-bold mb-4">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-12 md:p-16 border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-8 italic">"NFC is the future of Malaysia's payment culture."</h2>
              <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p>
                  Hi, I'm <span className="text-blue-600 font-bold">Wai Kei (YK)</span>. As a fellow Malaysian, I've always been fascinated by how NFC technology could simplify our lives. 
                </p>
                <p>
                  QR codes served us well during the pandemic, but it's time to move to something even more seamless. I built TapPay to bring a faster, cooler, and more professional payment experience to every local merchant—from the neighborhood Mamak to the busiest cafes.
                </p>
                <p>
                  Join me in building a truly contactless Malaysia. Let's start with TapPay.
                </p>
              </div>
              <div className="mt-10 pt-10 border-t border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">YK</div>
                <div>
                  <div className="font-black text-slate-900">Wai Kei (YK)</div>
                  <div className="text-sm text-slate-500">Founder of TapPay Malaysia</div>
                </div>
              </div>
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
              <div key={i} className="group p-8 rounded-[2.5rem] bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-all shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{v.icon}</div>
                <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">{v.benefit}</div>
                <h3 className="text-2xl font-bold mb-4">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <footer className="bg-transparent border-t border-slate-100/50 py-10 px-6 relative z-10">
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
