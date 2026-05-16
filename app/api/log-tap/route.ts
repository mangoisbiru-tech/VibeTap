import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Simple in-memory rate limiter (Note: state resets on serverless cold starts)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 taps per minute per IP

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || request.headers.get("referer") || "";
    // Basic origin check (adjust if you have custom domains)
    if (process.env.NODE_ENV === "production" && !origin.includes("tappay") && !origin.includes("vibetap")) {
      return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
    }

    const ipRaw =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const ipHash = Buffer.from(ipRaw).toString("base64").slice(0, 12);
    
    // Rate Limiting Logic
    const now = Date.now();
    const rateData = rateLimitMap.get(ipHash) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    
    if (now > rateData.resetTime) {
      rateData.count = 1;
      rateData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    } else {
      rateData.count++;
    }
    
    rateLimitMap.set(ipHash, rateData);
    
    if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({ error: "Too many requests, please try again later." }, { status: 429 });
    }

    const { merchantId, stickerId } = await request.json();

    if (!merchantId) {
      return NextResponse.json({ error: "Missing merchantId" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

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
