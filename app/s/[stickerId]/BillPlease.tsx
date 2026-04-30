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
  plan3Mode,
}: {
  stickerId: string;
  merchantId: string;
  merchantName: string;
  tableName: string;
  plan3Mode: string;
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">{merchantName}</p>
          <h1 className="text-2xl font-black text-slate-900">{tableName}</h1>
        </div>

        {done ? (
          <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
            {plan3Mode === "summing_up" ? (
              <>
                <div className="flex justify-center items-center h-24 mb-2 space-x-3">
                  <div className="w-4 h-4 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-4 h-4 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-4 h-4 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Summing up...</h2>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-green-100 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Requested!</h2>
              </>
            )}
            
            <p className="text-slate-600 text-sm leading-relaxed mt-4">
              {plan3Mode === "summing_up"
                ? "Your boss is calculating the total. Please wait a moment."
                : "Your boss has been notified. They will come to your table shortly."}
              <br /><br />
              {wantsReceipt && "Please pick up your receipt at the front counter."}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white/60 backdrop-blur-md border border-orange-200/50 rounded-3xl p-6 text-center shadow-sm">
              <p className="text-slate-500 text-sm mb-1">Ready to pay?</p>
              <p className="text-xl font-black text-slate-900">Request your bill</p>
              <p className="text-slate-500 text-xs mt-2">
                Your boss will be notified immediately
              </p>
            </div>

            {/* Receipt toggle */}
            <button
              onClick={() => setWantsReceipt(!wantsReceipt)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left shadow-sm ${
                wantsReceipt
                  ? "bg-orange-100 border-orange-300"
                  : "bg-white/60 border-orange-200/50 hover:bg-white/80"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  wantsReceipt
                    ? "bg-orange-500 border-orange-500"
                    : "border-slate-300 bg-white"
                }`}
              >
                {wantsReceipt && <Check size={14} className="text-white" />}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Click this if you need a receipt</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Please pick it up at the front counter
                </p>
              </div>
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center bg-red-100 border border-red-200 rounded-xl px-4 py-3">
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
