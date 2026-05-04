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
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  Bell,
  Table,
  Zap,
} from "lucide-react";
import PaymentFlash from "./PaymentFlash";

interface MerchantData {
  name: string;
  plan?: string;
  plan3Mode?: "summing_up" | "fixed";
  fixedAmount: number | null;
  presets?: number[];
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

  const handleEditPreset = async (oldVal: number) => {
    if (amountRM <= 0) return;
    if (!merchantId || !merchant) return;
    const currentPresets = merchant.presets || [10, 20, 50];
    const nextPresets = currentPresets.map(p => p === oldVal ? amountRM : p);
    
    await updateDoc(doc(db, "merchants", merchantId), { presets: nextPresets });
  };

  const handleRemovePreset = async (val: number) => {
    if (!merchantId || !merchant) return;
    const currentPresets = merchant.presets || [10, 20, 50];
    const nextPresets = currentPresets.filter(p => p !== val);
    
    await updateDoc(doc(db, "merchants", merchantId), { presets: nextPresets });
  };

  const handleAddPreset = async () => {
    if (amountRM <= 0) return;
    if (!merchantId || !merchant) return;
    const currentPresets = merchant.presets || [10, 20, 50];
    
    // Prevent duplicates
    if (currentPresets.includes(amountRM)) return;
    
    await updateDoc(doc(db, "merchants", merchantId), { 
      presets: [...currentPresets, amountRM] 
    });
  };

