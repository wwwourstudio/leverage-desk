import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Disable body parsing — Stripe signature verification requires the raw body.
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  // Collect raw bytes
  const rawBody = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Service-role client bypasses RLS for server-side writes
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const obj = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const userId = obj.metadata?.userId;
      if (!userId) break;
      await supabase.from('profiles').upsert({
        id: userId,
        stripe_customer_id: obj.customer,
        subscription_status: 'active',
        subscription_tier: 'pro',
        updated_at: new Date().toISOString(),
      });
      break;
    }

    case 'customer.subscription.updated': {
      const active = obj.status === 'active';
      const { data: profile } = await supabase
        .from('profiles').select('id').eq('stripe_customer_id', obj.customer).single();
      if (profile) {
        await supabase.from('profiles').update({
          subscription_status: active ? 'active' : 'inactive',
          subscription_tier:   active ? 'pro'    : 'free',
          subscription_period_end: new Date(obj.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const { data: profile } = await supabase
        .from('profiles').select('id').eq('stripe_customer_id', obj.customer).single();
      if (profile) {
        await supabase.from('profiles').update({
          subscription_status: 'inactive',
          subscription_tier: 'free',
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
      }
      break;
    }
  }

  res.status(200).json({ received: true });
}
