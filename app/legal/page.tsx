"use client";

import Link from "next/link";
import { ArrowLeft, Shield, FileText, Lock, Scale } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-900 font-sans selection:bg-blue-200 relative overflow-x-hidden">
      {/* Decorative Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#F8FAFF] border-b border-slate-200/50">
        <div className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/TapPay_Logo.png" alt="TapPay Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Tap<span className="text-blue-600">Pay</span>
            </span>
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 text-blue-600 text-sm font-bold mb-6">
            <Shield size={16} /> Legal & Compliance
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">Terms & Privacy</h1>
          <p className="text-slate-500 font-medium text-lg">Last updated: May 9, 2026</p>
        </div>

        <div className="space-y-12">
          {/* Section: Terms of Service */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-500/5 border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Scale size={24} />
              </div>
              <h2 className="text-3xl font-black">Terms of Service</h2>
            </div>
            
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
              <p>Welcome to TapPay. By using our service, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">1. Description of Service</h3>
                <p>TapPay provides NFC-based payment redirection tools and a real-time notification dashboard ("The Service"). The Service is designed to assist merchants in redirecting customers to official payment gateways (e.g., Touch 'n Go Merchant accounts).</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">2. Merchant Responsibilities</h3>
                <p>To use TapPay, you must maintain a valid, active Merchant Account with supported payment providers (such as TNG Digital Sdn Bhd). TapPay is NOT a payment gateway; we are a technology bridge. You are responsible for the legality of your business and the accuracy of your payment details.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">3. Subscription & Payments</h3>
                <p>Payments for Starter Kits and SaaS subscriptions are processed via authorized third-party gateways. All sales are final once the hardware (NFC Stickers) has been programmed and dispatched.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">4. Third-Party Dependencies & Deep Links</h3>
                <p>TapPay's functionality relies on deep-linking technology to third-party mobile applications (including, but not limited to, Touch 'n Go eWallet). We do not own, control, or guarantee the persistence of these third-party links.</p>
                <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 italic font-bold">Important: If a third-party provider changes their technical architecture, deep link format, or mobile app behavior, TapPay is not responsible for any resulting service interruptions or transaction failures.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">5. Limitation of Liability</h3>
                <p>TapPay is not liable for any transaction failures, app downtime, or disputes between you and your customers. We provide the software and hardware "as is" without warranties of any kind.</p>
              </div>
            </div>
          </section>

          {/* Section: Privacy Policy */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-500/5 border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Lock size={24} />
              </div>
              <h2 className="text-3xl font-black">Privacy Policy</h2>
            </div>

            <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
              <p>Your privacy is important to us. This policy explains how we collect, use, and protect your data.</p>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">1. Data We Collect</h3>
                <p>We collect minimal information necessary to run the service: your business name, email address, and your public merchant payment URL/identifier. We do not store your customers' personal banking details.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">2. How We Use Data</h3>
                <p>Your data is used to: generate your custom NFC redirects, provide you with a dashboard of your payment notifications, and communicate important service updates.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">3. Data Security</h3>
                <p>We use industry-standard encryption and Firebase security protocols to protect your merchant dashboard. Access is restricted to authenticated users only.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">4. Cookies</h3>
                <p>We use essential cookies to keep you logged into your dashboard and to remember your preferences.</p>
              </div>

              <div className="space-y-4" id="data-deletion">
                <h3 className="text-xl font-bold text-slate-900">5. Data Deletion Requests</h3>
                <p>You have the right to request the deletion of your account and all associated data. To do so, please contact us via our official email or WhatsApp support channel. Upon verification of your identity, we will permanently delete your account, including your email address, business profile, and transaction history, from our active databases within 14 days.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-16 text-center text-slate-400 text-sm font-medium">
          <p>© 2026 TapPay Malaysia. All rights reserved.</p>
          <p className="mt-2">If you have questions about these terms, contact us via WhatsApp.</p>
        </div>
      </main>
    </div>
  );
}
