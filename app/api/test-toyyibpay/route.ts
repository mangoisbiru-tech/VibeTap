import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasSecret: !!process.env.TOYYIBPAY_SECRET_KEY,
    hasCategory: !!process.env.TOYYIBPAY_CATEGORY_CODE,
    apiUrl: process.env.TOYYIBPAY_API_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    // Show first 5 chars only for security
    secretPreview: process.env.TOYYIBPAY_SECRET_KEY?.substring(0, 5) + '...',
    categoryPreview: process.env.TOYYIBPAY_CATEGORY_CODE?.substring(0, 4) + '...',
  });
}
