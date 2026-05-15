/* Built By Nova — Stripe Payment Intent (Vercel Serverless Function)
   Set STRIPE_SECRET_KEY in Vercel environment variables. */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount = 100, currency = 'usd', email = '', name = '' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:        Number(amount),
      currency,
      receipt_email: email,
      description:   'Built By Nova 60-Day Transformation Program',
      metadata:      { name },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[Nova Pay] Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
