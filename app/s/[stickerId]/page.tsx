import { notFound, redirect } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import LiveSticker from "./LiveSticker";

export default async function StickerPage(props: {
  params: Promise<{ stickerId: string }>;
}) {
  const { stickerId } = await props.params;

  // 1. Fetch the sticker document using Client SDK to avoid Admin SDK auth issues on Vercel
  const stickerSnap = await getDoc(doc(db, "stickers", stickerId));
  if (!stickerSnap.exists()) notFound();

  const sticker = stickerSnap.data()!;
  const { merchantId } = sticker;

  // 2. Fetch the merchant document
  const merchantSnap = await getDoc(doc(db, "merchants", merchantId));
  if (!merchantSnap.exists()) notFound();

  const merchant = merchantSnap.data()!;
  if (!merchant.isActive) notFound();

  const activePlan = merchant.plan || sticker.plan || "plan1";
  const tngPaymentUrl = (merchant.tngPaymentUrl || merchant.paymentUrl || "") as string;

  // ── PLAN 1: Direct redirect to TNG
  // We do this server-side so Android can intercept the HTTP 307 redirect and open the native app
  if (activePlan === "plan1") {
    if (!tngPaymentUrl) notFound();
    redirect(tngPaymentUrl);
  }

  // ── PLAN 2 & 3: Interactive real-time component
  return (
    <LiveSticker
      stickerId={stickerId}
      initialSticker={sticker}
      initialMerchant={merchant}
    />
  );
}
