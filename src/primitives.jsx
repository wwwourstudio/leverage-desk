import React from 'react';

export const Tag = ({ children, kind = 'default', mono = true, style }) => {
  const map = {
    default: { bg: 'var(--panel-hi)', fg: 'var(--fg-mute)', bd: 'var(--line)' },
    edge:    { bg: 'var(--accent-dim)', fg: 'var(--accent)', bd: 'var(--accent)' },
    fade:    { bg: 'var(--fade-dim)', fg: 'var(--fade)', bd: 'var(--fade)' },
    info:    { bg: 'transparent', fg: 'var(--info)', bd: 'var(--line)' },
    ghost:   { bg: 'transparent', fg: 'var(--fg-faint)', bd: 'var(--line-soft)' },
  };
  const s = map[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 7px', fontFamily: mono ? 'var(--mono)' : 'var(--sans)',
      fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      background: s.bg, color: s.fg,
      border: `1px solid ${s.bd}`,
      borderRadius: 2, whiteSpace: 'nowrap',
      ...style
    }}>{children}</span>
  );
};

export const Divider = ({ label, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
    <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
    {label && (
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{label}</span>
    )}
    <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
  </div>
);

export const Ticker = ({ items }) => {
  const doubled = [...items, ...items];
  return (
    <div style={{
      borderBottom: '1px solid var(--line-soft)',
      borderTop: '1px solid var(--line-soft)',
      background: 'var(--bg-deep)',
      overflow: 'hidden', position: 'relative', height: 32, flexShrink: 0
    }}>
      <div style={{
        display: 'flex', gap: 0,
        animation: 'lvg-ticker 62s linear infinite',
        whiteSpace: 'nowrap', willChange: 'transform'
      }}>
        {doubled.map((it, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 18px', borderRight: '1px solid var(--line-soft)',
            fontFamily: 'var(--mono)', fontSize: 11
          }}>
            <span style={{ color: 'var(--fg-faint)', letterSpacing: '0.12em' }}>{it.sport}</span>
            <span style={{ color: 'var(--fg)' }}>{it.label}</span>
            <span style={{ color: 'var(--fg-mute)', fontWeight: 600 }}>{it.line}</span>
            <span style={{ color: it.side === 'edge' ? 'var(--accent)' : 'var(--fade)', fontWeight: 600 }}>
              {it.side === 'edge' ? '▲' : '▼'} {it.move}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Caret = () => (
  <span style={{
    display: 'inline-block', width: 2, height: 14, background: 'var(--accent)',
    marginLeft: 2, verticalAlign: '-2px',
    animation: 'lvg-blink 1s step-end infinite'
  }} />
);

export const Wordmark = ({ compact }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
    <div style={{
      fontFamily: 'var(--serif)', fontStyle: 'italic',
      fontSize: compact ? 20 : 24, lineHeight: 1,
      color: 'var(--fg)', letterSpacing: '-0.01em'
    }}>Leverage</div>
    {!compact && (
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--fg-faint)', textTransform: 'uppercase', paddingBottom: 2 }}>
        Market Desk / v4.2
      </div>
    )}
  </div>
);

export const Sparkline = ({ data, width = 260, height = 60, stroke, fill }) => {
  if (!data || data.length === 0) return null;
  const vals = data.map(d => d.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = 6;
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (d.v - min) / span) * (height - pad * 2);
    return [x, y];
  });
  const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${line} L${pts[pts.length-1][0]},${height} L${pts[0][0]},${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={area} fill={fill || 'var(--accent-dim)'} />
      <path d={line} fill="none" stroke={stroke || 'var(--accent)'} strokeWidth="1.5" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 1.5} fill={stroke || 'var(--accent)'} />
      ))}
    </svg>
  );
};
