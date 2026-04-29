import { adminDb } from "@/lib/firebase/admin";
import { notFound, redirect } from "next/navigation";
import ShowBill from "./ShowBill";
import BillPlease from "./BillPlease";

export default async function StickerPage(props: {
  params: Promise<{ stickerId: string }>;
}) {
  const { stickerId } = await props.params;

  // 1. Fetch the sticker document
  const stickerSnap = await adminDb.collection("stickers").doc(stickerId).get();
  if (!stickerSnap.exists) notFound();

  const sticker = stickerSnap.data()!;
  const { merchantId, tableName, plan, pushedBill } = sticker;

  // 2. Fetch the merchant document
  const merchantSnap = await adminDb.collection("merchants").doc(merchantId).get();
  if (!merchantSnap.exists) notFound();

  const merchant = merchantSnap.data()!;
  if (!merchant.isActive) notFound();

  const merchantName = merchant.name as string;
  const tngPaymentUrl = (merchant.tngPaymentUrl || merchant.paymentUrl || "") as string;
  const staticQrData = (merchant.staticQrData || "") as string;

  // ── PLAN 1: Direct redirect to TNG ─────────────────────────────────────────
  if (plan === "plan1") {
    if (!tngPaymentUrl) notFound();
    redirect(tngPaymentUrl);
  }

  // ── PLAN 2: Show pre-pushed bill amount ────────────────────────────────────
  if (plan === "plan2") {
    const amount = pushedBill?.amount as number | undefined;
    if (!amount || amount <= 0) {
      // No bill pushed yet — show waiting screen
      return (
        <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl animate-pulse">⏳</span>
          </div>
          <h1 className="text-2xl font-black mb-2">{tableName}</h1>
          <p className="text-gray-400">{merchantName}</p>
          <p className="text-gray-500 text-sm mt-4">Your bill is being prepared...</p>
          <p className="text-gray-600 text-xs mt-2">Please ask your server to send the bill.</p>
        </div>
      );
    }

    return (
      <ShowBill
        merchantName={merchantName}
        tableName={tableName}
        amount={amount}
        staticQrData={staticQrData}
        tngPaymentUrl={tngPaymentUrl}
      />
    );
  }

  // ── PLAN 3: Bill Please ─────────────────────────────────────────────────────
  return (
    <BillPlease
      stickerId={stickerId}
      merchantId={merchantId}
      merchantName={merchantName}
      tableName={tableName}
    />
  );
}
