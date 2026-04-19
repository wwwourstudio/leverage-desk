import React from 'react';
import { Tag, Sparkline } from './primitives.jsx';

const CardShell = ({ title, badge, children, footer }) => (
  <div style={{ border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 4, overflow: 'hidden', marginTop: 14, marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--line-soft)', background: 'var(--bg-deep)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>{title}</span>
      </div>
      {badge}
    </div>
    <div>{children}</div>
    {footer && (
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--line-soft)', background: 'var(--bg-deep)', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {footer}
      </div>
    )}
  </div>
);

const cellStyle = (i, len) => ({
  padding: '10px 14px',
  borderBottom: i === len - 1 ? 'none' : '1px solid var(--line-soft)',
  fontSize: 12, color: 'var(--fg)'
});

const PricingCard = ({ data }) => (
  <CardShell
    title={data.title}
    badge={<Tag kind="ghost">Upd {data.updated}</Tag>}
    footer={<>
      <span>No-vig · BOS {data.consensus.no_vig_home}% &nbsp; NYY {data.consensus.no_vig_away}%</span>
      <span style={{ color: 'var(--accent)' }}>Model NYY {data.consensus.model}% · +4.3 edge</span>
    </>}
  >
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr .8fr .9fr .7fr', fontFamily: 'var(--mono)', fontSize: 12 }}>
      {['Book', 'Red Sox', 'Yankees', 'Move 6h', 'Signal'].map(h => (
        <div key={h} style={{ padding: '8px 14px', fontSize: 10, letterSpacing: '0.1em', color: 'var(--fg-faint)', textTransform: 'uppercase', borderBottom: '1px solid var(--line-soft)' }}>{h}</div>
      ))}
      {data.rows.map((r, i) => (
        <React.Fragment key={i}>
          <div style={cellStyle(i, data.rows.length)}>{r.book}</div>
          <div style={{ ...cellStyle(i, data.rows.length), color: 'var(--fg-mute)' }}>{r.home}</div>
          <div style={{ ...cellStyle(i, data.rows.length), color: 'var(--fg)', fontWeight: 600 }}>{r.away}</div>
          <div style={{ ...cellStyle(i, data.rows.length), color: 'var(--fade)' }}>{r.move}</div>
          <div style={cellStyle(i, data.rows.length)}>
            {r.sharp && <Tag kind="edge" style={{ fontSize: 9 }}>SHARP</Tag>}
          </div>
        </React.Fragment>
      ))}
    </div>
  </CardShell>
);

const LineCard = ({ data }) => {
  const delta = data.current - data.open;
  return (
    <CardShell
      title={data.title}
      badge={<Tag kind={delta > 0 ? 'edge' : 'fade'}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta)} · {delta > 0 ? 'toward NYY' : 'toward BOS'}</Tag>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ padding: 16, borderRight: '1px solid var(--line-soft)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Price path</div>
          <Sparkline data={data.data.map(d => ({ v: -d.v }))} width={300} height={74} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)' }}>
            <span>13:00 · open {data.open}</span>
            <span style={{ color: 'var(--accent)' }}>19:00 · now {data.current}</span>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Steam events</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {data.steam.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 8, fontSize: 12 }}>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--fg-faint)' }}>{s.t}</span>
                <span style={{ color: 'var(--fg-mute)' }}>{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardShell>
  );
};

const ArbCard = ({ data }) => (
  <CardShell
    title={data.title}
    badge={<Tag kind="edge">+{data.margin}% · {data.expires_in}</Tag>}
    footer={<>
      <span>Risk-free profit on $1,000 stake</span>
      <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>$ {data.profit.toFixed(2)}</span>
    </>}
  >
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'stretch', gap: 0 }}>
        {data.legs.map((leg, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ width: 1, background: 'var(--line-soft)' }} />}
            <div style={{ padding: 12 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>{leg.book}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--fg)', marginBottom: 10 }}>{leg.side}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 12 }}>
                <span style={{ color: 'var(--fg-faint)' }}>Stake</span>
                <span style={{ color: 'var(--fg)' }}>${leg.stake.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 12, marginTop: 4 }}>
                <span style={{ color: 'var(--fg-faint)' }}>Pays</span>
                <span style={{ color: 'var(--accent)' }}>${leg.pays.toFixed(2)}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  </CardShell>
);

const PropCard = ({ data }) => (
  <CardShell
    title={data.title}
    badge={<Tag kind="edge">+{data.ev_pts} pts EV</Tag>}
    footer={<span>{data.history}</span>}
  >
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Market implies</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 34, color: 'var(--fg-mute)', lineHeight: 1 }}>{data.implied}<span style={{ fontSize: 18, color: 'var(--fg-faint)' }}>%</span></div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Model calls</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 34, color: 'var(--accent)', lineHeight: 1 }}>{data.model}<span style={{ fontSize: 18 }}>%</span></div>
        </div>
      </div>
      <div style={{ position: 'relative', height: 8, background: 'var(--panel-hi)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${data.implied}%`, background: 'var(--fg-faint)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, width: `${data.model}%`, background: 'var(--accent)' }} />
      </div>
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {data.bars.map((b, i) => (
          <div key={i} style={{ border: '1px solid var(--line-soft)', padding: 8 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--fg-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>{b.book}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg)' }}>{b.price}</div>
          </div>
        ))}
      </div>
    </div>
  </CardShell>
);

