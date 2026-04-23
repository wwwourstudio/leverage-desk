import React from 'react';
import { LVG_DATA as DATA } from './data.jsx';
import { Icons } from './icons.jsx';
import { Tag, Ticker } from './primitives.jsx';
import { Cards } from './cards.jsx';
import { Sidebar } from './sidebar.jsx';
import { Welcome } from './welcome.jsx';
import { StreamingAnswer, FollowupChips, UserTurn, AssistantTurn, Composer, StreamingText } from './conversation.jsx';
import { Tweaks } from './tweaks.jsx';
import { supabase } from './supabase.js';
import { AccountLightbox } from './auth.jsx';
import { PricingLightbox } from './pricing.jsx';

const TWEAK_DEFAULTS = {
  theme: 'dark', density: 'default', layout: 'classic', accent: 'lime', stream: 'auto', view: 'welcome'
};

const ACCENT_MAP = {
  lime:    { c: 'oklch(0.86 0.20 125)', dim: 'oklch(0.86 0.20 125 / .14)', lightC: 'oklch(0.58 0.18 135)', lightDim: 'oklch(0.58 0.18 135 / .12)' },
  amber:   { c: 'oklch(0.80 0.18 70)',  dim: 'oklch(0.80 0.18 70 / .14)',  lightC: 'oklch(0.60 0.17 60)',  lightDim: 'oklch(0.60 0.17 60 / .12)' },
  cyan:    { c: 'oklch(0.82 0.15 210)', dim: 'oklch(0.82 0.15 210 / .14)', lightC: 'oklch(0.52 0.14 225)', lightDim: 'oklch(0.52 0.14 225 / .12)' },
  magenta: { c: 'oklch(0.72 0.22 340)', dim: 'oklch(0.72 0.22 340 / .14)', lightC: 'oklch(0.52 0.22 345)', lightDim: 'oklch(0.52 0.22 345 / .12)' },
};

const App = () => {
  const [state, setState] = React.useState(TWEAK_DEFAULTS);
  const [view, setView] = React.useState(TWEAK_DEFAULTS.view);
  const [messages, setMessages] = React.useState([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [liveData, setLiveData] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [conversations, setConversations] = React.useState([]);
  const [activeConvId, setActiveConvId] = React.useState(null);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [pricingOpen, setPricingOpen] = React.useState(false);
  const scrollRef = React.useRef(null);

  // Fetch live market data once on mount
  React.useEffect(() => {
    fetch('/api/data').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveData(d); }).catch(() => {});
  }, []);

  // Apply theme/accent CSS vars
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

  // Auth state listener
  React.useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Detect Stripe checkout return and reload profile
  React.useEffect(() => {
    if (!supabase) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => {
        supabase.auth.getUser().then(({ data: { user: u } }) => {
          if (u) supabase.from('profiles').select('*').eq('id', u.id).single()
            .then(({ data }) => { if (data) setProfile(data); });
        });
      }, 2500);
    }
  }, []);

  // Load conversations + profile when user logs in/out
  React.useEffect(() => {
    if (!user || !supabase) { setConversations([]); setActiveConvId(null); setMessages([]); setProfile(null); return; }
    supabase.from('conversations')
      .select('id, title, pinned, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data }) => { if (data) setConversations(data); });
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  // Load messages when active conversation changes
  React.useEffect(() => {
    if (!activeConvId || !supabase) { setMessages([]); return; }
    supabase.from('messages')
      .select('role, content')
      .eq('conversation_id', activeConvId)
      .order('created_at')
      .then(({ data }) => { if (data) setMessages(data); });
  }, [activeConvId]);

  const selectConversation = (id) => {
    // Only load real conversations (logged-in users); ignore mock data clicks
    if (user) { setActiveConvId(id); setView('chat'); }
  };

  const newConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setView('welcome');
  };

  const ask = async (q) => {
    setView('chat');
    let convId = activeConvId;

    // Create a new DB conversation on first message (logged-in users only)
    if (!convId && user && supabase) {
      const title = q.slice(0, 60);
      const { data } = await supabase.from('conversations')
        .insert({ user_id: user.id, title })
        .select('id').single();
      if (data) {
        convId = data.id;
        setActiveConvId(convId);
        setConversations(prev => [{ id: convId, title, pinned: false, updated_at: new Date().toISOString() }, ...prev]);
      }
    }

    const newMessages = [...messages, { role: 'user', content: q }];
    setMessages([...newMessages, { role: 'assistant', content: '' }]);
    setIsStreaming(true);
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 40);

    // Persist user message
    if (convId && supabase) {
      supabase.from('messages').insert({ conversation_id: convId, role: 'user', content: q });
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, liveData }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: `[Error ${res.status}: ${errText}]` };
          return updated;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          let parsed;
          try { parsed = JSON.parse(data); } catch { continue; }
          const token = parsed?.choices?.[0]?.delta?.content;
          if (token) {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: 'assistant',
                content: updated[updated.length - 1].content + token,
              };
              return updated;
            });
          }
        }
      }
    } finally {
      setIsStreaming(false);
      // Persist completed assistant message — cap at 9 500 chars to stay under DB quota
      if (convId && supabase) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.content) {
            const stored = last.content.length > 9500 ? last.content.slice(0, 9500) + '…' : last.content;
            supabase.from('messages').insert({ conversation_id: convId, role: 'assistant', content: stored });
            supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
          }
          return prev;
        });
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar
        chats={user ? conversations : DATA.CHAT_HISTORY}
        activeId={activeConvId}
        onSelect={selectConversation}
        onNew={newConversation}
        user={user}
        onOpenAccount={() => setAccountOpen(true)}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar view={view} onHome={() => setView('welcome')} />
        <Ticker items={DATA.TICKER} />
        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {view === 'welcome'
            ? <Welcome data={DATA} onAsk={ask} />
            : (state.layout === 'split'
                ? <SplitDesk messages={messages} isStreaming={isStreaming} onAsk={ask} streamDone={state.stream === 'done'} />
                : <ChatView messages={messages} isStreaming={isStreaming} onAsk={ask} />
              )
          }
        </div>
        <Composer onSend={ask} disabled={isStreaming} />
      </main>
      <Tweaks state={state} setState={setState} />
      <AccountLightbox open={accountOpen} onClose={() => setAccountOpen(false)} user={user} profile={profile} onUpgrade={() => setPricingOpen(true)} />
      <PricingLightbox open={pricingOpen} onClose={() => setPricingOpen(false)} user={user} profile={profile} onNeedAuth={() => { setPricingOpen(false); setAccountOpen(true); }} />
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

