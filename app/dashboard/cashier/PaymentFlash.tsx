"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Zap, X } from "lucide-react";

interface PaymentConfirmation {
  lastPaid: number;
  paidAt: any;
  status: "confirmed" | "cleared";
}

interface PaymentFlashProps {
  merchantId: string;
}

export default function PaymentFlash({ merchantId }: PaymentFlashProps) {
  const [flash, setFlash] = useState<PaymentConfirmation | null>(null);
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(async () => {
    setVisible(false);
    // Mark as cleared in Firestore
    try {
      await updateDoc(doc(db, "paymentConfirmations", merchantId), {
        status: "cleared",
      });
    } catch (e) {
      console.error("Failed to clear payment confirmation:", e);
    }
  }, [merchantId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "paymentConfirmations", merchantId),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as PaymentConfirmation;

        if (data.status === "confirmed") {
          setFlash(data);
          setVisible(true);

          // Auto-dismiss after 3 seconds
          const timer = setTimeout(() => {
            setVisible(false);
            // We don't necessarily need to updateDoc here to avoid extra writes 
            // if it just auto-hides visually. But for consistency:
            dismiss();
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    );

    return () => unsubscribe();
  }, [merchantId, dismiss]);

  if (!visible || !flash) return null;

  const amount = flash.lastPaid?.toFixed(2) ?? "0.00";

  return (
    <div className="fixed bottom-8 right-8 z-[9999] animate-in slide-in-from-right-full duration-500">
      <div 
        onClick={dismiss}
        className="bg-slate-950 border-4 border-blue-500 rounded-[2rem] p-6 shadow-2xl flex items-center gap-5 cursor-pointer hover:scale-105 transition-transform group min-w-[320px]"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:animate-bounce">
          <Zap size={32} className="fill-white" />
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Payment Received</p>
          <p className="text-white font-black text-3xl tracking-tighter">RM {amount}</p>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          className="p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* 3s Progress Bar */}
        <div className="absolute bottom-0 left-8 right-8 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-progress" style={{ animationDuration: '3000ms' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation-name: progress;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
