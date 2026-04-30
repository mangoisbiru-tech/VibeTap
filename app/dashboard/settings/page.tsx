"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
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
  const [plan3Mode, setPlan3Mode] = useState("summing_up"); // 'summing_up' or 'boss_coming'
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
          setPlan3Mode(d.plan3Mode || "summing_up");
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
      await setDoc(doc(db, "merchants", uid), {
        uid, // Ensure uid is set
        name,
        tngPaymentUrl,
        paymentUrl: tngPaymentUrl, // keep backward compat
        staticQrData,
        isActive,
        plan,
        plan3Mode,
        menuItems,
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      console.error("Failed to save settings:", e);
      alert(`Failed to save settings: ${e.message}`);
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
    <div className="space-y-10 max-w-2xl pb-20">
      <div className="relative">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Configure your store, choose your plan, and manage your NFC stickers.
        </p>
      </div>

      {/* ── YOUR NFC URL ── */}
      <div className="glass-card rounded-3xl p-6 space-y-4 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white/50">
        <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.15em] flex items-center gap-2">
          <Nfc size={16} /> Your NFC Sticker URL
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          Copy these URLs exactly into your NFC stickers using the <span className="text-blue-600 font-bold">NFC Writer</span>.
        </p>

        {uid ? (
          <div className="space-y-3">
            {/* Plan 1 URL */}
            <div className="bg-white/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Plan 1 — write this TNG link directly</p>
                <p className="font-mono text-xs text-slate-600 truncate">
                  {tngPaymentUrl || "⚠ Paste your TNG link in Business Info below"}
                </p>
              </div>
            </div>

            {/* Plans 2 & 3 — sticker-specific URLs */}
            <div className="bg-white/60 border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Plans 2 & 3 — unique URL per table</p>
              {stickers.length === 0 ? (
                <p className="text-xs text-slate-300 italic py-2">Add stickers below — each gets its own unique URL</p>
              ) : (
                <div className="space-y-2">
                  {stickers.map((s) => {
                    const url = `${SITE_URL}/s/${s.id}`;
                    return (
                      <div key={s.id} className="flex items-center gap-3 group">
                        <p className="flex-1 font-mono text-[11px] text-slate-500 truncate">{url}</p>
                        <button
                          onClick={() => { navigator.clipboard.writeText(url); setCopiedId(s.id); setTimeout(() => setCopiedId(null), 2000); }}
                          className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl transition-all"
                        >
                          {copiedId === s.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> {s.tableName}</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-10 flex justify-center">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* ── Plan Selector ────────────────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-6 space-y-6">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em]">Choose Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`p-5 rounded-3xl border-2 text-left transition-all ${
                plan === p.id
                  ? "bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10"
                  : "bg-slate-50/50 border-transparent hover:bg-slate-50"
              }`}
            >
              <p className={`font-black text-sm tracking-tight ${plan === p.id ? "text-blue-600" : "text-slate-900"}`}>
                {p.label}
              </p>
              <p className={`text-[10px] mt-1.5 leading-snug font-bold ${plan === p.id ? "text-blue-400" : "text-slate-400"}`}>
                {p.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Plan 3 Behavior Mode Toggle */}
        {plan === "plan3" && (
          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-3xl p-5 animate-in zoom-in-95 duration-300">
            <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4">Plan 3 Customer Experience</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${plan3Mode === "summing_up" ? "border-orange-500 bg-orange-500" : "border-slate-200"}`}>
                  {plan3Mode === "summing_up" && <Check size={14} className="text-white" />}
                </div>
                <input type="radio" className="hidden" checked={plan3Mode === "summing_up"} onChange={() => setPlan3Mode("summing_up")} />
                <div>
                  <p className="text-sm font-black text-slate-900">Boss is summing up... (Recommended)</p>
                  <p className="text-[11px] text-slate-500 font-medium">Customer waits while you push the exact bill.</p>
                </div>
              </label>

              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${plan3Mode === "boss_coming" ? "border-orange-500 bg-orange-500" : "border-slate-200"}`}>
                  {plan3Mode === "boss_coming" && <Check size={14} className="text-white" />}
                </div>
                <input type="radio" className="hidden" checked={plan3Mode === "boss_coming"} onChange={() => setPlan3Mode("boss_coming")} />
                <div>
                  <p className="text-sm font-black text-slate-900">Boss is coming</p>
                  <p className="text-[11px] text-slate-500 font-medium">Customer is just told "Boss is coming".</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Business Info ─────────────────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-6 space-y-6">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em]">Business Info</h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Business Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="e.g. Mamak Ali Kopitiam"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
              TNG Payment URL
              <span className="text-blue-500 font-black">(Plan 1 only)</span>
            </label>
            <input
              type="text"
              value={tngPaymentUrl}
              onChange={(e) => setTngPaymentUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-600 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="https://payment.tngdigital.com.my/sc/..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
              Merchant QR Data
              <span className="text-blue-500 font-black">(Plans 2 & 3 only)</span>
            </label>
            <input
              type="text"
              value={staticQrData}
              onChange={(e) => setStaticQrData(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-600 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
              placeholder="000201010211..."
            />
            <p className="text-[10px] text-slate-400 font-medium px-1">
              Scan your TNG QR code with any scanner to get this data.
            </p>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between py-4 border-t border-slate-100">
          <div>
            <p className="font-black text-sm text-slate-900">Store Active</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Control public availability</p>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`w-14 h-8 rounded-full transition-all relative p-1 ${
              isActive ? "bg-green-500 shadow-md shadow-green-500/20" : "bg-slate-200"
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all transform ${isActive ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* ── Table Management ───────────────────────────────────────── */}
      <div className="glass-card rounded-3xl p-6 space-y-6">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em]">Table Management</h2>
        
        {/* Sticker list */}
        <div className="space-y-3">
          {stickers.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
              <UtensilsCrossed size={32} className="text-slate-100 mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No tables added yet</p>
            </div>
          )}
          {stickers.map((s) => (
            <div key={s.id} className="flex items-center gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 group transition-all hover:bg-white hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                <UtensilsCrossed size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900">{s.tableName}</p>
                <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5 uppercase tracking-tight">ID: {s.id}</p>
              </div>
              <button
                onClick={() => deleteSticker(s.id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new sticker */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSticker()}
            placeholder="Table Name (e.g. Table 1)"
            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            onClick={addSticker}
            disabled={addingSticker || !newTableName.trim()}
            className="bg-slate-900 hover:bg-black disabled:opacity-40 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-black/10 active:scale-95"
          >
            {addingSticker ? <Loader2 size={18} className="animate-spin" /> : "Add Table"}
          </button>
        </div>
      </div>

      {/* ── Save Button ───────────────────────────────────────────────── */}
      <div className="sticky bottom-6 z-10 px-4 sm:px-0">
        <button
          id="save-settings"
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-[#2D5BFF] to-[#00D4FF] text-white py-5 rounded-3xl font-black text-lg tracking-tight shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
        >
          {saving ? (
            <Loader2 size={24} className="animate-spin" />
          ) : saved ? (
            <>
              <Check size={24} className="text-green-300" /> Saved Successfully
            </>
          ) : (
            "Update Store Settings"
          )}
        </button>
      </div>
    </div>
  );
}
