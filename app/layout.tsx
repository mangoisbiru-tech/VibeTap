import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VibeTap — NFC Payments for Malaysian Merchants",
  description:
    "One NFC sticker, any payment method. Switch between TNG, GrabPay, and DuitNow without changing your sticker. Smart redirector for Malaysian businesses.",
  keywords: "NFC payment Malaysia, Touch n Go, DuitNow, GrabPay, cashless payment sticker",
  openGraph: {
    title: "VibeTap — Tap. Pay. Done.",
    description: "Smart NFC payment stickers for Malaysian merchants.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
