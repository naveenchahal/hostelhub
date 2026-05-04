import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { AuthLayout } from './AuthLayout';
import { Spinner } from '../../components/common';

export default function VerifyScreen() {
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

        {status === 'loading' && (
          <>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
              <Spinner size={32} />
            </div>
            <p style={{ color:'var(--text2)', fontSize:'14px' }}>
              Verifying your email...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize:'48px', marginBottom:'14px' }}>✅</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', marginBottom:'8px' }}>
              Email Verified!
            </h2>
            <p style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'24px' }}>
              Your account is now active. You can sign in.
            </p>
            <Link
              to="/login"
              style={{ color:'var(--amber)', fontWeight:'600', fontSize:'14px', textDecoration:'none' }}
            >
              Go to Sign In →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize:'48px', marginBottom:'14px' }}>❌</div>
            <h2 style={{
              fontFamily:'var(--font-display)', fontSize:'22px',
              fontWeight:'700', marginBottom:'8px', color:'var(--red)',
            }}>
              Link Expired
            </h2>
            <p style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'24px' }}>
              This verification link is invalid or has expired.
              Please register again or contact support.
            </p>
            <Link
              to="/login"
              style={{ color:'var(--amber)', fontWeight:'600', fontSize:'14px', textDecoration:'none' }}
            >
              ← Back to Login
            </Link>
          </>
        )}

      </div>
    </AuthLayout>
  );
}