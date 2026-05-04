import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, maxWidth = 500 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0,
        background:'rgba(0,0,0,0.72)',
        backdropFilter:'blur(8px)',
        zIndex:500,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'16px',
      }}
    >
      <div style={{
        background:'var(--bg2)',
        border:'1px solid var(--border)',
        borderRadius:'20px',
        padding:'32px',
        width:'90%', maxWidth,
        maxHeight:'90vh', overflowY:'auto',
        animation:'pageIn 0.28s var(--ease) both',
        position:'relative',
      }}>
        {/* Gold top line */}
        <div style={{
          position:'absolute', top:0, left:'24px', right:'24px', height:'1px',
          background:'linear-gradient(90deg,transparent,var(--amber),transparent)',
        }} />

        <div style={{
          display:'flex', alignItems:'center',
          justifyContent:'space-between', marginBottom:'22px',
        }}>
          <h2 style={{
            fontFamily:'var(--font-display)',
            fontSize:'20px', fontWeight:'700',
          }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width:'30px', height:'30px', borderRadius:'50%',
              background:'var(--surface)', border:'none', cursor:'pointer',
              color:'var(--text2)', fontSize:'16px',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.color='var(--text2)'; }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}