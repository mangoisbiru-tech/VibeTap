"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Aurora Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-100/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/TapPay_Logo.png" alt="TapPay" className="w-12 h-12 object-contain" />
            <span className="text-3xl font-black tracking-tight text-slate-900">
              Tap<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D5BFF] to-[#00D4FF]">Pay</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your merchant dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-500/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="boss@tappay.my"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
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
              <div className="flex justify-end px-1">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-2xl animate-shake">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#2D5BFF] to-[#00D4FF] text-white py-5 rounded-[1.5rem] font-black text-lg tracking-tight shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <><Loader2 size={24} className="animate-spin" /> Verifying...</>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-400 mt-8">
            New here?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-black transition-colors">
              Sign up here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
