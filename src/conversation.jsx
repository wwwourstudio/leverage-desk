import React from 'react';
import { Tag, Caret } from './primitives.jsx';
import { Cards } from './cards.jsx';
import { Icons } from './icons.jsx';
import { VerificationStrip } from './verify.jsx';

function useStream(blocks, started) {
  const [idx, setIdx] = React.useState(0);
  const [charIdx, setCharIdx] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!started) { setIdx(0); setCharIdx(0); setDone(false); return; }
    if (idx >= blocks.length) { setDone(true); return; }
    const b = blocks[idx];
    if (b.kind === 'card' || b.kind === 'callout' || b.kind === 'kicker') {
      const t = setTimeout(() => { setIdx(idx + 1); setCharIdx(0); }, 320);
      return () => clearTimeout(t);
    }
    const text = b.text || '';
    if (charIdx >= text.length) {
      const t = setTimeout(() => { setIdx(idx + 1); setCharIdx(0); }, 160);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCharIdx(charIdx + (b.kind === 'h' ? 2 : 3)), 8);
    return () => clearTimeout(t);
  }, [idx, charIdx, started]);

  return { idx, charIdx, done };
}

export const StreamingAnswer = ({ blocks, cards }) => {
  const [started, setStarted] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setStarted(true), 420); return () => clearTimeout(t); }, []);
  const { idx, charIdx, done } = useStream(blocks, started);
  const visible = blocks.slice(0, idx + 1);

  return (
    <div>
      {!started && <ThinkingBar />}
      {visible.map((b, i) => {
        const isLast = i === visible.length - 1;
        if (b.kind === 'kicker') return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--accent)', textTransform: 'uppercase' }}>{b.text}</span>
          </div>
        );
        if (b.kind === 'lede') {
          const t = isLast ? b.text.slice(0, charIdx) : b.text;
          return <p key={i} style={{ margin: '0 0 18px', fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.2, color: 'var(--fg)', letterSpacing: '-0.005em' }}>{t}{isLast && !done && <Caret />}</p>;
        }
        if (b.kind === 'h') {
          const t = isLast ? b.text.slice(0, charIdx) : b.text;
          return <h3 key={i} style={{ margin: '28px 0 10px', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase', fontWeight: 600 }}>{t}{isLast && !done && <Caret />}</h3>;
        }
        if (b.kind === 'p') {
          const t = isLast ? b.text.slice(0, charIdx) : b.text;
          return <p key={i} style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.62, color: 'var(--fg)' }}>{t}{isLast && !done && <Caret />}</p>;
        }
        if (b.kind === 'card') {
          const Card = Cards[b.card];
          return <Card key={i} data={cards[b.card]} />;
        }
        if (b.kind === 'callout') return (
          <div key={i} style={{ margin: '18px 0 4px', padding: '18px 22px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-dim)', fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1.3, color: 'var(--fg)' }}>{b.text}</div>
        );
        return null;
      })}
      {done && <AnswerFooter />}
      {done && <VerificationStrip />}
    </div>
  );
};

export const ThinkingBar = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 14px' }}>
    <div style={{ display: 'flex', gap: 3 }}>
      {[0,1,2,3,4].map(i => (
        <span key={i} style={{ width: 3, height: 14, background: 'var(--accent)', animation: `lvg-wave 1s ease-in-out ${i * 0.12}s infinite` }} />
      ))}
    </div>
    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--fg-mute)', textTransform: 'uppercase' }}>
      Scanning 6 books · reading Statcast · fetching weather · building answer
    </span>
  </div>
);

export const StreamingText = ({ content, done }) => {
  if (!content && !done) return <ThinkingBar />;
  const paragraphs = (content || '').split('\n').filter(Boolean);
  return (
    <div>
      {paragraphs.length === 0
        ? <ThinkingBar />
        : paragraphs.map((p, i) => (
            <p key={i} style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.62, color: 'var(--fg)' }}>
              {p}{i === paragraphs.length - 1 && !done && <Caret />}
            </p>
          ))
      }
      {done && <AnswerFooter />}
      {done && <VerificationStrip />}
    </div>
  );
};

const iconBtn = { width: 26, height: 26, display: 'grid', placeItems: 'center', color: 'var(--fg-faint)', border: '1px solid transparent', borderRadius: 2 };
const ratingBtn = { ...iconBtn, fontSize: 13, filter: 'grayscale(1) opacity(.7)' };

const AnswerFooter = () => (
  <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {['Copy', 'Share', 'Download'].map((lbl) => {
        const I = Icons[lbl];
        return <button key={lbl} style={iconBtn} title={lbl}><I size={13}/></button>;
      })}
      <div style={{ width: 1, height: 14, background: 'var(--line-soft)', margin: '0 6px' }} />
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>Generated in 1.8s · 11 sources · cached 4</span>
    </div>
    <div style={{ display: 'flex', gap: 4 }}>
      <button style={ratingBtn}>👍</button>
      <button style={ratingBtn}>👎</button>
    </div>
  </div>
);

export const FollowupChips = ({ chips, onPick }) => (
  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>Follow-ups</div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {chips.map((c, i) => (
        <button key={i} onClick={() => onPick(c)} style={{ padding: '8px 12px', border: '1px solid var(--line-soft)', fontSize: 12, color: 'var(--fg-mute)', transition: 'all .15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--fg)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line-soft)'; e.currentTarget.style.color='var(--fg-mute)' }}>
          {c}
        </button>
      ))}
    </div>
  </div>
);

export const UserTurn = ({ text }) => (
  <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px dashed var(--line-soft)' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: 2, background: 'var(--panel-hi)', color: 'var(--fg)', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>AM</div>
      <div style={{ flex: 1, fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.35, color: 'var(--fg)', paddingTop: 2 }}>"{text}"</div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.12em' }}>19:14:08</span>
    </div>
  </div>
);

export const AssistantTurn = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 0 }}>
    <div style={{ position: 'relative' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--accent)', fontSize: 16 }}>L</div>
      <div style={{ position: 'absolute', left: 13, top: 32, bottom: 0, width: 1, background: 'var(--line-soft)' }} />
    </div>
    <div>{children}</div>
  </div>
);

export const Composer = ({ onSend, disabled }) => {
  const [val, setVal] = React.useState('');
  const canSend = val.trim() && !disabled;
  return (
    <div style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-deep)', padding: '14px 18px', position: 'sticky', bottom: 0 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', background: 'var(--panel)', padding: '4px 4px 4px 14px' }}>
          <Icons.Sparks size={14} />
          <input value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && canSend) { onSend(val); setVal(''); } }}
            placeholder="Ask the desk — odds, props, arbitrage, Kalshi, Statcast…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, padding: '12px 4px', fontSize: 14, color: 'var(--fg)' }} />
          <button style={{ ...iconBtn, width: 30, height: 30 }}><Icons.Attach size={14}/></button>
          <button style={{ ...iconBtn, width: 30, height: 30 }}><Icons.Mic size={14}/></button>
          <button onClick={() => { if (canSend) { onSend(val); setVal(''); } }} style={{ padding: '0 14px', height: 36, background: canSend ? 'var(--accent)' : 'var(--panel-hi)', color: canSend ? '#0b0b0b' : 'var(--fg-faint)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            Send <Icons.Send size={12}/>
          </button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>
          <span>Grok 3 Mini · tool-routed · 11 data sources</span>
          <span>↵ send · ⇧↵ newline · ⌘K new</span>
        </div>
      </div>
    </div>
  );
};
