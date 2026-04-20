import React from 'react';
import { Icons } from './icons.jsx';

const Check = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const Cross = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const FREE_FEATURES = [
  { label: '10 dispatches / day', ok: true },
  { label: 'AI analysis (rate-limited)', ok: true },
  { label: 'Basic betting lines', ok: true },
  { label: 'Live Odds · 11 books', ok: false },
  { label: 'Kalshi prediction markets', ok: false },
  { label: 'Statcast + weather', ok: false },
  { label: 'Verification engine', ok: false },
  { label: 'Priority support', ok: false },
];

const PRO_FEATURES = [
  { label: 'Unlimited dispatches', ok: true },
  { label: 'Grok 3 Mini · Llama 70B', ok: true },
  { label: 'Live Odds · 11 books', ok: true },
  { label: 'Kalshi prediction markets', ok: true },
  { label: 'Statcast + weather data', ok: true },
  { label: "Benford's Law verification", ok: true },
  { label: 'Monte Carlo simulation', ok: true },
  { label: 'Priority support', ok: true },
];

const PRICES = {
  monthly: { amount: 149, label: '/mo · billed monthly' },
  weekly:  { amount: 49,  label: '/wk · billed weekly' },
};

export const PricingLightbox = ({ open, onClose, user, profile, onNeedAuth }) => {
  const [period, setPeriod] = React.useState('monthly');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => { if (open) setError(''); }, [open]);

  if (!open) return null;

  const isSubscribed = profile?.subscription_status === 'active';
  const { amount, label } = PRICES[period];

  const subscribe = async () => {
    if (!user) { onNeedAuth?.(); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, userId: user.id, email: user.email, customerId: profile?.stripe_customer_id ?? null }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setError(data.error || 'Checkout failed — try again.');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  };

  const manageBilling = async () => {
    if (!profile?.stripe_customer_id) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: profile.stripe_customer_id }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  };

  const planCard = (isFree) => {
    const features = isFree ? FREE_FEATURES : PRO_FEATURES;
    const isCurrent = isFree ? !isSubscribed : isSubscribed;
    return (
      <div style={{ padding: '22px 20px', borderRight: isFree ? '1px solid var(--line-soft)' : 'none', borderTop: isFree ? 'none' : '2px solid var(--accent)', position: 'relative' }}>
        {!isFree && (
          <div style={{ position: 'absolute', top: -1, right: 18, background: 'var(--accent)', color: '#0b0b0b', fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', padding: '3px 8px' }}>
            Recommended
          </div>
        )}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.24em', color: isFree ? 'var(--fg-faint)' : 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>
          {isFree ? 'Free' : 'Pro'}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: isFree ? 20 : 6 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 40, color: 'var(--fg)', lineHeight: 1 }}>
            {isFree ? '$0' : `$${amount}`}
          </span>
        </div>
        {!isFree && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', marginBottom: 20 }}>{label}</div>
        )}
        {isFree && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', marginBottom: 20 }}>forever</div>
        )}
        <div style={{ display: 'grid', gap: 9 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: f.ok ? 'var(--fg)' : 'var(--fg-faint)', lineHeight: 1.3 }}>
              {f.ok ? <Check /> : <Cross />}
              <span>{f.label}</span>
            </div>
          ))}
        </div>
        {!isFree && error && (
          <div style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fade)' }}>{error}</div>
        )}
        <div style={{ marginTop: 22 }}>
          {isFree ? (
            <div style={{ padding: '10px', border: '1px solid var(--line)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: isCurrent ? 'var(--fg-faint)' : 'var(--fg-faint)', textAlign: 'center' }}>
              {isCurrent ? 'Current plan' : '—'}
            </div>
          ) : isSubscribed ? (
            <button onClick={manageBilling} disabled={loading}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid var(--accent)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', cursor: 'pointer' }}>
              {loading ? 'Loading…' : 'Manage billing →'}
            </button>
          ) : (
            <button onClick={subscribe} disabled={loading}
              style={{ width: '100%', padding: '12px', background: 'var(--accent)', border: 'none', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0b0b0b', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Redirecting…' : `Subscribe ${period === 'monthly' ? 'monthly' : 'weekly'} →`}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', zIndex: 210, display: 'grid', placeItems: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: '100%', maxWidth: 640, background: 'var(--panel)', border: '1px solid var(--line)', boxShadow: '0 40px 100px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.26em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 3 }}>Leverage Desk</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--fg)' }}>Upgrade to Pro</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', border: '1px solid var(--line)' }}>
              {['monthly', 'weekly'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '7px 14px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em',
                  textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                  background: period === p ? 'var(--accent)' : 'transparent',
                  color: period === p ? '#0b0b0b' : 'var(--fg-mute)',
                  transition: 'all .12s',
                }}>
                  {p === 'monthly' ? 'Monthly' : 'Weekly'}
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{ color: 'var(--fg-faint)', padding: 4 }}>
              <Icons.Close size={12} />
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {planCard(true)}
          {planCard(false)}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>
          <span>Cancel anytime · Secured by Stripe</span>
          {period === 'monthly' && <span style={{ color: 'var(--accent)' }}>Best value</span>}
          {period === 'weekly' && <span>Flexible · no commitment</span>}
        </div>
      </div>
    </div>
  );
};
