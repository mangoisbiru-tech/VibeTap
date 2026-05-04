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
import { CheckCircle2, XCircle, Clock, Loader2, TrendingUp, Download, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { writeBatch, getDocs, deleteDoc, doc } from "firebase/firestore";

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
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const q = query(
        collection(db, "billHistory"),
        where("merchantId", "==", user.uid)
      );

      const unsubSnap = onSnapshot(q, (snap) => {
        const docs = snap.docs
          .map((d) => ({
            id: d.id,
            tableName: d.data().tableName,
            amount: d.data().amount,
            status: d.data().status,
            createdAt: d.data().createdAt ?? null,
          })) as HistoryEntry[];

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

  async function handleClearHistory() {
    if (!auth.currentUser) return;
    if (!confirm("Are you sure you want to clear all history? This cannot be undone.")) return;

    setClearing(true);
    try {
      const q = query(
        collection(db, "billHistory"),
        where("merchantId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      
      const batch = writeBatch(db);
      snap.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (e) {
      console.error("Failed to clear history:", e);
      alert("Failed to clear history. Please try again.");
    } finally {
      setClearing(false);
    }
  }

  function handleExportPDF() {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("TapPay Transaction Report", 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString("en-MY")}`, 14, 30);
    
    const tableData = entries.map(e => [
      e.createdAt?.toDate ? e.createdAt.toDate().toLocaleDateString("en-MY") : "—",
      e.createdAt?.toDate ? e.createdAt.toDate().toLocaleTimeString("en-MY", { hour: '2-digit', minute: '2-digit' }) : "—",
      e.tableName,
      e.status === "paid" ? `RM ${e.amount.toFixed(2)}` : "RM 0.00",
      e.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Date', 'Time', 'Table', 'Amount', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [45, 91, 255] },
    });

    doc.save(`TapPay_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const paidEntries = entries.filter((e) => e.status === "paid");
  const clearedEntries = entries.filter((e) => e.status === "cleared");
  const totalRevenue = paidEntries.reduce((sum, e) => sum + e.amount, 0);
  const successRate =
    entries.length > 0
      ? Math.round((paidEntries.length / entries.length) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight">History</h1>
          <p className="text-slate-950 text-sm mt-1 font-bold uppercase tracking-widest">
            {entries.length} Record{entries.length !== 1 ? 's' : ''} Found
          </p>
        </div>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm"
              >
                <Download size={14} /> PDF
              </button>
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-red-100 transition-all shadow-sm disabled:opacity-50"
              >
                <Trash2 size={14} /> {clearing ? "..." : "Clear"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="glass-card rounded-[2.5rem] p-8 text-center border-2 border-slate-100">
          <p className="text-4xl font-black text-green-600 tracking-tighter">
            RM {totalRevenue.toFixed(2)}
          </p>
          <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] mt-2">Collected</p>
        </div>
        <div className="glass-card rounded-[2.5rem] p-8 text-center border-2 border-slate-100">
          <p className="text-4xl font-black text-slate-950 tracking-tighter">{entries.length}</p>
          <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] mt-2">Total Taps</p>
        </div>
        <div className="glass-card rounded-[2.5rem] p-8 text-center border-2 border-slate-100">
          <p className="text-4xl font-black text-blue-600 tracking-tighter">{successRate}%</p>
          <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] mt-2">Success Rate</p>
        </div>
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
              <Clock size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No transactions yet</p>
            <p className="text-slate-300 text-xs mt-1">Activity will appear here as soon as customers tap.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-5 hover:bg-slate-50/80 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    entry.status === "paid"
                      ? "bg-green-100 text-green-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {entry.status === "paid" ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-950 truncate uppercase tracking-tight text-lg leading-tight">
                    {entry.tableName}
                  </p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    {entry.status === "paid" ? "Paid via tap" : "Cleared Manual"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-black text-lg tracking-tighter ${
                      entry.status === "paid" ? "text-green-600" : "text-slate-400"
                    }`}
                  >
                    {entry.status === "paid"
                      ? `RM ${entry.amount.toFixed(2)}`
                      : "RM 0.00"}
                  </p>
                  <div className="flex flex-col items-end gap-0.5 mt-0.5">
                    <p className="text-[9px] text-slate-950 font-black uppercase tracking-tighter">
                      {entry.createdAt?.toDate ? entry.createdAt.toDate().toLocaleDateString("en-MY", { day: '2-digit', month: 'short' }) : ""}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {entry.createdAt?.toDate
                        ? entry.createdAt.toDate().toLocaleTimeString("en-MY", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
      {entries.length > 0 && (
        <p className="text-center text-xs text-slate-400 mt-8">
          Historical records are displayed in chronological order.
        </p>
      )}
    </div>
  );
}
