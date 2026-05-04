// ── Spinner.jsx ───────────────────────────────────────────
import React from 'react';

export function Spinner({ size = 20, color = 'var(--amber)' }) {
  return (
    <span style={{
      display:'inline-block', width:size, height:size,
      border:`2px solid rgba(255,255,255,0.1)`,
      borderTopColor: color, borderRadius:'50%',
      animation:'spin 0.7s linear infinite',
      flexShrink:0,
    }} />
  );
}

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('spinner-kf')) {
  const s = document.createElement('style');
  s.id = 'spinner-kf';
  s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
}

export default Spinner;