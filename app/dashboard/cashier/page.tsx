"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  Delete,
  AlertCircle,
  Bell,
  Receipt,
  Nfc,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Sticker = { 
  id: string; 
  tableName: string;
  pushedBill?: { amount: number; pushedAt: any };
};
type BillRequest = {
  id: string;
  stickerId: string;
  tableName: string;
  wantsReceipt: boolean;
  createdAt: any;
};

export default function CashierPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [plan, setPlan] = useState<"plan1" | "plan2" | "plan3">("plan1");
  const [plan3Mode, setPlan3Mode] = useState("summing_up");
  const [rawCents, setRawCents] = useState(0);
  const [input, setInput] = useState("0.00");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [billRequests, setBillRequests] = useState<BillRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);

      const merchantSnap = await getDoc(doc(db, "merchants", user.uid));
      if (merchantSnap.exists()) {
        setPlan(merchantSnap.data().plan || "plan1");
        setPlan3Mode(merchantSnap.data().plan3Mode || "summing_up");
      }

      const stickersQ = query(
        collection(db, "stickers"),
        where("merchantId", "==", user.uid)
      );
      const unsubStickers = onSnapshot(stickersQ, (snap) => {
        setStickers(snap.docs.map((d) => ({ 
          id: d.id, 
          tableName: d.data().tableName,
          pushedBill: d.data().pushedBill
        })));
      });

      const reqQ = query(
        collection(db, "billRequests"),
        where("merchantId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubReqs = onSnapshot(reqQ, (snap) => {
        setBillRequests(
          snap.docs.map((d) => ({
            id: d.id,
            stickerId: d.data().stickerId,
            tableName: d.data().tableName,
            wantsReceipt: d.data().wantsReceipt,
            createdAt: d.data().createdAt,
          }))
        );
      });

      return () => {
        unsubStickers();
        unsubReqs();
      };
    });
    return () => unsub();
  }, []);

  // ── Numpad helpers ───────────────────────────────────────────────────────────
  const formatDisplay = (cents: number) => {
    const r = Math.floor(cents / 100);
    const s = cents % 100;
    return `${r}.${s.toString().padStart(2, "0")}`;
  };
  const pressDigit = (d: string) => {
    if (rawCents >= 9999900) return;
    const n = rawCents * 10 + parseInt(d);
    setRawCents(n);
    setInput(formatDisplay(n));
  };
  const pressBackspace = () => {
    const n = Math.floor(rawCents / 10);
    setRawCents(n);
    setInput(formatDisplay(n));
  };
  const pressClear = () => { setRawCents(0); setInput("0.00"); };
  const pressQuick = (rm: number) => {
    const c = rm * 100;
    setRawCents(c);
    setInput(formatDisplay(c));
  };

  // ── Write a history record ────────────────────────────────────────────────────
  const writeHistory = async (merchantId: string, tableName: string, amount: number, status: "paid" | "cleared") => {
    await addDoc(collection(db, "billHistory"), {
      merchantId,
      tableName,
      amount,
      status,
      createdAt: serverTimestamp(),
    });
  };

  // ── Plan 2: Push bill to a sticker ──────────────────────────────────────────
  const handlePushBill = useCallback(async (stickerId: string, tableName: string) => {
    if (rawCents === 0) { setError("Enter an amount first."); return; }
    setError("");
    setLoading(true);
    try {
      const amount = rawCents / 100;
      await updateDoc(doc(db, "stickers", stickerId), {
        pushedBill: { amount, pushedAt: serverTimestamp() },
      });
      pressClear();
    } catch {
      setError("Failed to push bill.");
    } finally {
      setLoading(false);
    }
  }, [rawCents]);

  // ── Mark active table as PAID (records revenue) ──────────────────────────────
  const handleDoneBill = async (sticker: Sticker) => {
    if (!uid || !sticker.pushedBill) return;
    const amount = sticker.pushedBill.amount;
    try {
      // Primary action: clear table first so UI is responsive
      await updateDoc(doc(db, "stickers", sticker.id), { pushedBill: null });
      // Secondary: attempt to record history
      try {
        await writeHistory(uid, sticker.tableName, amount, "paid");
      } catch (historyErr) {
        console.error("History recording failed:", historyErr);
      }
    } catch (e: any) {
      setError(`Failed to mark as done: ${e.message || "Unknown error"}`);
      console.error(e);
    }
  };

  // ── Clear active table WITHOUT recording revenue ─────────────────────────────
  const handleClearBill = async (sticker: Sticker) => {
    if (!uid || !sticker.pushedBill) return;
    const amount = sticker.pushedBill.amount;
    try {
      await updateDoc(doc(db, "stickers", sticker.id), { pushedBill: null });
      try {
        await writeHistory(uid, sticker.tableName, amount, "cleared");
      } catch (historyErr) {
        console.error("History recording failed:", historyErr);
      }
    } catch (e: any) {
      setError(`Failed to clear bill: ${e.message || "Unknown error"}`);
      console.error(e);
    }
  };

  // ── Plan 3: Push bill + resolve request ─────────────────────────────────────
  const handlePushAndDone = async (req: BillRequest) => {
    if (!uid || rawCents === 0) { setError("Enter an amount first."); return; }
    setLoading(true);
    const amount = rawCents / 100;
    try {
      await updateDoc(doc(db, "stickers", req.stickerId), {
        pushedBill: { amount, pushedAt: serverTimestamp() }
      });
      await deleteDoc(doc(db, "billRequests", req.id));
      try {
        await writeHistory(uid, req.tableName, amount, "paid");
      } catch (historyErr) {
        console.error("History recording failed:", historyErr);
      }
      pressClear();
    } catch (e: any) {
      setError(`Failed to process request: ${e.message || "Unknown error"}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Plan 3 (boss coming): just mark done (no amount) ────────────────────────
  const handleBossComingDone = async (req: BillRequest) => {
    if (!uid) return;
    try {
      await deleteDoc(doc(db, "billRequests", req.id));
    } catch (e: any) {
      setError(`Failed to resolve request: ${e.message || "Unknown error"}`);
      console.error(e);
    }
  };

  // ── Plan 3: clear/cancel a request ──────────────────────────────────────────
  const handleClearRequest = async (req: BillRequest) => {
    if (!uid) return;
    try {
      await deleteDoc(doc(db, "billRequests", req.id));
    } catch (e: any) {
      setError(`Failed to clear request: ${e.message || "Unknown error"}`);
      console.error(e);
    }
  };

  const amountRM = rawCents / 100;
  const QUICK_AMOUNTS = [1, 2, 5, 10, 20, 50];

  return (
    <div className="space-y-6 max-w-sm mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-black">Cashier</h1>
        <p className="text-gray-500 text-sm mt-1">
          {plan === "plan1" && "Plan 1: Customers pay directly via TNG link."}
          {plan === "plan2" && "Plan 2: Enter amount → push to a table."}
          {plan === "plan3" && "Plan 3: Customers send bill requests. You handle payment here."}
        </p>
      </div>

      {/* ── Bill Input (Numpad) ────────────────────────────────────────────────── */}
      {(plan === "plan2" || (plan === "plan3" && plan3Mode === "summing_up")) && (
        <>
          <div className="glass-card rounded-3xl p-8 text-center space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Enter Amount</p>
              <div className="text-6xl font-black text-slate-900 tracking-tighter">
                <span className="text-slate-300 text-3xl align-top mt-2 inline-block mr-1">RM</span>
                {amountRM.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => pressDigit(num.toString())}
                  className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 text-xl font-bold transition-all active:scale-95 shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={clearInput}
                className="h-16 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 font-bold text-sm transition-all active:scale-95 shadow-sm"
              >
                CLR
              </button>
              <button
                onClick={() => pressDigit("0")}
                className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-900 text-xl font-bold transition-all active:scale-95 shadow-sm"
              >
                0
              </button>
              <button
                onClick={pressBackspace}
                className="h-16 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <Delete size={22} className="text-slate-400" />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-4 rounded-2xl animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </>
      )}

      {/* ── Plan 1 ────────────────────────────────────────────────────────────── */}
      {plan === "plan1" && (
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-sm text-blue-900 shadow-sm">
          <p className="font-bold mb-1">Plan 1 — No action needed here</p>
          <p className="text-blue-700/70">The NFC sticker redirects customers directly to TNG. They type the amount themselves.</p>
        </div>
      )}

      {/* ── Active Tables ──────────────────────────────────────────────────────── */}
      {(plan === "plan2" || (plan === "plan3" && plan3Mode === "summing_up")) && (
        <div className="space-y-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Active Tables</p>
          {stickers.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm glass-card border-dashed rounded-3xl">
              No stickers yet. Go to Settings → NFC Stickers to add tables.
            </div>
          )}
          <div className="grid grid-cols-1 gap-3">
            {stickers.map((s) => (
              <div key={s.id} className="flex items-center gap-4 glass-card rounded-2xl p-4 transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Nfc size={20} className="text-blue-500" />
                </div>
                <p className="flex-1 font-bold text-slate-900">{s.tableName}</p>
                {s.pushedBill ? (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-black text-sm mr-2">RM {s.pushedBill.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleDoneBill(s)}
                      className="flex items-center gap-1.5 text-xs font-bold bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl transition-all shadow-sm shadow-green-500/20"
                    >
                      <CheckCircle2 size={14} /> Done
                    </button>
                    <button
                      onClick={() => handleClearBill(s)}
                      className="flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl transition-all"
                    >
                      <XCircle size={14} /> Clear
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePushBill(s.id, s.tableName)}
                    disabled={loading || rawCents === 0}
                    className="text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20"
                  >
                    Push RM {amountRM.toFixed(2)}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bill Requests ──────────────────────────────────────────────────────── */}
      {(plan === "plan3" || billRequests.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black flex-1">Bill Requests</p>
            {billRequests.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                {billRequests.length}
              </span>
            )}
          </div>
          {billRequests.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-3xl border-dashed">
              <Bell size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">No pending bill requests</p>
              <p className="text-slate-300 text-xs mt-1">Customers tap the sticker and hit "Bill Please"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {billRequests.map((req) => (
                <div key={req.id} className="bg-orange-50/50 border border-orange-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Bell size={24} className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 text-lg tracking-tight">{req.tableName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {req.wantsReceipt && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                          <Receipt size={10} /> Receipt
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-400">
                        {req.createdAt?.toDate
                          ? req.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {plan === "plan3" && plan3Mode === "summing_up" ? (
                      <button
                        onClick={() => handlePushAndDone(req)}
                        disabled={loading || rawCents === 0}
                        className="flex items-center gap-1.5 text-xs font-bold bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-green-500/20"
                      >
                        <CheckCircle2 size={15} /> Push RM {amountRM.toFixed(2)}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBossComingDone(req)}
                        <CheckCircle2 size={13} /> Done
                      </button>
                    )}
                    <button
                      onClick={() => handleClearRequest(req)}
                      className="flex items-center gap-1 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1.5 rounded-lg transition-all"
                    >
                      <XCircle size={13} /> Clear
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
