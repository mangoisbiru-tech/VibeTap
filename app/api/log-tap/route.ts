import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { merchantId, stickerId } = await request.json();

    if (!merchantId) {
      return NextResponse.json({ error: "Missing merchantId" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const ipRaw =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const ipHash = Buffer.from(ipRaw).toString("base64").slice(0, 12);

    const merchantRef = adminDb.collection("merchants").doc(merchantId);

    await Promise.all([
      merchantRef.update({
        tapCount: FieldValue.increment(1),
        lastTappedAt: FieldValue.serverTimestamp(),
        [`dailyTaps.${today}`]: FieldValue.increment(1),
      }),
      adminDb.collection("tapEvents").add({
        merchantId,
        stickerId: stickerId || null,
        tappedAt: FieldValue.serverTimestamp(),
        ipHash,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API/Log-Tap] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
