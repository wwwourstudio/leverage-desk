import React from 'react';
import { Ticker, Tag, Wordmark } from './primitives.jsx';
import { Icons } from './icons.jsx';

export const Welcome = ({ data, onAsk }) => (
  <div style={{ padding: '36px 56px 40px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, paddingBottom: 18, borderBottom: '1px solid var(--line)', marginBottom: 28 }}>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.28em', color: 'var(--fg-faint)', textTransform: 'uppercase', marginBottom: 12 }}>
          Saturday · April 18, 2026 · 19:14 ET · No. 412
        </div>
        <h1 style={{ margin: 0, fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(44px, 6.2vw, 72px)', lineHeight: 0.98, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
          Good evening,<br/>
          <span style={{ fontStyle: 'italic', color: 'var(--fg-mute)' }}>the market is moving.</span>
        </h1>
      </div>
      <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'lvg-pulse 1.4s ease-in-out infinite' }} />
          <span style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}>LIVE</span>
        </div>
        <div style={{ marginTop: 4, color: 'var(--fg-faint)' }}>412 markets · 6 books</div>
        <div style={{ color: 'var(--fg-faint)' }}>Grok 3 · tool access: 11</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: '1px solid var(--line)', marginBottom: 36 }}>
      {data.PULSE.map((p, i) => {
        const col = p.kind === 'edge' ? 'var(--accent)' : p.kind === 'fade' ? 'var(--fade)' : 'var(--info)';
        return (
          <button key={i} onClick={() => onAsk(`Tell me more about: ${p.title}`)}
            style={{ padding: '18px 20px', textAlign: 'left', borderRight: (i % 3 !== 2) ? '1px solid var(--line-soft)' : 'none', borderBottom: (i < 3) ? '1px solid var(--line-soft)' : 'none', background: 'var(--panel)', transition: 'background .15s ease' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--panel-hi)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--panel)'}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.24em', color: col }}>{p.tag}</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: col }} />
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.1, color: 'var(--fg)', marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-mute)', lineHeight: 1.4 }}>{p.meta}</div>
          </button>
        );
      })}
    </div>

    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase', marginBottom: 10 }}>Or — ask the desk</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {data.QUICK_PROMPTS.map((q, i) => (
          <button key={i} onClick={() => onAsk(q)} style={{ padding: '14px 16px', background: 'transparent', border: '1px solid var(--line-soft)', textAlign: 'left', color: 'var(--fg-mute)', fontSize: 13, transition: 'all .15s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--fg)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line-soft)'; e.currentTarget.style.color='var(--fg-mute)' }}>
            <span>{q}</span>
            <Icons.Arrow size={12} />
          </button>
        ))}
      </div>
    </div>
  </div>
);
