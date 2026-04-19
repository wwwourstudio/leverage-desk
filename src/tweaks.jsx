import React from 'react';
import { Icons } from './icons.jsx';

export const Tweaks = ({ state, setState }) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const update = (k, v) => setState(s => ({ ...s, [k]: v }));

  if (!open) return null;
  const row = { display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10, alignItems: 'center', fontSize: 12 };
  const label = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-faint)', textTransform: 'uppercase' };
  const seg = (active) => ({
    padding: '6px 10px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
    border: '1px solid var(--line)', background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#0b0b0b' : 'var(--fg-mute)', flex: 1, textAlign: 'center'
  });

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, width: 300, background: 'var(--panel)', border: '1px solid var(--line)', boxShadow: '0 24px 60px rgba(0,0,0,.5)', zIndex: 90 }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={label}>Tweaks</span>
        <button onClick={() => setOpen(false)} style={{ color: 'var(--fg-faint)' }}><Icons.Close size={12}/></button>
      </div>
      <div style={{ padding: 14, display: 'grid', gap: 14 }}>
        <div style={row}>
          <span style={label}>Theme</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['dark', 'light'].map(t => <button key={t} style={seg(state.theme === t)} onClick={() => update('theme', t)}>{t}</button>)}
          </div>
        </div>
        <div style={row}>
          <span style={label}>Density</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['roomy','default','dense'].map(d => <button key={d} style={seg(state.density === d)} onClick={() => update('density', d)}>{d}</button>)}
          </div>
        </div>
        <div style={row}>
          <span style={label}>Layout</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['classic','split'].map(v => <button key={v} style={seg(state.layout === v)} onClick={() => update('layout', v)}>{v}</button>)}
          </div>
        </div>
        <div style={{ ...row, gridTemplateColumns: '90px 1fr' }}>
          <span style={label}>Accent</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'lime',    c: 'oklch(0.86 0.20 125)' },
              { key: 'amber',   c: 'oklch(0.80 0.18 70)' },
              { key: 'cyan',    c: 'oklch(0.82 0.15 210)' },
              { key: 'magenta', c: 'oklch(0.72 0.22 340)' },
            ].map(a => (
              <button key={a.key} onClick={() => update('accent', a.key)} title={a.key} style={{ width: 28, height: 28, borderRadius: '50%', background: a.c, border: state.accent === a.key ? '2px solid var(--fg)' : '1px solid var(--line)' }} />
            ))}
          </div>
        </div>
        <div style={row}>
          <span style={label}>Stream</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['auto','done'].map(v => <button key={v} style={seg(state.stream === v)} onClick={() => update('stream', v)}>{v}</button>)}
          </div>
        </div>
        <div style={row}>
          <span style={label}>View</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['welcome','chat'].map(v => <button key={v} style={seg(state.view === v)} onClick={() => update('view', v)}>{v}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
};
