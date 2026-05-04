// ══════════════════════════════════════════════════════════
// Card.jsx
// ══════════════════════════════════════════════════════════
// src/components/common/Card.jsx
import React from 'react';

const cardStyle = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '22px',
};

const hoverStyle = {
  transition: 'all 0.22s var(--ease)',
  cursor: 'pointer',
};

export function Card({ children, style, hover, accent, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        ...cardStyle,
        ...(hover ? hoverStyle : {}),
        ...(accent ? { borderColor: 'var(--border2)', background: 'linear-gradient(135deg,var(--bg2),var(--bg3))' } : {}),
        ...style,
      }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.borderColor = 'var(--border2)';
        e.currentTarget.style.transform   = 'translateY(-2px)';
        e.currentTarget.style.boxShadow   = 'var(--amber-glow)';
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform   = '';
        e.currentTarget.style.boxShadow   = '';
      } : undefined}
    >
      {children}
    </div>
  );
}
export default Card;