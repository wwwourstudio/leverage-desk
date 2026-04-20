import React from 'react';
import { supabase } from './supabase.js';
import { Icons } from './icons.jsx';

const field = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--line)',
  padding: '10px 12px', fontSize: 13, color: 'var(--fg)', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};
const btn = {
  width: '100%', padding: '11px', background: 'var(--accent)', color: '#0b0b0b',
  fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
  border: 'none', cursor: 'pointer', marginTop: 4,
};
const label = {
  fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.2em',
  color: 'var(--fg-faint)', textTransform: 'uppercase', display: 'block', marginBottom: 6,
};

export const AccountLightbox = ({ open, onClose, user, profile, onUpgrade }) => {
  const defaultTab = user ? 'account' : 'login';
  const [tab, setTab] = React.useState(defaultTab);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setTab(user ? 'account' : 'login');
    setError('');
  }, [user, open]);

  if (!open) return null;

  const switchTab = (t) => { setTab(t); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onClose();
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signUp({
      email, password, options: { data: { name } },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onClose();
  };

  const handleSignout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const tabBtn = (t, label) => ({
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
    padding: '8px 14px', border: 'none', cursor: 'pointer', transition: 'all .12s',
    background: tab === t ? 'var(--panel-hi)' : 'transparent',
    color: tab === t ? 'var(--fg)' : 'var(--fg-faint)',
    borderBottom: tab === t ? '1px solid var(--accent)' : '1px solid transparent',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 200, display: 'grid', placeItems: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 400, background: 'var(--panel)', border: '1px solid var(--line)', boxShadow: '0 32px 80px rgba(0,0,0,.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--line-soft)' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--fg)' }}>Account</span>
          <button onClick={onClose} style={{ color: 'var(--fg-faint)', padding: 4 }}><Icons.Close size={12} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--line-soft)' }}>
          {!user && <button style={tabBtn('login', 'Login')} onClick={() => switchTab('login')}>Sign in</button>}
          {!user && <button style={tabBtn('signup', 'Sign up')} onClick={() => switchTab('signup')}>Create account</button>}
          {user && <button style={tabBtn('account', 'Account')} onClick={() => switchTab('account')}>Account</button>}
        </div>

        <div style={{ padding: '22px 20px 24px' }}>
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: 14 }}>
              <div>
                <span style={label}>Email</span>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={field} autoFocus />
              </div>
              <div>
                <span style={label}>Password</span>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" style={field} />
              </div>
              {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fade)' }}>{error}</div>}
              <button type="submit" style={btn} disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
              <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)' }}>
                No account?{' '}
                <button type="button" onClick={() => switchTab('signup')}
                  style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Create one
                </button>
              </div>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignup} style={{ display: 'grid', gap: 14 }}>
              <div>
                <span style={label}>Display name</span>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" style={field} autoFocus />
              </div>
              <div>
                <span style={label}>Email</span>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" style={field} />
              </div>
              <div>
                <span style={label}>Password</span>
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters" style={field} />
              </div>
              {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fade)' }}>{error}</div>}
              <button type="submit" style={btn} disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
              <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)' }}>
                Have an account?{' '}
                <button type="button" onClick={() => switchTab('login')}
                  style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Sign in
                </button>
              </div>
            </form>
          )}

          {tab === 'account' && user && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 2, background: 'var(--accent)', color: '#0b0b0b', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  {(user.user_metadata?.name?.[0] ?? user.email[0]).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, color: 'var(--fg)', fontWeight: 500 }}>{user.user_metadata?.name ?? '—'}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', marginTop: 2 }}>{user.email}</div>
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: 'var(--bg-deep)', border: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Plan</span>
                {profile?.subscription_status === 'active'
                  ? <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Pro · Active</span>
                  : <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Free</span>
                }
              </div>

              {profile?.subscription_status !== 'active' && (
                <button onClick={() => { onClose(); onUpgrade?.(); }}
                  style={{ ...btn, marginTop: 0 }}>
                  Upgrade to Pro →
                </button>
              )}

              <div style={{ height: 1, background: 'var(--line-soft)' }} />

              <button onClick={handleSignout}
                style={{ ...btn, background: 'transparent', color: 'var(--fade)', border: '1px solid var(--line)', marginTop: 0 }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
