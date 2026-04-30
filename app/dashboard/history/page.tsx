"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { CheckCircle2, XCircle, Clock, Loader2, TrendingUp } from "lucide-react";

type HistoryEntry = {
  id: string;
  tableName: string;
  amount: number;
  status: "paid" | "cleared";
  createdAt: Timestamp | null;
};

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      // Query only by merchantId (no composite index needed)
      const q = query(
        collection(db, "billHistory"),
        where("merchantId", "==", user.uid)
      );

      const unsubSnap = onSnapshot(q, (snap) => {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 48);

        const docs = snap.docs
          .map((d) => ({
            id: d.id,
            tableName: d.data().tableName,
            amount: d.data().amount,
            status: d.data().status,
            createdAt: d.data().createdAt ?? null,
          }))
          .filter((d) => {
            if (!d.createdAt?.toDate) return true; // include docs with no timestamp
            return d.createdAt.toDate() >= cutoff;
          }) as HistoryEntry[];

        docs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setEntries(docs);
        setLoading(false);
      }, (err) => {
        console.error("History query error:", err);
        setLoading(false);
      });

      return () => unsubSnap();
    });
    return () => unsub();
  }, []);

  const paidEntries = entries.filter((e) => e.status === "paid");
  const clearedEntries = entries.filter((e) => e.status === "cleared");
  const totalRevenue = paidEntries.reduce((sum, e) => sum + e.amount, 0);
  const successRate =
    entries.length > 0
      ? Math.round((paidEntries.length / entries.length) * 100)
      : 0;

  function formatTime(ts: Timestamp | null) {
    if (!ts?.toDate) return "—";
    const d = ts.toDate();
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) {
      const diffM = Math.floor((now.getTime() - d.getTime()) / 60000);
      return diffM <= 1 ? "Just now" : `${diffM}m ago`;
    }
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString("en-MY", { month: "short", day: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-black">History</h1>
        <p className="text-gray-500 text-sm mt-1">
          Last 48 hours • Auto-refreshing
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-400">
            RM {totalRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-green-300/70 mt-1 font-medium">Collected</p>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-white">{entries.length}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Total Taps</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-purple-400">{successRate}%</p>
          <p className="text-xs text-purple-300/70 mt-1 font-medium">Success Rate</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transaction History</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Showing successful and cleared taps from the last 48 hours.
        </p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Loading history...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No recent transactions</p>
            <p className="text-slate-300 text-xs mt-1">New activity will appear here in real-time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  entry.status === "paid"
                    ? "bg-green-500/20"
                    : "bg-red-500/10"
                }`}
              >
                {entry.status === "paid" ? (
                  <CheckCircle2 size={16} className="text-green-400" />
                ) : (
                  <XCircle size={16} className="text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">
                  {entry.tableName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {entry.status === "paid" ? "Paid via tap" : "Cancelled / Cash"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`font-black text-sm ${
                    entry.status === "paid" ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {entry.status === "paid"
                    ? `+ RM ${entry.amount.toFixed(2)}`
                    : `RM ${entry.amount.toFixed(2)}`}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {formatTime(entry.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {entries.length > 0 && (
        <p className="text-center text-xs text-gray-700">
          Entries older than 48 hours are automatically removed.
        </p>
      )}
    </div>
  );
}
