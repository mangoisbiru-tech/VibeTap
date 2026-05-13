import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      oneTimeTotal, 
      monthlyTotal, 
      selectedKit, 
      selectedPlan, 
      selectedAddons,
      name,
      email,
      phone 
    } = body;

    // Calculate total amount for the first payment (One-time Hardware)
    // For now, we only charge the One-time total. 
    // The monthly SaaS will start after the promo period.
    const amount = Math.round(oneTimeTotal * 100); // ToyyibPay uses cents

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const billName = `TapPay - ${selectedKit ? selectedKit.toUpperCase() : 'Custom'} Kit`;
    const billDescription = `TapPay NFC Kit: ${selectedKit || 'Custom'}. Includes ${selectedPlan || 'No'} Plan.`;

    const formData = new URLSearchParams();
    formData.append('userSecretKey', process.env.TOYYIBPAY_SECRET_KEY || '');
    formData.append('categoryCode', process.env.TOYYIBPAY_CATEGORY_CODE || '');
    formData.append('billName', billName);
    formData.append('billDescription', billDescription);
    formData.append('billPriceSetting', '1'); // Fixed price
    formData.append('billPayorInfo', '1'); // Show payor info on toyyibpay
    formData.append('billAmount', amount.toString());
    formData.append('billReturnUrl', `${process.env.NEXT_PUBLIC_APP_URL}/checkout/status`);
    formData.append('billCallbackUrl', `${process.env.NEXT_PUBLIC_APP_URL}/api/callback/toyyibpay`);
    formData.append('billExternalReferenceNo', `TAPPAY_${Date.now()}`);
    
    // Optional: Pre-fill payor info if provided
    if (name) formData.append('billTo', name);
    if (email) formData.append('billEmail', email);
    if (phone) formData.append('billPhone', phone);

    const response = await fetch(`${process.env.TOYYIBPAY_API_URL}/index.php/api/createBill`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data && data[0] && data[0].BillCode) {
      const billCode = data[0].BillCode;
      const paymentUrl = `${process.env.TOYYIBPAY_API_URL}/${billCode}`;
      return NextResponse.json({ paymentUrl });
    } else {
      console.error('ToyyibPay Error:', data);
      return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
    }

  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
