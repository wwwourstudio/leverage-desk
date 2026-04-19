import React from 'react';
import { LVG_DATA as DATA } from './data.jsx';
import { Icons } from './icons.jsx';
import { Tag, Ticker } from './primitives.jsx';
import { Cards } from './cards.jsx';
import { Sidebar } from './sidebar.jsx';
import { Welcome } from './welcome.jsx';
import { StreamingAnswer, FollowupChips, UserTurn, AssistantTurn, Composer } from './conversation.jsx';
import { Tweaks } from './tweaks.jsx';

const TWEAK_DEFAULTS = {
  theme: 'dark', density: 'default', layout: 'classic', accent: 'lime', stream: 'auto', view: 'chat'
};

const ACCENT_MAP = {
  lime:    { c: 'oklch(0.86 0.20 125)', dim: 'oklch(0.86 0.20 125 / .14)', lightC: 'oklch(0.58 0.18 135)', lightDim: 'oklch(0.58 0.18 135 / .12)' },
  amber:   { c: 'oklch(0.80 0.18 70)',  dim: 'oklch(0.80 0.18 70 / .14)',  lightC: 'oklch(0.60 0.17 60)',  lightDim: 'oklch(0.60 0.17 60 / .12)' },
  cyan:    { c: 'oklch(0.82 0.15 210)', dim: 'oklch(0.82 0.15 210 / .14)', lightC: 'oklch(0.52 0.14 225)', lightDim: 'oklch(0.52 0.14 225 / .12)' },
  magenta: { c: 'oklch(0.72 0.22 340)', dim: 'oklch(0.72 0.22 340 / .14)', lightC: 'oklch(0.52 0.22 345)', lightDim: 'oklch(0.52 0.22 345 / .12)' },
};

const App = () => {
  const [state, setState] = React.useState(TWEAK_DEFAULTS);
  const [activeChat, setActiveChat] = React.useState('c1');
  const [view, setView] = React.useState(TWEAK_DEFAULTS.view);
  const [streamKey, setStreamKey] = React.useState(0);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = state.theme;
    r.dataset.density = state.density;
    const a = ACCENT_MAP[state.accent] || ACCENT_MAP.lime;
    const isDark = state.theme === 'dark';
    r.style.setProperty('--accent',     isDark ? a.c : a.lightC);
    r.style.setProperty('--accent-dim', isDark ? a.dim : a.lightDim);
  }, [state]);

  React.useEffect(() => setView(state.view), [state.view]);

  const ask = (q) => {
    setView('chat');
    setStreamKey(k => k + 1);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 40);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar chats={DATA.CHAT_HISTORY} activeId={activeChat} onSelect={setActiveChat} onNew={() => setView('welcome')} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar view={view} onHome={() => setView('welcome')} />
        <Ticker items={DATA.TICKER} />
        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {view === 'welcome'
            ? <Welcome data={DATA} onAsk={ask} />
            : (state.layout === 'split'
                ? <SplitDesk streamKey={streamKey} streamDone={state.stream === 'done'} />
                : <ChatView streamKey={streamKey} streamDone={state.stream === 'done'} />
              )
          }
        </div>
        <Composer onSend={ask} />
      </main>
      <Tweaks state={state} setState={setState} />
    </div>
  );
};

