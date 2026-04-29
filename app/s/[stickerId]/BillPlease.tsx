"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { CheckCircle2, ChevronRight, Check } from "lucide-react";

export default function BillPlease({
  stickerId,
  merchantId,
  merchantName,
  tableName,
}: {
  stickerId: string;
  merchantId: string;
  merchantName: string;
  tableName: string;
}) {
  const [wantsReceipt, setWantsReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = async () => {
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "billRequests"), {
        stickerId,
        merchantId,
        tableName,
        wantsReceipt,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{merchantName}</p>
          <h1 className="text-2xl font-black text-white">{tableName}</h1>
        </div>

        {done ? (
          <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={48} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Bill Requested!</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your boss has been notified.
              <br />
              {wantsReceipt
                ? "Please go to the counter to collect your receipt."
                : "They will come to your table shortly."}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-1">Ready to pay?</p>
              <p className="text-xl font-black text-white">Request your bill</p>
              <p className="text-gray-500 text-xs mt-2">
                Your boss will be notified immediately
              </p>
            </div>

            {/* Receipt toggle */}
            <button
              onClick={() => setWantsReceipt(!wantsReceipt)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                wantsReceipt
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  wantsReceipt
                    ? "bg-orange-500 border-orange-500"
                    : "border-white/20"
                }`}
              >
                {wantsReceipt && <Check size={14} className="text-white" />}
              </div>
              <div>
                <p className="font-bold text-white text-sm">I want a receipt</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Pick it up at the counter
                </p>
              </div>
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              onClick={handleRequest}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all active:scale-95 shadow-xl shadow-orange-500/25 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Bill Please <ChevronRight size={22} />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
