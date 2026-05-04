/* src/screens/auth/AuthLayout.jsx */
import React from 'react';

export function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight:'100vh', background:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px', position:'relative', overflow:'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position:'absolute', top:'30%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:'500px', height:'500px', borderRadius:'50%',
        background:'radial-gradient(circle,rgba(232,160,32,0.07) 0%,transparent 70%)',
        pointerEvents:'none',
      }} />
      <div style={{ width:'100%', maxWidth:'420px', animation:'pageIn 0.5s var(--ease) both' }}>
        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:'36px',
            fontWeight:'800', color:'var(--amber)',
            textShadow:'0 0 40px rgba(232,160,32,0.35)',
          }}>HostelHive</div>
          <div style={{ fontSize:'11px', color:'var(--text3)', letterSpacing:'3px', textTransform:'uppercase', marginTop:'6px', fontWeight:'600' }}>
            Smart Hostel Management
          </div>
        </div>
        {/* Card */}
        <div style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:'20px', padding:'36px 32px',
          boxShadow:'var(--amber-glow), 0 32px 64px rgba(0,0,0,0.6)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{
            position:'absolute', top:0, left:'24px', right:'24px', height:'2px',
            background:'linear-gradient(90deg,transparent,var(--amber),var(--amber2),transparent)',
          }} />
          {children}
        </div>
      </div>
    </div>
  );
}