  async function handleAssignToSticker(stickerId: string) {
    if (!auth.currentUser) return;
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

        // 3. Add to bill history with DETERMINISTIC ID to prevent double records
        // If we have a paymentToClose (real payment), use its ID as the history ID
        // Otherwise use a time-based ID for manual assignments.
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
        const historyId = paymentToClose || `${auth.currentUser.uid}_${stickerId}_${dateStr}_${timeStr}`;

        await setDoc(doc(db, "billHistory", historyId), {
          merchantId: auth.currentUser.uid,
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
      
      setAmount("0");
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

      // DETERMINISTIC ID for manual clear too
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
      const historyId = `${auth.currentUser?.uid}_${req.stickerId}_clear_${dateStr}_${timeStr}`;

      await setDoc(doc(db, "billHistory", historyId), {
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
      {merchantId && <PaymentFlash merchantId={merchantId} isListening={true} />}
      <div className="max-w-[1600px] mx-auto pb-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-12 items-start">
          {/* ── COLUMN 1: Input & Amount (THE CALCULATOR) ────────────────────────── */}
        <div className="space-y-8 lg:pt-4">
          {/* Amount Display */}
          <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-6 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)] min-h-[160px] flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Total Amount</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-black text-slate-950">RM</span>
              <span className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter tabular-nums leading-tight">
                {amountRM.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Numpad */}
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00"].map((digit) => (
                <button
                  key={digit}
                  onClick={() => pressDigit(digit)}
                  className="h-16 rounded-2xl bg-white border-4 border-slate-950 hover:bg-slate-50 text-slate-950 font-black text-3xl transition-all active:scale-90 shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={pressBackspace}
                className="h-16 rounded-2xl bg-amber-50 border-4 border-slate-950 hover:bg-amber-100 text-slate-950 font-black text-2xl transition-all active:scale-90 shadow-sm flex items-center justify-center"
              >
                ⌫
              </button>
              <button
                onClick={pressClear}
                className="col-span-3 h-14 rounded-xl bg-white border-4 border-red-600 hover:bg-red-50 text-red-600 font-black text-lg uppercase tracking-widest transition-all active:scale-95 shadow-sm"
              >
                Clear Amount
              </button>
            </div>
          </div>
        </div>

        {/* ── COLUMN 2: Money Received & Requests ────────────────────────────── */}
        <div className="space-y-10 lg:pt-4">
          
          {/* Money Received Inbox */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Inbox</p>
              {receivedPayments.length > 0 && (
                <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                  {receivedPayments.length} New
                </span>
              )}
            </div>

            {receivedPayments.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
                <Bell size={32} className="text-slate-200 mb-3" />
                <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest text-center leading-relaxed">No payments yet.<br/>Waiting for TNG Ding...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {receivedPayments.sort((a,b) => b.receivedAt?.seconds - a.receivedAt?.seconds).map((pay) => (
                  <button 
                    key={pay.id} 
                    onClick={() => setSelectedPayment(selectedPayment?.id === pay.id ? null : pay)}
                    className={`group relative bg-white border-4 rounded-3xl p-4 flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 ${
                      selectedPayment?.id === pay.id ? 'border-green-500 ring-4 ring-green-100 shadow-xl' : 'border-slate-950 shadow-lg'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      selectedPayment?.id === pay.id ? 'bg-green-500 text-white' : 'bg-slate-950 text-white'
                    }`}>
                      <Bell size={24} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-black text-slate-950 text-xl tracking-tight leading-none">
                        RM {pay.amount.toFixed(2)}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {pay.receivedAt?.toDate 
                          ? pay.receivedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just Now'}
                      </p>
                    </div>
                    {selectedPayment?.id === pay.id && (
                      <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Requests Section */}
          {(plan === "plan3" || plan === "plan2") && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Table Requests</p>
                {billRequests.length > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                    {billRequests.length} New
                  </span>
                )}
              </div>

              {billRequests.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
                  <Bell size={32} className="text-slate-300 mb-3" />
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No Incoming Taps</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {billRequests.map((req) => (
                    <div key={req.id} className="bg-white border-4 border-slate-950 rounded-3xl p-4 flex items-center gap-4 shadow-lg">
                      <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                        <Bell size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-950 text-lg truncate tracking-tight">{req.tableName}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {plan === "plan3" && plan3Mode === "summing_up" ? (
                          <button
                            onClick={() => handlePushAndDone(req)}
                            disabled={loading || rawCents === 0}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                          >
                            Push RM {amountRM.toFixed(2)}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBossComingDone(req)}
                            className="bg-slate-950 hover:bg-black text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── COLUMN 3: All Tables & Quick RM ─────────────────────────────────── */}
        <div className="space-y-8 lg:pt-4">
          
          {/* Tables Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Tables</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {stickers.map((s) => (
                <div key={s.id} className="relative">
                  <button
                    onClick={() => handleAssignToSticker(s.id)}
                    disabled={loading || (rawCents === 0 && !s.pushedBill)}
                    className={`w-full aspect-square rounded-lg border-4 border-slate-950 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md ${
                      s.pushedBill ? "bg-blue-50 border-blue-600 shadow-blue-900/10" : "bg-white"
                    } ${loading ? "opacity-50" : ""}`}
                  >
                    <p className="font-black text-slate-950 text-xs truncate w-full text-center tracking-tight leading-tight px-1">{s.tableName}</p>
                    {s.pushedBill ? (
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                        RM {s.pushedBill.amount.toFixed(0)}
                      </p>
                    ) : (
                      <p className="text-[8px] font-black text-slate-200 uppercase tracking-widest">
                        Assign
                      </p>
                    )}
                  </button>
                  {s.pushedBill && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearStickerBill(s.id);
                      }}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-700 transition-all active:scale-90 z-10"
                    >
                      <span className="text-base font-black">×</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick RM Section (Excel Style) */}
          <div className="space-y-4 pt-4 border-t-4 border-slate-50">
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] text-slate-950 uppercase tracking-[0.2em] font-black">Quick RM</p>
              <button 
                onClick={handleAddPreset}
                className="text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                + Add
              </button>
            </div>

            <div className="border-4 border-slate-950 bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(2,6,23,1)]">
              {(merchant?.presets || [10, 20, 50]).map((val, idx) => (
                <div key={`${val}-${idx}`} className={`flex items-stretch group ${idx !== 0 ? 'border-t-2 border-slate-950' : ''}`}>
                  <button
                    onClick={() => setAmount((val * 100).toString())}
                    className="flex-1 py-4 text-center hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center gap-4"
                  >
                    <span className="text-2xl font-black text-slate-950">{val}</span>
                  </button>
                  <div className="flex border-l-2 border-slate-950">
                    <button 
                      className="px-3 text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all border-r border-slate-200"
                      onClick={() => handleEditPreset(val)}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button 
                      className="px-3 text-red-200 hover:text-red-500 hover:bg-red-50 transition-all"
                      onClick={() => handleRemovePreset(val)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
