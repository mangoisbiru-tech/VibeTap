"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
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
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [merchantName, setMerchantName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      return () => unsub();
    });
    return () => unsubAuth();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: "/dashboard", icon: <Activity size={18} />, label: "Overview" },
    { href: "/dashboard/cashier", icon: <Calculator size={18} />, label: "Cashier Mode" },
    { href: "/dashboard/nfc", icon: <Nfc size={18} />, label: "NFC Writer" },
    { href: "/dashboard/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col bg-white/[0.02] border-r border-white/5 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4FF] flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">
            Vibe<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C47FF] to-[#00D4FF]">Tap</span>
          </span>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C47FF] to-[#00D4FF] flex items-center justify-center text-xs font-bold">
              {merchantName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{merchantName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium group"
            >
              <span className="group-hover:text-purple-400 transition-colors">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0A0A0F]/80 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6C47FF] to-[#00D4FF] flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-black tracking-tight">VibeTap</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-[#0A0A0F]/95 backdrop-blur-xl pt-16">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all text-base font-medium"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full transition-all text-base font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </button>
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
