"use client";

import { useState } from "react";
import {
  Zap,
  Check,
  Loader2,
  Settings,
  Calculator,
  UtensilsCrossed,
  Nfc,
  Info,
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface MerchantData {
  name: string;
  plan: "plan1" | "plan2" | "plan3";
  fixedAmount: number | null;
  tngPaymentUrl: string;
}

interface BillRequest {
  id: string;
  stickerId: string;
  tableName: string;
  wantsReceipt: boolean;
  createdAt: Date;
  status: string;
}

interface Sticker {
  id: string;
  tableName: string;
  pushedBill: { amount: number; pushedAt: Date } | null;
}

// ─── INITIAL MOCK DATA ────────────────────────────────────────────────────────
const INITIAL_MERCHANT: MerchantData = {
  name: "Demo Kopitiam",
  plan: "plan3",
  fixedAmount: null,
  tngPaymentUrl: "https://payment.tngdigital.com.my/sc/demo",
};

const INITIAL_STICKERS: Sticker[] = [
  { id: "s1", tableName: "Table 1", pushedBill: null },
  { id: "s2", tableName: "Table 2", pushedBill: { amount: 15.5, pushedAt: new Date() } },
  { id: "s3", tableName: "Table 3", pushedBill: null },
];

const INITIAL_BILL_REQUESTS: BillRequest[] = [
  {
    id: "br1",
    stickerId: "s1",
    tableName: "Table 1",
    wantsReceipt: true,
    createdAt: new Date(Date.now() - 120000),
    status: "pending",
  },
];

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"cashier" | "settings">("cashier");
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [merchant, setMerchant] = useState<MerchantData>(INITIAL_MERCHANT);
  const [stickers, setStickers] = useState<Sticker[]>(INITIAL_STICKERS);
  const [billRequests, setBillRequests] = useState<BillRequest[]>(INITIAL_BILL_REQUESTS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rawCents = parseInt(amount);
  const amountRM = rawCents / 100;

  function pressDigit(digit: string) {
    if (amount === "0") {
      if (digit === "00" || digit === "0") return;
      setAmount(digit);
    } else {
      if (amount.length >= 7) return;
      setAmount(amount + digit);
    }
  }

  function pressBackspace() {
    if (amount === "0") return;
    setAmount(amount.length <= 1 ? "0" : amount.slice(0, -1));
  }

  function pressClear() {
    setAmount("0");
  }

  const simulateAction = (callback: () => void) => {
    setLoading(true);
    setTimeout(() => {
      callback();
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  function handleSetAmount() {
    simulateAction(() => {
      setMerchant((prev) => ({ ...prev, fixedAmount: amountRM }));
    });
  }

  function handleClearAmount() {
    simulateAction(() => {
      setMerchant((prev) => ({ ...prev, fixedAmount: null }));
      setAmount("0");
    });
  }

  function handleAssignToSticker(stickerId: string) {
    if (rawCents === 0) return;
    simulateAction(() => {
      setStickers((prev) =>
        prev.map((s) =>
          s.id === stickerId ? { ...s, pushedBill: { amount: amountRM, pushedAt: new Date() } } : s
        )
      );
      setAmount("0");
    });
  }

  function handleClearStickerBill(stickerId: string) {
    simulateAction(() => {
      setStickers((prev) =>
        prev.map((s) => (s.id === stickerId ? { ...s, pushedBill: null } : s))
      );
    });
  }

  function handlePushAndDone(req: BillRequest) {
    simulateAction(() => {
      setMerchant((prev) => ({ ...prev, fixedAmount: amountRM }));
      setBillRequests((prev) => prev.filter((r) => r.id !== req.id));
      setStickers((prev) =>
        prev.map((s) =>
          s.id === req.stickerId ? { ...s, pushedBill: { amount: amountRM, pushedAt: new Date() } } : s
        )
      );
      setAmount("0");
    });
  }

  function handleDoneRequest(reqId: string) {
    simulateAction(() => {
      setBillRequests((prev) => prev.filter((r) => r.id !== reqId));
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      <ParticleBackground />

      {/* Demo Banner */}
      <div className="bg-slate-950 text-white py-2 px-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-50 shadow-xl">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Interactive Demo Mode — No real data is saved
      </div>

      {/* Header */}
      <header className="border-b-4 border-slate-950 bg-white sticky top-[34px] z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/TapPay_Logo.png" alt="TapPay" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-xl font-black text-slate-950 tracking-tight leading-none">TapPay</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{merchant.name}</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]">
          <button
            onClick={() => setActiveTab("cashier")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "cashier" ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <Calculator size={14} /> Cashier
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "settings" ? "bg-slate-950 text-white shadow-lg" : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <Settings size={14} /> Settings
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <a href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-all">
            Exit Demo
          </a>
          <button className="bg-slate-950 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:-translate-y-[2px] active:translate-y-0 transition-all">
            Get Started
          </button>
        </div>
      </header>

      <main className="p-8 md:p-12">
        {activeTab === "cashier" ? (
          <div className="max-w-6xl mx-auto pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

              {/* Left: Cashier Panel */}
              <div className="space-y-10 lg:pt-4">
                <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)]">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Total Amount to Collect</p>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl font-black text-slate-950 mt-4">RM</span>
                    <span className="text-8xl md:text-9xl font-black text-slate-950 tracking-tighter tabular-nums leading-none">
                      {amountRM.toFixed(2)}
                    </span>
                  </div>
                  {merchant.fixedAmount && (
                    <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                      <Zap size={12} className="fill-white" /> Active Tap Enabled
                    </div>
                  )}
                </div>

                <div className="space-y-6">
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
                      onClick={pressBackspace}
                      className="h-20 rounded-3xl bg-amber-50 border-4 border-slate-950 hover:bg-amber-100 text-slate-950 font-black text-3xl transition-all active:scale-90 shadow-sm flex items-center justify-center"
                    >
                      ⌫
                    </button>
                    <button
                      onClick={pressClear}
                      className="col-span-3 h-16 rounded-2xl bg-white border-4 border-red-600 hover:bg-red-50 text-red-600 font-black text-xl uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                    >
                      Clear Amount
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleClearAmount}
                      disabled={loading || !merchant.fixedAmount}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-950 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSetAmount}
                      disabled={loading || rawCents === 0}
                      className="flex-[2] bg-slate-950 hover:bg-black disabled:opacity-30 text-white py-5 rounded-3xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : saved ? <Check /> : <Zap className="fill-white" />}
                      {saved ? "Activated" : "Activate Tap"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Requests & Tables */}
              <div className="space-y-12 lg:pt-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Incoming Requests</p>
                    {billRequests.length > 0 && (
                      <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                        {billRequests.length} New
                      </span>
                    )}
                  </div>

                  {billRequests.length === 0 ? (
                    <div className="bg-white border-4 border-slate-950 rounded-[2rem] p-8 text-center shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]">
                      <p className="text-slate-300 font-black text-sm uppercase tracking-widest">No requests yet</p>
                      <p className="text-slate-400 text-[10px] mt-2">Customers tap your sticker to send a bill request</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {billRequests.map((req) => (
                        <div key={req.id} className="bg-orange-50 border-4 border-slate-950 rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-black text-slate-950">{req.tableName}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                {req.wantsReceipt ? "Wants receipt" : "No receipt needed"}
                              </p>
                            </div>
                            <span className="bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                              Pending
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handlePushAndDone(req)}
                              disabled={loading || rawCents === 0}
                              className="flex-1 bg-slate-950 disabled:opacity-30 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                            >
                              {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : `Push RM ${amountRM.toFixed(2)}`}
                            </button>
                            <button
                              onClick={() => handleDoneRequest(req.id)}
                              className="px-4 py-3 border-4 border-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black px-2">Tables</p>
                  <div className="space-y-4">
                    {stickers.map((s) => (
                      <div key={s.id} className="bg-white border-4 border-slate-950 rounded-[2rem] p-6 shadow-[4px_4px_0px_0px_rgba(2,6,23,1)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                          <UtensilsCrossed size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-950 truncate">{s.tableName}</p>
                          {s.pushedBill ? (
                            <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-1">
                              RM {s.pushedBill.amount.toFixed(2)} pushed
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Waiting</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAssignToSticker(s.id)}
                            disabled={loading || rawCents === 0}
                            className="text-[10px] font-black uppercase text-white bg-slate-950 px-4 py-2 rounded-xl disabled:opacity-30 transition-all active:scale-95"
                          >
                            Push
                          </button>
                          {s.pushedBill && (
                            <button
                              onClick={() => handleClearStickerBill(s.id)}
                              className="text-[10px] font-black uppercase text-red-500 border-4 border-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all active:scale-95"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-12 pb-20">
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Configure your demo store and experience the dashboard setup.</p>
              </div>

              {/* NFC URLs */}
              <div className="bg-blue-50 border-4 border-slate-950 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] space-y-4">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Nfc size={18} /> NFC Sticker URLs
                </h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  Copy these URLs into your NFC stickers using the <span className="text-blue-600">NFC Writer</span>.
                </p>
                <div className="space-y-3">
                  {stickers.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 bg-white border-4 border-slate-950 rounded-2xl p-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{s.tableName}</p>
                        <p className="font-mono text-[10px] text-slate-500 truncate">tappay.my/s/{s.id}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`tappay.my/s/${s.id}`);
                          setCopiedId(s.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border-4 border-blue-600 transition-all active:scale-95"
                      >
                        {copiedId === s.id ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Selector */}
              <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] space-y-6">
                <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Choose Your Plan</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(["plan1", "plan2", "plan3"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setMerchant((prev) => ({ ...prev, plan: p }))}
                      className={`p-5 rounded-3xl border-4 transition-all ${
                        merchant.plan === p
                          ? "bg-blue-50 border-blue-600"
                          : "bg-slate-50 border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <p className={`font-black text-sm ${merchant.plan === p ? "text-blue-600" : "text-slate-900"}`}>
                        Plan {p.slice(-1)}
                      </p>
                      <p className={`text-[9px] mt-1.5 font-bold ${merchant.plan === p ? "text-blue-400" : "text-slate-400"}`}>
                        {p === "plan1" ? "Direct TNG" : p === "plan2" ? "Show Bill" : "Bill Please"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Info */}
              <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] space-y-6">
                <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Business Info</p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Name</label>
                  <input
                    type="text"
                    value={merchant.name}
                    onChange={(e) => setMerchant((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border-4 border-slate-950 rounded-2xl px-5 py-4 text-slate-950 font-black focus:outline-none focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TNG Payment URL</label>
                  <input
                    type="text"
                    value={merchant.tngPaymentUrl}
                    className="w-full bg-slate-100 border-4 border-slate-950 rounded-2xl px-5 py-4 text-slate-400 font-mono text-xs focus:outline-none"
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t-4 border-slate-50">
                  <div>
                    <p className="font-black text-sm text-slate-950">Store Active</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">Control public availability</p>
                  </div>
                  <button className="w-14 h-8 bg-green-500 rounded-full relative p-1">
                    <div className="w-6 h-6 bg-white rounded-full shadow-sm translate-x-6" />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={() => simulateAction(() => {})}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 transition-all flex items-center justify-center gap-4"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : saved ? <Check size={24} /> : "Update Store Settings"}
                {saved && "Demo Saved"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Info Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-950 animate-bounce">
          <Info size={28} />
        </button>
      </div>
    </div>
  );
}
