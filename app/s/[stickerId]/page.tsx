import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import LiveSticker from "./LiveSticker";

export default async function StickerPage(props: {
  params: Promise<{ stickerId: string }>;
}) {
  const { stickerId } = await props.params;

  // 1. Fetch the sticker document using Admin SDK to bypass security rules on the server
  const stickerSnap = await adminDb.collection("stickers").doc(stickerId).get();
  if (!stickerSnap.exists) notFound();

  const sticker = stickerSnap.data()!;
  const { merchantId } = sticker;

  // 2. Fetch the merchant document
  const merchantSnap = await adminDb.collection("merchants").doc(merchantId).get();
  if (!merchantSnap.exists) notFound();

  const merchant = merchantSnap.data()!;
  if (!merchant.isActive) notFound();

  const activePlan = merchant.plan || sticker.plan || "plan1";
  const tngPaymentUrl = (merchant.tngPaymentUrl || merchant.paymentUrl || "") as string;

  // ── PLAN 1: Direct redirect to TNG
  // We do this server-side so Android can intercept the HTTP 307 redirect and open the native app
  if (activePlan === "plan1") {
    if (!tngPaymentUrl) notFound();

    // Check if user is on Android to force the TNG App via Intent
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    if (/android/i.test(userAgent) && tngPaymentUrl.startsWith("https://")) {
      const withoutScheme = tngPaymentUrl.substring(8);
      const intentUrl = `intent://${withoutScheme}#Intent;scheme=https;package=my.com.tngdigital.ewallet;end;`;
      redirect(intentUrl);
    } else {
      redirect(tngPaymentUrl);
    }
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
