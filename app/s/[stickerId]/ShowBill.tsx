"use client";

import { useState, useEffect } from "react";

export default function ShowBill({
  merchantName,
  tableName,
  amount,
  tngPaymentUrl,
}: {
  merchantName: string;
  tableName: string;
  amount: number;
  tngPaymentUrl: string;
}) {
  const [paymentHref, setPaymentHref] = useState(tngPaymentUrl);

  useEffect(() => {
    if (/android/i.test(navigator.userAgent) && tngPaymentUrl.startsWith("https://")) {
      const withoutScheme = tngPaymentUrl.substring(8);
      setPaymentHref(`intent://${withoutScheme}#Intent;scheme=https;package=my.com.tngdigital.ewallet;end;`);
    } else {
      setPaymentHref(tngPaymentUrl);
    }
  }, [tngPaymentUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">{merchantName}</p>
          <h1 className="text-2xl font-black text-slate-900">{tableName}</h1>
        </div>

        {/* Bill Card */}
        <div className="bg-white/80 backdrop-blur-md border border-orange-200/50 rounded-3xl p-8 text-center shadow-lg">
          <p className="text-xs text-orange-500 uppercase tracking-widest font-bold mb-3">Amount Due</p>
          <p className="text-6xl font-black text-slate-900 tracking-tight">
            RM <span className="text-orange-500">{amount.toFixed(2)}</span>
          </p>
          <p className="text-slate-500 text-xs mt-4">Open TNG eWallet to pay</p>
        </div>

        {/* Pay Button */}
        <a
          href={paymentHref}
          className="w-full bg-gradient-to-r from-[#00AEEF] to-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all active:scale-95 shadow-xl shadow-blue-600/25 block text-center uppercase tracking-tight"
        >
          Open TNG eWallet
        </a>

        <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
          Please enter RM {amount.toFixed(2)} manually
        </p>
      </div>
    </div>
  );
}
