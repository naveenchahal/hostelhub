import React from 'react';

const VARIANTS = {
  amber: { bg:'rgba(232,160,32,0.09)',  border:'rgba(232,160,32,0.2)',  color:'var(--amber2)' },
  teal:  { bg:'rgba(45,212,191,0.08)',  border:'rgba(45,212,191,0.2)',  color:'var(--teal)' },
  red:   { bg:'rgba(248,113,113,0.08)', border:'rgba(248,113,113,0.2)', color:'var(--red)' },
  green: { bg:'rgba(74,222,128,0.08)',  border:'rgba(74,222,128,0.2)',  color:'var(--green)' },
  blue:  { bg:'rgba(96,165,250,0.08)',  border:'rgba(96,165,250,0.2)',  color:'var(--blue)' },
};

export default function InfoBox({ children, variant = 'amber', icon }) {
  const v = VARIANTS[variant];
  return (
    <div style={{
      background:v.bg, border:`1px solid ${v.border}`,
      borderRadius:'9px', padding:'12px 14px',
      fontSize:'12px', color:v.color,
      marginBottom:'16px',
      display:'flex', alignItems:'flex-start', gap:'9px',
    }}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}