"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { Settings, Loader2, CheckCircle2, Link, Plus, Trash2, UtensilsCrossed, ExternalLink } from "lucide-react";

type MenuItem = { name: string; price: number };

export default function SettingsPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [merchantData, setMerchantData] = useState<{
    name: string;
    slug: string;
    paymentUrl: string;
    isActive: boolean;
    mode?: "redirect" | "menu";
    menuItems?: MenuItem[];
    staticQrData?: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [staticQrData, setStaticQrData] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mode, setMode] = useState<"redirect" | "menu">("redirect");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setUid(user.uid);
      const unsubSnap = onSnapshot(doc(db, "merchants", user.uid), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setMerchantData(d as any);
          setName(d.name || "");
          setPaymentUrl(d.paymentUrl || "");
          setStaticQrData(d.staticQrData || "");
          setIsActive(d.isActive ?? true);
          setMode(d.mode || "redirect");
          setMenuItems(d.menuItems || []);
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
        staticQrData,
        isActive,
        mode,
        menuItems,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const addItem = () => {
    if (menuItems.length >= 5) return;
    setMenuItems([...menuItems, { name: "", price: 0 }]);
  };

  const updateItem = (index: number, field: keyof MenuItem, value: string | number) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuItems(newItems);
  };

  const removeItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

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

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Static QR Data (FOR AUTO-RM AMOUNT)
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
              <Zap size={18} />
            </div>
            <input
              id="static-qr-data"
              type="text"
              value={staticQrData}
              onChange={(e) => setStaticQrData(e.target.value)}
              placeholder="00020101021126..."
              className="w-full bg-[#1A1A24] border border-white/10 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-700"
            />
          </div>
          <p className="text-[10px] text-gray-600 mt-2">
            Paste the 000201... code here. Do NOT put the https:// link here.
          </p>
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

        <div className="pt-4 border-t border-white/5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Merchant Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("redirect")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === "redirect"
                    ? "bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-lg shadow-purple-500/5"
                    : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/[0.08]"
                }`}
              >
                <ExternalLink size={20} className="mb-2" />
                <p className="font-bold text-sm">Simple Redirect</p>
                <p className="text-[10px] opacity-60">Go straight to TNG</p>
              </button>
              <button
                onClick={() => setMode("menu")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === "menu"
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-300 shadow-lg shadow-blue-500/5"
                    : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/[0.08]"
                }`}
              >
                <UtensilsCrossed size={20} className="mb-2" />
                <p className="font-bold text-sm">Mini Menu</p>
                <p className="text-[10px] opacity-60">Customers select items first</p>
              </button>
            </div>
          </div>

          {mode === "menu" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Menu Items ({menuItems.length}/5)</label>
                {menuItems.length < 5 && (
                  <button
                    onClick={addItem}
                    className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-3 items-start group">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(idx, "name", e.target.value)}
                        placeholder="Item name (e.g. Nasi Lemak)"
                        className="w-full bg-transparent border-b border-white/10 text-white text-sm py-1 focus:outline-none focus:border-purple-500/50"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">RM</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-white text-sm font-bold focus:outline-none w-20"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {menuItems.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-gray-600 text-sm">No items added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
