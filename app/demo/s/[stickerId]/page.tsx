"use client";

import { useSearchParams } from "next/navigation";
import { useState, use, Suspense } from "react";
import { ChevronRight, CheckCircle2, Check } from "lucide-react";

function MockCustomerView({ stickerId }: { stickerId: string }) {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "plan2";
  const tableName = searchParams.get("table") || stickerId;
  const merchantName = "Demo Merchant";

  // Mock State for Bill Please
  const [wantsReceipt, setWantsReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // PLAN 2 MOCK UI
  if (plan === "plan2") {
    const amount = 25.5; // Fake amount for demo
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{merchantName}</p>
            <h1 className="text-2xl font-black text-white">{tableName}</h1>
          </div>
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
            <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-3">Amount Due</p>
            <p className="text-6xl font-black text-white tracking-tight">
              RM <span className="text-blue-400">{amount.toFixed(2)}</span>
            </p>
            <p className="text-gray-500 text-xs mt-4">Tap the button below to pay with TNG eWallet</p>
          </div>
          <button
            onClick={() => alert("In the real app, this opens TNG eWallet with the exact amount!")}
            className="w-full bg-gradient-to-r from-[#00AEEF] to-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl"
          >
            PAY RM {amount.toFixed(2)} WITH TNG <ChevronRight size={22} />
          </button>
          <p className="text-center text-xs text-gray-600">
            This is a mock demo. Amount is pre-filled.
          </p>
        </div>
      </div>
    );
  }

  // PLAN 3 MOCK UI
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
            <button
              onClick={() => setWantsReceipt(!wantsReceipt)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                wantsReceipt
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0 ${wantsReceipt ? "bg-orange-500 border-orange-500" : "border-white/20"}`}>
                {wantsReceipt && <Check size={14} className="text-white" />}
              </div>
              <div>
                <p className="font-bold text-white text-sm">I want a receipt</p>
                <p className="text-gray-500 text-xs mt-0.5">Pick it up at the counter</p>
              </div>
            </button>
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => { setLoading(false); setDone(true); }, 1000);
              }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-xl"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Bill Please <ChevronRight size={22} /></>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DemoStickerPage(props: { params: Promise<{ stickerId: string }> }) {
  const params = use(props.params);
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">Loading Demo...</div>}>
      <MockCustomerView stickerId={params.stickerId} />
    </Suspense>
  );
}
