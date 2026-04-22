import * as admin from "firebase-admin";

// Prevent re-initialization in dev (Next.js hot-reload)
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (privateKey && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } else {
    // Fallback for local dev without service account (uses GOOGLE_APPLICATION_CREDENTIALS or project default)
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "nfceftpos",
    });
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