const TopBar = ({ view, onHome }) => (
  <header style={{ height: 48, flexShrink: 0, borderBottom: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', background: 'var(--bg)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onHome} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>← Desk</button>
      <div style={{ width: 1, height: 14, background: 'var(--line-soft)' }} />
      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--fg)' }}>
        {view === 'welcome' ? 'Welcome' : 'Yankees–Red Sox · exit velo trends'}
      </span>
      {view !== 'welcome' && <Tag kind="edge" style={{ marginLeft: 4 }}>Live · NYY -132</Tag>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <HeaderBtn icon="Grid" label="Cards" />
      <HeaderBtn icon="Layers" label="Sources" />
      <HeaderBtn icon="Share" />
      <HeaderBtn icon="Settings" />
    </div>
  </header>
);

const HeaderBtn = ({ icon, label }) => {
  const I = Icons[icon];
  return (
    <button style={{ height: 30, padding: label ? '0 12px 0 10px' : '0 10px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-mute)', border: '1px solid transparent', borderRadius: 2 }}
      onMouseEnter={e => e.currentTarget.style.border='1px solid var(--line-soft)'}
      onMouseLeave={e => e.currentTarget.style.border='1px solid transparent'}>
      <I size={13}/>
      {label && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>}
    </button>
  );
};

const ChatView = ({ streamKey, streamDone }) => (
  <div style={{ padding: '28px 56px 40px', maxWidth: 820, margin: '0 auto' }}>
    <UserTurn text={DATA.SAMPLE_QUESTION} />
    <AssistantTurn>
      <div style={{ paddingLeft: 16 }}>
        {streamDone
          ? <InstantAnswer blocks={DATA.SAMPLE_ANSWER} cards={DATA.CARDS} />
          : <StreamingAnswer key={streamKey} blocks={DATA.SAMPLE_ANSWER} cards={DATA.CARDS} />
        }
        <FollowupChips chips={DATA.FOLLOWUP_CHIPS} onPick={() => {}} />
      </div>
    </AssistantTurn>
  </div>
);

const InstantAnswer = ({ blocks, cards }) => (
  <div>
    {blocks.map((b, i) => {
      if (b.kind === 'kicker') return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--accent)', textTransform: 'uppercase' }}>{b.text}</span>
        </div>
      );
      if (b.kind === 'lede') return <p key={i} style={{ margin: '0 0 18px', fontFamily: 'var(--serif)', fontSize: 30, lineHeight: 1.2, color: 'var(--fg)' }}>{b.text}</p>;
      if (b.kind === 'h') return <h3 key={i} style={{ margin: '28px 0 10px', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase', fontWeight: 600 }}>{b.text}</h3>;
      if (b.kind === 'p') return <p key={i} style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.62, color: 'var(--fg)' }}>{b.text}</p>;
      if (b.kind === 'card') { const C = Cards[b.card]; return <C key={i} data={cards[b.card]} />; }
      if (b.kind === 'callout') return <div key={i} style={{ margin: '18px 0 4px', padding: '18px 22px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-dim)', fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1.3, color: 'var(--fg)' }}>{b.text}</div>;
      return null;
    })}
  </div>
);

const SplitDesk = ({ streamKey, streamDone }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: '100%' }}>
    <div style={{ overflow: 'auto', borderRight: '1px solid var(--line-soft)' }}>
      <div style={{ padding: '28px 36px 40px' }}>
        <UserTurn text={DATA.SAMPLE_QUESTION} />
        <AssistantTurn>
          <div style={{ paddingLeft: 16 }}>
            {streamDone
              ? <SplitAnswer blocks={DATA.SAMPLE_ANSWER} />
              : <StreamingAnswer key={streamKey} blocks={DATA.SAMPLE_ANSWER.filter(b => b.kind !== 'card')} cards={DATA.CARDS} />}
            <FollowupChips chips={DATA.FOLLOWUP_CHIPS} onPick={() => {}} />
          </div>
        </AssistantTurn>
      </div>
    </div>
    <div style={{ overflow: 'auto', padding: '28px 28px 40px', background: 'var(--bg-deep)' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase', marginBottom: 14 }}>Card canvas · 4 artifacts</div>
      {['weather','pricing','line','arb','player','prop','kalshi'].map(k => { const C = Cards[k]; return <C key={k} data={DATA.CARDS[k]} />; })}
    </div>
  </div>
);

const SplitAnswer = ({ blocks }) => (
  <>{blocks.filter(b => b.kind !== 'card').map((b, i) => {
    if (b.kind === 'kicker') return (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ width: 18, height: 1, background: 'var(--accent)' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--accent)', textTransform: 'uppercase' }}>{b.text}</span>
      </div>
    );
    if (b.kind === 'lede') return <p key={i} style={{ margin: '0 0 18px', fontFamily: 'var(--serif)', fontSize: 26, lineHeight: 1.2, color: 'var(--fg)' }}>{b.text}</p>;
    if (b.kind === 'h') return <h3 key={i} style={{ margin: '24px 0 10px', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase', fontWeight: 600 }}>{b.text}</h3>;
    if (b.kind === 'p') return <p key={i} style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.62, color: 'var(--fg)' }}>{b.text}</p>;
    if (b.kind === 'callout') return <div key={i} style={{ margin: '18px 0 4px', padding: '16px 20px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-dim)', fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.3, color: 'var(--fg)' }}>{b.text}</div>;
    return null;
  })}</>
);

export default App;
