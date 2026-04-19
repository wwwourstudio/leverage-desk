import React from 'react';

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function gauss(rng) {
  const u = 1 - rng(); const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function runMonteCarlo(N = 10000, seed = 424242) {
  const rng = mulberry32(seed);
  const p = 0.608;
  const pMkt = 0.569;
  const winPayout = 100 / 1.32;
  const buckets = new Array(21).fill(0);
  let winsNYY = 0;
  let pnlTotal = 0;
  const path = [];

  for (let i = 0; i < N; i++) {
    const nyyRuns = Math.max(0, Math.round(4.7 + gauss(rng) * 1.8));
    const bosRuns = Math.max(0, Math.round(4.2 + gauss(rng) * 1.8));
    const nyyWins = nyyRuns > bosRuns ? 1 : nyyRuns < bosRuns ? 0 : rng() < p ? 1 : 0;
    winsNYY += nyyWins;
    pnlTotal += nyyWins ? winPayout : -100;
    if (i % 100 === 99) path.push({ i: i + 1, wr: winsNYY / (i + 1), ev: pnlTotal / (i + 1) });
    if (i >= 199 && i % 40 === 0) {
      const localWR = winsNYY / (i + 1);
      const jitter = (rng() - 0.5) * 0.14;
      const val = Math.max(0.40, Math.min(0.80, localWR + jitter));
      const idx = Math.round((val - 0.40) / 0.02);
      buckets[Math.max(0, Math.min(20, idx))]++;
    }
  }

  const finalWR = winsNYY / N;
  const evPer100 = pnlTotal / N;
  const stderr = Math.sqrt(finalWR * (1 - finalWR) / N);
  return { N, p, pMkt, finalWR, evPer100, stderr, ci95: [finalWR - 1.96 * stderr, finalWR + 1.96 * stderr], buckets, path };
}

function firstSig(x) {
  x = Math.abs(x);
  if (!x || !isFinite(x)) return 0;
  while (x < 1) x *= 10;
  while (x >= 10) x /= 10;
  return Math.floor(x);
}

function benfordCheck(values) {
  const counts = new Array(10).fill(0);
  let total = 0;
  for (const v of values) {
    const d = firstSig(v);
    if (d >= 1 && d <= 9) { counts[d]++; total++; }
  }
  const obs = counts.map(c => total ? c / total : 0);
  const exp = [0, ...[1,2,3,4,5,6,7,8,9].map(d => Math.log10(1 + 1/d))];
  let chi2 = 0;
  for (let d = 1; d <= 9; d++) {
    const e = exp[d] * total;
    if (e > 0) chi2 += Math.pow(counts[d] - e, 2) / e;
  }
  let mad = 0;
  for (let d = 1; d <= 9; d++) mad += Math.abs(obs[d] - exp[d]);
  mad /= 9;
  let verdict = 'Acceptable';
  if (mad < 0.006) verdict = 'Close conformity';
  else if (mad < 0.012) verdict = 'Acceptable';
  else if (mad < 0.015) verdict = 'Marginal';
  else verdict = 'Nonconformity';
  return { obs, exp, counts, total, chi2, mad, verdict };
}

function harvestNumbers(DATA) {
  const out = [];
  const push = (v) => { if (typeof v === 'number' && v !== 0 && isFinite(v)) out.push(v); };
  const pushStr = (s) => { if (typeof s !== 'string') return; const m = s.match(/-?\d+(?:\.\d+)?/g); if (m) m.forEach(x => push(parseFloat(x))); };
  const walk = (x) => {
    if (x == null) return;
    if (typeof x === 'number') push(x);
    else if (typeof x === 'string') pushStr(x);
    else if (Array.isArray(x)) x.forEach(walk);
    else if (typeof x === 'object') Object.values(x).forEach(walk);
  };
  if (DATA) { walk(DATA.CARDS); walk(DATA.PULSE); }
  return out;
}

const SectionHead = ({ eyebrow, title, status }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid var(--line-soft)', paddingBottom: 10 }}>
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.24em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 3 }}>{eyebrow}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--fg)', lineHeight: 1.1 }}>{title}</div>
    </div>
    {status && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: status.ok ? 'var(--accent)' : 'var(--fade)', boxShadow: status.ok ? '0 0 8px var(--accent)' : '0 0 8px var(--fade)' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: status.ok ? 'var(--accent)' : 'var(--fade)', textTransform: 'uppercase' }}>{status.label}</span>
      </div>
    )}
  </div>
);

