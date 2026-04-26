import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import MenuClient from "./MenuClient";

export default async function MenuPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  // Fetch merchant data server-side
  const merchantsRef = adminDb.collection("merchants");
  const snapshot = await merchantsRef.where("slug", "==", slug).limit(1).get();

  if (snapshot.empty) {
    notFound();
  }

  const merchant = snapshot.docs[0].data();
  
  // Only allow access if they are in menu mode
  if (merchant.mode !== "menu" || !merchant.isActive) {
    notFound();
  }

  return (
    <MenuClient 
      name={merchant.name} 
      menuItems={merchant.menuItems || []} 
      paymentUrl={merchant.paymentUrl} 
      staticQrData={merchant.staticQrData}
    />
  );
}
