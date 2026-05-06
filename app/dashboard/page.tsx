"use client";

import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, query, where, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { TrendingUp, Loader2, MousePointerClick, Calendar, DollarSign, BarChart3, X } from "lucide-react";

interface MerchantData {
  name: string; slug: string; paymentUrl: string; tapCount: number;
  dailyTaps: Record<string, number>; isActive: boolean; fixedAmount: number | null;
  createdAt: { toDate?: () => Date } | null; planTier?: "free" | "lite" | "basic" | "pro";
}
type HistoryEntry = { id: string; amount: number; status: "paid" | "cleared" | "pending"; createdAt: Timestamp | null; };
type Period = "daily" | "weekly" | "monthly" | "yearly" | "custom";

function getRange(period: Period, customStart: string, customEnd: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(); end.setHours(23, 59, 59, 999);
  if (period === "daily") { const s = new Date(); s.setHours(0,0,0,0); return { start: s, end }; }
  if (period === "weekly") { const s = new Date(); s.setDate(s.getDate() - 6); s.setHours(0,0,0,0); return { start: s, end }; }
  if (period === "monthly") { const s = new Date(now.getFullYear(), now.getMonth(), 1); return { start: s, end }; }
  if (period === "yearly") { const s = new Date(now.getFullYear(), 0, 1); return { start: s, end }; }
  const s = customStart ? new Date(customStart + "T00:00:00") : new Date(now.getFullYear(), now.getMonth(), 1);
  const e = customEnd ? new Date(customEnd + "T23:59:59") : end;
  return { start: s, end: e };
}

