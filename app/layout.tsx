// v1.0.2 - Final Emoji Scrub
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "TapPay — NFC Payments for Malaysian Merchants",
  description:
    "One NFC sticker, any payment method. Switch between TNG, GrabPay, and DuitNow without changing your sticker. Smart redirector for Malaysian businesses.",
  keywords: "NFC payment Malaysia, Touch n Go, DuitNow, GrabPay, cashless payment sticker",
  openGraph: {
    title: "TapPay — Tap. Pay. Done.",
    description: "The smartest way to collect digital payments in Malaysia. Tap, Pay, and you're done.",
    images: ["/TapPay_Logo.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
