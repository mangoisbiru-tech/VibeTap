"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  Zap,
  Bell,
  Check,
  Loader2,
  Table,
  CheckCircle2,
} from "lucide-react";

interface MerchantData {
  name: string;
  plan?: string;
  plan3Mode?: "summing_up" | "fixed";
  fixedAmount: number | null;
}

interface BillRequest {
  id: string;
  tableName: string;
  wantsReceipt: boolean;
  createdAt: any;
  status: string;
}

interface Sticker {
  id: string;
  tableName: string;
  pushedBill?: { amount: number; pushedAt: any };
}

export default function CashierPage() {
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [billRequests, setBillRequests] = useState<BillRequest[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [plan, setPlan] = useState<string>("plan1");
  const [plan3Mode, setPlan3Mode] = useState<"summing_up" | "fixed">("summing_up");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      
      // Merchant settings
      const mRef = doc(db, "merchants", user.uid);
      const unsubSnap = onSnapshot(mRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as MerchantData;
          setMerchant(data);
          setPlan(data.plan || "plan1");
          setPlan3Mode(data.plan3Mode || "summing_up");
        }
      });

      // Pending bill requests (Plan 3)
      const qReq = query(
        collection(db, "billRequests"),
        where("merchantId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubReqs = onSnapshot(qReq, (snap) => {
        setBillRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BillRequest)));
      });

      // Merchant stickers (Plan 2)
      const qStickers = query(
        collection(db, "stickers"),
        where("merchantId", "==", user.uid)
      );
      const unsubStickers = onSnapshot(qStickers, (snap) => {
        setStickers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sticker)));
      });

      return () => {
        unsubSnap();
        unsubReqs();
        unsubStickers();
      };
    });
    return () => unsub();
  }, []);

  const rawCents = parseInt(amount);
  const amountRM = rawCents / 100;

  function pressDigit(digit: string) {
    if (amount === "0") {
      setAmount(digit);
    } else {
      if (amount.length >= 7) return; 
      setAmount(amount + digit);
    }
  }

  function pressClear() {
    setAmount("0");
  }

  async function handleSetAmount() {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "merchants", auth.currentUser.uid), {
        fixedAmount: amountRM,
        lastTappedAt: null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearAmount() {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "merchants", auth.currentUser.uid), {
        fixedAmount: null,
      });
      setAmount("0");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Plan 2 & 3: Assign manual amount to a table sticker
  async function handleAssignToSticker(stickerId: string) {
    if (rawCents === 0) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "stickers", stickerId), {
        pushedBill: {
          amount: amountRM,
          pushedAt: serverTimestamp(),
        },
      });
      setAmount("0");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearStickerBill(stickerId: string) {
    setLoading(true);
    try {
      await updateDoc(doc(db, "stickers", stickerId), {
        pushedBill: null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePushAndDone(req: BillRequest) {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "merchants", auth.currentUser.uid), {
        fixedAmount: amountRM,
      });
      await updateDoc(doc(db, "billRequests", req.id), {
        status: "pushed",
        amount: amountRM,
      });
      setAmount("0");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBossComingDone(req: BillRequest) {
    setLoading(true);
    try {
      await updateDoc(doc(db, "billRequests", req.id), {
        status: "cleared",
      });
      await addDoc(collection(db, "billHistory"), {
        merchantId: auth.currentUser?.uid,
        tableName: req.tableName,
        amount: 0,
        status: "cleared",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearRequest(req: BillRequest) {
    try {
      await updateDoc(doc(db, "billRequests", req.id), { status: "cancelled" });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* ── Display Section ────────────────────────────────────────────────── */}
      <div className="text-center pt-6">
        <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em] mb-4">Total Amount to Collect</p>
        <div className="relative inline-block">
          <div className="flex items-start justify-center gap-2">
            <span className="text-3xl font-black text-slate-950 mt-4">RM</span>
            <span className="text-8xl md:text-9xl font-black text-slate-950 tracking-tighter tabular-nums">
              {amountRM.toFixed(2)}
            </span>
          </div>
          {merchant?.fixedAmount && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest animate-pulse shadow-lg shadow-blue-500/20">
              <Zap size={14} className="fill-white" /> Currently Active on Sticker
            </div>
          )}
        </div>
      </div>

      {/* ── Numpad Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0"].map((digit) => (
              <button
                key={digit}
                onClick={() => pressDigit(digit)}
                className="h-20 rounded-3xl bg-white border-4 border-slate-950 hover:bg-slate-100 text-slate-950 font-black text-4xl transition-all active:scale-90 shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={pressClear}
              className="h-20 rounded-3xl bg-white border-4 border-red-600 hover:bg-red-50 text-red-600 font-black text-2xl transition-all active:scale-90 shadow-sm"
            >
              CLR
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleClearAmount}
              disabled={loading || !merchant?.fixedAmount}
              className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-30 text-slate-950 py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
            >
              Reset
            </button>
            <button
              id="set-amount-btn"
              onClick={handleSetAmount}
              disabled={loading || rawCents === 0}
              className="flex-[2] bg-slate-950 hover:bg-black disabled:opacity-30 text-white py-5 rounded-3xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : saved ? <Check /> : <Zap className="fill-white" />}
              {saved ? "Activated" : "Activate Tap"}
            </button>
          </div>
        </div>

        {/* ── Action Section (Plan 2: Stickers vs Plan 3: Requests) ─────────── */}
        {/* ── Action Section (Stickers & Requests) ─────────────────────────── */}
        <div className="space-y-8">
          {/* Incoming Requests Section (Plan 3) */}
          {(plan === "plan3" || plan === "plan2") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Incoming Requests</p>
                {billRequests.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg shadow-orange-500/20 animate-bounce">
                    {billRequests.length} New
                  </span>
                )}
              </div>

              {billRequests.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
                  <Bell size={32} className="text-slate-300 mb-2" />
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No New Taps</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billRequests.map((req) => (
                    <div key={req.id} className="bg-white border-4 border-slate-950 rounded-[2rem] p-5 flex items-center gap-4 shadow-xl">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shrink-0">
                        <Bell size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-950 text-lg truncate">{req.tableName}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {req.createdAt?.toDate
                            ? req.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "Just now"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {plan === "plan3" && plan3Mode === "summing_up" ? (
                          <button
                            onClick={() => handlePushAndDone(req)}
                            disabled={loading || rawCents === 0}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                          >
                            Push RM {amountRM.toFixed(2)}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBossComingDone(req)}
                            className="bg-slate-950 hover:bg-black text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                          >
                            Done
                          </button>
                        )}
                        <button
                          onClick={() => handleClearRequest(req)}
                          className="text-red-500 hover:bg-red-50 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tables / Stickers Grid (Plan 2 & 3) */}
          {(plan === "plan2" || plan === "plan3") && (
            <div className="space-y-4 pt-4 border-t-4 border-slate-100">
              <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">All Tables / Active Bills</p>
              <div className="grid grid-cols-2 gap-4">
                {stickers.map((s) => (
                  <div key={s.id} className="relative group">
                    <button
                      onClick={() => handleAssignToSticker(s.id)}
                      disabled={loading || (rawCents === 0 && !s.pushedBill)}
                      className={`w-full p-6 rounded-[2rem] border-4 border-slate-950 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                        s.pushedBill ? "bg-blue-50 border-blue-600" : "bg-white"
                      } ${loading ? "opacity-50" : ""}`}
                    >
                      <Table size={24} className={s.pushedBill ? "text-blue-600" : "text-slate-950"} />
                      <p className="font-black text-slate-950 text-lg truncate w-full px-2 text-center">{s.tableName}</p>
                      {s.pushedBill ? (
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                          RM {s.pushedBill.amount.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {rawCents > 0 ? `Assign RM ${amountRM.toFixed(2)}` : "Empty"}
                        </p>
                      )}
                    </button>
                    {s.pushedBill && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearStickerBill(s.id);
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-700 transition-all active:scale-90 z-10"
                        title="Clear Bill"
                      >
                        <span className="text-xs font-black">×</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
