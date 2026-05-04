import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) return toast.error('Email and password required');
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(
        data.user.role === 'warden' || data.user.role === 'admin'
          ? '/warden/dashboard'
          : '/dashboard',
        { replace: true }
      );
    } catch (err) {
      // ✅ Fix: Real error dikhao — demo fallback hata diya
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'22px', fontWeight:'700', marginBottom:'4px' }}>
        Welcome back
      </h2>
      <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'24px' }}>
        Your role is managed by hostel administration
      </p>

      <form onSubmit={handleLogin}>
        <FormField label="Email Address" id="email" type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="your@college.edu" required />
        <FormField label="Password" id="password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

        <div style={{ textAlign:'right', marginBottom:'18px' }}>
          <Link to="/forgot-password" style={{ fontSize:'12px', color:'var(--amber)', textDecoration:'none' }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading}>Sign In</Button>
      </form>

      <p style={{ textAlign:'center', marginTop:'16px', fontSize:'13px', color:'var(--text2)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color:'var(--amber)', textDecoration:'none', fontWeight:'600' }}>Register</Link>
      </p>
    </AuthLayout>
  );
}