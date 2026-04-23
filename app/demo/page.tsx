"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Calculator,
  Settings,
  Wallet,
  TrendingUp,
  Activity,
  History,
  CheckCircle2,
  Timer,
  AlertCircle,
  Nfc,
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  Zap,
  Check,
  Ban,
  Lock,
  ScanSearch,
  Store,
} from "lucide-react";
import Link from "next/link";

// ─── TYPES & INITIAL DATA ──────────────────────────────────────────────────
type Sticker = { id: string; name: string; slug: string; paymentUrl: string };
type ActiveSession = { stickerId: string; amount: number; expiresAt: number };
type Payment = { id: string; stickerId: string; amount: number; timestamp: number };

const INITIAL_STICKERS: Sticker[] = [
  { id: "s1", name: "Table 1", slug: "demo-t1", paymentUrl: "" },
  { id: "s2", name: "Table 2", slug: "demo-t2", paymentUrl: "" },
  { id: "s3", name: "Takeaway", slug: "demo-t3", paymentUrl: "" },
];

const INITIAL_QUICK_AMOUNTS = [1, 2, 5, 10, 15, 20];

// ─── SIDEBAR COMPONENT ───────────────────────────────────────────────────────
function Sidebar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const navItems = [
    { id: "overview", icon: <BarChart3 size={18} />, label: "Overview" },
    { id: "cashier", icon: <Calculator size={18} />, label: "Cashier Mode" },
    { id: "nfc", icon: <Nfc size={18} />, label: "NFC Writer" },
    { id: "settings", icon: <Settings size={18} />, label: "Settings" },
  ];
  return (
    <div className="w-64 bg-[#0F0F16] border-r border-white/5 flex flex-col hidden md:flex sticky top-0 h-screen">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
            <Zap className="text-white fill-white" size={16} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Vibe<span className="text-blue-400">Tap</span>
          </span>
          <span className="ml-2 text-[10px] uppercase tracking-wider bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">
            Demo
          </span>
        </div>
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
            D
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Demo Merchant</p>
            <p className="text-xs text-gray-500">demo@vibetap.com</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === item.id
                ? "bg-purple-500/10 text-purple-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-white transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">N</div>
          Back to Landing
        </Link>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ payments }: { payments: Payment[] }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todaysPayments = payments.filter(p => p.timestamp >= todayStart.getTime());
  const dailyTotal = todaysPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Live metrics and daily settlements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Settlement Card */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet size={64} className="text-green-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-green-400 font-semibold mb-1 flex items-center gap-2">
              <CheckCircle2 size={18} /> Daily Settlement
            </h3>
            <p className="text-4xl font-black text-white mt-2">RM {dailyTotal.toFixed(2)}</p>
            <p className="text-sm text-green-400/80 mt-2 font-medium bg-green-500/10 inline-block px-2 py-1 rounded">
              {todaysPayments.length} completed transactions today
            </p>
            <p className="text-xs text-gray-500 mt-4">Resets automatically at midnight.</p>
          </div>
        </div>

        {/* Global Demo Metrics */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
          <h3 className="text-gray-400 font-medium mb-1 flex items-center gap-2">
            <Activity size={18} /> Total Demo Taps
          </h3>
          <p className="text-4xl font-black text-white mt-2">1,204</p>
          <p className="text-sm text-green-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp size={14} /> +24% from last week
          </p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mt-8 mb-4 flex items-center gap-2">
        <History size={18} className="text-gray-400" /> Recent Transactions
      </h2>
      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No transactions yet. Mark a payment as paid in Cashier Mode to see it here.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Sticker</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...payments].reverse().slice(0, 10).map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{p.stickerId}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-400">RM {p.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── CASHIER TAB ──────────────────────────────────────────────────────────────
