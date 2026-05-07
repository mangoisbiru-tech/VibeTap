"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Check,
  Loader2,
  Settings,
  Calculator,
  UtensilsCrossed,
  Nfc,
  Info,
  History,
  Activity,
  ScanSearch,
  Lock,
  ArrowRight,
  ShieldCheck,
  X,
  Bell,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import Link from "next/link";

// ─── TYPES & MOCK DATA ────────────────────────────────────────────────────────
interface Sticker {
  id: string;
  tableName: string;
  pushedBill: { amount: number; pushedAt: Date } | null;
}

const INITIAL_STICKERS: Sticker[] = [
  { id: "s1", tableName: "Table 1", pushedBill: null },
  { id: "s2", tableName: "Table 2", pushedBill: { amount: 15.5, pushedAt: new Date() } },
  { id: "s3", tableName: "Table 3", pushedBill: null },
  { id: "s4", tableName: "Table 4", pushedBill: null },
];

const INITIAL_HISTORY = [
  { id: "h1", tableName: "Table 2", amount: 45.00, status: "paid", time: "10:30 AM" },
  { id: "h2", tableName: "Table 1", amount: 12.50, status: "paid", time: "10:15 AM" },
  { id: "h3", tableName: "Table 5", amount: 0, status: "cleared", time: "09:45 AM" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "cashier" | "history" | "nfc" | "settings">("overview");
  const [plan, setPlan] = useState<"plan1" | "plan2" | "plan3">("plan3");
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [showLock, setShowLock] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>(INITIAL_STICKERS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cashier Logic
  const amountRM = parseInt(amount) / 100;

  function pressDigit(digit: string) {
    if (amount === "0") {
      if (digit === "00" || digit === "0") return;
      setAmount(digit);
    } else {
      if (amount.length >= 7) return;
      setAmount(amount + digit);
    }
  }

  const triggerLock = (msg: string) => {
    setShowLock(msg);
    setTimeout(() => setShowLock(null), 3000);
  };

  const simulateAction = (callback: () => void) => {
    setLoading(true);
    setTimeout(() => {
      callback();
      setLoading(false);
    }, 600);
  };

  // ─── RENDERERS ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      <ParticleBackground />

      {/* Lock Overlay */}
      {showLock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
          <div className="relative bg-white border-4 border-slate-950 rounded-[2.5rem] p-10 shadow-[12px_12px_0px_0px_rgba(2,6,23,1)] max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center border-4 border-blue-100">
              <Lock size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-950">Premium Feature</h3>
              <p className="text-slate-500 font-bold mt-2 leading-relaxed">{showLock}</p>
            </div>
            <Link href="/signup" className="block w-full bg-slate-950 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:-translate-y-1 transition-all active:translate-y-0 shadow-lg">
              Get Started Now
            </Link>
            <button onClick={() => setShowLock(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">
              Continue Exploring Demo
            </button>
          </div>
        </div>
      )}

      {/* Demo Banner */}
      <div className="bg-slate-950 text-white py-2 px-4 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Interactive Demo Mode
        </div>
        <div className="h-4 w-px bg-white/20" />
        <Link href="/" className="hover:text-blue-400 transition-colors">Exit Demo</Link>
      </div>

      <div className="flex h-[calc(100vh-34px)]">
        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-white border-r-4 border-slate-950 flex flex-col z-40">
          <div className="p-6 border-b-4 border-slate-950 hidden md:block">
            <div className="flex items-center gap-3">
              <img src="/TapPay_Logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TapPay</p>
                <p className="font-black text-slate-950 truncate">Demo Store</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 mt-4">
            {[
              { id: "overview", icon: <Activity size={20} />, label: "Overview" },
              { id: "cashier", icon: <Calculator size={20} />, label: "Cashier", badge: "Live" },
              { id: "history", icon: <History size={20} />, label: "History" },
              { id: "nfc", icon: <Nfc size={20} />, label: "NFC Writer" },
              { id: "settings", icon: <Settings size={20} />, label: "Settings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                  activeTab === item.id 
                    ? "bg-slate-950 text-white shadow-xl" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <div className="shrink-0">{item.icon}</div>
                <span className="hidden md:block font-black text-sm uppercase tracking-widest">{item.label}</span>
                {item.badge && activeTab !== item.id && (
                  <span className="hidden md:block ml-auto text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t-4 border-slate-950">
            <div className="bg-blue-50 rounded-2xl p-4 hidden md:block">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Current Plan</p>
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-950 text-sm">Plan {plan.slice(-1)} Premium</span>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </div>
            <button 
              onClick={() => triggerLock("User authentication is disabled in demo.")}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:text-red-500 transition-all mt-2"
            >
              <Lock size={20} />
              <span className="hidden md:block font-black text-xs uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
          
          {/* Header Info */}
          <div className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight capitalize">
                  {activeTab}
                </h2>
                {activeTab === 'cashier' && <span className="bg-green-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest animate-pulse">Live</span>}
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
                {activeTab === 'overview' ? "Your business at a glance" : 
                 activeTab === 'cashier' ? "Real-time table settlement" :
                 activeTab === 'history' ? "Transaction logs" :
                 activeTab === 'nfc' ? "Program physical stickers" : "Dashboard configuration"}
              </p>
            </div>

            {activeTab === 'settings' && (
              <div className="flex gap-4">
                {(['plan1', 'plan2', 'plan3'] as const).map(p => (
                  <button 
                    key={p}
                    onClick={() => setPlan(p)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      plan === p ? "bg-blue-600 text-white" : "bg-white border-2 border-slate-200 text-slate-400"
                    }`}
                  >
                    Demo Plan {p.slice(-1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="max-w-6xl mx-auto">
            {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: "Today's Revenue", value: "RM 157.50", icon: <Activity className="text-green-600" />, color: "text-green-600" },
                    { label: "Active Taps", value: "42", icon: <Nfc className="text-blue-600" />, color: "text-blue-600" },
                    { label: "Requests Handled", value: "18", icon: <Bell className="text-orange-500" />, color: "text-orange-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">{stat.icon}</div>
                      <p className="text-[40px] font-black text-slate-950 tracking-tighter leading-none mb-2">{stat.value}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <ShieldCheck size={200} />
                  </div>
                  <div className="relative z-10 max-w-xl">
                    <h3 className="text-3xl font-black tracking-tight mb-4 leading-tight">Welcome to the God Mode Demo.</h3>
                    <p className="text-slate-400 font-medium leading-relaxed mb-8">
                      Experience the full power of TapPay without spending a single sen. We've unlocked all premium features for this demo store.
                    </p>
                    <button onClick={() => setActiveTab("cashier")} className="inline-flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95">
                      Open Cashier Mode <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── CASHIER TAB ──────────────────────────────────────── */}
            {activeTab === "cashier" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-10">
                  <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Total Amount to Collect</p>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl font-black text-slate-950 mt-4">RM</span>
                      <span className="text-8xl md:text-9xl font-black text-slate-950 tracking-tighter tabular-nums leading-none">
                        {amountRM.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {["1","2","3","4","5","6","7","8","9","0","00"].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => pressDigit(digit)}
                        className="h-20 rounded-3xl bg-white border-4 border-slate-950 hover:bg-slate-50 text-slate-950 font-black text-4xl transition-all active:scale-90 shadow-sm"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      onClick={() => setAmount(amount.length <= 1 ? "0" : amount.slice(0, -1))}
                      className="h-20 rounded-3xl bg-amber-50 border-4 border-slate-950 hover:bg-amber-100 text-slate-950 font-black text-3xl transition-all active:scale-90 shadow-sm flex items-center justify-center"
                    >
                      ⌫
                    </button>
                  </div>
                  <button
                    onClick={() => setAmount("0")}
                    className="w-full h-16 rounded-2xl bg-white border-4 border-red-600 hover:bg-red-50 text-red-600 font-black text-xl uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                  >
                    Clear Amount
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Live Table Grid</p>
                    {plan === 'plan1' && (
                      <span className="text-[9px] font-black text-orange-500 uppercase flex items-center gap-1">
                        <Lock size={10} /> Upgrade to Plan 2/3 for Table Tracking
                      </span>
                    )}
                  </div>

                  {plan === 'plan1' ? (
                    <div className="bg-slate-100 border-4 border-dashed border-slate-300 rounded-[2.5rem] p-12 text-center flex flex-col items-center gap-4 opacity-70">
                      <Lock size={32} className="text-slate-400" />
                      <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Plan 1: Direct Payout Only</p>
                      <p className="text-[10px] text-slate-400 font-medium">Table tracking and remote pushing requires Plan 2 or 3.</p>
                      <button onClick={() => setPlan('plan3')} className="mt-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Switch to Plan 3 to Demo</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {stickers.map((s) => (
                        <div key={s.id} className="bg-white border-4 border-slate-950 rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] flex flex-col justify-between gap-4 group hover:-translate-y-1 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${s.pushedBill ? 'bg-green-100 text-green-600' : 'bg-slate-950 text-white'}`}>
                              <UtensilsCrossed size={18} />
                            </div>
                            <div>
                              <p className="font-black text-slate-950">{s.tableName}</p>
                              <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${s.pushedBill ? 'text-green-600' : 'text-slate-400'}`}>
                                {s.pushedBill ? `RM ${s.pushedBill.amount.toFixed(2)} Active` : "Ready"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (amountRM === 0) return;
                                simulateAction(() => {
                                  setStickers(prev => prev.map(st => st.id === s.id ? {...st, pushedBill: { amount: amountRM, pushedAt: new Date() }} : st));
                                  setAmount("0");
                                });
                              }}
                              className="flex-1 bg-slate-950 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
                            >
                              Push Bill
                            </button>
                            {s.pushedBill && (
                              <button 
                                onClick={() => setStickers(prev => prev.map(st => st.id === s.id ? {...st, pushedBill: null} : st))}
                                className="px-3 border-2 border-slate-950 rounded-xl font-black text-slate-400 hover:text-red-500 hover:border-red-500 transition-all"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── HISTORY TAB ──────────────────────────────────────── */}
            {activeTab === "history" && (
              <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white border-4 border-slate-950 rounded-3xl p-6 text-center">
                    <p className="text-2xl font-black text-green-600 leading-none">RM 57.50</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Revenue</p>
                  </div>
                  <div className="bg-white border-4 border-slate-950 rounded-3xl p-6 text-center">
                    <p className="text-2xl font-black text-slate-950 leading-none">3</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Taps</p>
                  </div>
                  <div className="bg-white border-4 border-slate-950 rounded-3xl p-6 text-center">
                    <p className="text-2xl font-black text-blue-600 leading-none">100%</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Success</p>
                  </div>
                </div>

                <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] overflow-hidden">
                  <div className="divide-y-4 divide-slate-950">
                    {INITIAL_HISTORY.map(h => (
                      <div key={h.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            {h.status === 'paid' ? <CheckCircle2 size={18} /> : <X size={18} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-950 uppercase text-lg leading-tight">{h.tableName}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h.status} via Tap • {h.time}</p>
                          </div>
                        </div>
                        <p className={`text-xl font-black ${h.status === 'paid' ? 'text-green-600' : 'text-slate-300'}`}>
                          RM {h.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  History cleared automatically in demo sessions
                </p>
              </div>
            )}

            {/* ── NFC WRITER TAB ───────────────────────────────────── */}
            {activeTab === "nfc" && (
              <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 border-4 border-slate-950 rounded-[2.5rem] p-10 space-y-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <ScanSearch size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">Scanner Mode</h3>
                    <p className="text-slate-600 font-bold text-sm leading-relaxed">
                      Wanna see what's inside a sticker? Tap any physical NFC tag to reveal its stored data and serial number.
                    </p>
                    <button 
                      onClick={() => triggerLock("Web NFC requires an Android device with Chrome. Sign in to start scanning your real stickers.")}
                      className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:-translate-y-1 transition-all"
                    >
                      Scan Physical Tag
                    </button>
                  </div>

                  <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-10 space-y-6">
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <UtensilsCrossed size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">Eraser Tool</h3>
                    <p className="text-slate-600 font-bold text-sm leading-relaxed">
                      Made a mistake? Use this tool to wipe a sticker clean and make it ready for a new URL.
                    </p>
                    <button 
                      onClick={() => triggerLock("Eraser tool is a Plan 1+ feature. Upgrade to enable hardware control.")}
                      className="w-full border-4 border-slate-950 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Wipe Sticker
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-950">Program Tables</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Android + Chrome Required</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stickers.map(s => (
                      <div key={s.id} className="bg-white border-4 border-slate-950 rounded-[2rem] p-8 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-950">
                            <Nfc size={20} />
                          </div>
                          <h4 className="font-black text-slate-950 text-lg">{s.tableName}</h4>
                        </div>
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target URL</p>
                          <p className="font-mono text-[10px] text-blue-600 truncate font-bold">tappay-malaysia-nfc.vercel.app/s/{s.id}</p>
                        </div>
                        <button 
                          onClick={() => triggerLock("Web NFC API is only accessible on secure mobile browsers. Login on your phone to program this sticker.")}
                          className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Nfc size={16} /> Write to {s.tableName}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS TAB ─────────────────────────────────────── */}
            {activeTab === "settings" && (
              <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-10 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black px-1">Store Branding</p>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                      <input 
                        type="text" 
                        defaultValue="Demo Kopitiam" 
                        className="w-full bg-slate-50 border-4 border-slate-950 rounded-2xl px-6 py-4 text-slate-950 font-black focus:outline-none focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black px-1">Payment Setup</p>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TNG Merchant URL</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          readOnly
                          value="https://payment.tngdigital.com.my/sc/demo" 
                          className="w-full bg-slate-100 border-4 border-slate-950 rounded-2xl px-6 py-4 text-slate-400 font-mono text-[10px] focus:outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-lg border-2 border-slate-950 text-[8px] font-black uppercase text-slate-400">Locked</div>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold ml-1">This is your unique Touch 'n Go checkout link from the TNG app.</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t-4 border-slate-50">
                    <button 
                      onClick={() => triggerLock("Settings are read-only in demo mode. Create an account to save your store profile.")}
                      className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>

                <div className="bg-orange-50 border-4 border-orange-200 rounded-[2.5rem] p-10 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-200 text-orange-600 rounded-2xl flex items-center justify-center">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-orange-600">Danger Zone</h4>
                        <p className="text-orange-600/70 text-xs font-bold">Permanently delete your entire digital store.</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => triggerLock("Account deletion is disabled for demo safety.")}
                    className="w-full bg-white border-4 border-orange-200 text-orange-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-100 transition-all"
                   >
                     Reset All Store Data
                   </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Call to Action */}
      <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
        <div className="hidden lg:block bg-slate-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl border-4 border-white/10 animate-in slide-in-from-right-10 duration-700">
           Ready to start for real?
        </div>
        <Link href="/signup" className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-950 hover:scale-110 transition-transform group">
          <Zap size={32} className="fill-white group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
