"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "")
    .slice(0, 20);
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Firebase Auth user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });

      // 2. Generate a unique slug from merchant name
      const baseSlug = slugify(name) || user.uid.slice(0, 8);
      // Append random suffix to avoid collisions
      const slug = `${baseSlug}${Math.random().toString(36).slice(2, 6)}`;

      // 3. Create merchant document in Firestore
      await setDoc(doc(db, "merchants", user.uid), {
        uid: user.uid,
        name,
        email,
        slug,
        paymentUrl: "", // To be set in dashboard
        tapCount: 0,
        dailyTaps: {},
        isActive: true,
        fixedAmount: null,
        createdAt: serverTimestamp(),
        lastTappedAt: null,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Aurora Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 py-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D5BFF] to-[#00D4FF] flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-slate-900">
              Vibe<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D5BFF] to-[#00D4FF]">Tap</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Join VibeTap</h1>
          <p className="text-slate-500 font-medium mt-2">Start accepting digital payments instantly</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-500/5">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Ahmad's Cafe"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="boss@vibetap.my"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 pr-14 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#2D5BFF] to-[#00D4FF] text-white py-5 rounded-[1.5rem] font-black text-lg tracking-tight shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <><Loader2 size={24} className="animate-spin" /> Setting Up...</>
              ) : (
                "Create Free Account"
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">
              By joining, you agree to our Terms & Privacy
            </p>
          </form>

          <p className="text-center text-sm font-medium text-slate-400 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-black transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
