"use client";

import { useEffect, useState, use } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { notFound, redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import ShowBill from "./ShowBill";
import BillPlease from "./BillPlease";

export default function StickerPage(props: {
  params: Promise<{ stickerId: string }>;
}) {
  const { stickerId } = use(props.params);

  const [loading, setLoading] = useState(true);
  const [sticker, setSticker] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Listen to sticker changes in real-time
    const unsub = onSnapshot(
      doc(db, "stickers", stickerId),
      async (snap) => {
        if (!snap.exists()) {
          setError(true);
          setLoading(false);
          return;
        }
        const sData = snap.data();
        setSticker(sData);

        // Fetch merchant data once (or listen to it if you want real-time merchant updates)
        try {
          const mSnap = await getDoc(doc(db, "merchants", sData.merchantId));
          if (!mSnap.exists() || !mSnap.data().isActive) {
            setError(true);
          } else {
            setMerchant(mSnap.data());
          }
        } catch (e) {
          console.error(e);
          setError(true);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [stickerId]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Not Found</h1>
        <p className="text-gray-400">This sticker is invalid or the merchant is inactive.</p>
      </div>
    );
  }

  if (loading || !sticker || !merchant) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  const { tableName, plan, pushedBill } = sticker;
  const merchantName = merchant.name as string;
  const tngPaymentUrl = (merchant.tngPaymentUrl || merchant.paymentUrl || "") as string;
  const staticQrData = (merchant.staticQrData || "") as string;

  // ── PLAN 1: Direct redirect to TNG
  if (plan === "plan1") {
    if (tngPaymentUrl) {
      window.location.href = tngPaymentUrl;
      return null;
    }
    return <div className="p-6 text-white text-center">No payment URL set by merchant.</div>;
  }

  // ── PLAN 2: Show pre-pushed bill amount
  if (plan === "plan2") {
    const amount = pushedBill?.amount as number | undefined;
    if (!amount || amount <= 0) {
      return (
        <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl animate-pulse">⏳</span>
          </div>
          <h1 className="text-2xl font-black mb-2">{tableName}</h1>
          <p className="text-gray-400">{merchantName}</p>
          <p className="text-gray-500 text-sm mt-4">Your bill is being prepared...</p>
          <p className="text-gray-600 text-xs mt-2">Please ask your server to send the bill.</p>
        </div>
      );
    }

    return (
      <ShowBill
        merchantName={merchantName}
        tableName={tableName}
        amount={amount}
        staticQrData={staticQrData}
        tngPaymentUrl={tngPaymentUrl}
      />
    );
  }

  // ── PLAN 3: Bill Please
  return (
    <BillPlease
      stickerId={stickerId}
      merchantId={sticker.merchantId}
      merchantName={merchantName}
      tableName={tableName}
    />
  );
}
