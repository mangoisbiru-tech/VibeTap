"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

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
  const [dismissTimer, setDismissTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(async () => {
    setVisible(false);
    if (dismissTimer) clearTimeout(dismissTimer);
    // Mark as cleared in Firestore so it doesn't re-trigger on page reload
    try {
      await updateDoc(doc(db, "paymentConfirmations", merchantId), {
        status: "cleared",
      });
    } catch (e) {
      console.error("Failed to clear payment confirmation:", e);
    }
  }, [merchantId, dismissTimer]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "paymentConfirmations", merchantId),
      (snap) => {
        console.log("PaymentFlash: Data received for " + merchantId, snap.data());
        if (!snap.exists()) {
          console.log("PaymentFlash: Document does not exist");
          return;
        }
        const data = snap.data() as PaymentConfirmation;

        if (data.status === "confirmed") {
          console.log("PaymentFlash: TRIGGERING FLASH! RM " + data.lastPaid);
          setFlash(data);
          setVisible(true);

          // Auto-dismiss after 12 seconds
          const timer = setTimeout(() => {
            dismiss();
          }, 12000);
          setDismissTimer(timer);
        }
      }
    );

    return () => {
      unsubscribe();
      if (dismissTimer) clearTimeout(dismissTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  if (!visible || !flash) return null;

  const amount = flash.lastPaid?.toFixed(2) ?? "0.00";
  const paidTime = flash.paidAt?.toDate
    ? flash.paidAt.toDate().toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <div
      className="payment-flash-overlay"
      onClick={dismiss}
      role="dialog"
      aria-label="Payment confirmed"
    >
      {/* Scanline effect */}
      <div className="scanlines" aria-hidden="true" />

      {/* Pulsing glow rings */}
      <div className="glow-ring ring-1" aria-hidden="true" />
      <div className="glow-ring ring-2" aria-hidden="true" />

      <div className="flash-content">
        {/* Status label */}
        <p className="flash-label">PAYMENT RECEIVED</p>

        {/* Checkmark */}
        <div className="flash-check">✓</div>

        {/* Amount */}
        <div className="flash-amount-row">
          <span className="flash-currency">RM</span>
          <span className="flash-amount">{amount}</span>
        </div>

        {/* Time */}
        {paidTime && <p className="flash-time">{paidTime}</p>}

        {/* Dismiss hint */}
        <p className="flash-dismiss">TAP ANYWHERE TO DISMISS</p>
      </div>

      <style>{`
        .payment-flash-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          animation: flashIn 0.3s ease-out forwards;
          overflow: hidden;
        }

        @keyframes flashIn {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* CRT scanlines */
        .scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 80, 0.03) 2px,
            rgba(0, 255, 80, 0.03) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Pulsing concentric glow rings */
        .glow-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(0, 255, 80, 0.15);
          animation: ringPulse 2s ease-out infinite;
          pointer-events: none;
        }
        .ring-1 {
          width: 500px; height: 500px;
          animation-delay: 0s;
        }
        .ring-2 {
          width: 700px; height: 700px;
          animation-delay: 0.5s;
        }
        @keyframes ringPulse {
          0%   { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .flash-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          padding: 40px;
        }

        .flash-label {
          font-family: 'Courier New', 'Lucida Console', monospace;
          font-size: clamp(12px, 2vw, 18px);
          font-weight: 900;
          letter-spacing: 0.4em;
          color: #00ff50;
          text-shadow: 0 0 20px #00ff50, 0 0 40px #00ff50;
          animation: ledFlicker 3s ease-in-out infinite;
        }

        .flash-check {
          font-size: clamp(80px, 15vw, 160px);
          line-height: 1;
          color: #00ff50;
          text-shadow:
            0 0 30px #00ff50,
            0 0 60px #00ff50,
            0 0 120px rgba(0, 255, 80, 0.5);
          animation: checkBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                     ledFlicker 3s ease-in-out 0.6s infinite;
        }

        @keyframes checkBounce {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        .flash-amount-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          line-height: 1;
        }

        .flash-currency {
          font-family: 'Courier New', 'Lucida Console', monospace;
          font-size: clamp(32px, 6vw, 64px);
          font-weight: 900;
          color: #00ff50;
          text-shadow: 0 0 20px #00ff50, 0 0 40px #00ff50;
          padding-top: 8px;
        }

        .flash-amount {
          font-family: 'Courier New', 'Lucida Console', monospace;
          font-size: clamp(80px, 18vw, 200px);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #00ff50;
          text-shadow:
            0 0 40px #00ff50,
            0 0 80px #00ff50,
            0 0 160px rgba(0, 255, 80, 0.4);
          animation: ledFlicker 3s ease-in-out infinite;
        }

        .flash-time {
          font-family: 'Courier New', 'Lucida Console', monospace;
          font-size: clamp(14px, 2.5vw, 22px);
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(0, 255, 80, 0.6);
          text-shadow: 0 0 10px rgba(0, 255, 80, 0.4);
        }

        .flash-dismiss {
          font-family: 'Courier New', 'Lucida Console', monospace;
          font-size: clamp(10px, 1.5vw, 14px);
          font-weight: 700;
          letter-spacing: 0.3em;
          color: rgba(0, 255, 80, 0.35);
          margin-top: 24px;
          animation: blinkSlow 2s ease-in-out infinite;
        }

        /* Subtle LED flicker */
        @keyframes ledFlicker {
          0%, 94%, 96%, 98%, 100% { opacity: 1; }
          95%  { opacity: 0.85; }
          97%  { opacity: 0.92; }
          99%  { opacity: 0.88; }
        }

        @keyframes blinkSlow {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
