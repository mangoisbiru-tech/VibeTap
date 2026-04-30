"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot, query, collection, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import {
  Zap,
  BarChart3,
  Settings,
  LogOut,
  Activity,
  Calculator,
  Menu,
  X,
  Nfc,
  History,
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
      setLoading(false);

      // Listen to merchant doc for name
      const unsub = onSnapshot(doc(db, "merchants", u.uid), (snap) => {
        if (snap.exists()) {
          setMerchantName(snap.data().name || "Merchant");
        }
      });

      // Listen to pending bill requests globally
      const reqQ = query(
        collection(db, "billRequests"),
        where("merchantId", "==", u.uid),
        where("status", "==", "pending")
      );
      const unsubReqs = onSnapshot(reqQ, (snap) => {
        const newCount = snap.docs.length;
        setPendingRequests((prevCount) => {
          if (newCount > prevCount) {
            // Play a 'Ding Ding' sound when a new request comes in
            try {
              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContext) {
                const ctx = new AudioContext();
                const playTone = (freq: number, startTime: number) => {
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.type = "sine";
                  osc.frequency.setValueAtTime(freq, startTime);
                  gain.gain.setValueAtTime(0.3, startTime);
                  gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start(startTime);
                  osc.stop(startTime + 0.5);
                };
                playTone(880, ctx.currentTime); // A5
                playTone(1046.50, ctx.currentTime + 0.2); // C6
              }
            } catch (e) {
              console.warn("Audio playback blocked or failed", e);
            }
          }
          return newCount;
        });
      });

      return () => {
        unsub();
        unsubReqs();
      };
    });
    return () => unsubAuth();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", icon: <Activity size={18} />, label: "Overview" },
    { href: "/dashboard/cashier", icon: <Calculator size={18} />, label: "Cashier Mode", badge: pendingRequests > 0 ? pendingRequests : null },
    { href: "/dashboard/history", icon: <History size={18} />, label: "History" },
    { href: "/dashboard/nfc", icon: <Nfc size={18} />, label: "NFC Writer" },
    { href: "/dashboard/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col glass-panel border-r border-slate-200/50 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-200/50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D5BFF] to-[#00D4FF] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">
            Vibe<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D5BFF] to-[#00D4FF]">Tap</span>
          </span>
        </div>

        {/* User */}
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/50 border border-white/80 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D5BFF] to-[#00D4FF] flex items-center justify-center text-xs font-bold text-white shadow-md">
              {merchantName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{merchantName}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-wider">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/60 hover:shadow-sm transition-all text-sm font-semibold group"
            >
              <span className="group-hover:text-blue-500 transition-colors flex-shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-orange-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-6 border-t border-slate-200/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all text-sm font-semibold w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-4 bg-white/80 border-b border-slate-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2D5BFF] to-[#00D4FF] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-black tracking-tight text-slate-900">VibeTap</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-500 p-1">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 glass-panel pt-20 animate-in slide-in-from-right duration-300">
          <nav className="px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-all text-lg font-bold shadow-sm shadow-transparent hover:shadow-blue-500/5"
              >
                <span className="text-blue-500">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-6 mt-6 border-t border-slate-200/50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 w-full transition-all text-lg font-bold"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="md:ml-60 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
