"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LiveSticker from "./LiveSticker";
import { Loader2, AlertCircle } from "lucide-react";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nfceftpos";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getDocument(collection: string, docId: string) {
  const url = `${FIRESTORE_BASE}/${collection}/${docId}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error(`Fetch failed for ${collection}/${docId}:`, res.status, errorData);
    return null;
  }
  const json = await res.json();
  return parseFields(json.fields);
}

function parseFields(fields: Record<string, any>): Record<string, any> {
  if (!fields) return {};
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val.stringValue !== undefined) out[key] = val.stringValue;
    else if (val.integerValue !== undefined) out[key] = Number(val.integerValue);
    else if (val.doubleValue !== undefined) out[key] = val.doubleValue;
    else if (val.booleanValue !== undefined) out[key] = val.booleanValue;
    else if (val.nullValue !== undefined) out[key] = null;
    else if (val.timestampValue !== undefined) out[key] = val.timestampValue;
    else if (val.mapValue !== undefined) out[key] = parseFields(val.mapValue.fields || {});
    else if (val.arrayValue !== undefined)
      out[key] = (val.arrayValue.values || []).map((v: any) => parseFields({ _: v })["_"]);
  }
  return out;
}

export default function StickerPage() {
  const params = useParams();
  const stickerId = params?.stickerId as string;

  const [data, setData] = useState<{ sticker: any; merchant: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stickerId) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const sticker = await getDocument("stickers", stickerId);
        if (!sticker) {
          setError(`Sticker [${stickerId}] not found in database.`);
          setLoading(false);
          return;
        }

        const merchant = await getDocument("merchants", sticker.merchantId);
        if (!merchant) {
          setError(`Merchant [${sticker.merchantId}] linked to this sticker not found.`);
          setLoading(false);
          return;
        }

        if (!merchant.isActive) {
          setError("This merchant is currently inactive.");
          setLoading(false);
          return;
        }

        setData({ sticker, merchant });
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to connect to VibeTap network. Please check your internet.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [stickerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Connecting to VibeTap...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-950 mb-2">Setup Required</h1>
        <p className="text-slate-600 max-w-xs mx-auto leading-relaxed">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 bg-slate-950 text-white px-8 py-3 rounded-xl font-bold transition-transform active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <LiveSticker
      stickerId={stickerId}
      initialSticker={data!.sticker}
      initialMerchant={data!.merchant}
    />
  );
}
