import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-6 text-center text-white">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#6C47FF] to-[#00D4FF] flex items-center justify-center mb-8 shadow-2xl shadow-purple-500/30">
        <Zap size={36} className="text-white" />
      </div>
      <h1 className="text-4xl font-black mb-3">Merchant Not Found</h1>
      <p className="text-gray-400 max-w-md mb-8">
        This NFC sticker isn&apos;t linked to an active VibeTap merchant yet.
        If you&apos;re the business owner, log in to set up your payment link.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/login"
          className="bg-gradient-to-r from-[#6C47FF] to-[#00D4FF] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          Merchant Login
        </Link>
        <Link
          href="/"
          className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