function FilterBar({ period, onPeriod, customStart, customEnd, onCustomStart, onCustomEnd, onClear }:
  { period: Period; onPeriod: (p: Period) => void; customStart: string; customEnd: string; onCustomStart: (v: string) => void; onCustomEnd: (v: string) => void; onClear: () => void; }) {
  const tabs: { key: Period; label: string }[] = [
    { key: "daily", label: "Daily" }, { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" }, { key: "yearly", label: "Yearly" }, { key: "custom", label: "Custom" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5 p-1 bg-white/30 backdrop-blur-md rounded-2xl border border-white/40">
        {tabs.map(t => (
          <button key={t.key} onClick={() => onPeriod(t.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${period === t.key ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-slate-500 hover:bg-white/40"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {period === "custom" && (
        <div className="flex items-center gap-2 bg-white/30 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/40">
          <input type="date" value={customStart} onChange={e => onCustomStart(e.target.value)}
            className="text-xs bg-transparent rounded-xl px-2 py-1 font-medium text-slate-700 focus:outline-none" />
          <span className="text-slate-400 text-[10px] font-bold">TO</span>
          <input type="date" value={customEnd} onChange={e => onCustomEnd(e.target.value)}
            className="text-xs bg-transparent rounded-xl px-2 py-1 font-medium text-slate-700 focus:outline-none" />
        </div>
      )}
      <button onClick={() => { console.log("Clearing filters..."); onClear(); }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-600 hover:bg-red-500/20 active:scale-95 border border-red-500/20 backdrop-blur-sm transition-all ml-auto">
        <X size={12} strokeWidth={3} /> Clear
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; }) {
  return (
    <div className="glass-card rounded-[2.5rem] p-8 transition-all hover:translate-y-[-2px] hover:shadow-2xl border-none">
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-md" style={{ background: `${color}33`, color: color }}>{icon}</div>
      </div>
      <div className="text-4xl font-extrabold text-slate-900 tracking-tighter mb-1">{value}</div>
      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-2 font-semibold uppercase tracking-widest">{sub}</div>}
    </div>
  );
}

function TapChart({ dailyTaps, period, customStart, customEnd }: { dailyTaps: Record<string, number>; period: Period; customStart: string; customEnd: string; }) {
  const days = useMemo(() => {
    if (period === "yearly") {
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setMonth(i, 1); return d.toISOString().slice(0, 7);
      });
    }
    let count = period === "daily" ? 1 : period === "weekly" ? 7 : period === "monthly" ? 30 : 7;
    if (period === "custom" && customStart && customEnd) {
      const diff = Math.ceil((new Date(customEnd).getTime() - new Date(customStart).getTime()) / 86400000) + 1;
      count = Math.min(diff, 60);
    }
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (count - 1 - i)); return d.toISOString().slice(0, 10);
    });
  }, [period, customStart, customEnd]);

  const values = days.map(d => {
    if (period === "yearly") {
      return Object.entries(dailyTaps).filter(([k]) => k.startsWith(d)).reduce((s, [, v]) => s + v, 0);
    }
    return dailyTaps[d] || 0;
  });
  const max = Math.max(...values, 1);

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><TrendingUp size={16} className="text-blue-500" /></div>
        <h3 className="font-bold text-sm text-slate-800">Tap Activity</h3>
      </div>
      <div className="flex items-end gap-1 h-28 overflow-x-auto">
        {days.map((day, i) => {
          const count = values[i];
          const height = (count / max) * 100;
          const todayKey = new Date().toISOString().slice(0, 10);
          const isToday = day === todayKey || (period === "yearly" && day === new Date().toISOString().slice(0, 7));
          const label = period === "yearly"
            ? new Date(day + "-01").toLocaleDateString("en-MY", { month: "short" })
            : period === "monthly" || period === "custom"
            ? new Date(day + "T00:00:00").toLocaleDateString("en-MY", { day: "numeric" })
            : new Date(day + "T00:00:00").toLocaleDateString("en-MY", { weekday: "short" });
          return (
            <div key={day} className="flex-1 min-w-[24px] flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: "96px" }}>
                <div className="w-full rounded-t-xl transition-all duration-700 ease-out"
                  style={{ height: `${Math.max(height, 5)}%`, background: isToday ? "linear-gradient(to top, #2D5BFF, #00D4FF)" : "rgba(37,99,235,0.08)" }}
                  title={`${count} taps`} />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isToday ? "text-blue-600" : "text-slate-300"}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  // Separate filter states for each section
  const [tapPeriod, setTapPeriod] = useState<Period>("weekly");
  const [tapCustomStart, setTapCustomStart] = useState("");
  const [tapCustomEnd, setTapCustomEnd] = useState("");

  const [revPeriod, setRevPeriod] = useState<Period>("monthly");
  const [revCustomStart, setRevCustomStart] = useState("");
  const [revCustomEnd, setRevCustomEnd] = useState("");

  const [actPeriod, setActPeriod] = useState<Period>("weekly");
  const [actCustomStart, setActCustomStart] = useState("");
  const [actCustomEnd, setActCustomEnd] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const merchantRef = doc(db, "merchants", user.uid);
      const unsubSnap = onSnapshot(merchantRef, (snap) => { if (snap.exists()) setMerchant(snap.data() as MerchantData); });
      const histQ = query(collection(db, "billHistory"), where("merchantId", "==", user.uid));
      const receivedQ = query(collection(db, "receivedPayments"), where("merchantId", "==", user.uid));
      const unsubHist = onSnapshot(histQ, (snap) => {
        const newHist = snap.docs.map(d => ({ id: d.id, amount: d.data().amount ?? 0, status: d.data().status, createdAt: d.data().createdAt ?? null }));
        setHistoryEntries(prev => { const others = prev.filter(p => !newHist.some(n => n.id === p.id)); return [...others, ...newHist]; });
      });
      const unsubReceived = onSnapshot(receivedQ, (snap) => {
        const newReceived = snap.docs.map(d => ({ id: d.id, amount: d.data().amount ?? 0, status: d.data().status === "pending" ? "paid" : d.data().status, createdAt: d.data().receivedAt ?? null })).filter(d => d.status !== "cancelled");
        setHistoryEntries(prev => { const others = prev.filter(p => !newReceived.some(n => n.id === p.id)); return [...others, ...newReceived]; });
      });
      return () => { unsubSnap(); unsubHist(); unsubReceived(); };
    });
    return () => unsub();
  }, []);

  const mergedDailyTaps: Record<string, number> = { ...(merchant?.dailyTaps || {}) };
  historyEntries.forEach(entry => {
    if (entry.createdAt?.toDate) {
      const day = entry.createdAt.toDate().toISOString().slice(0, 10);
      mergedDailyTaps[day] = Math.max(mergedDailyTaps[day] || 0, (mergedDailyTaps[day] || 0) + 0);
    }
  });

  // NFC Taps computed values
  const tapRange = getRange(tapPeriod, tapCustomStart, tapCustomEnd);
  const tapDays = Object.entries(mergedDailyTaps).filter(([k]) => {
    const d = new Date(k + "T00:00:00"); return d >= tapRange.start && d <= tapRange.end;
  });
  const tapCount = tapDays.reduce((s, [, v]) => s + v, 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTaps = mergedDailyTaps[todayKey] || 0;
  const allTimeTaps = Math.max(merchant?.tapCount || 0, historyEntries.length);

  // Revenue computed values
  const revRange = getRange(revPeriod, revCustomStart, revCustomEnd);
  const revEntries = historyEntries.filter(e => e.createdAt?.toDate && e.createdAt.toDate() >= revRange.start && e.createdAt.toDate() <= revRange.end);
  const revTotal = revEntries.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const revPaid = revEntries.filter(e => e.status === "paid").length;
  const revConversion = revEntries.length > 0 ? Math.round((revPaid / revEntries.length) * 100) : 0;
  const allTimeRevenue = historyEntries.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0);

  const periodLabel = (p: Period) => ({ daily: "Today", weekly: "This Week", monthly: "This Month", yearly: "This Year", custom: "Custom Range" }[p]);

  if (!merchant) return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Welcome back, <span className="text-blue-600 font-bold">{merchant.name}</span></p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold uppercase tracking-wider shadow-sm
          ${(!merchant.planTier || merchant.planTier === "free") ? "bg-slate-100 border-slate-200 text-slate-500"
          : merchant.planTier === "pro" ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 border-yellow-400/50"
          : "bg-blue-50 border-blue-200 text-blue-700"}`}>
          {(!merchant.planTier || merchant.planTier === "free") ? "Free Account (Locked)" : `${merchant.planTier} Account`}
        </div>
      </div>

      {/* Tap Activity Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Tap Activity</p>
        </div>
        <FilterBar period={actPeriod} onPeriod={setActPeriod} customStart={actCustomStart} customEnd={actCustomEnd}
          onCustomStart={setActCustomStart} onCustomEnd={setActCustomEnd}
          onClear={() => { setActPeriod("weekly"); setActCustomStart(""); setActCustomEnd(""); }} />
        <TapChart dailyTaps={mergedDailyTaps} period={actPeriod} customStart={actCustomStart} customEnd={actCustomEnd} />
      </div>

      {/* NFC Taps */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">NFC Taps</p>
        </div>
        <FilterBar period={tapPeriod} onPeriod={setTapPeriod} customStart={tapCustomStart} customEnd={tapCustomEnd}
          onCustomStart={setTapCustomStart} onCustomEnd={setTapCustomEnd}
          onClear={() => { setTapPeriod("weekly"); setTapCustomStart(""); setTapCustomEnd(""); }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={<MousePointerClick size={20} />} label="Today's Taps" value={todayTaps} color="#00D4FF" />
          <StatCard icon={<Calendar size={20} />} label={periodLabel(tapPeriod)} value={tapCount} color="#2D5BFF" />
          <StatCard icon={<TrendingUp size={20} />} label="All Time" value={allTimeTaps.toLocaleString()} color="#6C47FF"
            sub={`Since ${merchant.createdAt?.toDate ? merchant.createdAt.toDate().toLocaleDateString("en-MY") : "—"}`} />
        </div>
      </div>

      {/* Revenue Report */}
      <div className="space-y-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Revenue Report</p>
        <FilterBar period={revPeriod} onPeriod={setRevPeriod} customStart={revCustomStart} customEnd={revCustomEnd}
          onCustomStart={setRevCustomStart} onCustomEnd={setRevCustomEnd}
          onClear={() => { setRevPeriod("monthly"); setRevCustomStart(""); setRevCustomEnd(""); }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatCard icon={<DollarSign size={20} />} label={periodLabel(revPeriod)} value={`RM ${revTotal.toFixed(2)}`} color="#10b981" />
          <StatCard icon={<BarChart3 size={20} />} label="All Time Revenue" value={`RM ${allTimeRevenue.toFixed(2)}`} color="#2D5BFF" />
          <StatCard icon={<TrendingUp size={20} />} label="Conversion Rate" value={`${revConversion}%`}
            sub={`${revPaid} paid / ${revEntries.length} taps`} color="#f59e0b" />
        </div>
      </div>
    </div>
  );
}
