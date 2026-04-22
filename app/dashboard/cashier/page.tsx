"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  Zap,
  Delete,
  CheckCircle2,
  Timer,
  AlertCircle,
} from "lucide-react";

const QUICK_AMOUNTS = [1, 2, 5, 10, 20, 50];
const SESSION_TTL_MINUTES = 5;

export default function CashierPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [input, setInput] = useState("0.00");
  const [rawCents, setRawCents] = useState(0); // store as cents to avoid float issues
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);
      const snap = await getDoc(doc(db, "merchants", user.uid));
      if (snap.exists()) {
        setMerchantId(snap.id);
      }
    });
    return () => unsub();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!sessionActive || !sessionExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((sessionExpiresAt.getTime() - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining === 0) {
        setSessionActive(false);
        setSessionExpiresAt(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, sessionExpiresAt]);

  function formatDisplay(cents: number): string {
    const ringgit = Math.floor(cents / 100);
    const sen = cents % 100;
    return `${ringgit}.${sen.toString().padStart(2, "0")}`;
  }

  function pressDigit(digit: string) {
    if (rawCents >= 9999900) return; // cap at RM 99,999
    const newCents = rawCents * 10 + parseInt(digit);
    setRawCents(newCents);
    setInput(formatDisplay(newCents));
  }

  function pressBackspace() {
    const newCents = Math.floor(rawCents / 10);
    setRawCents(newCents);
    setInput(formatDisplay(newCents));
  }

  function pressClear() {
    setRawCents(0);
    setInput("0.00");
  }

  function pressQuick(rm: number) {
    const cents = rm * 100;
    setRawCents(cents);
    setInput(formatDisplay(cents));
  }

  const handleActivateSession = useCallback(async () => {
    if (!merchantId || rawCents === 0) {
      setError("Please enter an amount greater than RM 0.00");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);
      await addDoc(collection(db, "cashierSessions"), {
        merchantId,
        amount: rawCents / 100, // store as RM float
        amountCents: rawCents,
        used: false,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: Timestamp.now(),
        createdBy: uid,
      });
      setSessionActive(true);
      setSessionExpiresAt(expiresAt);
      setTimeLeft(SESSION_TTL_MINUTES * 60);
    } catch {
      setError("Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [merchantId, rawCents, uid]);

  function handleCancelSession() {
    setSessionActive(false);
    setSessionExpiresAt(null);
    setTimeLeft(0);
    pressClear();
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const amountRM = rawCents / 100;

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <div>
        <h1 className="text-2xl font-black">Cashier Mode</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set the amount — customer taps to pay
        </p>
      </div>

      {/* Active session banner */}
      {sessionActive && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-ping" />
            <span className="text-green-400 font-bold text-lg">Session Active</span>
          </div>
          <p className="text-white text-3xl font-black mb-2">
            RM {amountRM.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <Timer size={16} className="text-yellow-400" />
            <span>
              Expires in{" "}
              <span className={`font-mono font-bold ${timeLeft < 60 ? "text-red-400" : "text-yellow-400"}`}>
                {formatTime(timeLeft)}
              </span>
            </span>
          </div>
          <p className="text-gray-400 text-xs mb-4">
            👋 Ask customer to tap the NFC sticker now. Payment will auto-fill RM {amountRM.toFixed(2)}.
          </p>
          <button
            id="cancel-session"
            onClick={handleCancelSession}
            className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Cancel Session
          </button>
        </div>
      )}

      {/* Amount display */}
      {!sessionActive && (
        <>
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Amount (RM)</p>
            <div className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              {amountRM.toFixed(2)}
            </div>
            {rawCents > 0 && (
              <p className="text-gray-600 text-xs mt-2">
                = {rawCents} sen
              </p>
            )}
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((rm) => (
              <button
                key={rm}
                id={`quick-${rm}`}
                onClick={() => pressQuick(rm)}
                className="py-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-purple-500/20 hover:border-purple-500/30 text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                RM {rm}
              </button>
            ))}
          </div>

          {/* Numpad */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  id={`numpad-${d}`}
                  onClick={() => pressDigit(d)}
                  className="h-14 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-xl font-bold transition-all active:scale-95"
                >
                  {d}
                </button>
              ))}
              <button
                id="numpad-clear"
                onClick={pressClear}
                className="h-14 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm transition-all active:scale-95"
              >
                CLR
              </button>
              <button
                id="numpad-0"
                onClick={() => pressDigit("0")}
                className="h-14 rounded-xl bg-white/5 hover:bg-white/10 text-xl font-bold transition-all active:scale-95"
              >
                0
              </button>
              <button
                id="numpad-backspace"
                onClick={pressBackspace}
                className="h-14 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
              >
                <Delete size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Activate button */}
          <button
            id="activate-session"
            onClick={handleActivateSession}
            disabled={loading || rawCents === 0}
            className="w-full bg-gradient-to-r from-[#6C47FF] to-[#00D4FF] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap size={20} />
                Start RM {amountRM.toFixed(2)} Session
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-600">
            Session lasts {SESSION_TTL_MINUTES} minutes · One use per session
          </p>
        </>
      )}

      {/* Success state */}
      {sessionActive && timeLeft === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 size={48} className="text-green-400 mx-auto mb-3" />
          <p className="font-bold text-lg">Session Completed!</p>
          <p className="text-gray-400 text-sm">Customer has tapped and paid.</p>
          <button
            onClick={pressClear}
            className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
          >
            Start New Session
          </button>
        </div>
      )}
    </div>
  );
}
