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
} from "lucide-react";
import PaymentFlash from "./PaymentFlash";

interface MerchantData {
  name: string;
  plan?: string;
  plan3Mode?: "summing_up" | "fixed";
  fixedAmount: number | null;
}

interface BillRequest {
  id: string;
  stickerId: string;
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

interface ReceivedPayment {
  id: string;
  amount: number;
  receivedAt: any;
  status: "pending" | "assigned";
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
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [receivedPayments, setReceivedPayments] = useState<ReceivedPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<ReceivedPayment | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setMerchantId(user.uid);
      
      const mRef = doc(db, "merchants", user.uid);
      const unsubSnap = onSnapshot(mRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as MerchantData;
          setMerchant(data);
          setPlan(data.plan || "plan1");
          setPlan3Mode(data.plan3Mode || "summing_up");
        }
      });

      const qReq = query(
        collection(db, "billRequests"),
        where("merchantId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubReqs = onSnapshot(qReq, (snap) => {
        setBillRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BillRequest)));
      });

      const qStickers = query(
        collection(db, "stickers"),
        where("merchantId", "==", user.uid)
      );
      const unsubStickers = onSnapshot(qStickers, (snap) => {
        setStickers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sticker)));
      });

      const qPayments = query(
        collection(db, "receivedPayments"),
        where("merchantId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubPayments = onSnapshot(qPayments, (snap) => {
        setReceivedPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReceivedPayment)));
      });

      return () => {
        unsubSnap();
        unsubReqs();
        unsubStickers();
        unsubPayments();
      };
    });
    return () => unsub();
  }, []);

  const rawCents = parseInt(amount);
  const amountRM = rawCents / 100;

  function pressDigit(digit: string) {
    if (amount === "0") {
      if (digit === "00" || digit === "0") return;
      setAmount(digit);
    } else {
      if (amount.length >= 7) return; 
      setAmount(amount + digit);
    }
  }

  function pressBackspace() {
    if (amount === "0") return;
    if (amount.length <= 1) {
      setAmount("0");
    } else {
      setAmount(amount.slice(0, -1));
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

  async function handleAssignToSticker(stickerId: string) {
    // If we have a selected payment from the inbox, it means the table JUST PAID.
    // So we CLEAR the table and mark the payment as assigned.
    
    let assignAmount = amountRM;
    let paymentToClose: string | null = null;

    if (selectedPayment) {
      assignAmount = selectedPayment.amount;
      paymentToClose = selectedPayment.id;
    }

    // Validation
    if (!paymentToClose && assignAmount === 0) return;

    setLoading(true);
    try {
      if (paymentToClose) {
        // SCENARIO A: Assigning a real payment from Inbox
        // 1. Clear the sticker's bill (it's paid!)
        await updateDoc(doc(db, "stickers", stickerId), {
          pushedBill: null,
        });

        // 2. Mark the payment document as assigned
        await updateDoc(doc(db, "receivedPayments", paymentToClose), {
          status: "assigned",
          assignedTo: stickerId,
          assignedAt: serverTimestamp()
        });

        // 3. Add to bill history
        await addDoc(collection(db, "billHistory"), {
          merchantId: auth.currentUser?.uid,
          tableName: stickers.find(s => s.id === stickerId)?.tableName || "Unknown",
          amount: assignAmount,
          status: "paid",
          createdAt: serverTimestamp(),
        });

        setSelectedPayment(null);
      } else {
        // SCENARIO B: Manual push (no payment selected)
        await updateDoc(doc(db, "stickers", stickerId), {
          pushedBill: {
            amount: assignAmount,
            pushedAt: serverTimestamp(),
          },
        });
        setAmount("0");
      }
      
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
      await updateDoc(doc(db, "stickers", req.stickerId), {
        pushedBill: {
          amount: amountRM,
          pushedAt: serverTimestamp(),
        },
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

  async function handleDismissPayment(id: string) {
    try {
      await updateDoc(doc(db, "receivedPayments", id), { status: "cancelled" });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      {merchantId && <PaymentFlash merchantId={merchantId} />}
      <div className="max-w-6xl mx-auto pb-20 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* ── LEFT COLUMN: Input & Amount ─────────────────────────────────── */}
        <div className="space-y-10 lg:pt-4">
          {/* Amount Display */}
          <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-8 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Total Amount to Collect</p>
            <div className="flex items-start gap-3">
              <span className="text-3xl font-black text-slate-950 mt-4">RM</span>
              <span className="text-8xl md:text-9xl font-black text-slate-950 tracking-tighter tabular-nums leading-none">
                {amountRM.toFixed(2)}
              </span>
            </div>
            {merchant?.fixedAmount && (
              <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                <Zap size={12} className="fill-white" /> Active Tap Enabled
              </div>
            )}
          </div>

          {/* Numpad */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00"].map((digit) => (
                <button
                  key={digit}
                  onClick={() => pressDigit(digit)}
                  className="h-20 rounded-3xl bg-white border-4 border-slate-950 hover:bg-slate-50 text-slate-950 font-black text-4xl transition-all active:scale-90 shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={pressBackspace}
                className="h-20 rounded-3xl bg-amber-50 border-4 border-slate-950 hover:bg-amber-100 text-slate-950 font-black text-3xl transition-all active:scale-90 shadow-sm flex items-center justify-center"
              >
                ⌫
              </button>
              <button
                onClick={pressClear}
                className="col-span-3 h-16 rounded-2xl bg-white border-4 border-red-600 hover:bg-red-50 text-red-600 font-black text-xl uppercase tracking-widest transition-all active:scale-95 shadow-sm"
              >
                Clear Amount
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleClearAmount}
                disabled={loading || !merchant?.fixedAmount}
                className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-950 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
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
        </div>

        {/* ── RIGHT COLUMN: Actions & Tables ──────────────────────────────── */}
        <div className="space-y-12 lg:pt-4">
          
          {/* Money Received Inbox (The "Ding Ding" List) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Received Payments (Inbox)</p>
              {receivedPayments.length > 0 && (
                <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                  {receivedPayments.length} Pending
                </span>
              )}
            </div>

            {receivedPayments.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200">
                <Zap size={40} className="text-slate-200 mb-4" />
                <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest text-center">No unassigned payments.<br/>Waiting for TNG Ding...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {receivedPayments.sort((a,b) => b.receivedAt?.seconds - a.receivedAt?.seconds).map((pay) => (
                  <button 
                    key={pay.id} 
                    onClick={() => setSelectedPayment(selectedPayment?.id === pay.id ? null : pay)}
                    className={`group relative bg-white border-4 rounded-[2.5rem] p-6 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 ${
                      selectedPayment?.id === pay.id ? 'border-green-500 ring-4 ring-green-100 shadow-2xl' : 'border-slate-950 shadow-xl'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 transition-colors ${
                      selectedPayment?.id === pay.id ? 'bg-green-500 text-white' : 'bg-slate-950 text-white'
                    }`}>
                      <Zap size={28} className={selectedPayment?.id === pay.id ? 'fill-white' : ''} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-black text-slate-950 text-2xl tracking-tighter leading-none">
                        RM {pay.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {pay.receivedAt?.toDate 
                          ? pay.receivedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          : 'Just Now'}
                      </p>
                    </div>
                    {selectedPayment?.id === pay.id ? (
                      <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        Selected
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDismissPayment(pay.id); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        ×
                      </button>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {selectedPayment && (
              <div className="bg-green-50 border-4 border-green-500 rounded-3xl p-6 animate-bounce shadow-lg">
                <p className="text-green-700 font-black text-xs uppercase tracking-widest text-center">
                  👉 Click a table below to assign RM {selectedPayment.amount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Incoming Requests Section */}
          {(plan === "plan3" || plan === "plan2") && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Incoming Requests</p>
                {billRequests.length > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                    {billRequests.length} New
                  </span>
                )}
              </div>

              {billRequests.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200">
                  <Bell size={40} className="text-slate-300 mb-4" />
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No Incoming Taps</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billRequests.map((req) => (
                    <div key={req.id} className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-xl">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shrink-0">
                        <Bell size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-950 text-xl truncate tracking-tight">{req.tableName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
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
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:translate-y-1"
                          >
                            Push RM {amountRM.toFixed(2)}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBossComingDone(req)}
                            className="bg-slate-950 hover:bg-black text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:translate-y-1"
                          >
                            Done
                          </button>
                        )}
                        <button
                          onClick={() => handleClearRequest(req)}
                          className="text-red-500 hover:bg-red-50 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
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

          {/* Tables / Stickers Grid */}
          {(plan === "plan2" || plan === "plan3") && (
            <div className="space-y-6 pt-4 border-t-4 border-slate-50">
              <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black px-2">All Tables / Active Bills</p>
              <div className="grid grid-cols-2 gap-4">
                {stickers.map((s) => (
                  <div key={s.id} className="relative">
                    <button
                      onClick={() => handleAssignToSticker(s.id)}
                      disabled={loading || (rawCents === 0 && !s.pushedBill)}
                      className={`w-full p-8 rounded-[2.5rem] border-4 border-slate-950 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                        s.pushedBill ? "bg-blue-50 border-blue-600 shadow-blue-900/10" : "bg-white"
                      } ${loading ? "opacity-50" : ""}`}
                    >
                      <Table size={28} className={s.pushedBill ? "text-blue-600" : "text-slate-950"} />
                      <p className="font-black text-slate-950 text-xl truncate w-full px-2 text-center tracking-tight">{s.tableName}</p>
                      {s.pushedBill ? (
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
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
                        className="absolute -top-3 -right-3 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white hover:bg-red-700 transition-all active:scale-90 z-10"
                        title="Clear Bill"
                      >
                        <span className="text-xl font-black">×</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {merchantId && <PaymentFlash merchantId={merchantId} />}

        {/* Diagnosis Sticker */}
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.5)',
          color: '#666',
          fontSize: '10px',
          padding: '4px 8px',
          borderRadius: '4px',
          zIndex: 100,
          pointerEvents: 'none',
          fontFamily: 'monospace'
        }}>
          DEBUG ID: {merchantId || 'NOT LOGGED IN'}
        </div>

      </div>
      </div>
    </>
  );
}
