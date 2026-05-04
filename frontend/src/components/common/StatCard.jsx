import React from 'react';

export default function StatCard({ icon, value, label, change, changeType = 'up', color }) {
  return (
    <div style={{
      background:'var(--bg2)', border:'1px solid var(--border)',
      borderRadius:'var(--radius)', padding:'20px 22px',
      transition:'all 0.22s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.boxShadow='var(--amber-glow)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow=''; }}
    >
      <div style={{fontSize:'22px', marginBottom:'14px'}}>{icon}</div>
      <div style={{
        fontFamily:'var(--font-display)', fontSize:'30px', fontWeight:'800',
        marginBottom:'4px', color: color || 'var(--text)',
      }}>{value}</div>
      <div style={{fontSize:'12px', color:'var(--text2)', fontWeight:'500'}}>{label}</div>
      {change && (
        <div style={{
          fontSize:'11px', marginTop:'7px',
          color: changeType === 'up' ? 'var(--green)' : 'var(--red)',
        }}>
          {changeType === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}