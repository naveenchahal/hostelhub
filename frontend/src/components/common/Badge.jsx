// Badge.jsx
import React from 'react';

const VARIANT_STYLES = {
  green:  { background:'rgba(74,222,128,0.12)',  color:'var(--green)' },
  red:    { background:'rgba(248,113,113,0.12)', color:'var(--red)' },
  amber:  { background:'rgba(232,160,32,0.14)',  color:'var(--amber2)' },
  blue:   { background:'rgba(96,165,250,0.12)',  color:'var(--blue)' },
  teal:   { background:'rgba(45,212,191,0.12)',  color:'var(--teal)' },
  pink:   { background:'rgba(249,168,212,0.12)', color:'var(--pink)' },
  gray:   { background:'var(--surface)',          color:'var(--text2)' },
};

export function Badge({ children, variant = 'gray' }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'3px 9px', borderRadius:'20px',
      fontSize:'10px', fontWeight:'700',
      letterSpacing:'0.5px', textTransform:'uppercase',
      ...VARIANT_STYLES[variant],
    }}>
      {children}
    </span>
  );
}
export default Badge;