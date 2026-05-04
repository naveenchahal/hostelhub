import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import InfoBox from '../../components/common/InfoBox';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1 = register form, 2 = otp verify
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    rollNumber: '', roomNumber: '', course: '',
    hostelBlock: '', year: '',
  });
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // ── Step 1: Register ────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Name, email and password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authApi.register(form);
      setRegisteredEmail(form.email);
      toast.success('OTP bhej diya! Email check karo 📧');
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6) return toast.error('6 digit OTP enter karo');
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp({ email: registeredEmail, otp });
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}! 🎉`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'OTP galat hai!');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    try {
      await authApi.resendOtp({ email: registeredEmail });
      toast.success('OTP dobara bhej diya!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Kuch error hua');
    }
  };

  // ── Step 2 UI: OTP Screen ───────────────────────────────────────────────────
  if (step === 2) {
    return (
      <AuthLayout>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
          Verify Your Email
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>
          OTP bheja gaya: <strong>{registeredEmail}</strong>
        </p>

        <InfoBox variant="amber" icon="📧">
          Apna email check karo aur 6-digit OTP enter karo. OTP 5 minutes mein expire hoga.
        </InfoBox>

        <form onSubmit={handleVerifyOtp}>
          <div style={{ margin: '20px 0' }}>
            <FormField
              label="6-Digit OTP"
              id="otp"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="• • • • • •"
              required
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '22px' }}
            />
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Verify & Login
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text2)' }}>OTP nahi aaya? </span>
          <button
            onClick={handleResendOtp}
            style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            Dobara Bhejo
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button
            onClick={() => { setStep(1); setOtp(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '12px' }}
          >
            ← Wapas Register pe jao
          </button>
        </div>
      </AuthLayout>
    );
  }

  // ── Step 1 UI: Register Form ────────────────────────────────────────────────
  return (
    <AuthLayout>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
        Create Account
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px' }}>
        Join your hostel management system
      </p>

      <InfoBox variant="amber" icon="ℹ️">
        Your account role (Student / Warden) is assigned by hostel administration — not selectable here.
      </InfoBox>

      <form onSubmit={handleRegister}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField label="Full Name" id="name" value={form.name} onChange={set('name')} placeholder="Your full name" required />
          <FormField label="Email" id="email" type="email" value={form.email} onChange={set('email')} placeholder="email@college.edu" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField label="Roll Number" id="roll" value={form.rollNumber} onChange={set('rollNumber')} placeholder="CS2024001" />
          <FormField label="Room Number" id="room" value={form.roomNumber} onChange={set('roomNumber')} placeholder="A-101" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField label="Course" id="course" value={form.course} onChange={set('course')} placeholder="B.Tech CS" />
          <FormField label="Phone" id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField label="Hostel Block" id="hostelBlock" value={form.hostelBlock} onChange={set('hostelBlock')} placeholder="A / B / C" />
          <FormField label="Year" id="year" value={form.year} onChange={set('year')} placeholder="1 / 2 / 3 / 4" />
        </div>
        <FormField label="Password (min 6 chars)" id="password" type="password"
          value={form.password} onChange={set('password')} placeholder="Create a strong password" required />
        <Button type="submit" fullWidth loading={loading}>Create Account</Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text2)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--amber)', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
      </p>
    </AuthLayout>
  );
}