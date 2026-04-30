"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  TrendingUp,
  Copy,
  ExternalLink,
  CheckCircle2,
  Loader2,
  MousePointerClick,
  QrCode,
  LinkIcon,
  Calendar,
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
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

function TapChart({ dailyTaps }: { dailyTaps: Record<string, number> }) {
  // Get last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const max = Math.max(...days.map((d) => dailyTaps[d] || 0), 1);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={18} className="text-purple-400" />
        <h3 className="font-semibold text-sm">Last 7 Days</h3>
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
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max(height, 3)}%`,
                    background: isToday
                      ? "linear-gradient(to top, #6C47FF, #A78BFA)"
                      : "linear-gradient(to top, #ffffff10, #ffffff20)",
                  }}
                  title={`${count} taps`}
                />
              </div>
              <span className={`text-xs ${isToday ? "text-purple-400 font-medium" : "text-gray-600"}`}>
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const merchantRef = doc(db, "merchants", user.uid);
      const unsubSnap = onSnapshot(merchantRef, (snap) => {
        if (snap.exists()) {
          setMerchant(snap.data() as MerchantData);
        }
      });
      return () => unsubSnap();
    });
    return () => unsub();
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);

  if (!merchant) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {merchant.name}! Here&apos;s your tap overview.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={<MousePointerClick size={18} />}
          label="Today's Taps"
          value={todayTaps}
          color="#6C47FF"
        />
        <StatCard
          icon={<Calendar size={18} />}
          label="This Week"
          value={weekTaps}
          color="#00D4FF"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="All Time Taps"
          value={(merchant.tapCount || 0).toLocaleString()}
          color="#A78BFA"
          sub={`Since ${merchant.createdAt?.toDate ? merchant.createdAt.toDate().toLocaleDateString("en-MY") : "—"}`}
        />
      </div>

      {/* Chart */}
      <TapChart dailyTaps={merchant.dailyTaps || {}} />

    </div>
  );
}
