"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [merchantIconUrl, setMerchantIconUrl] = useState("");
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
          setMerchantIconUrl(snap.data().iconUrl || "");
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

  const adminEmails = ["tappaymy@outlook.com", "tappaymy@hotmail.com"];

  if (user?.email && adminEmails.includes(user.email)) {
    navItems.push({ href: "/dashboard/admin", icon: <ShieldCheck size={18} />, label: "Admin Dashboard" });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed top-[40%] left-[20%] w-[30%] h-[30%] bg-cyan-300/10 blur-[100px] rounded-full pointer-events-none" />
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col glass-panel border-r border-slate-200/50 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-200/50">
          <img src="/TapPay_Logo.png" alt="TapPay" className="w-8 h-8 object-contain" />
          <span className="font-black text-2xl tracking-tighter text-slate-950">
            Tap<span className="text-blue-600">Pay</span>
          </span>
        </div>

        {/* User */}
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/50 border border-white/80 shadow-sm">
            {merchantIconUrl ? (
              <img src={merchantIconUrl} alt={merchantName} className="w-9 h-9 rounded-full object-cover shadow-md" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D5BFF] to-[#00D4FF] flex items-center justify-center text-xs font-bold text-white shadow-md">
                {merchantName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{merchantName}</p>
              <p className="text-[10px] font-semibold text-slate-500 truncate uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-4 transition-all text-sm font-bold uppercase tracking-widest group ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-md rounded-xl border-l-4 border-transparent"
                }`}
              >
                <span className={`${isActive ? "text-blue-600" : "group-hover:text-blue-600"} transition-colors flex-shrink-0`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-orange-500/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-6 border-t border-slate-200/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-4 rounded-xl text-red-600 hover:bg-red-50 transition-all text-xs font-bold uppercase tracking-[0.2em] w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-4 bg-white/80 border-b border-slate-200/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <img src="/TapPay_Logo.png" alt="TapPay" className="w-8 h-8 object-contain" />
          <span className="font-black tracking-tight text-slate-900">TapPay</span>
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