const ChatView = ({ messages, isStreaming, onAsk }) => {
  const bottomRef = React.useRef(null);
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return (
    <div style={{ padding: '28px 56px 40px', maxWidth: 820, margin: '0 auto',
      color: 'var(--fg-faint)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      Ask the desk to get started.
    </div>
  );

  const lastAssistantIdx = messages.map(m => m.role).lastIndexOf('assistant');

  return (
    <div style={{ padding: '28px 56px 40px', maxWidth: 820, margin: '0 auto' }}>
      {messages.map((msg, i) => {
        if (msg.role === 'user') return <UserTurn key={i} text={msg.content} />;
        const isDone = !isStreaming || i < lastAssistantIdx;
        return (
          <AssistantTurn key={i}>
            <div style={{ paddingLeft: 16 }}>
              <StreamingText content={msg.content} done={isDone} />
              {isDone && <FollowupChips chips={DATA.FOLLOWUP_CHIPS} onPick={onAsk} />}
            </div>
          </AssistantTurn>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

const SplitDesk = ({ messages, isStreaming, onAsk, streamDone }) => {
  const hasMessages = messages.length > 0;
  const lastAssistantIdx = messages.map(m => m.role).lastIndexOf('assistant');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: '100%' }}>
      <div style={{ overflow: 'auto', borderRight: '1px solid var(--line-soft)' }}>
        <div style={{ padding: '28px 36px 40px' }}>
          {!hasMessages ? (
            <>
              <UserTurn text={DATA.SAMPLE_QUESTION} />
              <AssistantTurn>
                <div style={{ paddingLeft: 16 }}>
                  {streamDone
                    ? <SplitAnswer blocks={DATA.SAMPLE_ANSWER} />
                    : <StreamingAnswer blocks={DATA.SAMPLE_ANSWER.filter(b => b.kind !== 'card')} cards={DATA.CARDS} />}
                  <FollowupChips chips={DATA.FOLLOWUP_CHIPS} onPick={onAsk} />
                </div>
              </AssistantTurn>
            </>
          ) : (
            messages.map((msg, i) => {
              if (msg.role === 'user') return <UserTurn key={i} text={msg.content} />;
              const isDone = !isStreaming || i < lastAssistantIdx;
              return (
                <AssistantTurn key={i}>
                  <div style={{ paddingLeft: 16 }}>
                    <StreamingText content={msg.content} done={isDone} />
                    {isDone && <FollowupChips chips={DATA.FOLLOWUP_CHIPS} onPick={onAsk} />}
                  </div>
                </AssistantTurn>
              );
            })
          )}
        </div>
      </div>
      <div style={{ overflow: 'auto', padding: '28px 28px 40px', background: 'var(--bg-deep)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase', marginBottom: 14 }}>Card canvas · 4 artifacts</div>
        {['weather','pricing','line','arb','player','prop','kalshi'].map(k => { const C = Cards[k]; return <C key={k} data={DATA.CARDS[k]} />; })}
      </div>
    </div>
  );
};

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