function CashierTab({
  stickers,
  setStickers,
  quickAmounts,
  setQuickAmounts,
  activeSessions,
  setActiveSessions,
  onCompletePayment,
}: {
  stickers: Sticker[];
  setStickers: (s: Sticker[]) => void;
  quickAmounts: number[];
  setQuickAmounts: (a: number[]) => void;
  activeSessions: ActiveSession[];
  setActiveSessions: (s: ActiveSession[]) => void;
  onCompletePayment: (amount: number, sticker: Sticker) => void;
}) {
  const [currentAmount, setCurrentAmount] = useState("0");
  const [editingQuick, setEditingQuick] = useState(false);
  const [editingStickerId, setEditingStickerId] = useState<string | null>(null);
  
  // Track temporary visual success state (Sticker ID -> Amount)
  const [successStates, setSuccessStates] = useState<Record<string, number>>({});

  const formatAmount = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return "0.00";
    return (num / 100).toFixed(2);
  };

  const handleNumpad = (digit: string) => {
    setCurrentAmount((prev) => {
      if (prev === "0" && digit !== "0") return digit;
      if (prev === "0" && digit === "0") return prev;
      if (prev.length >= 7) return prev;
      return prev + digit;
    });
  };

  const handleDelete = () => {
    setCurrentAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const handleQuickAdd = (amount: number) => {
    const totalCents = parseInt(currentAmount, 10) + amount * 100;
    setCurrentAmount(totalCents.toString());
  };

  const updateStickerNameInline = (id: string, name: string) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleSetSession = (stickerId: string) => {
    const amt = parseFloat(formatAmount(currentAmount));
    if (amt <= 0) return;
    
    // 5 minutes expiry
    const newSession: ActiveSession = { stickerId, amount: amt, expiresAt: Date.now() + 5 * 60 * 1000 };
    setActiveSessions([...activeSessions.filter(s => s.stickerId !== stickerId), newSession]);
    setCurrentAmount("0");
  };

  const markStickerPaid = (session: ActiveSession) => {
    const sticker = stickers.find(s => s.id === session.stickerId);
    if (sticker) {
      onCompletePayment(session.amount, sticker);
      setActiveSessions(activeSessions.filter(s => s.stickerId !== session.stickerId));

      // Trigger 2.5s success visual state
      setSuccessStates(prev => ({ ...prev, [sticker.id]: session.amount }));
      setTimeout(() => {
        setSuccessStates(prev => {
          const next = { ...prev };
          delete next[sticker.id];
          return next;
        });
      }, 2500);
    }
  };

  const cancelSession = (stickerId: string) => {
    setActiveSessions(activeSessions.filter(s => s.stickerId !== stickerId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Calculator/Numpad */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Cashier Mode</h1>
          <p className="text-gray-500 text-sm mt-1">Set amounts for tables and verify payments.</p>
        </div>

        <div className="bg-[#1A1A24] border border-white/10 rounded-3xl p-6 shadow-xl">
          {/* Display */}
          <div className="bg-black/40 rounded-2xl p-6 mb-6 flex justify-between items-center border border-white/5">
            <span className="text-purple-400 font-bold text-xl">RM</span>
            <span className="text-5xl font-black text-white tracking-tight">
              {formatAmount(currentAmount)}
            </span>
          </div>

          {/* Quick Amounts */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Quick Add</span>
              <button onClick={() => setEditingQuick(!editingQuick)} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                <Edit2 size={12} /> {editingQuick ? "Done" : "Edit"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt, idx) => (
                <div key={idx} className="relative">
                  {editingQuick ? (
                    <input 
                      type="number"
                      value={amt}
                      onChange={(e) => {
                        const newAmts = [...quickAmounts];
                        newAmts[idx] = parseInt(e.target.value) || 0;
                        setQuickAmounts(newAmts);
                      }}
                      className="w-full bg-white/10 text-white rounded-lg py-2 text-center text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  ) : (
                    <button
                      onClick={() => handleQuickAdd(amt)}
                      className="w-full bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg py-2 font-semibold text-sm transition-colors"
                    >
                      +RM{amt}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "00", 0].map((num) => (
              <button
                key={num}
                onClick={() => handleNumpad(num.toString())}
                className="bg-white/5 hover:bg-white/10 text-white text-xl font-bold py-4 rounded-xl transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 flex justify-center items-center py-4 rounded-xl transition-all active:scale-95"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Sticker Selection & Sessions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
          <span>Active Tables</span>
        </h2>
        
        {stickers.length === 0 && <p className="text-sm text-gray-500">No tables added. Go to Settings to add tables.</p>}

        {stickers.map((sticker) => {
          const session = activeSessions.find(s => s.stickerId === sticker.id);
          const amt = parseFloat(formatAmount(currentAmount));
          const isSuccess = sticker.id in successStates;
          const successAmount = successStates[sticker.id];

          return (
            <div
              key={sticker.id}
              className={`border rounded-2xl p-5 transition-all flex flex-col gap-4 relative overflow-hidden ${
                isSuccess
                  ? "bg-green-500/20 border-green-500/50"
                  : session
                  ? "bg-purple-900/20 border-purple-500/40"
                  : amt > 0
                  ? "bg-white/5 border-white/10 hover:border-purple-500/50 cursor-pointer"
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
              onClick={() => {
                if (!session && !isSuccess && amt > 0) handleSetSession(sticker.id);
              }}
            >
              {/* SUCCESS ANIMATION LAYER */}
              {isSuccess && (
                <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 size={48} className="text-green-400 mb-2" />
                  <p className="text-xl font-black text-white">Payment Received!</p>
                  <p className="text-green-300 font-bold">RM {successAmount.toFixed(2)}</p>
                </div>
              )}

              <div className="flex justify-between items-center relative z-0">
                <div className="flex items-center gap-2 group">
                  {editingStickerId === sticker.id ? (
                    <input 
                      type="text" 
                      defaultValue={sticker.name}
                      onBlur={(e) => { updateStickerNameInline(sticker.id, e.target.value); setEditingStickerId(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { updateStickerNameInline(sticker.id, e.currentTarget.value); setEditingStickerId(null); } }}
                      autoFocus
                      className="bg-white/10 text-white font-bold text-lg rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  ) : (
                    <h3 className="font-bold text-white text-lg flex items-center gap-2 cursor-text" onClick={(e) => { e.stopPropagation(); setEditingStickerId(sticker.id); }}>
                      {sticker.name}
                      <Edit2 size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  )}
                </div>

                {!session && !isSuccess && amt > 0 && (
                  <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all">
                    Set RM {amt.toFixed(2)}
                  </button>
                )}

                {!session && !isSuccess && amt <= 0 && (
                  <span className="text-gray-600 text-xs font-medium px-2 py-1 bg-white/5 rounded">Idle</span>
                )}
              </div>

              {session && !isSuccess && (
                <div className="bg-[#0A0A0F] rounded-xl p-4 border border-purple-500/20 relative z-0">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Timer size={12} className="animate-pulse" /> Processing tap...
                      </p>
                      <p className="text-2xl font-black text-white mt-1">RM {session.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button onClick={(e) => { e.stopPropagation(); cancelSession(sticker.id); }} className="text-xs text-red-500 hover:text-red-400 bg-red-500/10 px-2 py-1 rounded">Cancel Bill</button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); markStickerPaid(session); }}
                      className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <Check size={18} /> Mark Paid
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); markStickerPaid(session); }}
                      className="whitespace-nowrap px-3 bg-white/5 hover:bg-white/10 text-gray-400 font-medium py-3 border border-white/5 rounded-lg flex flex-col items-center justify-center transition-all group"
                      title="Simulate NFC Tap (for Demo purposes)"
                    >
                      <Smartphone size={16} className="group-hover:text-white" /> 
                      <span className="text-[10px] mt-0.5 opacity-60">Test Tap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NFC WRITER TAB ─────────────────────────────────────────────────────────────
function NfcWriterTab({ stickers, setStickers }: { stickers: Sticker[], setStickers: (s: Sticker[]) => void }) {
  const [status, setStatus] = useState<"idle"|"scanning"|"success"|"error">("idle");
  const [message, setMessage] = useState("");
  const [currentTool, setCurrentTool] = useState<"write"|"read"|"format"|"lock">("write");

  const runNfcAction = async (slug: string, urlParam: string) => {
    if (!("NDEFReader" in window)) {
      setStatus("error");
      setMessage("Web NFC is strictly hardware! Open Google Chrome on an Android phone, place it against the sticker, and run this action again.");
      return;
    }
    try {
      setStatus("scanning");
      const ndef = new (window as any).NDEFReader();

      if (currentTool === "write") {
        setMessage("Hold phone against tag to WRITE...");
        // Hidden technical detail: It writes VibeTap link mapped to that specific table
        await ndef.write({ records: [{ recordType: "url", data: `https://vibetap.link/m/${slug}` }] });
        setMessage("Successfully wrote mapping to sticker.");
      } else if (currentTool === "format") {
        setMessage("Hold phone against tag to FORMAT...");
        await ndef.write({ records: [{ recordType: "empty" }] });
        setMessage("Sticker successfully formatted and erased.");
      } else if (currentTool === "lock") {
        setMessage("Hold phone against tag to LOCK...");
        // Making tag read-only (Web NFC API command)
        await ndef.makeReadOnly();
        setMessage("Sticker locked permanently. It can no longer be overwritten.");
      } else if (currentTool === "read") {
        setMessage("Hold phone against tag to SCAN...");
        await ndef.scan();
        // Wait for reading event
        const val = await new Promise((resolve) => {
          ndef.onreading = (event: any) => {
            const dataUrl = event.message.records?.[0]?.data;
            resolve(dataUrl || "Empty or Unknown Data");
          };
          setTimeout(() => resolve("Read timeout - moved tag too fast."), 5000);
        });
        setMessage(`Scanned content: ${val}`);
      }
      
      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setMessage(error.message || "Failed. Ensure sticker is close and NOT mathematically locked.");
    }
  };

  const updatePaymentUrl = (id: string, url: string) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, paymentUrl: url } : s));
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Nfc size={24} className="text-purple-400" /> NFC Tool Suite
        </h1>
        <p className="text-gray-500 text-sm mt-1">Configure your destination payment links and burn them directly to your physical stickers.</p>
      </div>

      {status !== "idle" && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
          status === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" :
          "bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse"
        }`}>
          {status === "error" ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> : 
           status === "success" ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : 
           <Smartphone size={20} className="shrink-0 mt-0.5" />}
          <div>
            <p className="font-semibold">{status === "scanning" ? "Scanning Hardware..." : status === "success" ? "Done!" : "Hardware Error"}</p>
            <p className="text-sm opacity-90 mt-1">{message}</p>
          </div>
        </div>
      )}

      {/* Toolbox Tabs */}
              <button 
                onClick={() => runNfcAction(table.slug, table.paymentUrl)}
                disabled={status === "scanning"}
                className={`w-full text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg ${
                  currentTool === "write" ? "bg-purple-600 hover:bg-purple-500 shadow-purple-900/20" :
                  currentTool === "read" ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20" :
                  currentTool === "format" ? "bg-orange-600 hover:bg-orange-500" :
                  "bg-red-600 hover:bg-red-500 shadow-red-900/20"
                }`}
              >
                {currentTool === "write" && <><Nfc size={18} /> Write Mapping</>}
                {currentTool === "read" && <><ScanSearch size={18} /> Scan Tag</>}
                {currentTool === "format" && <><Ban size={18} /> Erase Tag</>}
                {currentTool === "lock" && <><Lock size={18} /> Lock Forever</>}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ stickers, setStickers, ttsLang, setTtsLang }: { stickers: Sticker[], setStickers: (s: Sticker[]) => void, ttsLang: string, setTtsLang: (l: string) => void }) {
  const [storeName, setStoreName] = useState("Demo Kopitiam");
  const [phone, setPhone] = useState("+60 12-345 6789");
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [pin, setPin] = useState("");

  const addSticker = () => {
    if (stickers.length >= 8) return;
    const newId = `s${Date.now().toString().slice(-4)}`;
    setStickers([...stickers, { id: newId, name: `New Table`, slug: `demo-${newId}`, paymentUrl: "" }]);
  };

  const removeSticker = (id: string) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  const updateStickerName = (id: string, name: string) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, name } : s));
  };

  const LANGS = [
    { code: "en-US", name: "English" },
    { code: "ms-MY", name: "Bahasa Melayu" },
    { code: "zh-CN", name: "中文 (Mandarin)" }
  ];

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-white">Merchant Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your store, manage hardware tables, and adjust audio notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Store Info & Voice */}
        <div className="space-y-8">
          {/* Store Profile */}
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Store size={18} className="text-purple-400" /> Store Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Business Name</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Support Phone Number</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Volume2 size={18} className="text-blue-400" /> Voice of Success
            </h2>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              When a payment is marked as verified, your device will automatically announce the received amount out loud to confirm success.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {LANGS.map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => setTtsLang(lang.code)}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold flex items-center justify-between transition-all ${
                    ttsLang === lang.code 
                      ? "bg-blue-500/20 border-blue-500 text-blue-400" 
                      : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {lang.name}
                  {ttsLang === lang.code && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
          </div>
          
          {/* Security (Visual Mock) */}
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <Lock size={18} className={securityEnabled ? "text-green-400" : "text-gray-400"} /> Cashier Security
                </h2>
                <p className="text-xs text-gray-400">Optional: Require a PIN to access these settings.</p>
              </div>
              <button 
                onClick={() => setSecurityEnabled(!securityEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securityEnabled ? 'bg-purple-600' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securityEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {securityEnabled && (
              <div className="pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Access PIN</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    className="w-32 bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors tracking-widest text-center"
                  />
                  <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Save PIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Manage Tables */}
        <div className="space-y-8">
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-6 shadow-lg h-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Nfc size={18} className="text-purple-400" /> Active Tables ({stickers.length}/8)
              </h2>
              {stickers.length < 8 && (
                <button 
                  onClick={addSticker} 
                  className="flex items-center gap-1 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition shadow-lg shadow-purple-900/20"
                >
                  <Plus size={14} /> Add Node
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-6">Manage the logical tables representing your physical NFC stickers.</p>
            
            <div className="space-y-3">
              {stickers.map(sticker => (
                <div key={sticker.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 group hover:border-white/20 transition-all">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Smartphone size={14} className="text-purple-400" />
                  </div>
                  <input 
                    type="text" 
                    value={sticker.name} 
                    onChange={(e) => updateStickerName(sticker.id, e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/5 focus:border-purple-500 px-2 py-1 text-white font-semibold focus:outline-none transition-colors" 
                  />
                  <button 
                    onClick={() => removeSticker(sticker.id)} 
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                    title="Remove Table"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {stickers.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                  <p className="text-sm font-bold text-gray-400">No active tables found.</p>
                  <button onClick={addSticker} className="text-purple-400 text-sm font-semibold mt-2 hover:underline">Create your first table</button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── MAIN DEMO PAGE ───────────────────────────────────────────────────────────
export default function DemoPage() {
  const [tab, setTab] = useState("overview");
  
  // Shared State
  const [stickers, setStickers] = useState<Sticker[]>(INITIAL_STICKERS);
  const [quickAmounts, setQuickAmounts] = useState<number[]>(INITIAL_QUICK_AMOUNTS);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ttsLang, setTtsLang] = useState<string>("en-US");

  // Voice of Success TTS Logic
  const playVoiceOfSuccess = (amount: number, stickerName: string) => {
    if (!('speechSynthesis' in window)) return;
    
    let text = "";
    const dollars = Math.floor(amount);
    const cents = Math.round((amount - dollars) * 100);

    if (ttsLang === "ms-MY") {
      text = `Terima kasih. ${dollars} ringgit ${cents > 0 ? `dan ${cents} sen` : ""} diterima untuk ${stickerName}.`;
    } else if (ttsLang === "zh-CN") {
      text = `收到 ${dollars} 令吉 ${cents > 0 ? `${cents} 仙` : ""}。谢谢！`;
    } else {
      text = `Received ${dollars} ringgit ${cents > 0 ? `and ${cents} cents` : ""} for ${stickerName}.`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsLang;
    utterance.rate = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(ttsLang.split('-')[0]));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  };

  const handleCompletePayment = (amount: number, sticker: Sticker) => {
    setPayments([...payments, { id: Date.now().toString(), stickerId: sticker.name, amount, timestamp: Date.now() }]);
    playVoiceOfSuccess(amount, sticker.name);
  };

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex">
      <Sidebar tab={tab} setTab={setTab} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
          {tab === "overview" && <OverviewTab payments={payments} />}
          {tab === "cashier" && (
            <CashierTab 
              stickers={stickers} setStickers={setStickers}
              quickAmounts={quickAmounts} setQuickAmounts={setQuickAmounts}
              activeSessions={activeSessions} setActiveSessions={setActiveSessions}
              onCompletePayment={handleCompletePayment}
            />
          )}
          {tab === "nfc" && <NfcWriterTab stickers={stickers} setStickers={setStickers} />}
          {tab === "settings" && <SettingsTab stickers={stickers} setStickers={setStickers} ttsLang={ttsLang} setTtsLang={setTtsLang} />}
        </div>
      </main>
    </div>
  );
}
