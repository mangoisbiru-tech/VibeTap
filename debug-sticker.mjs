import { adminDb } from "./lib/firebase/admin";

async function checkSticker() {
  const stickerId = "12m2KOK4uTv3CJgp6LAL";
  console.log("Checking sticker:", stickerId);
  
  try {
    const stickerSnap = await adminDb.collection("stickers").doc(stickerId).get();
    if (stickerSnap.exists) {
      console.log("Sticker exists!");
      console.log("Data:", stickerSnap.data());
    } else {
      console.log("Sticker does NOT exist in Firestore.");
      
      // List some stickers to see IDs
      const allStickers = await adminDb.collection("stickers").limit(5).get();
      console.log("Available sticker IDs:");
      allStickers.docs.forEach(doc => console.log("- " + doc.id));
    }
  } catch (err) {
    console.error("Error checking sticker:", err);
  }
}

checkSticker();
