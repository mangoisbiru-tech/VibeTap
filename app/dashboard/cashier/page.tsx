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
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  Zap,
  Delete,
  CheckCircle2,
  Timer,
  AlertCircle,
  Bell,
  Receipt,
  Nfc,
} from "lucide-react";

type Sticker = { id: string; tableName: string };
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
  const [pushedStickerId, setPushedStickerId] = useState<string | null>(null);
  const [pushedAmount, setPushedAmount] = useState<number | null>(null);
  const [billRequests, setBillRequests] = useState<BillRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);

      // Get merchant plan
      const merchantSnap = await getDoc(doc(db, "merchants", user.uid));
      if (merchantSnap.exists()) {
        setPlan(merchantSnap.data().plan || "plan1");
        setPlan3Mode(merchantSnap.data().plan3Mode || "summing_up");
      }

      // Listen to stickers
      const stickersQ = query(
        collection(db, "stickers"),
        where("merchantId", "==", user.uid)
      );
      const unsubStickers = onSnapshot(stickersQ, (snap) => {
        setStickers(snap.docs.map((d) => ({ id: d.id, tableName: d.data().tableName })));
      });

      // Listen to bill requests (plan 3)
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

  // ── Numpad helpers ──────────────────────────────────────────────────────────
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

  // ── Plan 2: Push bill to a sticker ─────────────────────────────────────────
  const handlePushBill = useCallback(async (stickerId: string, tableName: string) => {
    if (rawCents === 0) { setError("Enter an amount first."); return; }
    setError("");
    setLoading(true);
    try {
      const amount = rawCents / 100;
      await updateDoc(doc(db, "stickers", stickerId), {
        pushedBill: { amount, pushedAt: serverTimestamp() },
      });
      setPushedStickerId(stickerId);
      setPushedAmount(amount);
      pressClear();
    } catch {
      setError("Failed to push bill.");
    } finally {
      setLoading(false);
    }
  }, [rawCents]);

  const handleClearBill = async (stickerId: string) => {
    await updateDoc(doc(db, "stickers", stickerId), { pushedBill: null });
    if (pushedStickerId === stickerId) { setPushedStickerId(null); setPushedAmount(null); }
  };

  const handleDoneRequest = async (reqId: string, stickerId?: string) => {
    try {
      // If we are pushing an amount at the same time (summing_up mode)
      if (stickerId && amountRM > 0) {
        await updateDoc(doc(db, "stickers", stickerId), {
          pushedBill: { amount: amountRM, pushedAt: serverTimestamp() }
        });
        setPushedStickerId(stickerId);
        setPushedAmount(amountRM);
        pressClear();
      }
      // Clear the request
      await deleteDoc(doc(db, "billRequests", reqId));
    } catch (e) {
      setError("Failed to process request.");
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

      {/* ── Numpad (Plan 1, Plan 2, and Plan 3 summing_up) ──────────────────────────────────────────────── */}
      {(plan === "plan1" || plan === "plan2" || (plan === "plan3" && plan3Mode === "summing_up")) && (
        <>
          {/* Amount display */}
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Amount (RM)</p>
            <div className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              {amountRM.toFixed(2)}
            </div>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((rm) => (
              <button
                key={rm}
                onClick={() => pressQuick(rm)}
                className="py-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-purple-500/20 hover:border-purple-500/30 text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                RM {rm}
              </button>
            ))}
          </div>

          {/* Numpad */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button key={d} onClick={() => pressDigit(d)}
                  className="h-14 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-xl font-bold transition-all active:scale-95">
                  {d}
                </button>
              ))}
              <button onClick={pressClear}
                className="h-14 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm transition-all active:scale-95">
                CLR
              </button>
              <button onClick={() => pressDigit("0")}
                className="h-14 rounded-xl bg-white/5 hover:bg-white/10 text-xl font-bold transition-all active:scale-95">
                0
              </button>
              <button onClick={pressBackspace}
                className="h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95">
                <Delete size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </>
      )}

      {/* ── Plan 1: No table selection needed ───────────────────────────────── */}
      {plan === "plan1" && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-sm text-purple-300">
          <p className="font-bold mb-1">Plan 1 — No action needed here</p>
          <p className="text-purple-400/70">The NFC sticker redirects customers directly to TNG. They type the amount themselves.</p>
        </div>
      )}

      {/* ── Plan 2: Push Bill to Table ───────────────────────────────────────── */}
      {plan === "plan2" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Push Bill to Table</p>
          {stickers.length === 0 && (
            <div className="text-center py-6 text-gray-600 text-sm border-2 border-dashed border-white/5 rounded-2xl">
              No stickers yet. Go to Settings → NFC Stickers to add tables.
            </div>
          )}
          {stickers.map((s) => (
            <div key={s.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
              <Nfc size={18} className="text-blue-400 flex-shrink-0" />
              <p className="flex-1 font-bold text-white">{s.tableName}</p>
              {pushedStickerId === s.id && pushedAmount ? (
                <>
                  <span className="text-blue-300 font-black text-sm">RM {pushedAmount.toFixed(2)}</span>
                  <button onClick={() => handleClearBill(s.id)}
                    className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg">
                    Clear
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handlePushBill(s.id, s.tableName)}
                  disabled={loading || rawCents === 0}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition-all"
                >
                  Push RM {amountRM.toFixed(2)}
                </button>
              )}
            </div>
          ))}
          {pushedStickerId && pushedAmount && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 size={20} className="text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Bill pushed!</p>
                <p className="text-blue-300 text-xs">Customer will see RM {pushedAmount.toFixed(2)} when they tap the sticker.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Plan 3: Bill Requests ────────────────────────────────────────────── */}
      {plan === "plan3" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold flex-1">Bill Requests</p>
            {billRequests.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {billRequests.length}
              </span>
            )}
          </div>
          {billRequests.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
              <Bell size={28} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No pending bill requests</p>
              <p className="text-gray-600 text-xs mt-1">Customers tap the sticker and hit "Bill Please"</p>
            </div>
          ) : (
            billRequests.map((req) => (
              <div key={req.id} className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-white">{req.tableName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {req.wantsReceipt && (
                      <span className="flex items-center gap-1 text-xs text-orange-300">
                        <Receipt size={12} /> Wants receipt
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {req.createdAt?.toDate
                        ? req.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Just now"}
                    </span>
                  </div>
                </div>
                {plan3Mode === "summing_up" ? (
                  <button
                    onClick={() => handleDoneRequest(req.id, req.stickerId)}
                    disabled={loading || rawCents === 0}
                    className="text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition-all"
                  >
                    Push RM {amountRM.toFixed(2)}
                  </button>
                ) : (
                  <button
                    onClick={() => handleDoneRequest(req.id)}
                    className="text-xs font-bold bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Done
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
