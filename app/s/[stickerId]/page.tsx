"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import LiveSticker from "./LiveSticker";
import { Loader2 } from "lucide-react";

export default function StickerPage({ params }: { params: any }) {
  const [stickerId, setStickerId] = useState<string | null>(null);
  const [sticker, setSticker] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolveParams() {
      const p = await params;
      setStickerId(p.stickerId);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!stickerId) return;

    async function fetchData() {
      try {
        const sSnap = await getDoc(doc(db, "stickers", stickerId!));
        if (!sSnap.exists()) {
          setError(true);
          return;
        }

        const sData = sSnap.data();
        setSticker(sData);

        const mSnap = await getDoc(doc(db, "merchants", sData.merchantId));
        if (!mSnap.exists()) {
          setError(true);
          return;
        }

        const mData = mSnap.data();
        if (!mData.isActive) {
          setError(true);
          return;
        }

        setMerchant(mData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [stickerId]);

  if (error) return notFound();
  
  if (loading || !sticker || !merchant) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <LiveSticker
      stickerId={stickerId!}
      initialSticker={sticker}
      initialMerchant={merchant}
    />
  );
}
