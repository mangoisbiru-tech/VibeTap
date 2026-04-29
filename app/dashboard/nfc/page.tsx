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
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Nfc size={24} className="text-purple-400" /> NFC Tool Suite</h1>
        <p className="text-gray-500 text-sm mt-1">Program physical NFC stickers with your VibeTap URLs using your Android phone.</p>
      </div>

      {!isNfcSupported && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-yellow-300 text-sm">
          <Smartphone size={18} className="shrink-0" />
          <p><strong>Android + Chrome required.</strong> Web NFC only works in Google Chrome on Android. Open this page there to use these tools.</p>
        </div>
      )}

      <div className="flex border-b border-white/10">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setStatus("idle"); setTagInfo(null); }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === tab.id ? "border-purple-500 text-purple-400" : "border-transparent text-gray-500 hover:text-white"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {status !== "idle" && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 whitespace-pre-line ${status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : status === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-blue-500/10 border-blue-500/20 text-blue-300"}`}>
          {status === "error" ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> : status === "success" ? <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> : <Nfc size={20} className="shrink-0 mt-0.5 animate-pulse" />}
          <div>
            <p className="font-bold text-sm">{status === "scanning" ? "Waiting for NFC tag..." : status === "success" ? "Done!" : "Failed"}</p>
            <p className="text-sm opacity-90 mt-0.5">{message}</p>
          </div>
        </div>
      )}

      {/* READ TAB */}
      {activeTab === "read" && (
        <div className="space-y-5">
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5"><ScanSearch size={36} className="text-blue-400" /></div>
            <h2 className="text-xl font-bold text-white mb-2">Read Tag Info</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Tap any NFC sticker to reveal its Serial Number, stored content, and record count.</p>
            <button onClick={handleRead} disabled={status === "scanning"} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-all shadow-lg shadow-blue-900/30">
              <ScanSearch size={18} /> {status === "scanning" ? "Waiting for tag..." : "Scan Tag Now"}
            </button>
          </div>
          {tagInfo && (
            <div className="bg-[#1A1A24] border border-green-500/20 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-green-400 flex items-center gap-2 text-sm uppercase tracking-wider"><CheckCircle2 size={16} /> Tag Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Serial Number", value: tagInfo.serialNumber || "Unknown" },
                  { label: "Record Count", value: tagInfo.recordCount.toString() },
                ].map((item, i) => (
                  <div key={i} className="bg-black/30 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-mono text-sm text-green-300 truncate">{item.value}</p>
                  </div>
                ))}
                <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Stored URL Data</p>
                  <p className="font-mono text-sm text-green-300 break-all">{tagInfo.url}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WRITE TAB */}
      {activeTab === "write" && (
        <div className="space-y-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">How to write a URL to your physical NFC sticker</h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "Find the correct URL below (auto-filled from your Settings)." },
                { step: "2", text: "This page must be open on your Android phone in Chrome (Web NFC only works on Android Chrome)." },
                { step: "3", text: 'Click the blue "Write to Tag" button on the table you want to program.' },
                { step: "4", text: "Hold the back of your Android phone flat against the physical NFC sticker." },
                { step: "5", text: "Wait for the success message — done!" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0 mt-0.5">{step}</div>
                  <p className="text-sm text-gray-300 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {plan === "plan1" && (
            <div className="bg-[#1A1A24] border border-purple-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><Nfc size={14} className="text-purple-400" /></div>
                <div>
                  <h3 className="font-bold text-white">Plan 1 — All Stickers</h3>
                  <p className="text-xs text-gray-500">Write the same TNG URL into every sticker</p>
                </div>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">URL to write</p>
                <p className="font-mono text-sm text-purple-300 break-all">
                  {paymentUrl || "⚠ No TNG URL set — go to Settings → Business Info → paste your TNG link"}
                </p>
              </div>
              {paymentUrl && (
                <button onClick={() => handleWrite(paymentUrl)} disabled={status === "scanning"}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20">
                  <Nfc size={16} /> {status === "scanning" ? "Waiting for tag..." : "Write to Tag"}
                </button>
              )}
            </div>
          )}

          {(plan === "plan2" || plan === "plan3") && (
            <>
              {stickers.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                  <p className="text-gray-500 text-sm">No tables configured yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Go to Settings → NFC Stickers → Add your tables first.</p>
                </div>
              )}
              {stickers.map(table => {
                const stickerUrl = `${SITE_URL}/s/${table.id}`;
                return (
                  <div key={table.id} className="bg-[#1A1A24] border border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><Nfc size={14} className="text-purple-400" /></div>
                      <h3 className="font-bold text-white">{table.tableName}</h3>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">URL to write</p>
                      <p className="font-mono text-sm text-blue-300 break-all">{stickerUrl}</p>
                    </div>
                    <button onClick={() => handleWrite(stickerUrl)} disabled={status === "scanning"}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20">
                      <Nfc size={16} /> {status === "scanning" ? "Waiting for tag..." : `Write to ${table.tableName}`}
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* OTHER TOOLS TAB */}
      {activeTab === "other" && (
        <div className="space-y-5">
          <div className="bg-[#1A1A24] border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0"><Ban size={22} className="text-orange-400" /></div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">Erase Tag</h2>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">Wipes all data from the sticker, returning it to a blank factory state. Use this when you wrote the wrong URL. You can write to it again after erasing.</p>
                <button onClick={handleErase} disabled={status === "scanning"} className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all">
                  <Ban size={16} /> {status === "scanning" ? "Erasing..." : "Erase Tag"}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#1A1A24] border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0"><Lock size={22} className="text-red-400" /></div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">Lock Tag <span className="text-red-400 text-sm font-medium">(Permanent)</span></h2>
                <p className="text-sm text-gray-400 mb-3 leading-relaxed">Permanently locks the NFC chip so it can never be overwritten — even by you. Use this to prevent customers from tampering with your payment stickers.</p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
                  <p className="text-xs text-red-300 font-semibold">⚠ Cannot be undone. Once locked, the sticker cannot be erased or rewritten — ever.</p>
                </div>
                <button onClick={handleLock} disabled={status === "scanning"} className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all">
                  <Lock size={16} /> {status === "scanning" ? "Locking..." : "Lock Tag Forever"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
