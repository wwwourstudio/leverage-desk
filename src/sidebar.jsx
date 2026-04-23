import React from 'react';
import { Wordmark, Tag } from './primitives.jsx';
import { Icons } from './icons.jsx';

const collapsedBtn = {
  width: 32, height: 32, display: 'grid', placeItems: 'center',
  color: 'var(--fg-mute)', border: '1px solid transparent'
};

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yest';
  return `${d}d`;
}

export const Sidebar = ({ chats, activeId, onSelect, onNew, collapsed, user, onOpenAccount }) => {
  if (collapsed) {
    return (
      <aside style={{ width: 56, borderRight: '1px solid var(--line-soft)', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 10 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 24, color: 'var(--fg)' }}>L</div>
        <div style={{ width: 24, height: 1, background: 'var(--line-soft)', margin: '6px 0' }} />
        <button onClick={onNew} title="New dispatch" style={collapsedBtn}><Icons.Plus size={16}/></button>
        <button title="Search" style={collapsedBtn}><Icons.Search size={16}/></button>
      </aside>
    );
  }

  const initial = user
    ? (user.user_metadata?.name?.[0] ?? user.email[0]).toUpperCase()
    : '?';
  const displayName = user ? (user.user_metadata?.name ?? user.email) : 'Sign in';

  return (
    <aside style={{ width: 260, borderRight: '1px solid var(--line-soft)', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--line-soft)' }}>
        <Wordmark compact />
        <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>Market Desk · v4.2</div>
      </div>
      <button onClick={onNew} style={{ margin: '14px', padding: '10px 12px', border: '1px solid var(--line)', background: 'transparent', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg)', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .15s ease' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line)';e.currentTarget.style.color='var(--fg)'}}>
        <span>New dispatch</span>
        <span style={{ fontSize: 10, color: 'var(--fg-faint)' }}>⌘K</span>
      </button>
      <div style={{ padding: '4px 18px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>History</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px' }}>
        {chats.length === 0 && (
          <div style={{ padding: '20px 10px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>
            No conversations yet
          </div>
        )}
        {chats.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 10px', borderLeft: `2px solid ${c.id === activeId ? 'var(--accent)' : 'transparent'}`, background: c.id === activeId ? 'var(--panel)' : 'transparent', marginBottom: 1, transition: 'background .12s ease' }}
            onMouseEnter={e => { if (c.id !== activeId) e.currentTarget.style.background = 'var(--panel)' }}
            onMouseLeave={e => { if (c.id !== activeId) e.currentTarget.style.background = 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13, color: c.id === activeId ? 'var(--fg)' : 'var(--fg-mute)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.title}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', flexShrink: 0 }}>
                {c.updated_at ? relativeTime(c.updated_at) : c.time}
              </span>
            </div>
            {c.pinned && <div style={{ marginTop: 3 }}><Tag kind="ghost" style={{ fontSize: 8 }}>pinned</Tag></div>}
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--line-soft)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 2, background: 'var(--accent)', color: '#0b0b0b', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
          {user && <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>Pro · $149/mo</div>}
        </div>
        <button onClick={onOpenAccount} style={{ color: 'var(--fg-faint)', flexShrink: 0, padding: 4 }} title="Account settings">
          <Icons.Settings size={14}/>
        </button>
      </div>
    </aside>
  );
};

export const ConvHistory = ({ chats, activeId, onSelect, onNew, user, onOpenAccount }) => {
  const initial = user
    ? (user.user_metadata?.name?.[0] ?? user.email[0]).toUpperCase()
    : '?';
  const displayName = user ? (user.user_metadata?.name ?? user.email) : 'Sign in';

  return (
    <aside style={{ width: 240, borderRight: '1px solid var(--line-soft)', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <button onClick={onNew} style={{ margin: '12px', padding: '9px 12px', border: '1px solid var(--line)', background: 'transparent', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg)', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .15s ease' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line)';e.currentTarget.style.color='var(--fg)'}}>
        <span>New dispatch</span>
        <span style={{ fontSize: 10, color: 'var(--fg-faint)' }}>⌘K</span>
      </button>
      <div style={{ padding: '2px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.22em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>History</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px' }}>
        {chats.length === 0 && (
          <div style={{ padding: '20px 10px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-faint)', textTransform: 'uppercase' }}>
            No conversations yet
          </div>
        )}
        {chats.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 10px', borderLeft: `2px solid ${c.id === activeId ? 'var(--accent)' : 'transparent'}`, background: c.id === activeId ? 'var(--panel)' : 'transparent', marginBottom: 1, transition: 'background .12s ease' }}
            onMouseEnter={e => { if (c.id !== activeId) e.currentTarget.style.background = 'var(--panel)' }}
            onMouseLeave={e => { if (c.id !== activeId) e.currentTarget.style.background = 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13, color: c.id === activeId ? 'var(--fg)' : 'var(--fg-mute)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.title}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', flexShrink: 0 }}>
                {c.updated_at ? relativeTime(c.updated_at) : c.time}
              </span>
            </div>
            {c.pinned && <div style={{ marginTop: 3 }}><Tag kind="ghost" style={{ fontSize: 8 }}>pinned</Tag></div>}
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--line-soft)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 2, background: 'var(--accent)', color: '#0b0b0b', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
          {user && <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>Pro</div>}
        </div>
        <button onClick={onOpenAccount} style={{ color: 'var(--fg-faint)', flexShrink: 0, padding: 4 }} title="Account settings">
          <Icons.Settings size={14}/>
        </button>
      </div>
    </aside>
  );
};
