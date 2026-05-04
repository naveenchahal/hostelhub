import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api';
import { AuthLayout } from './AuthLayout';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { Spinner } from '../../components/common';

// ── Reset Password ────────────────────────────────────────
export function ResetScreen() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handle = async (e) => {
    e?.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6)  return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch { toast.error('Reset link expired or invalid'); }
    finally  { setLoading(false); }
  };

  return (
    <AuthLayout>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', marginBottom:'24px' }}>New Password 🔑</h2>
      <form onSubmit={handle}>
        <FormField label="New Password"     id="pass"    type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required />
        <FormField label="Confirm Password" id="confirm" type="password" value={confirm}  onChange={e => setConfirm(e.target.value)}  placeholder="Repeat password"   required />
        <Button type="submit" fullWidth loading={loading}>Reset Password</Button>
      </form>
    </AuthLayout>
  );
}
export default ResetScreen;

// ── Verify Email ──────────────────────────────────────────
export function VerifyScreen() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthLayout>
      <div style={{ textAlign:'center', padding:'24px 0' }}>
        {status === 'loading' && <><Spinner size={32} /><p style={{ marginTop:'14px', color:'var(--text2)' }}>Verifying your email...</p></>}
        {status === 'success' && (
          <>
            <div style={{ fontSize:'48px', marginBottom:'14px' }}>✅</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', marginBottom:'8px' }}>Email Verified!</h2>
            <p style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'20px' }}>Your account is now active. You can sign in.</p>
            <Link to="/login" style={{ color:'var(--amber)', fontWeight:'600', fontSize:'14px' }}>Go to Sign In →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize:'48px', marginBottom:'14px' }}>❌</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', marginBottom:'8px', color:'var(--red)' }}>Link Expired</h2>
            <p style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'20px' }}>Verification link is invalid or expired.</p>
            <Link to="/login" style={{ color:'var(--amber)', fontWeight:'600', fontSize:'14px' }}>← Back to Login</Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}