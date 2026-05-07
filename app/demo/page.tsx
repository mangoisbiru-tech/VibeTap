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
  AlertCircle,
  Trash2,
  Table
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
  { id: "s5", tableName: "Table 5", pushedBill: null },
  { id: "s6", tableName: "Table 6", pushedBill: null },
  { id: "s7", tableName: "Table 7", pushedBill: null },
  { id: "s8", tableName: "Table 8", pushedBill: null },
  { id: "s9", tableName: "Table 9", pushedBill: null },
  { id: "s10", tableName: "VIP 1", pushedBill: null },
  { id: "s11", tableName: "VIP 2", pushedBill: null },
  { id: "s12", tableName: "VIP 3", pushedBill: null },
];

const INITIAL_HISTORY = [
  { id: "h1", tableName: "Table 2", amount: 45.00, status: "paid", time: "10:30 AM" },
  { id: "h2", tableName: "Table 1", amount: 12.50, status: "paid", time: "10:15 AM" },
  { id: "h3", tableName: "Table 5", amount: 0, status: "cleared", time: "09:45 AM" },
];

const MOCK_PAYMENTS = [
  { id: "p1", amount: 12.50, time: "10:15 AM", content: "TNG eWallet" },
  { id: "p2", amount: 30.00, time: "09:50 AM", content: "TNG eWallet" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "cashier" | "history" | "nfc" | "settings">("overview");
  const [plan, setPlan] = useState<"plan1" | "plan2" | "plan3">("plan3");
  const [plan3Mode, setPlan3Mode] = useState<"summing_up" | "fixed">("summing_up");
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [showLock, setShowLock] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>(INITIAL_STICKERS);
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [mismatchError, setMismatchError] = useState<string | null>(null);

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
          <div className="max-w-[1600px] mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
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

            <div className="flex flex-wrap gap-3 items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 hidden md:block">Demo Mode:</p>
              {(['plan1', 'plan2', 'plan3'] as const).map(p => (
                <button 
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 border-4 ${
                    plan === p 
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 -translate-y-0.5" 
                      : "bg-white border-slate-950 text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  {plan === p && <Check size={12} />}
                  {p === 'plan1' ? "Lite (P1)" : p === 'plan2' ? "Pro (P2)" : "Enterprise (P3)"}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto">
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
                    <h3 className="text-3xl font-black tracking-tight mb-4 leading-tight">Welcome to the Interactive Demo.</h3>
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
              <div className={`grid grid-cols-1 ${plan === "plan1" ? "max-w-2xl mx-auto" : "md:grid-cols-2 xl:grid-cols-3"} gap-8 xl:gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                
                {/* COLUMN 1: Calculator (Hidden in Plan 1) */}
                {plan !== "plan1" && (
                  <div className="space-y-8">
                    <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-6 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] min-h-[160px] flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Total Amount</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-950">RM</span>
                        <span className="text-6xl font-black text-slate-950 tracking-tighter tabular-nums leading-tight">
                          {amountRM.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {["1","2","3","4","5","6","7","8","9","0","00"].map((digit) => (
                        <button
                          key={digit}
                          onClick={() => pressDigit(digit)}
                          className="h-16 rounded-2xl bg-white border-4 border-slate-950 hover:bg-slate-50 text-slate-950 font-black text-3xl transition-all active:scale-90 shadow-sm"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        onClick={() => setAmount(amount.length <= 1 ? "0" : amount.slice(0, -1))}
                        className="h-16 rounded-2xl bg-amber-50 border-4 border-slate-950 hover:bg-amber-100 text-slate-950 font-black text-2xl transition-all active:scale-90 shadow-sm flex items-center justify-center"
                      >
                        ⌫
                      </button>
                      <button
                        onClick={() => setAmount("0")}
                        className="col-span-3 h-14 rounded-xl bg-white border-4 border-red-600 hover:bg-red-50 text-red-600 font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                      >
                        Clear Amount
                      </button>
                    </div>
                  </div>
                )}

                {/* COLUMN 2: Inbox/Requests */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">
                      {plan === "plan1" ? "Today's Log" : "Inbox"}
                    </p>
                    <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                      2 New
                    </span>
                  </div>

                  <div className="space-y-3">
                    {payments.map((pay) => (
                      <button 
                        key={pay.id} 
                        onClick={() => {
                          setSelectedPayment(selectedPayment === pay.id ? null : pay.id);
                          setMismatchError(null);
                        }}
                        className={`w-full bg-white border-4 rounded-3xl p-4 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 relative ${
                          selectedPayment === pay.id ? 'border-green-500 ring-4 ring-green-100 shadow-xl' : 'border-slate-950 shadow-lg'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedPayment === pay.id ? 'bg-green-500 text-white' : 'bg-slate-950 text-white'
                        }`}>
                          <Bell size={24} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-black text-slate-950 text-xl tracking-tight leading-none">RM {pay.amount.toFixed(2)}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{pay.content} • {pay.time}</p>
                        </div>
                        {selectedPayment === pay.id && plan !== 'plan1' && (
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-bounce shadow-lg flex items-center gap-1">
                            Drag to Table <ArrowRight size={8} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {plan === "plan1" && (
                    <div className="pt-4 border-t-4 border-slate-100 space-y-4">
                      <button
                        onClick={() => triggerLock("Selecting a payment from the log will clear it. In Plan 1, this is used for manual reconciliation.")}
                        className={`w-full py-6 rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                          selectedPayment ? "bg-red-50 border-red-500 text-red-500 animate-pulse" : "bg-slate-50 border-slate-200 text-slate-300"
                        }`}
                      >
                        <Trash2 size={24} />
                        <p className="font-black text-[10px] uppercase tracking-widest">Delete Entry</p>
                      </button>
                      <div className="bg-blue-50 border-4 border-blue-100 rounded-[2rem] p-6 text-center">
                         <p className="text-blue-600 font-black text-sm uppercase tracking-tight">Lite Plan Mode</p>
                         <p className="text-[10px] text-blue-500 font-bold mt-1">Direct pay only. No table assignment.</p>
                      </div>
                    </div>
                  )}

                  {/* Requests (Plan 2/3 Only) */}
                  {plan !== "plan1" && (
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Table Requests</p>
                        <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">1 New</span>
                      </div>
                      <div className="bg-white border-4 border-slate-950 rounded-3xl p-4 flex items-center gap-4 shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                          <Bell size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-950 text-lg truncate tracking-tight">Table 4</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {plan === "plan3" && plan3Mode === "summing_up" ? (
                            <button
                              onClick={() => {
                                if (amountRM === 0) return;
                                simulateAction(() => {
                                  setStickers(prev => prev.map(s => s.id === 's4' ? {...s, pushedBill: { amount: amountRM, pushedAt: new Date() }} : s));
                                  setAmount("0");
                                });
                              }}
                              disabled={amountRM === 0}
                              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                            >
                              Push RM {amountRM.toFixed(2)}
                            </button>
                          ) : (
                            <button
                              onClick={() => simulateAction(() => triggerLock("This request is now marked as 'Done'. The customer has been notified that you are on your way."))}
                              className="bg-slate-950 hover:bg-black text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUMN 3: Tables (Hidden in Plan 1) */}
                {plan !== "plan1" && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                      <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Tables</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {stickers.slice(0, plan === "plan2" ? 6 : 12).map((s) => (
                        <div key={s.id} className="relative">
                          <button
                            onClick={() => {
                              if (selectedPayment) {
                                const pay = payments.find(p => p.id === selectedPayment);
                                if (!pay) return;
                                
                                // Matching Logic
                                if (s.pushedBill && pay.amount === s.pushedBill.amount) {
                                  simulateAction(() => {
                                    setStickers(prev => prev.map(st => st.id === s.id ? {...st, pushedBill: null} : st));
                                    setPayments(prev => prev.filter(p => p.id !== pay.id));
                                    setSelectedPayment(null);
                                    setMismatchError(null);
                                  });
                                } else {
                                  setMismatchError(s.id);
                                  setTimeout(() => setMismatchError(null), 1500);
                                }
                              } else if (amountRM > 0) {
                                simulateAction(() => {
                                  setStickers(prev => prev.map(st => st.id === s.id ? {...st, pushedBill: { amount: amountRM, pushedAt: new Date() }} : st));
                                  setAmount("0");
                                });
                              }
                            }}
                            className={`w-full aspect-square rounded-2xl border-4 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md relative overflow-hidden ${
                              mismatchError === s.id ? "bg-red-50 border-red-600 animate-shake" :
                              s.pushedBill ? "bg-blue-50 border-blue-600 shadow-blue-900/10" : "bg-white border-slate-950"
                            }`}
                          >
                            {mismatchError === s.id && (
                              <div className="absolute inset-0 bg-red-600/90 flex items-center justify-center text-white p-2">
                                <p className="font-black text-[8px] uppercase tracking-widest text-center leading-none">Amount Mismatch!</p>
                              </div>
                            )}
                            <p className="font-black text-slate-950 text-xs truncate w-full text-center tracking-tight leading-tight px-1">{s.tableName}</p>
                            {s.pushedBill ? (
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">RM {s.pushedBill.amount.toFixed(2)}</p>
                            ) : (
                              <p className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Assign</p>
                            )}
                          </button>
                          {s.pushedBill && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStickers(prev => prev.map(st => st.id === s.id ? {...st, pushedBill: null} : st));
                              }}
                              className="absolute -top-1 -right-1 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-700 transition-all z-10"
                            >
                              <span className="text-base font-black">×</span>
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          if (selectedPayment) {
                            simulateAction(() => setSelectedPayment(null));
                          }
                        }}
                        className={`w-full aspect-square rounded-2xl border-4 border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                          selectedPayment ? "bg-red-50 border-red-500 text-red-500 animate-pulse" : "bg-slate-50 border-slate-200 text-slate-300"
                        }`}
                      >
                        <Trash2 size={24} />
                        <p className="font-black text-[10px] uppercase tracking-widest">Dustbin</p>
                      </button>

                      <button
                        onClick={() => {
                          setStickers(INITIAL_STICKERS);
                          setAmount("0");
                          setSelectedPayment(null);
                          setMismatchError(null);
                          const newAmts = [Math.floor(Math.random() * 50) + 10, Math.floor(Math.random() * 20) + 5];
                          setPayments([
                            { id: "p1", amount: newAmts[0] + 0.5, time: "Just now", content: "TNG eWallet" },
                            { id: "p2", amount: newAmts[1] + 0.9, time: "Just now", content: "TNG eWallet" },
                          ]);
                        }}
                        className="w-full aspect-square rounded-2xl border-4 border-slate-950 bg-slate-950 text-white flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                      >
                        <Activity size={24} />
                        <p className="font-black text-[10px] uppercase tracking-widest text-center">Reset Demo</p>
                      </button>
                    </div>

                    {/* Quick RM Section */}
                    <div className="space-y-4 pt-4 border-t-4 border-slate-100">
                      <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Quick RM</p>
                      </div>
                      <div className="border-4 border-slate-950 bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]">
                        {[10, 20, 50].map((val, idx) => (
                          <button
                            key={idx}
                            onClick={() => setAmount((val * 100).toString())}
                            className={`w-full py-4 text-center hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center gap-4 ${idx !== 0 ? 'border-t-2 border-slate-950' : ''}`}
                          >
                            <span className="text-2xl font-black text-slate-950">{val.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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

                  {(plan === 'plan3' || plan === 'plan2') && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300 relative">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Plan 3 Customer Experience</p>
                        {plan === 'plan2' && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Enterprise Only</span>}
                      </div>
                      <div className={`bg-orange-50/50 border-4 border-orange-100 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden ${plan === 'plan2' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                        {plan === 'plan2' && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[2px]">
                            <button onClick={() => setPlan('plan3')} className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform">
                              <Zap size={14} className="fill-blue-500 text-blue-500" /> Unlock Enterprise Mode
                            </button>
                          </div>
                        )}
                        <button 
                          onClick={() => setPlan3Mode("summing_up")}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-4 ${
                            plan3Mode === "summing_up" ? "bg-white border-orange-500 shadow-lg" : "bg-transparent border-transparent grayscale opacity-50"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center shrink-0 ${plan3Mode === "summing_up" ? "border-orange-500 bg-orange-500" : "border-slate-200"}`}>
                            {plan3Mode === "summing_up" && <Check size={14} className="text-white" />}
                          </div>
                          <div className="text-left">
                            <p className="font-black text-slate-950 text-sm">Boss is summing up... <span className="text-[9px] text-orange-600 ml-1">(Recommended)</span></p>
                            <p className="text-[10px] text-slate-500 font-bold">Customer waits while you push the exact bill.</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => setPlan3Mode("fixed")}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-4 ${
                            plan3Mode === "fixed" ? "bg-white border-orange-500 shadow-lg" : "bg-transparent border-transparent grayscale opacity-50"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center shrink-0 ${plan3Mode === "fixed" ? "border-orange-500 bg-orange-500" : "border-slate-200"}`}>
                            {plan3Mode === "fixed" && <Check size={14} className="text-white" />}
                          </div>
                          <div className="text-left">
                            <p className="font-black text-slate-950 text-sm">Boss is coming</p>
                            <p className="text-[10px] text-slate-500 font-bold">Customer is just told "Boss is coming".</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t-4 border-slate-50">
                    <button 
                      onClick={() => triggerLock("Settings are read-only in demo mode. Create an account to save your store profile.")}
                      className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:-translate-y-1 transition-all shadow-xl"
                    >
                      Save Configuration
                    </button>
                  </div>
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
