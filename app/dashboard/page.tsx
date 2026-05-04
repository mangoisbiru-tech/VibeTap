"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  TrendingUp,
  Loader2,
  MousePointerClick,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface MerchantData {
  name: string;
  slug: string;
  paymentUrl: string;
  tapCount: number;
  dailyTaps: Record<string, number>;
  isActive: boolean;
  fixedAmount: number | null;
  createdAt: { toDate?: () => Date } | null;
}

type HistoryEntry = {
  id: string;
  amount: number;
  status: "paid" | "cleared" | "pending";
  createdAt: Timestamp | null;
};

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="glass-card rounded-[2.5rem] p-8 transition-all hover:translate-y-[-2px] hover:shadow-xl border-2 border-slate-100 hover:border-blue-500">
      <div className="flex items-start justify-between mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: color, color: '#fff' }}
        >
          {icon}
        </div>
      </div>
      <div className="text-4xl font-black text-slate-950 tracking-tighter mb-1">{value}</div>
      <div className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em]">{label}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">{sub}</div>}
    </div>
  );
}

function TapChart({ dailyTaps }: { dailyTaps: Record<string, number> }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const max = Math.max(...days.map((d) => dailyTaps[d] || 0), 1);

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <TrendingUp size={16} className="text-blue-500" />
        </div>
        <h3 className="font-bold text-sm text-slate-800">Tap Activity — Last 7 Days</h3>
      </div>
      <div className="flex items-end gap-2 h-28">
        {days.map((day) => {
          const count = dailyTaps[day] || 0;
          const height = max > 0 ? (count / max) * 100 : 0;
          const dayLabel = new Date(day + "T00:00:00").toLocaleDateString("en-MY", {
            weekday: "short",
          });
          const isToday = day === new Date().toISOString().slice(0, 10);
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: "96px" }}>
                <div
                  className="w-full rounded-t-xl transition-all duration-700 ease-out"
                  style={{
                    height: `${Math.max(height, 5)}%`,
                    background: isToday
                      ? "linear-gradient(to top, #2D5BFF, #00D4FF)"
                      : "rgba(37, 99, 235, 0.08)",
                  }}
                  title={`${count} taps`}
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-blue-600" : "text-slate-300"}`}>
                {dayLabel}
              </span>
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      // Merchant data
      const merchantRef = doc(db, "merchants", user.uid);
      const unsubSnap = onSnapshot(merchantRef, (snap) => {
        if (snap.exists()) {
          setMerchant(snap.data() as MerchantData);
        }
      });

      // Revenue history (query by merchantId only, filter month in JS)
      const histQ = query(
        collection(db, "billHistory"),
        where("merchantId", "==", user.uid)
      );
      
      const receivedQ = query(
        collection(db, "receivedPayments"),
        where("merchantId", "==", user.uid)
      );

      const unsubHist = onSnapshot(histQ, (snap) => {
        const newHist = snap.docs.map((d) => ({
          id: d.id,
          amount: d.data().amount ?? 0,
          status: d.data().status,
          createdAt: d.data().createdAt ?? null,
        }));
        setHistoryEntries((prev) => {
          // Merge avoiding duplicates by ID, though collections are different
          const others = prev.filter(p => !newHist.some(n => n.id === p.id));
          return [...others, ...newHist];
        });
      });

      const unsubReceived = onSnapshot(receivedQ, (snap) => {
        const newReceived = snap.docs.map((d) => ({
          id: d.id,
          amount: d.data().amount ?? 0,
          status: d.data().status === "pending" ? "paid" : d.data().status, // count pending as paid for revenue
          createdAt: d.data().receivedAt ?? null, // receivedPayments uses receivedAt
        })).filter(d => d.status !== "cancelled"); // ignore cancelled ones (dustbin)

        setHistoryEntries((prev) => {
          const others = prev.filter(p => !newReceived.some(n => n.id === p.id));
          return [...others, ...newReceived];
        });
      });

      return () => {
        unsubSnap();
        unsubHist();
        unsubReceived();
      };
    });
    return () => unsub();
  }, []);

  // Merge merchant.dailyTaps with data derived from historyEntries to ensure consistency
  const mergedDailyTaps: Record<string, number> = { ...(merchant?.dailyTaps || {}) };
  
  // Group history entries by day
  const historyTapsByDay: Record<string, number> = {};
  historyEntries.forEach(entry => {
    if (entry.createdAt?.toDate) {
      const day = entry.createdAt.toDate().toISOString().slice(0, 10);
      historyTapsByDay[day] = (historyTapsByDay[day] || 0) + 1;
    }
  });

  // Ensure mergedDailyTaps is at least as high as history counts
  Object.entries(historyTapsByDay).forEach(([day, count]) => {
    mergedDailyTaps[day] = Math.max(mergedDailyTaps[day] || 0, count);
  });

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTaps = mergedDailyTaps[todayKey] || 0;
  const weekTaps = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reduce((acc, d) => acc + (mergedDailyTaps[d] || 0), 0);

  // Revenue stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const thisMonthEntries = historyEntries.filter((e) => e.createdAt?.toDate && e.createdAt.toDate() >= monthStart);

  const weekRevenue = historyEntries
    .filter((e) => e.status === "paid" && e.createdAt?.toDate && e.createdAt.toDate() >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthRevenue = thisMonthEntries
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTaps = thisMonthEntries.length;
  const monthPaid = thisMonthEntries.filter((e) => e.status === "paid").length;
  const conversionRate = monthTaps > 0 ? Math.round((monthPaid / monthTaps) * 100) : 0;

  // Calculate "All Time" taps by merging merchant.tapCount with total history entries
  // but taking the max to avoid double counting if possible.
  // Actually, merchant.tapCount should ideally be the total, but we can't easily merge 
  // without knowing how many history entries are already in tapCount.
  // For now, let's just make sure allTimeTaps is at least historyEntries.length.
  const allTimeTaps = Math.max(merchant?.tapCount || 0, historyEntries.length);

  if (!merchant) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="relative">
        <h1 className="text-4xl font-black text-slate-950 tracking-tight">Overview</h1>
        <p className="text-slate-950 text-sm mt-1 font-bold">
          Welcome back, <span className="text-blue-600">{merchant.name}</span>
        </p>
      </div>

      {/* Chart */}
      <TapChart dailyTaps={mergedDailyTaps} />

      {/* Tap stats */}
      <div className="space-y-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">NFC Taps</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<MousePointerClick size={20} />}
            label="Today's Taps"
            value={todayTaps}
            color="#00D4FF"
          />
          <StatCard
            icon={<Calendar size={20} />}
            label="This Week"
            value={weekTaps}
            color="#2D5BFF"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="All Time"
            value={allTimeTaps.toLocaleString()}
            color="#6C47FF"
            sub={`Since ${merchant.createdAt?.toDate ? merchant.createdAt.toDate().toLocaleDateString("en-MY") : "—"}`}
          />
        </div>
      </div>

      {/* Revenue stats */}
      <div className="space-y-4">
        <p className="text-[10px] text-slate-950 uppercase tracking-[0.3em] font-black">Revenue Report</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatCard
            icon={<DollarSign size={20} />}
            label="This Week"
            value={`RM ${weekRevenue.toFixed(2)}`}
            color="#10b981"
          />
          <StatCard
            icon={<BarChart3 size={20} />}
            label="This Month"
            value={`RM ${monthRevenue.toFixed(2)}`}
            color="#2D5BFF"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Conversion Rate"
            value={`${conversionRate}%`}
            sub={`${monthPaid} paid / ${monthTaps} taps`}
            color="#f59e0b"
          />
        </div>
      </div>
    </div>
  );
}
