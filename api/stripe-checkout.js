import Stripe from 'stripe';

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  weekly:  process.env.STRIPE_PRICE_WEEKLY,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { period, userId, email, customerId } = req.body;

  const priceId = PRICES[period];
  if (!priceId) return res.status(400).json({ error: 'Invalid billing period.' });

  const appUrl = process.env.APP_URL || 'https://leverage-desk.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      ...(customerId ? { customer: customerId } : { customer_email: email }),
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}?checkout=success`,
      cancel_url:  `${appUrl}?checkout=cancelled`,
      metadata: { userId },
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId },
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