const PlayerCard = ({ data }) => (
  <CardShell title="Player file" badge={<Tag kind="edge">4 live props · +11 best EV</Tag>}>
    <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', borderBottom: '1px solid var(--line-soft)' }}>
      <div style={{ borderRight: '1px solid var(--line-soft)', background: 'repeating-linear-gradient(45deg, var(--panel-hi) 0 8px, var(--bg-deep) 8px 16px)', position: 'relative', minHeight: 170 }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>player · photo</div>
        </div>
        <div style={{ position: 'absolute', top: 10, left: 10, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 44, color: 'var(--fg)', lineHeight: 1 }}>99</div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.05, color: 'var(--fg)' }}>{data.name}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.1em', marginTop: 4 }}>{data.team}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.08em', marginTop: 2 }}>{data.handed}</div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', border: '1px solid var(--line-soft)' }}>
          {data.season.map((s, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRight: i < data.season.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>{s.k}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--fg)', fontWeight: 600, marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ padding: 16, borderRight: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Last 5 · game log</div>
        {data.last5.map((g, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 60px 1fr', gap: 8, padding: '6px 0', borderBottom: i < data.last5.length - 1 ? '1px dashed var(--line-soft)' : 'none', fontFamily: 'var(--mono)', fontSize: 12 }}>
            <span style={{ color: 'var(--fg-faint)' }}>{g.d}</span>
            <span style={{ color: 'var(--fg-mute)' }}>{g.opp}</span>
            <span style={{ color: 'var(--fg)' }}>{g.line}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>{data.vs_pitcher.who}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--line-soft)' }}>
          {data.vs_pitcher.rows.map((r, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRight: ((i + 1) % 3 !== 0) ? '1px solid var(--line-soft)' : 'none', borderBottom: i < 3 ? '1px solid var(--line-soft)' : 'none' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>{r.k}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg)' }}>{r.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ borderTop: '1px solid var(--line-soft)', padding: '12px 16px', background: 'var(--bg-deep)' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Tonight's props · model vs. market</div>
      {data.tonight_props.map((p, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px 70px 60px', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: i < data.tonight_props.length - 1 ? '1px dashed var(--line-soft)' : 'none' }}>
          <span style={{ fontSize: 12, color: 'var(--fg)' }}>{p.market}</span>
          <div style={{ position: 'relative', height: 6, background: 'var(--panel-hi)' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${p.implied}%`, background: 'var(--fg-faint)', opacity: 0.4 }} />
            <div style={{ position: 'absolute', inset: 0, width: `${p.model}%`, background: 'var(--accent)' }} />
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', textAlign: 'right' }}>{p.line}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-faint)', textAlign: 'right' }}>{p.implied}% → {p.model}%</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', textAlign: 'right', fontWeight: 600 }}>{p.edge}</span>
        </div>
      ))}
    </div>
  </CardShell>
);

const WindCompass = ({ bearing, speed }) => (
  <svg width="96" height="96" viewBox="0 0 96 96">
    <circle cx="48" cy="48" r="42" fill="none" stroke="var(--line)" strokeWidth="1" />
    <circle cx="48" cy="48" r="30" fill="none" stroke="var(--line-soft)" strokeWidth="1" strokeDasharray="2 3" />
    {['N','E','S','W'].map((lbl, i) => {
      const a = (i * 90 - 90) * Math.PI / 180;
      const x = 48 + Math.cos(a) * 38;
      const y = 48 + Math.sin(a) * 38 + 3;
      return <text key={lbl} x={x} y={y} textAnchor="middle" fontFamily="var(--mono)" fontSize="8" fill="var(--fg-faint)" letterSpacing="0.1em">{lbl}</text>;
    })}
    <g transform={`rotate(${bearing} 48 48)`}>
      <line x1="48" y1="58" x2="48" y2="22" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="48,18 44,26 52,26" fill="var(--accent)"/>
    </g>
    <text x="48" y="50" textAnchor="middle" fontFamily="var(--mono)" fontSize="16" fill="var(--fg)" fontWeight="600">{speed}</text>
    <text x="48" y="62" textAnchor="middle" fontFamily="var(--mono)" fontSize="7" fill="var(--fg-faint)" letterSpacing="0.14em">MPH</text>
  </svg>
);

const WeatherCard = ({ data }) => (
  <CardShell
    title={`Weather · ${data.venue}`}
    badge={<Tag kind="edge">HR env · {data.impact.hr_multiplier}× &nbsp; runs {data.impact.runs}</Tag>}
    footer={<span>{data.impact.note}</span>}
  >
    <div style={{ display: 'grid', gridTemplateColumns: '128px 1fr 1fr', borderBottom: '1px solid var(--line-soft)' }}>
      <div style={{ padding: 12, display: 'grid', placeItems: 'center', borderRight: '1px solid var(--line-soft)' }}>
        <WindCompass bearing={data.wind.bearing} speed={data.wind.speed} />
      </div>
      <div style={{ padding: 16, borderRight: '1px solid var(--line-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 54, lineHeight: 1, color: 'var(--fg)' }}>{data.temp}</span>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--fg-mute)' }}>°F</span>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', marginTop: 4, letterSpacing: '0.08em' }}>
          feels {data.feels}° · {data.conditions}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', marginTop: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {data.wind.dir} · {data.wind.speed} mph · {data.humidity}% RH
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Park factor</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--line-soft)' }}>
          {[{ k: 'Overall', v: data.park_factor.overall }, { k: 'vs L', v: data.park_factor.lh }, { k: 'vs R', v: data.park_factor.rh }].map((r, i) => (
            <div key={i} style={{ padding: '8px', borderRight: i < 2 ? '1px solid var(--line-soft)' : 'none' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>{r.k}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: r.v > 100 ? 'var(--accent)' : 'var(--fg-mute)', fontWeight: 600 }}>{r.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ padding: 16 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Hourly · game window</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.hourly.length}, 1fr)`, border: '1px solid var(--line-soft)' }}>
        {data.hourly.map((h, i) => (
          <div key={i} style={{ padding: '10px 8px', borderRight: i < data.hourly.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)' }}>{h.t}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg)', marginTop: 2 }}>{h.temp}° · {h.wind}mph</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', marginTop: 2, letterSpacing: '0.08em' }}>{h.dir}</div>
          </div>
        ))}
      </div>
    </div>
  </CardShell>
);

const KalshiCard = ({ data }) => {
  const max = Math.max(...[...data.orderbook.yes_bids, ...data.orderbook.no_bids].map(o => o.size));
  const edge = data.implied_model - data.yes;
  return (
    <CardShell
      title={data.title}
      badge={<Tag kind="edge">Model {data.implied_model}¢ · +{edge}¢ edge</Tag>}
      footer={<>
        <span>Ticker {data.ticker} · 24h vol {data.volume_24h} · OI {data.open_interest}</span>
        <span style={{ color: 'var(--accent)' }}>YES ▲ {data.yes_change}¢ today</span>
      </>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ padding: 18, borderRight: '1px solid var(--line-soft)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>YES</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1, color: 'var(--accent)' }}>{data.yes}</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--accent)' }}>¢</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', marginLeft: 6 }}>▲ {data.yes_change}</span>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fade)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>NO</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 1, color: 'var(--fade)' }}>{data.no}</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--fade)' }}>¢</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fade)', marginLeft: 6 }}>▼ {Math.abs(data.no_change)}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: 16, borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Probability · last 24h</div>
        <Sparkline data={data.history} width={560} height={56} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: 14, borderRight: '1px solid var(--line-soft)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>YES · bids</div>
          {data.orderbook.yes_bids.map((b, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px', gap: 8, alignItems: 'center', padding: '4px 0', fontFamily: 'var(--mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--accent)' }}>{b.price}¢</span>
              <div style={{ height: 6, background: 'var(--panel-hi)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${(b.size/max)*100}%`, background: 'var(--accent)', opacity: 0.6 }} />
              </div>
              <span style={{ color: 'var(--fg-mute)', textAlign: 'right' }}>{b.size.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fade)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>NO · bids</div>
          {data.orderbook.no_bids.map((b, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 80px', gap: 8, alignItems: 'center', padding: '4px 0', fontFamily: 'var(--mono)', fontSize: 11 }}>
              <span style={{ color: 'var(--fade)' }}>{b.price}¢</span>
              <div style={{ height: 6, background: 'var(--panel-hi)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${(b.size/max)*100}%`, background: 'var(--fade)', opacity: 0.6 }} />
              </div>
              <span style={{ color: 'var(--fg-mute)', textAlign: 'right' }}>{b.size.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--line-soft)', padding: '12px 16px', background: 'var(--bg-deep)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Related markets</div>
        {data.related.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 50px', gap: 10, padding: '5px 0', fontSize: 12, borderBottom: i < data.related.length - 1 ? '1px dashed var(--line-soft)' : 'none' }}>
            <span style={{ color: 'var(--fg)' }}>{r.title}</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--fg-mute)', textAlign: 'right' }}>{r.yes}¢</span>
            <span style={{ fontFamily: 'var(--mono)', color: r.chg > 0 ? 'var(--accent)' : r.chg < 0 ? 'var(--fade)' : 'var(--fg-faint)', textAlign: 'right' }}>
              {r.chg > 0 ? '▲' : r.chg < 0 ? '▼' : '·'} {Math.abs(r.chg)}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
};

export const Cards = { pricing: PricingCard, line: LineCard, arb: ArbCard, prop: PropCard, player: PlayerCard, weather: WeatherCard, kalshi: KalshiCard };
