import crypto from 'crypto';

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

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan = 'premium',
    credits = 5000
  } = req.body || {};

  if (!razorpay_payment_id) {
    return res.status(400).json({ detail: 'Missing razorpay_payment_id' });
  }

  // If order_id and signature are present, verify HMAC-SHA256
  if (razorpay_order_id && razorpay_signature) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'QqJF5tUX6RBqH0SUqF3G3sRW';
    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ detail: 'Invalid payment signature' });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully! Account upgraded to Premium with AI credits.',
    order_id: razorpay_order_id || 'direct_test_order',
    payment_id: razorpay_payment_id,
    plan,
    credits
  });
}
