"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  TrendingUp,
  Copy,
  ExternalLink,
  CheckCircle2,
  Loader2,
  MousePointerClick,
  QrCode,
  LinkIcon,
  Calendar,
} from "lucide-react";

interface MerchantData {
  name: string;
  slug: string;
  paymentUrl: string;
  tapCount: number;
  dailyTaps: Record<string, number>;
  isActive: boolean;
  fixedAmount: number | null;
  createdAt: { toDate?: () => Date } | null;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

function TapChart({ dailyTaps }: { dailyTaps: Record<string, number> }) {
  // Get last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const max = Math.max(...days.map((d) => dailyTaps[d] || 0), 1);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={18} className="text-purple-400" />
        <h3 className="font-semibold text-sm">Last 7 Days</h3>
      </div>
      <div className="flex items-end gap-2 h-28">
        {days.map((day) => {
          const count = dailyTaps[day] || 0;
          const height = max > 0 ? (count / max) * 100 : 0;
          const dayLabel = new Date(day + "T00:00:00").toLocaleDateString("en-MY", {
            weekday: "short",
          });
          const isToday = day === new Date().toISOString().slice(0, 10);
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: "96px" }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max(height, 3)}%`,
                    background: isToday
                      ? "linear-gradient(to top, #6C47FF, #A78BFA)"
                      : "linear-gradient(to top, #ffffff10, #ffffff20)",
                  }}
                  title={`${count} taps`}
                />
              </div>
              <span className={`text-xs ${isToday ? "text-purple-400 font-medium" : "text-gray-600"}`}>
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setUid(user.uid);
      const merchantRef = doc(db, "merchants", user.uid);
      const unsubSnap = onSnapshot(merchantRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as MerchantData;
          setMerchant(data);
          setPaymentUrl(data.paymentUrl || "");
        }
      });
      return () => unsubSnap();
    });
    return () => unsub();
  }, []);

  const nfcLink = merchant
    ? `${process.env.NEXT_PUBLIC_APP_URL}/m/${merchant.slug}`
    : "";

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTaps = merchant?.dailyTaps?.[todayKey] || 0;
  const weekTaps = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reduce((acc, d) => acc + (merchant?.dailyTaps?.[d] || 0), 0);

  async function handleSaveLink() {
    if (!uid || !paymentUrl.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "merchants", uid), {
        paymentUrl: paymentUrl.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(nfcLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [nfcLink]);

  if (!merchant) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {merchant.name}! Here&apos;s your tap overview.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={<MousePointerClick size={18} />}
          label="Today's Taps"
          value={todayTaps}
          color="#6C47FF"
        />
        <StatCard
          icon={<Calendar size={18} />}
          label="This Week"
          value={weekTaps}
          color="#00D4FF"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="All Time Taps"
          value={merchant.tapCount.toLocaleString()}
          color="#A78BFA"
          sub={`Since ${merchant.createdAt?.toDate ? merchant.createdAt.toDate().toLocaleDateString("en-MY") : "—"}`}
        />
      </div>

      {/* Chart */}
      <TapChart dailyTaps={merchant.dailyTaps || {}} />

      {/* Payment link section */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
        <div className="flex items-center gap-2 mb-5">
          <LinkIcon size={18} className="text-purple-400" />
          <h2 className="font-semibold">Payment Destination</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Where should customers be redirected when they tap your sticker?
          Paste your TNG / GrabPay / DuitNow link below.
        </p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            id="payment-url-input"
            type="url"
            value={paymentUrl}
            onChange={(e) => setPaymentUrl(e.target.value)}
            placeholder="https://pay.tngdigital.com.my/sc/... or DuitNow QR URL"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
          />
          <button
            id="save-payment-url"
            onClick={handleSaveLink}
            disabled={saving}
            className="bg-gradient-to-r from-[#6C47FF] to-[#7C5CFF] text-white px-6 py-3 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : saveSuccess ? (
              <><CheckCircle2 size={16} /> Saved!</>
            ) : (
              "Save Link"
            )}
          </button>
        </div>

        {merchant.paymentUrl && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 size={14} className="text-green-400" />
            Current:{" "}
            <a
              href={merchant.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline truncate max-w-[300px]"
            >
              {merchant.paymentUrl}
            </a>
          </div>
        )}
      </div>

      {/* NFC link card */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCode size={18} className="text-purple-400" />
          <h2 className="font-semibold">Your NFC Link</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          This is the URL locked into your NFC sticker. Share or program it once.
        </p>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <code className="flex-1 text-sm text-purple-300 font-mono truncate">
            {nfcLink || `Loading...`}
          </code>
          <button
            id="copy-nfc-link"
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors shrink-0"
          >
            {copied ? (
              <CheckCircle2 size={18} className="text-green-400" />
            ) : (
              <Copy size={18} />
            )}
          </button>
          {merchant.paymentUrl && (
            <a
              href={nfcLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors shrink-0"
              title="Test redirect"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          👆 Tap the copy icon and program this URL into your NFC sticker via any NFC writer app.
        </p>
      </div>
    </div>
  );
}
