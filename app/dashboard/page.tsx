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
  amount: number;
  status: "paid" | "cleared";
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
    <div className="glass-card rounded-3xl p-6 transition-all hover:translate-y-[-2px] hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-[10px] text-slate-300 mt-1 font-medium">{sub}</div>}
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
      const unsubHist = onSnapshot(histQ, (snap) => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        setHistoryEntries(
          snap.docs
            .map((d) => ({
              amount: d.data().amount ?? 0,
              status: d.data().status,
              createdAt: d.data().createdAt ?? null,
            }))
            .filter((d) => {
              if (!d.createdAt?.toDate) return true;
              return d.createdAt.toDate() >= monthStart;
            })
        );
      }, (err) => {
        console.error("Dashboard history query error:", err);
      });

      return () => {
        unsubSnap();
        unsubHist();
      };
    });
    return () => unsub();
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTaps = merchant?.dailyTaps?.[todayKey] || 0;
  const weekTaps = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reduce((acc, d) => acc + (merchant?.dailyTaps?.[d] || 0), 0);

  // Revenue stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const weekRevenue = historyEntries
    .filter((e) => e.status === "paid" && e.createdAt?.toDate && e.createdAt.toDate() >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthRevenue = historyEntries
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTaps = historyEntries.length;
  const monthPaid = historyEntries.filter((e) => e.status === "paid").length;
  const conversionRate = monthTaps > 0 ? Math.round((monthPaid / monthTaps) * 100) : 0;

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
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Welcome back, <span className="text-blue-600 font-bold">{merchant.name}</span>! Here&apos;s your overview.
        </p>
      </div>

      {/* Chart */}
      <TapChart dailyTaps={merchant.dailyTaps || {}} />

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
            value={(merchant.tapCount || 0).toLocaleString()}
            color="#6C47FF"
            sub={`Since ${merchant.createdAt?.toDate ? merchant.createdAt.toDate().toLocaleDateString("en-MY") : "—"}`}
          />
        </div>
      </div>

      {/* Revenue stats */}
      <div className="space-y-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Revenue</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
