"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  Settings,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  UtensilsCrossed,
  ExternalLink,
  Zap,
  Copy,
  Check,
  Nfc,
} from "lucide-react";

type MenuItem = { name: string; price: number };
type Sticker = {
  id: string;
  tableName: string;
  plan: "plan1" | "plan2" | "plan3";
};

const SITE_URL = "https://vibe-tap-kpk2-one.vercel.app";

const PLANS = [
  {
    id: "plan1",
    label: "Plan 1 — Direct TNG",
    desc: "Sticker opens TNG directly. Customer types amount.",
    color: "purple",
  },
  {
    id: "plan2",
    label: "Plan 2 — Show Bill",
    desc: "You push the bill from Cashier. Customer sees RM amount, pays with TNG.",
    color: "blue",
  },
  {
    id: "plan3",
    label: "Plan 3 — Bill Please",
    desc: "Customer requests the bill. You get notified in Cashier.",
    color: "orange",
  },
] as const;

export default function SettingsPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tngPaymentUrl, setTngPaymentUrl] = useState("");
  const [staticQrData, setStaticQrData] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [plan, setPlan] = useState<"plan1" | "plan2" | "plan3">("plan1");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [addingSticker, setAddingSticker] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setUid(user.uid);

      // Listen to merchant doc
      const unsubMerchant = onSnapshot(doc(db, "merchants", user.uid), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setName(d.name || "");
          setSlug(d.slug || null);
          setTngPaymentUrl(d.tngPaymentUrl || d.paymentUrl || "");
          setStaticQrData(d.staticQrData || "");
          setIsActive(d.isActive ?? true);
          setPlan(d.plan || "plan1");
          setMenuItems(d.menuItems || []);
        }
      });

      // Listen to stickers
      const stickersQ = query(
        collection(db, "stickers"),
        where("merchantId", "==", user.uid)
      );
      const unsubStickers = onSnapshot(stickersQ, (snap) => {
        setStickers(
          snap.docs.map((d) => ({
            id: d.id,
            tableName: d.data().tableName,
            plan: d.data().plan,
          }))
        );
      });

      return () => {
        unsubMerchant();
        unsubStickers();
      };
    });
    return () => unsub();
  }, []);

  async function handleSave() {
    if (!uid) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "merchants", uid), {
        name,
        tngPaymentUrl,
        paymentUrl: tngPaymentUrl, // keep backward compat
        staticQrData,
        isActive,
        plan,
        menuItems,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function addSticker() {
    if (!uid || !newTableName.trim()) return;
    setAddingSticker(true);
    try {
      await addDoc(collection(db, "stickers"), {
        merchantId: uid,
        tableName: newTableName.trim(),
        plan,
        pushedBill: null,
        createdAt: serverTimestamp(),
      });
      setNewTableName("");
    } catch (e: any) {
      console.error("Failed to add sticker:", e);
      alert(`Failed to add table: ${e.message}`);
    } finally {
      setAddingSticker(false);
    }
  }

  async function deleteSticker(stickerId: string) {
    await deleteDoc(doc(db, "stickers", stickerId));
  }

  function copyUrl(stickerId: string) {
    const url = `${SITE_URL}/s/${stickerId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(stickerId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const addItem = () => {
    if (menuItems.length >= 8) return;
    setMenuItems([...menuItems, { name: "", price: 0 }]);
  };
  const updateItem = (i: number, field: keyof MenuItem, value: string | number) => {
    const n = [...menuItems];
    n[i] = { ...n[i], [field]: value };
    setMenuItems(n);
  };
  const removeItem = (i: number) => setMenuItems(menuItems.filter((_, idx) => idx !== i));

  const planColor = (p: string) =>
    p === "plan1" ? "purple" : p === "plan2" ? "blue" : "orange";

  return (
    <div className="space-y-8 max-w-2xl pb-16">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Settings size={22} className="text-purple-400" /> Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure your store, choose your plan, and manage your NFC stickers.
        </p>
      </div>

      {/* ── YOUR NFC URL ─ shown prominently at the top ──────────────── */}
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-5 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Nfc size={18} className="text-purple-400" /> Your NFC Sticker URL
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          This is the URL to write into your NFC sticker. It is unique to your account.{" "}
          <span className="text-yellow-400 font-semibold">
            Do NOT make up anything — copy it exactly from here.
          </span>
        </p>

        {uid ? (
          <div className="space-y-2">
            {/* Plan 1 URL */}
            <div className="bg-black/40 rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-0.5">Plan 1 — write this TNG link directly</p>
                <p className="font-mono text-xs text-gray-300 truncate">
                  {tngPaymentUrl || "⚠ Paste your TNG link in Business Info below"}
                </p>
              </div>
            </div>

            {/* Plans 2 & 3 — sticker-specific URLs */}
            <div className="bg-black/40 rounded-xl p-3">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">Plans 2 & 3 — unique URL per table (from NFC Stickers below)</p>
              {stickers.length === 0 ? (
                <p className="text-xs text-gray-600 italic">Add stickers below — each gets its own unique URL</p>
              ) : (
                <div className="space-y-1.5">
                  {stickers.map((s) => {
                    const url = `${SITE_URL}/s/${s.id}`;
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <p className="flex-1 font-mono text-xs text-gray-300 truncate">{url}</p>
                        <button
                          onClick={() => { navigator.clipboard.writeText(url); setCopiedId(s.id); setTimeout(() => setCopiedId(null), 2000); }}
                          className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-2 py-1 rounded-lg transition-all"
                        >
                          {copiedId === s.id ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> {s.tableName}</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-black/40 rounded-xl p-3 text-center">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>

      {/* ── Plan Selector ────────────────────────────────────────────── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Choose Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                plan === p.id
                  ? p.color === "purple"
                    ? "bg-purple-500/15 border-purple-500/50"
                    : p.color === "blue"
                    ? "bg-blue-500/15 border-blue-500/50"
                    : "bg-orange-500/15 border-orange-500/50"
                  : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
              }`}
            >
              <p
                className={`font-black text-sm ${
                  plan === p.id
                    ? p.color === "purple"
                      ? "text-purple-300"
                      : p.color === "blue"
                      ? "text-blue-300"
                      : "text-orange-300"
                    : "text-white"
                }`}
              >
                {p.label}
              </p>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Business Info ─────────────────────────────────────────────── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Business Info</h2>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Business Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="e.g. Mamak Ali Kopitiam"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            TNG Payment URL{" "}
            <span className="text-purple-400">(Plan 1 — paste your TNG link here)</span>
          </label>
          <input
            type="text"
            value={tngPaymentUrl}
            onChange={(e) => setTngPaymentUrl(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="https://payment.tngdigital.com.my/sc/..."
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Static QR Data{" "}
            <span className="text-blue-400">(Plans 2 & 3 — paste your TNG Merchant QR Code data)</span>
          </label>
          <input
            type="text"
            value={staticQrData}
            onChange={(e) => setStaticQrData(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="000201010211..."
          />
          <p className="text-[10px] text-gray-600 mt-1">
            Scan your physical TNG/DuitNow QR with a normal QR scanner app (or upload a screenshot) → copy the long code → paste here.
          </p>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between py-3 border-t border-white/5">
          <div>
            <p className="font-semibold text-sm">Store Active</p>
            <p className="text-xs text-gray-500">When off, all stickers redirect to not-found.</p>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`w-12 h-6 rounded-full transition-all relative ${
              isActive ? "bg-green-500" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                isActive ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Menu Items (Plan 2 only) ──────────────────────────────────── */}
      {plan === "plan2" && (
        <div className="bg-white/[0.03] border border-blue-500/20 rounded-2xl p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-blue-400" /> Menu Items
            </h2>
            {menuItems.length < 8 && (
              <button
                onClick={addItem}
                className="flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition"
              >
                <Plus size={14} /> Add
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">Optional — for your reference. Customers don't see this in Plan 2.</p>
          {menuItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
                placeholder="Item name"
                className="flex-1 bg-transparent text-white text-sm focus:outline-none"
              />
              <span className="text-gray-500 text-xs font-bold">RM</span>
              <input
                type="number"
                value={item.price}
                onChange={(e) => updateItem(i, "price", parseFloat(e.target.value) || 0)}
                className="w-20 bg-transparent text-white text-sm text-right focus:outline-none"
              />
              <button onClick={() => removeItem(i)} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Table Management ───────────────────────────────────────── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <UtensilsCrossed size={18} className="text-purple-400" /> Table Management
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Add your tables here (e.g., Table 1, VIP Room). Once created, you can write them to your physical stickers using the <span className="text-white font-semibold">NFC Writer</span> tab on the left.
        </p>

        {/* URL format explainer */}
        <div
          className={`rounded-xl p-4 border text-sm ${
            plan === "plan1"
              ? "bg-purple-500/10 border-purple-500/20 text-purple-300"
              : plan === "plan2"
              ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
              : "bg-orange-500/10 border-orange-500/20 text-orange-300"
          }`}
        >
          {plan === "plan1" ? (
            <>
              <p className="font-bold mb-1">Plan 1: Write your TNG URL directly into the sticker.</p>
              <p className="font-mono text-xs opacity-80">{tngPaymentUrl || "https://payment.tngdigital.com.my/sc/..."}</p>
            </>
          ) : (
            <>
              <p className="font-bold mb-1">Plans 2 & 3: Write each sticker's unique VibeTap URL into the sticker.</p>
              <p className="font-mono text-xs opacity-80">{SITE_URL}/s/{"<sticker-id>"}</p>
            </>
          )}
        </div>

        {/* Sticker list */}
        <div className="space-y-3">
          {stickers.length === 0 && (
            <p className="text-gray-600 text-sm py-4 text-center border-2 border-dashed border-white/5 rounded-xl">
              No tables yet. Add one below.
            </p>
          )}
          {stickers.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">{s.tableName}</p>
                <p className="font-mono text-xs text-gray-500 truncate mt-0.5">
                  {SITE_URL}/s/{s.id}
                </p>
              </div>
              <button
                onClick={() => copyUrl(s.id)}
                className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title="Copy URL"
              >
                {copiedId === s.id ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <button
                onClick={() => deleteSticker(s.id)}
                className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new sticker */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSticker()}
            placeholder="Table name (e.g. Table 3, Counter)"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            onClick={addSticker}
            disabled={addingSticker || !newTableName.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
          >
            {addingSticker ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add
          </button>
        </div>
      </div>

      {/* ── Save Button ───────────────────────────────────────────────── */}
      <button
        id="save-settings"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-[#6C47FF] to-[#00D4FF] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {saving ? (
          <Loader2 size={20} className="animate-spin" />
        ) : saved ? (
          <>
            <CheckCircle2 size={20} className="text-green-300" /> Saved!
          </>
        ) : (
          "Save Settings"
        )}
      </button>
    </div>
  );
}
