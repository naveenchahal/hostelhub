import React from 'react';

export default function EmptyState({ icon = '📭', title = 'Nothing here yet', subtitle = '', action }) {
  return (
    <div style={{ textAlign:'center', padding:'56px 20px', color:'var(--text2)' }}>
      <div style={{ fontSize:'44px', marginBottom:'14px' }}>{icon}</div>
      <div style={{ fontSize:'16px', fontWeight:'600', color:'var(--text)', marginBottom:'6px' }}>{title}</div>
      {subtitle && <div style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'20px' }}>{subtitle}</div>}
      {action}
    </div>
  );
}