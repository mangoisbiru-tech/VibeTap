"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { Nfc, ScanSearch, Settings, AlertCircle, CheckCircle2, Smartphone, Ban, Lock } from "lucide-react";

const SITE_URL = "https://vibe-tap-kpk2-one.vercel.app";

type Sticker = {
  id: string;
  tableName: string;
};

export default function NfcToolPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [plan, setPlan] = useState<"plan1" | "plan2" | "plan3">("plan1");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [stickers, setStickers] = useState<Sticker[]>([]);

  // NFC State
  const [activeTab, setActiveTab] = useState<"read" | "write" | "other">("write");
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [tagInfo, setTagInfo] = useState<any>(null);
  const [isNfcSupported, setIsNfcSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !("NDEFReader" in window)) {
      setIsNfcSupported(false);
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setUid(user.uid);

      // Listen to merchant doc
      const unsubMerchant = onSnapshot(doc(db, "merchants", user.uid), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setPlan(d.plan || "plan1");
          setPaymentUrl(d.tngPaymentUrl || d.paymentUrl || "");
        }
      });

      // Listen to stickers
      const stickersQ = query(collection(db, "stickers"), where("merchantId", "==", user.uid));
      const unsubStickers = onSnapshot(stickersQ, (snap) => {
        setStickers(
          snap.docs.map((d) => ({
            id: d.id,
            tableName: d.data().tableName,
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

  const handleRead = async () => {
    if (!isNfcSupported) {
      setStatus("error"); setMessage("Web NFC requires Google Chrome on Android."); return;
    }
    setStatus("scanning"); setMessage("Hold your phone against the NFC sticker...");
    setTagInfo(null);
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      ndef.onreading = (event: any) => {
        const { serialNumber, message } = event;
        let url = "None or encrypted";
        for (const record of message.records) {
          if (record.recordType === "url") {
            const textDecoder = new TextDecoder(record.encoding || "utf-8");
            url = textDecoder.decode(record.data);
          }
        }
        setTagInfo({ serialNumber, recordCount: message.records.length, url });
        setStatus("success");
        setMessage("Tag read successfully!");
      };
      ndef.onreadingerror = () => {
        setStatus("error"); setMessage("Failed to read tag. Try moving it closer.");
      };
    } catch (err: any) {
      setStatus("error"); setMessage(err?.message || "Please check if NFC is enabled in your phone settings.");
    }
  };

  const handleWrite = async (url: string) => {
    if (!isNfcSupported) {
      setStatus("error"); setMessage("Web NFC requires Google Chrome on Android."); return;
    }
    if (!url) {
      setStatus("error"); setMessage("No URL to write. Please configure your settings first."); return;
    }
    setStatus("scanning"); setMessage("Hold your phone against the NFC sticker to write...");
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({ records: [{ recordType: "url", data: url }] });
      setStatus("success"); setMessage(`Successfully wrote URL to sticker!\n\nWritten: ${url}`);
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      setStatus("error"); setMessage(err?.message || "Write failed. Tag might be locked or incompatible.");
    }
  };

  const handleErase = async () => {
    if (!isNfcSupported) { setStatus("error"); setMessage("Web NFC requires Google Chrome on Android."); return; }
    setStatus("scanning"); setMessage("Hold your phone against the sticker to erase it...");
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({ records: [{ recordType: "empty" }] });
      setStatus("success"); setMessage("Sticker erased. It is now blank and ready to be written again.");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      setStatus("error"); setMessage(err?.message || "Erase failed. Tag may already be locked permanently.");
    }
  };

  const handleLock = async () => {
    if (!isNfcSupported) { setStatus("error"); setMessage("Web NFC requires Google Chrome on Android."); return; }
    setStatus("scanning"); setMessage("Hold your phone against the sticker to lock permanently...");
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.makeReadOnly();
      setStatus("success"); setMessage("Sticker permanently locked. It can never be overwritten again.");
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err: any) {
      setStatus("error"); setMessage(err?.message || "Lock failed. Tag may already be locked or incompatible.");
    }
  };

  const TABS = [
    { id: "read" as const, label: "Read Tag", icon: <ScanSearch size={14} /> },
    { id: "write" as const, label: "Write Tag", icon: <Nfc size={14} /> },
    { id: "other" as const, label: "Other Tools", icon: <Settings size={14} /> },
  ];



  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="relative">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          NFC Tool Suite
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Program physical NFC stickers with your VibeTap URLs using your Android phone.
        </p>
      </div>

      {!isNfcSupported && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center gap-4 text-orange-700 text-sm font-medium shadow-sm">
          <Smartphone size={20} className="shrink-0 text-orange-500" />
          <p>
            <strong className="font-black uppercase text-[10px] tracking-widest block mb-0.5">Android + Chrome Required</strong>
            Web NFC only works in Google Chrome on Android. Open this page there to use these tools.
          </p>
        </div>
      )}

      {/* ── TABS ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => { setActiveTab(tab.id); setStatus("idle"); setTagInfo(null); }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all -mb-px whitespace-nowrap ${
              activeTab === tab.id 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "border-b-2 border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {status !== "idle" && (
        <div className={`p-5 rounded-3xl border flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 ${
          status === "error" 
            ? "bg-red-50 border-red-100 text-red-600" 
            : status === "success" 
            ? "bg-green-50 border-green-100 text-green-600" 
            : "bg-blue-50 border-blue-100 text-blue-600"
        }`}>
          <div className="mt-0.5">
            {status === "error" ? <AlertCircle size={22} /> : status === "success" ? <CheckCircle2 size={22} /> : <Nfc size={22} className="animate-pulse" />}
          </div>
          <div className="flex-1">
            <p className="font-black uppercase text-[10px] tracking-widest mb-1">
              {status === "scanning" ? "NFC Scanner Active" : status === "success" ? "Operation Success" : "Error Occurred"}
            </p>
            <p className="text-sm font-bold leading-relaxed whitespace-pre-line">{message}</p>
          </div>
        </div>
      )}

      {/* READ TAB */}
      {activeTab === "read" && (
        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] p-10 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-100 flex items-center justify-center mb-6 shadow-inner">
              <ScanSearch size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">Read Tag Info</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-sm font-medium leading-relaxed">
              Tap any NFC sticker to reveal its Serial Number, stored content, and record count.
            </p>
            <button 
              onClick={handleRead} 
              disabled={status === "scanning"} 
              className="bg-slate-900 hover:bg-black disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-black/20 active:scale-95 flex items-center gap-2"
            >
              <ScanSearch size={18} /> {status === "scanning" ? "Ready..." : "Scan Tag Now"}
            </button>
          </div>

          {tagInfo && (
            <div className="glass-card rounded-3xl p-6 space-y-5 border-green-100 bg-gradient-to-br from-green-50/30 to-white">
              <h3 className="font-black text-green-600 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] mb-4">
                <CheckCircle2 size={16} /> Tag Information Received
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Serial Number", value: tagInfo.serialNumber || "Unknown" },
                  { label: "Record Count", value: tagInfo.recordCount.toString() },
                ].map((item, i) => (
                  <div key={i} className="bg-white/60 border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">{item.label}</p>
                    <p className="font-mono text-sm text-slate-700 font-bold truncate">{item.value}</p>
                  </div>
                ))}
                <div className="bg-white/60 border border-slate-100 rounded-2xl px-5 py-4 shadow-sm sm:col-span-2">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Stored URL Data</p>
                  <p className="font-mono text-sm text-blue-600 font-bold break-all leading-relaxed">{tagInfo.url}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WRITE TAB */}
      {activeTab === "write" && (
        <div className="space-y-8">
          <div className="glass-card rounded-3xl p-8 space-y-6 bg-gradient-to-br from-blue-50/50 to-white/50 border-blue-100">
            <h3 className="font-black text-blue-600 text-[10px] uppercase tracking-[0.2em]">Writing Guide</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { step: "1", text: "Find the correct URL below (auto-filled from your Settings)." },
                { step: "2", text: "Open this in Chrome on Android (Web NFC only works on Android)." },
                { step: "3", text: 'Click "Write to Tag" on the table you want to program.' },
                { step: "4", text: "Hold the back of your phone against the physical NFC sticker." },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-md shadow-blue-500/20">{step}</div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 tracking-tight">Your Store Tables</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stickers.length} Registered Tables</p>
            </div>

            {stickers.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <p className="text-slate-400 text-sm font-bold">No tables configured yet.</p>
                <p className="text-slate-300 text-xs mt-1 font-medium italic">Go to Settings → Table Management → Add your tables first.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stickers.map(table => {
                const stickerUrl = plan === "plan1" ? paymentUrl : `${SITE_URL}/s/${table.id}`;
                return (
                  <div key={table.id} className="glass-card rounded-3xl p-6 flex flex-col justify-between group transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Nfc size={20} />
                        </div>
                        <h3 className="font-black text-slate-900 text-lg">{table.tableName}</h3>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 group-hover:bg-white transition-colors">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Target URL</p>
                        <p className="font-mono text-[10px] text-blue-500 font-bold truncate">{stickerUrl || "⚠ Missing URL (Check Settings)"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleWrite(stickerUrl)} 
                      disabled={status === "scanning" || !stickerUrl}
                      className="w-full bg-slate-900 hover:bg-black disabled:opacity-40 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Nfc size={16} /> 
                      {!stickerUrl ? "Missing URL" : status === "scanning" ? "Ready..." : `Write to ${table.tableName}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* OTHER TOOLS TAB */}
      {activeTab === "other" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-[2.5rem] p-8 flex flex-col border-orange-100 bg-gradient-to-br from-orange-50/30 to-white">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6"><Ban size={28} className="text-orange-500" /></div>
            <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Erase Tag</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">Wipes all data from the sticker, returning it to a blank factory state. Use this when you wrote the wrong URL.</p>
            <div className="mt-auto">
              <button onClick={handleErase} disabled={status === "scanning"} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2">
                <Ban size={16} /> {status === "scanning" ? "Scanning..." : "Erase Tag Now"}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 flex flex-col border-red-100 bg-gradient-to-br from-red-50/30 to-white">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6"><Lock size={28} className="text-red-500" /></div>
            <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Lock Forever</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">Permanently locks the NFC chip so it can never be overwritten — even by you. Prevents tampering.</p>
            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-8">
              <p className="text-[10px] text-red-600 font-black uppercase tracking-widest leading-normal">⚠ Danger Zone: Once locked, the sticker can NEVER be rewritten or erased.</p>
            </div>
            <div className="mt-auto">
              <button onClick={handleLock} disabled={status === "scanning"} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2">
                <Lock size={16} /> {status === "scanning" ? "Scanning..." : "Lock Tag Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
