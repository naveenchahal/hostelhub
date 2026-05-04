// ForgotScreen.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api';
import { AuthLayout } from './AuthLayout';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';

export function ForgotScreen() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handle = async (e) => {
    e?.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try { await authApi.forgotPassword(email); } catch {}
    setSent(true);
    setLoading(false);
  };

  return (
    <AuthLayout>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', marginBottom:'4px' }}>Reset Password 🔐</h2>
      <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'24px' }}>Enter your email to receive a reset link</p>
      {sent ? (
        <div style={{ textAlign:'center', padding:'24px 0' }}>
          <div style={{ fontSize:'36px', marginBottom:'12px' }}>📧</div>
          <p style={{ fontSize:'14px', color:'var(--green)', fontWeight:'600' }}>Reset link sent!</p>
          <p style={{ fontSize:'13px', color:'var(--text2)', marginTop:'6px' }}>Check your inbox and follow the link.</p>
        </div>
      ) : (
        <form onSubmit={handle}>
          <FormField label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@college.edu" required />
          <Button type="submit" fullWidth loading={loading}>Send Reset Link</Button>
        </form>
      )}
      <p style={{ textAlign:'center', marginTop:'16px', fontSize:'13px', color:'var(--text2)' }}>
        <Link to="/login" style={{ color:'var(--amber)', textDecoration:'none' }}>← Back to Sign In</Link>
      </p>
    </AuthLayout>
  );
}
export default ForgotScreen;