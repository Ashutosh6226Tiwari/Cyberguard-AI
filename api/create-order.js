export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { amount = 200, currency = 'INR', plan = 'premium', credits = 5000 } = req.body || {};

  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TmVEzobckpil2B';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'QqJF5tUX6RBqH0SUqF3G3sRW';

  try {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: Math.max(100, Number(amount)),
        currency,
        receipt: `rcpt_${Date.now()}`
      })
    });

    const data = await rzpRes.json();
    if (!rzpRes.ok) {
      return res.status(rzpRes.status).json({ detail: data.error?.description || 'Razorpay order creation failed' });
    }

    return res.status(200).json({
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: keyId,
      plan,
      credits
    });
  } catch (err) {
    return res.status(500).json({ detail: err.message || 'Server error' });
  }
}
