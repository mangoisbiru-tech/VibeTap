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

      // Only fetch entries from last 48 hours
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 48);

      const q = query(
        collection(db, "billHistory"),
        where("merchantId", "==", user.uid),
        where("createdAt", ">=", Timestamp.fromDate(cutoff)),
        orderBy("createdAt", "desc")
      );

      const unsubSnap = onSnapshot(q, (snap) => {
        setEntries(
          snap.docs.map((d) => ({
            id: d.id,
            tableName: d.data().tableName,
            amount: d.data().amount,
            status: d.data().status,
            createdAt: d.data().createdAt ?? null,
          }))
        );
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
        </div>
      </div>

      {/* Entries list */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-purple-400" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-2xl">
            <Clock size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No history yet</p>
            <p className="text-gray-600 text-xs mt-1">
              Mark bills as Done or Clear on the Cashier page to record them here.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                entry.status === "paid"
                  ? "bg-green-500/5 border-green-500/15"
                  : "bg-white/[0.02] border-white/5"
              }`}
            >
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
