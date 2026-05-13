import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      oneTimeTotal, 
      selectedKit, 
      selectedPlan,
      name,
      email,
      phone 
    } = body;

    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    const apiUrl = 'https://toyyibpay.com'; // hardcoded - not sensitive
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tappay-malaysia-nfc.vercel.app';

    // Debug: log env vars presence (not values for security)
    console.log('[ToyyibPay] Secret key present:', !!secretKey);
    console.log('[ToyyibPay] Category code present:', !!categoryCode);
    console.log('[ToyyibPay] API URL:', apiUrl);
    console.log('[ToyyibPay] App URL:', appUrl);

    if (!secretKey || !categoryCode) {
      console.error('[ToyyibPay] Missing environment variables!');
      return NextResponse.json({ 
        error: 'Payment configuration missing. Please contact support.',
        debug: { secretKey: !!secretKey, categoryCode: !!categoryCode }
      }, { status: 500 });
    }

    // ToyyibPay amount is in cents (multiply by 100)
    const amountInCents = Math.round((oneTimeTotal || 0) * 100);

    if (amountInCents <= 0) {
      return NextResponse.json({ error: 'Invalid amount. Please select a kit first.' }, { status: 400 });
    }

    const billName = `TapPay ${selectedKit ? selectedKit.charAt(0).toUpperCase() + selectedKit.slice(1) : ''} Kit`;
    // ToyyibPay billDescription has a max length, keep it short
    const billDescription = `NFC Kit: ${selectedKit || 'Custom'} + ${selectedPlan || 'No'} Plan`;

    const formData = new URLSearchParams();
    formData.append('userSecretKey', secretKey);
    formData.append('categoryCode', categoryCode);
    formData.append('billName', billName.substring(0, 30)); // max 30 chars
    formData.append('billDescription', billDescription.substring(0, 100)); // max 100 chars
    formData.append('billPriceSetting', '1');
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', amountInCents.toString());
    formData.append('billReturnUrl', `${appUrl}/checkout/status`);
    formData.append('billCallbackUrl', `${appUrl}/api/callback/toyyibpay`);
    formData.append('billExternalReferenceNo', `TP_${Date.now()}`);
    formData.append('billTo', name || 'TapPay Customer');
    formData.append('billEmail', email || '');
    if (phone) formData.append('billPhone', phone.replace(/\D/g, '')); // digits only

    console.log('[ToyyibPay] Sending request to:', `${apiUrl}/index.php/api/createBill`);
    console.log('[ToyyibPay] Amount (cents):', amountInCents);

    const response = await fetch(`${apiUrl}/index.php/api/createBill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const rawText = await response.text();
    console.log('[ToyyibPay] Raw response:', rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('[ToyyibPay] Non-JSON response:', rawText);
      return NextResponse.json({ 
        error: 'ToyyibPay returned unexpected response.',
        raw: rawText 
      }, { status: 500 });
    }

    console.log('[ToyyibPay] Parsed response:', JSON.stringify(data));

    if (data && data[0] && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = `${apiUrl}/${billCode}`;
      console.log('[ToyyibPay] Success! Bill:', billCode, 'URL:', paymentUrl);
      return NextResponse.json({ paymentUrl });
    } else {
      console.error('[ToyyibPay] Failed response:', JSON.stringify(data));
      return NextResponse.json({ 
        error: 'Failed to create bill',
        toyyibpay_response: data
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[ToyyibPay] FATAL ERROR:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message || String(error),
      stack: error.stack,
      env_check: {
        hasSecret: !!process.env.TOYYIBPAY_SECRET_KEY,
        hasCategory: !!process.env.TOYYIBPAY_CATEGORY_CODE,
        apiUrl: process.env.TOYYIBPAY_API_URL
      }
    }, { status: 500 });
  }
}
