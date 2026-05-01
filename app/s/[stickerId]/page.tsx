"use client";
import { useParams } from "next/navigation";

export default function StickerPage() {
  const params = useParams();
  return (
    <div className="p-20 text-black bg-white min-h-screen">
      <h1>Sticker ID: {params?.stickerId}</h1>
      <p>If you see this, the page is loading. We are debugging the data fetch.</p>
    </div>
  );
}
