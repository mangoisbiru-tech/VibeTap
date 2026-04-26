import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;

  if (!id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    // 1. Look up merchant by slug
    const merchantsRef = adminDb.collection("merchants");
    const snapshot = await merchantsRef.where("slug", "==", id).limit(1).get();

    if (snapshot.empty) {
      // Merchant not found — redirect to a friendly not-found page
      return NextResponse.redirect(new URL("/not-found", request.url));
    }

    const merchantDoc = snapshot.docs[0];
    const merchant = merchantDoc.data();

    if (!merchant.isActive) {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }

    // IF MODE IS MENU, REDIRECT TO MENU PAGE INSTEAD OF TNG
    if (merchant.mode === "menu") {
      // Still log analytics before redirecting to the menu page
      const response = NextResponse.redirect(new URL(`/menu/${id}`, request.url), { status: 302 });
      
      // Perform analytics in background
      await logAnalytics(merchantDoc, id, request, null);
      
      return response;
    }

    // 2. Check for active cashier session (EFTPOS mode)
    let paymentUrl = merchant.paymentUrl as string;

    const sessionsRef = adminDb.collection("cashierSessions");
    const now = new Date();
    const sessionSnapshot = await sessionsRef
      .where("merchantId", "==", merchantDoc.id)
      .where("expiresAt", ">", now)
      .where("used", "==", false)
      .orderBy("expiresAt", "desc")
      .limit(1)
      .get();

    let sessionAmount = null;
    if (!sessionSnapshot.empty) {
      const session = sessionSnapshot.docs[0];
      const sessionData = session.data();
      const amount = sessionData.amount as number; // in RM, e.g. 12.50
      sessionAmount = amount;

      // Append amount to payment URL if it supports it
      try {
        const url = new URL(paymentUrl);
        url.searchParams.set("amount", String(Math.round(amount * 100))); // in cents
        paymentUrl = url.toString();
      } catch {
        // If URL parsing fails, append as query string
        const separator = paymentUrl.includes("?") ? "&" : "?";
        paymentUrl = `${paymentUrl}${separator}amount=${Math.round(amount * 100)}`;
      }

      // Mark session as used (one-time use)
      await session.ref.update({ used: true, usedAt: FieldValue.serverTimestamp() });
    }

    // 3. Analytics — increment tap count & log tap event
    await logAnalytics(merchantDoc, id, request, sessionAmount);

    // 4. Execute the 302 redirect
    return NextResponse.redirect(paymentUrl, { status: 302 });
  } catch (error) {
    console.error("[VibeTap] Redirect error:", error);
    // Fail gracefully — redirect to homepage
    return NextResponse.redirect(new URL("/", request.url));
  }
}

async function logAnalytics(
  merchantDoc: any,
  id: string,
  request: NextRequest,
  sessionAmount: number | null
) {
  const ipRaw =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const ipHash = Buffer.from(ipRaw).toString("base64").slice(0, 12);
  const today = new Date().toISOString().slice(0, 10);

  try {
    await Promise.all([
      merchantDoc.ref.update({
        tapCount: FieldValue.increment(1),
        lastTappedAt: FieldValue.serverTimestamp(),
        [`dailyTaps.${today}`]: FieldValue.increment(1),
      }),
      adminDb.collection("tapEvents").add({
        merchantId: merchantDoc.id,
        merchantSlug: id,
        tappedAt: FieldValue.serverTimestamp(),
        ipHash,
        sessionAmount,
      }),
    ]);
  } catch (err) {
    console.error("[VibeTap] Analytics write failed:", err);
  }
}
