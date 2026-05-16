import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Simple in-memory rate limiter for bill requests
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 requests per minute per IP

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || request.headers.get("referer") || "";
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
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { stickerId, merchantId, tableName, wantsReceipt } = await request.json();

    if (!merchantId || !stickerId || !tableName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Write to Firestore using Admin SDK
    await adminDb.collection("billRequests").add({
      stickerId,
      merchantId,
      tableName,
      wantsReceipt: !!wantsReceipt,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API/Request-Bill] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
