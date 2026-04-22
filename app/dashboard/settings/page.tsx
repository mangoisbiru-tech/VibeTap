"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { Settings, Loader2, CheckCircle2, Link } from "lucide-react";

export default function SettingsPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [merchantData, setMerchantData] = useState<{
    name: string;
    slug: string;
    paymentUrl: string;
    isActive: boolean;
  } | null>(null);
  const [name, setName] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setUid(user.uid);
      const unsubSnap = onSnapshot(doc(db, "merchants", user.uid), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setMerchantData(d as typeof merchantData extends null ? never : typeof merchantData);
          setName(d.name || "");
          setPaymentUrl(d.paymentUrl || "");
          setIsActive(d.isActive ?? true);
        }
      });
      return unsubSnap;
    });
    return () => unsub();
  }, []);

  async function handleSave() {
    if (!uid) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "merchants", uid), {
        name,
        paymentUrl,
        isActive,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (!merchantData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings size={22} className="text-purple-400" /> Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage your merchant profile and NFC settings</p>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Payment URL</label>
          <div className="relative">
            <input
              id="settings-payment-url"
              type="url"
              value={paymentUrl}
              onChange={(e) => setPaymentUrl(e.target.value)}
              placeholder="Paste TNG / DuitNow / GrabPay link here"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
            />
            <Link size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your NFC Slug</label>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-purple-300">
            /m/{merchantData.slug}
          </div>
          <p className="text-xs text-gray-600 mt-1">Slug is permanent after creation</p>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-300">Sticker Active</p>
            <p className="text-xs text-gray-600">Disable to temporarily stop redirects</p>
          </div>
          <button
            id="toggle-active"
            onClick={() => setIsActive(!isActive)}
            className={`relative w-12 h-6 rounded-full transition-all ${isActive ? "bg-purple-500" : "bg-white/10"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        <button
          id="save-settings"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#6C47FF] to-[#7C5CFF] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle2 size={16} /> Saved!</>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}
