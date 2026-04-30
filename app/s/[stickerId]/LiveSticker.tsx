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
        // Play notification sound when bill arrives
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

  // If the merchant switched to Plan 1 while the page was open, render a manual button
  if (activePlan === "plan1") {
    const url = merchant.tngPaymentUrl || merchant.paymentUrl;
    if (url) {
      return (
        <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 text-center">
          <a href={url} className="bg-blue-600 px-8 py-4 rounded-xl font-bold text-white text-lg w-full max-w-sm block">
            Open TNG App
          </a>
        </div>
      );
    }
  }

  if (activePlan === "plan2") {
    const amount = sticker.pushedBill?.amount as number | undefined;
    if (!amount || amount <= 0) {
      return (
        <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl animate-pulse">⏳</span>
          </div>
          <h1 className="text-2xl font-black mb-2">{sticker.tableName}</h1>
          <p className="text-gray-400">{merchant.name}</p>
          <p className="text-gray-500 text-sm mt-4">Your bill is being prepared...</p>
          <p className="text-gray-600 text-xs mt-2">Please ask your server to send the bill.</p>
        </div>
      );
    }
    return (
      <ShowBill
        merchantName={merchant.name}
        tableName={sticker.tableName}
        amount={amount}
        staticQrData={merchant.staticQrData || ""}
        tngPaymentUrl={merchant.tngPaymentUrl || merchant.paymentUrl || ""}
      />
    );
  }

  // PLAN 3
  const amount = sticker.pushedBill?.amount as number | undefined;

  // If we are in "summing_up" mode and the boss has pushed an amount, transition to ShowBill
  if (plan3Mode === "summing_up" && amount && amount > 0) {
    return (
      <ShowBill
        merchantName={merchant.name}
        tableName={sticker.tableName}
        amount={amount}
        staticQrData={merchant.staticQrData || ""}
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
