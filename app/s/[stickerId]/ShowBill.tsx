"use client";

import { ChevronRight } from "lucide-react";
import { buildTngPayload } from "@/lib/crc16";

export default function ShowBill({
  merchantName,
  tableName,
  amount,
  staticQrData,
  tngPaymentUrl,
}: {
  merchantName: string;
  tableName: string;
  amount: number;
  staticQrData: string;
  tngPaymentUrl: string;
}) {
  // Generate the proper deep link to force the TNG App to open
  const getPaymentLink = () => {
    if (staticQrData && staticQrData.length > 20) {
      return `tngdwallet://pay?data=${buildTngPayload(staticQrData, amount)}`;
    }
    
    // Force Android to open the native app using Intent
    if (typeof window !== "undefined" && /android/i.test(navigator.userAgent)) {
      if (tngPaymentUrl.startsWith("https://")) {
        const withoutScheme = tngPaymentUrl.substring(8);
        return `intent://${withoutScheme}#Intent;scheme=https;package=my.com.tngdigital.ewallet;end;`;
      }
    }
    
    return tngPaymentUrl;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{merchantName}</p>
          <h1 className="text-2xl font-black text-white">{tableName}</h1>
        </div>

        {/* Bill Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
          <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-3">Amount Due</p>
          <p className="text-6xl font-black text-white tracking-tight">
            RM <span className="text-blue-400">{amount.toFixed(2)}</span>
          </p>
          <p className="text-gray-500 text-xs mt-4">Tap the button below to pay with TNG eWallet</p>
        </div>

        {/* Pay Button */}
        <a
          href={getPaymentLink()}
          className="w-full bg-gradient-to-r from-[#00AEEF] to-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all active:scale-95 shadow-xl shadow-blue-600/25"
        >
          PAY RM {amount.toFixed(2)} WITH TNG
          <ChevronRight size={22} />
        </a>

        <p className="text-center text-xs text-gray-600">
          Amount is pre-filled. Just confirm in TNG eWallet.
        </p>
      </div>
    </div>
  );
}
