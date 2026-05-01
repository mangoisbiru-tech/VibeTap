"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import ShowBill from "./ShowBill";
import BillPlease from "./BillPlease";

export default function LiveSticker({
  stickerId,
  initialSticker,
  initialMerchant,
}: {
  stickerId: string;
  initialSticker: any;
  initialMerchant: any;
}) {
  const [sticker, setSticker] = useState(initialSticker);
  const [merchant, setMerchant] = useState(initialMerchant);
  const [previousAmount, setPreviousAmount] = useState<number>(0);

  useEffect(() => {
    const unsubSticker = onSnapshot(doc(db, "stickers", stickerId), (snap) => {
      if (snap.exists()) setSticker(snap.data());
    });
    const unsubMerchant = onSnapshot(doc(db, "merchants", initialSticker.merchantId), (snap) => {
      if (snap.exists()) setMerchant(snap.data());
    });
    return () => {
      unsubSticker();
      unsubMerchant();
    };
  }, [stickerId, initialSticker.merchantId]);

  const activePlan = merchant.plan || sticker.plan || "plan1";
  const plan3Mode = merchant.plan3Mode || "summing_up";

  useEffect(() => {
    const amount = sticker.pushedBill?.amount || 0;
    if (activePlan === "plan3" && plan3Mode === "summing_up") {
      if (amount > 0 && previousAmount === 0) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const playTone = (freq: number, time: number, duration: number) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, time);
              gain.gain.setValueAtTime(0, time);
              gain.gain.linearRampToValueAtTime(0.5, time + 0.05);
              gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
              osc.start(time);
              osc.stop(time + duration);
            };
            const now = ctx.currentTime;
            playTone(1046.50, now, 0.5); // C6
            playTone(1318.51, now + 0.15, 0.6); // E6
          }
        } catch (e) {
          console.error("Audio playback failed", e);
        }
      }
    }
    setPreviousAmount(amount);
  }, [sticker.pushedBill?.amount, activePlan, plan3Mode, previousAmount]);

  if (activePlan === "plan1") {
    const url = merchant.tngPaymentUrl || merchant.paymentUrl;
    if (url) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm bg-white border-4 border-slate-950 rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(2,6,23,1)]">
            <h1 className="text-2xl font-black text-slate-950 mb-6">Payment Ready</h1>
            <a 
              href={url} 
              className="w-full bg-slate-950 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all active:translate-y-1 active:shadow-none shadow-[0px_6px_0px_0px_rgba(30,41,59,1)]"
            >
              OPEN TNG EWALLET
            </a>
            <p className="text-slate-500 text-xs mt-6 font-bold uppercase tracking-widest">
              Tap above to continue
            </p>
          </div>
        </div>
      );
    }
  }

  const amount = sticker.pushedBill?.amount as number | undefined;

  if (activePlan === "plan2") {
    if (!amount || amount <= 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-white/60 border border-orange-200/50 shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl animate-pulse">⏳</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">{sticker.tableName}</h1>
          <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">{merchant.name}</p>
          <p className="text-slate-600 text-sm mt-4">Your bill is being prepared...</p>
          <p className="text-slate-500 text-xs mt-2">Please ask your server to send the bill.</p>
        </div>
      );
    }
    return (
      <ShowBill
        merchantName={merchant.name}
        tableName={sticker.tableName}
        amount={amount}
        tngPaymentUrl={merchant.tngPaymentUrl || merchant.paymentUrl || ""}
      />
    );
  }

  if (plan3Mode === "summing_up" && amount && amount > 0) {
    return (
      <ShowBill
        merchantName={merchant.name}
        tableName={sticker.tableName}
        amount={amount}
        tngPaymentUrl={merchant.tngPaymentUrl || merchant.paymentUrl || ""}
      />
    );
  }

  return (
    <BillPlease
      stickerId={stickerId}
      merchantId={sticker.merchantId}
      merchantName={merchant.name}
      tableName={sticker.tableName}
      plan3Mode={plan3Mode}
    />
  );
}
