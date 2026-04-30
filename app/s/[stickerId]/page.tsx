import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import LiveSticker from "./LiveSticker";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getDocument(collection: string, docId: string) {
  const url = `${FIRESTORE_BASE}/${collection}/${docId}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  // Convert Firestore REST format to plain JS object
  return parseFields(json.fields);
}

function parseFields(fields: Record<string, any>): Record<string, any> {
  if (!fields) return {};
  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val.stringValue !== undefined) out[key] = val.stringValue;
    else if (val.integerValue !== undefined) out[key] = Number(val.integerValue);
    else if (val.doubleValue !== undefined) out[key] = val.doubleValue;
    else if (val.booleanValue !== undefined) out[key] = val.booleanValue;
    else if (val.nullValue !== undefined) out[key] = null;
    else if (val.timestampValue !== undefined) out[key] = val.timestampValue;
    else if (val.mapValue !== undefined) out[key] = parseFields(val.mapValue.fields || {});
    else if (val.arrayValue !== undefined)
      out[key] = (val.arrayValue.values || []).map((v: any) => parseFields({ _: v })["_"]);
  }
  return out;
}

export default async function StickerPage(props: {
  params: Promise<{ stickerId: string }>;
}) {
  const { stickerId } = await props.params;

  // 1. Fetch sticker via Firestore REST (no auth required — stickers allow read: true)
  const sticker = await getDocument("stickers", stickerId);
  if (!sticker) notFound();

  const merchantId = sticker.merchantId as string;
  if (!merchantId) notFound();

  // 2. Fetch merchant via Firestore REST (merchants allow read: true after our rules update)
  const merchant = await getDocument("merchants", merchantId);
  if (!merchant) notFound();

  if (!merchant.isActive) notFound();

  const activePlan = (merchant.plan || sticker.plan || "plan1") as string;
  const tngPaymentUrl = (merchant.tngPaymentUrl || merchant.paymentUrl || "") as string;

  // ── PLAN 1: Direct redirect — server-side so Android can intercept with TNG intent
  if (activePlan === "plan1") {
    if (!tngPaymentUrl) notFound();

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    if (/android/i.test(userAgent) && tngPaymentUrl.startsWith("https://")) {
      const withoutScheme = tngPaymentUrl.substring(8);
      redirect(`intent://${withoutScheme}#Intent;scheme=https;package=my.com.tngdigital.ewallet;end;`);
    } else {
      redirect(tngPaymentUrl);
    }
  }

  // ── PLAN 2 & 3: Interactive real-time page
  return (
    <LiveSticker
      stickerId={stickerId}
      initialSticker={sticker}
      initialMerchant={merchant}
    />
  );
}
