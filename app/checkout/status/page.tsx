"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

function StatusContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');
  
  const statusId = searchParams.get('status_id');
  const billCode = searchParams.get('billcode');

  useEffect(() => {
    if (statusId === '1') {
      setStatus('success');
    } else if (statusId === '2' || statusId === '3') {
      setStatus('fail');
    }
  }, [statusId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-20 px-6">
      {status === 'success' ? (
        <div className="animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">Payment Successful!</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Thank you for your purchase. We have received your order and our team will begin preparing your NFC stickers immediately.
          </p>
          <div className="space-y-4">
            <Link 
              href="/signup" 
              className="flex items-center justify-center gap-3 bg-blue-600 text-white w-full py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
            >
              Set Up Your Dashboard <ArrowRight size={20} />
            </Link>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Order Ref: {billCode}
            </p>
          </div>
        </div>
      ) : (
        <div className="animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle size={48} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">Payment Failed</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Something went wrong with your transaction. Don't worry, no charges were made. Please try again or contact support.
          </p>
          <Link 
            href="/pricing" 
            className="flex items-center justify-center gap-3 bg-slate-900 text-white w-full py-4 rounded-2xl font-black text-lg transition-all"
          >
            Return to Pricing
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Loading...</p>
        </div>
      }>
        <StatusContent />
      </Suspense>
    </div>
  );
}
