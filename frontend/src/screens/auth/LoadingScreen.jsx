import React from 'react';
import { Spinner } from '../../components/common';

export default function LoadingScreen() {
  return (
    <div style={{
      minHeight:'100vh', background:'var(--bg)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:'16px',
    }}>
      <div style={{
        fontFamily:'var(--font-display)', fontSize:'28px',
        fontWeight:'800', color:'var(--amber)',
        textShadow:'0 0 30px rgba(232,160,32,0.3)',
      }}>HostelHive</div>
      <Spinner size={28} />
    </div>
  );
}