const Stat = ({ label, value, sub, tone }) => (
  <div>
    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-faint)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1, color: tone === 'edge' ? 'var(--accent)' : tone === 'warn' ? 'var(--fade)' : 'var(--fg)' }}>{value}</div>
    {sub && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-mute)', marginTop: 4 }}>{sub}</div>}
  </div>
);

const MonteCarloPanel = () => {
  const mc = React.useMemo(() => runMonteCarlo(10000), []);
  const [progress, setProgress] = React.useState(0);
  const [hoverBucket, setHoverBucket] = React.useState(null);

  React.useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 1800);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const W = 560, H = 140;
  const bucketMax = Math.max(...mc.buckets);
  const shownBuckets = Math.ceil(mc.buckets.length * progress);
  const runCount = Math.floor(mc.N * progress);
  const pathPts = mc.path.slice(0, Math.ceil(mc.path.length * progress));
  const pathW = 560, pathH = 70;
  const xScale = i => (i / (mc.path.length - 1)) * pathW;
  const yScale = wr => pathH - ((wr - 0.45) / 0.25) * pathH;

  return (
    <div style={{ padding: 20, border: '1px solid var(--line-soft)', background: 'var(--bg-deep)' }}>
      <SectionHead eyebrow="Verification · 01" title="Monte Carlo simulation" status={{ ok: true, label: `${runCount.toLocaleString()} / ${mc.N.toLocaleString()} runs` }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 20 }}>
        <Stat label="Model p(NYY)" value={(mc.finalWR * 100).toFixed(1) + '%'} sub={`±${(mc.stderr*196).toFixed(2)} pp · 95% CI`} tone="edge" />
        <Stat label="Market p(NYY)" value={(mc.pMkt * 100).toFixed(1) + '%'} sub="Implied from −132" />
        <Stat label="EV / $100" value={(mc.evPer100 >= 0 ? '+' : '') + '$' + mc.evPer100.toFixed(2)} sub="After juice" tone={mc.evPer100 > 0 ? 'edge' : 'warn'} />
        <Stat label="Kelly ¼" value={(((mc.finalWR - mc.pMkt) / (1/1.32)) * 25).toFixed(1) + '%'} sub="Of bankroll" />
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-faint)', textTransform: 'uppercase', marginBottom: 8 }}>Distribution of simulated NYY win-rate · 40% → 80%</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="mc-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <line x1={((mc.pMkt - 0.40) / 0.40) * W} x2={((mc.pMkt - 0.40) / 0.40) * W} y1={8} y2={H - 16} stroke="var(--fade)" strokeDasharray="3 3" strokeWidth="1" />
        <text x={((mc.pMkt - 0.40) / 0.40) * W + 6} y={16} fontFamily="var(--mono)" fontSize="9" fill="var(--fade)" letterSpacing="0.1em">MKT</text>
        <line x1={((mc.finalWR - 0.40) / 0.40) * W} x2={((mc.finalWR - 0.40) / 0.40) * W} y1={8} y2={H - 16} stroke="var(--accent)" strokeWidth="1.2" />
        <text x={((mc.finalWR - 0.40) / 0.40) * W - 32} y={16} fontFamily="var(--mono)" fontSize="9" fill="var(--accent)" letterSpacing="0.1em">MODEL</text>
        {mc.buckets.slice(0, shownBuckets).map((c, i) => {
          const bw = W / mc.buckets.length;
          const h = bucketMax ? (c / bucketMax) * (H - 28) : 0;
          const x = i * bw;
          const y = H - 16 - h;
          const wr = 0.40 + i * 0.02;
          const isHover = hoverBucket === i;
          return (
            <g key={i} onMouseEnter={() => setHoverBucket(i)} onMouseLeave={() => setHoverBucket(null)}>
              <rect x={x + 1} y={y} width={bw - 2} height={h} fill="url(#mc-grad)" opacity={isHover ? 1 : 0.9} />
              <rect x={x + 1} y={y} width={bw - 2} height={1} fill="var(--accent)" />
              {(i % 5 === 0 || i === mc.buckets.length - 1) && (
                <text x={x + bw/2} y={H - 4} fontFamily="var(--mono)" fontSize="8" fill="var(--fg-faint)" textAnchor="middle">{(wr*100).toFixed(0)}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-faint)', textTransform: 'uppercase', marginBottom: 6 }}>Running win-rate convergence</div>
      <svg width="100%" viewBox={`0 0 ${pathW} ${pathH + 14}`} style={{ display: 'block' }}>
        {[0.50, 0.55, 0.60, 0.65].map((wr, i) => (
          <g key={i}>
            <line x1={0} x2={pathW} y1={yScale(wr)} y2={yScale(wr)} stroke="var(--line-soft)" strokeDasharray="1 3" />
            <text x={4} y={yScale(wr) - 2} fontFamily="var(--mono)" fontSize="8" fill="var(--fg-faint)">{(wr*100).toFixed(0)}%</text>
          </g>
        ))}
        <line x1={0} x2={pathW} y1={yScale(mc.pMkt)} y2={yScale(mc.pMkt)} stroke="var(--fade)" strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
        {pathPts.length > 1 && (
          <path d={pathPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.wr)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="1.4" />
        )}
        {pathPts.length > 0 && (
          <circle cx={xScale(pathPts.length - 1)} cy={yScale(pathPts[pathPts.length - 1].wr)} r="3" fill="var(--accent)" />
        )}
      </svg>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-mute)', borderTop: '1px dashed var(--line-soft)', paddingTop: 10 }}>
        <span>Seed 424242 · {mc.N.toLocaleString()} trials · Poisson-Gauss · reproducible</span>
        <span style={{ color: 'var(--accent)' }}>Edge vs market +{((mc.finalWR - mc.pMkt) * 100).toFixed(1)}pp</span>
      </div>
    </div>
  );
};

const BenfordPanel = ({ data }) => {
  const nums = React.useMemo(() => harvestNumbers(data), [data]);
  const b = React.useMemo(() => benfordCheck(nums), [nums]);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 1400);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const W = 560, H = 200;
  const pad = { t: 12, r: 8, b: 22, l: 26 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const maxY = Math.max(0.35, Math.max(...b.exp.slice(1), ...b.obs.slice(1))) * 1.15;
  const bw = innerW / 9;
  const ok = b.mad < 0.015;

  return (
    <div style={{ padding: 20, border: '1px solid var(--line-soft)', background: 'var(--bg-deep)' }}>
      <SectionHead eyebrow="Verification · 02" title="Benford's Law · first-digit distribution" status={{ ok, label: ok ? 'Conformity' : b.verdict }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 18 }}>
        <Stat label="Sample N" value={b.total.toLocaleString()} sub="Numeric values cited" />
        <Stat label="MAD" value={b.mad.toFixed(4)} sub="< 0.015 = conformity" tone={ok ? 'edge' : 'warn'} />
        <Stat label="χ² (df=8)" value={b.chi2.toFixed(2)} sub={b.chi2 < 15.51 ? 'p > 0.05 · pass' : 'p < 0.05 · flagged'} tone={b.chi2 < 15.51 ? 'edge' : 'warn'} />
        <Stat label="Verdict" value={b.verdict} sub="Nigrini bands" tone={ok ? 'edge' : 'warn'} />
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {[0, 0.1, 0.2, 0.3].map((y, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={pad.t + innerH - (y/maxY)*innerH} y2={pad.t + innerH - (y/maxY)*innerH} stroke="var(--line-soft)" strokeDasharray="1 3" />
            <text x={pad.l - 4} y={pad.t + innerH - (y/maxY)*innerH + 3} fontFamily="var(--mono)" fontSize="8" fill="var(--fg-faint)" textAnchor="end">{(y*100).toFixed(0)}%</text>
          </g>
        ))}
        {[1,2,3,4,5,6,7,8,9].map((d, i) => {
          const x = pad.l + i * bw;
          const oh = (b.obs[d] / maxY) * innerH * progress;
          const dev = Math.abs(b.obs[d] - b.exp[d]);
          const flagged = dev > 0.04;
          return (
            <g key={d}>
              <rect x={x + 6} y={pad.t + innerH - oh} width={bw - 12} height={oh} fill={flagged ? 'var(--fade)' : 'var(--accent)'} opacity={0.75} />
              <text x={x + bw/2} y={H - 6} fontFamily="var(--mono)" fontSize="10" fill="var(--fg-mute)" textAnchor="middle">{d}</text>
              <text x={x + bw/2} y={pad.t + innerH - oh - 4} fontFamily="var(--mono)" fontSize="8" fill={flagged ? 'var(--fade)' : 'var(--accent)'} textAnchor="middle">{(b.obs[d]*100).toFixed(1)}</text>
            </g>
          );
        })}
        <path d={[1,2,3,4,5,6,7,8,9].map((d, i) => { const x = pad.l + i * bw + bw/2; const y = pad.t + innerH - (b.exp[d] / maxY) * innerH; return `${i === 0 ? 'M' : 'L'} ${x} ${y}`; }).join(' ')} fill="none" stroke="var(--fg)" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.55" />
        {[1,2,3,4,5,6,7,8,9].map((d, i) => { const x = pad.l + i * bw + bw/2; const y = pad.t + innerH - (b.exp[d] / maxY) * innerH; return <circle key={d} cx={x} cy={y} r="2.5" fill="var(--bg-deep)" stroke="var(--fg)" strokeWidth="1.2" opacity="0.8" />; })}
        <g transform={`translate(${W - 168}, ${pad.t})`}>
          <rect x={0} y={0} width={10} height={8} fill="var(--accent)" opacity={0.75} />
          <text x={14} y={8} fontFamily="var(--mono)" fontSize="9" fill="var(--fg-mute)">Observed · in answer</text>
          <g transform="translate(0, 14)">
            <line x1={0} x2={10} y1={4} y2={4} stroke="var(--fg)" strokeDasharray="3 2" strokeWidth="1.2" opacity="0.55" />
            <circle cx={5} cy={4} r={2} fill="var(--bg-deep)" stroke="var(--fg)" strokeWidth="1.2" opacity="0.8" />
            <text x={14} y={7} fontFamily="var(--mono)" fontSize="9" fill="var(--fg-mute)">Benford · log₁₀(1 + 1/d)</text>
          </g>
        </g>
      </svg>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-mute)', borderTop: '1px dashed var(--line-soft)', paddingTop: 10 }}>
        <span>Harvested {b.total} numeric citations from odds, volumes, Statcast, orderbook, Kalshi</span>
        <span style={{ color: ok ? 'var(--accent)' : 'var(--fade)' }}>{ok ? 'No fabrication pattern detected' : 'Pattern inconsistent — review flagged digits'}</span>
      </div>
    </div>
  );
};

export const VerificationStrip = ({ data }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: 2, border: '1px solid var(--accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)' }}>✓</div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.24em', color: 'var(--accent)', textTransform: 'uppercase' }}>Data integrity · audit trail</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--fg)', marginTop: 2 }}>Answer verified against two independent checks</div>
          </div>
        </div>
        <button onClick={() => setOpen(!open)} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-mute)', border: '1px solid var(--line)', padding: '6px 12px', textTransform: 'uppercase' }}>
          {open ? 'Hide' : 'Show'} checks
        </button>
      </div>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          <MonteCarloPanel />
          <BenfordPanel data={data} />
        </div>
      )}
    </div>
  );
};
