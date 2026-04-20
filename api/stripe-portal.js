import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { customerId } = req.body;

  if (!customerId) return res.status(400).json({ error: 'Missing customerId.' });

  const appUrl = process.env.APP_URL || 'https://leverage-desk.vercel.app';

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: appUrl,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
