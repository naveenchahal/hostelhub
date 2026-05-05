const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 32px; text-align: center; }
    .header h1 { color: #e94560; margin: 0; font-size: 28px; letter-spacing: 2px; }
    .header p { color: #a0aec0; margin: 6px 0 0; font-size: 13px; }
    .body { padding: 36px 40px; color: #2d3748; }
    .body h2 { color: #1a1a2e; margin-top: 0; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #e94560, #c62a47); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; letter-spacing: 0.5px; }
    .code { background: #f7fafc; border: 2px dashed #e94560; border-radius: 8px; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; margin: 20px 0; }
    .footer { background: #f7fafc; padding: 20px 40px; text-align: center; color: #718096; font-size: 12px; border-top: 1px solid #e2e8f0; }
    .info-box { background: #ebf8ff; border-left: 4px solid #4299e1; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .success-box { background: #f0fff4; border-left: 4px solid #48bb78; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .warning-box { background: #fffbeb; border-left: 4px solid #f6ad55; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ HOSTELHUB</h1>
      <p>Your Smart Hostel Companion</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HostelHub. This is an automated message, please do not reply.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  </div>
</body>
</html>`;

// ── Core send function ────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  return await resend.emails.send({
   from: "Placementor <noreply@placementor.xyz>",
    to,
    subject,
    html,
  });
};

// ── OTP Email ─────────────────────────────────────────────────────────────────
const sendOtpEmail = async (user, otp) => {
  return await sendEmail({  // ✅ return add kiya
    to: user.email,
    subject: '🔑 Your OTP — HostelHub',
    html: baseTemplate(`
      <h2>OTP Verification 🔐</h2>
      <p>Hi <strong>${user.name}</strong>, use the code below to verify your account:</p>
      <div class="code">${otp}</div>
      <div class="warning-box">
        <strong>⏰ This OTP expires in 5 minutes.</strong> Do not share it with anyone.
      </div>
    `),
  });
};

// ── Verify Email ──────────────────────────────────────────────────────────────
const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  return await sendEmail({
    to: user.email,
    subject: '✅ Verify Your HostelHub Account',
    html: baseTemplate(`
      <h2>Welcome to HostelHub, ${user.name}! 👋</h2>
      <p>We're excited to have you on board. Please verify your email address to activate your account.</p>
      <div style="text-align:center">
        <a href="${url}" class="btn">Verify My Email</a>
      </div>
      <div class="warning-box">
        <strong>⏰ This link expires in 24 hours.</strong>
      </div>
      <p>Or copy this link: <code style="color:#e94560">${url}</code></p>
    `),
  });
};

// ── Password Reset ────────────────────────────────────────────────────────────
const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  return await sendEmail({
    to: user.email,
    subject: '🔐 Reset Your HostelHub Password',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi <strong>${user.name}</strong>, we received a request to reset your password.</p>
      <div style="text-align:center">
        <a href="${url}" class="btn">Reset My Password</a>
      </div>
      <div class="warning-box">
        <strong>⏰ Link expires in 10 minutes.</strong> If you didn't request this, ignore this email.
      </div>
    `),
  });
};

// ── Leave Pass Approved ───────────────────────────────────────────────────────
const sendLeaveApprovedEmail = async (user, leavePass, qrBase64) => {
  return await sendEmail({
    to: user.email,
    subject: '✅ Leave Pass Approved — HostelHub',
    html: baseTemplate(`
      <h2>Your Leave Pass is Approved! 🎉</h2>
      <div class="success-box">
        <strong>Status:</strong> APPROVED<br>
        <strong>Destination:</strong> ${leavePass.destination}<br>
        <strong>Departure:</strong> ${new Date(leavePass.departureDate).toLocaleString()}<br>
        <strong>Return:</strong> ${new Date(leavePass.returnDate).toLocaleString()}
      </div>
      <p>Show the QR code below at the gate:</p>
      <div style="text-align:center; margin: 20px 0;">
        <img src="${qrBase64}" alt="QR Code" style="width:200px;height:200px;border:2px solid #e94560;border-radius:8px;padding:8px;" />
      </div>
      <div class="warning-box">⚠️ This QR code is single-use and time-bound. Do not share it.</div>
    `),
  });
};

// ── Leave Rejected ────────────────────────────────────────────────────────────
const sendLeaveRejectedEmail = async (user, leavePass) => {
  return await sendEmail({
    to: user.email,
    subject: '❌ Leave Pass Rejected — HostelHub',
    html: baseTemplate(`
      <h2>Leave Pass Update</h2>
      <div style="background:#fff5f5;border-left:4px solid #e94560;padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0;">
        <strong>Status:</strong> REJECTED<br>
        <strong>Reason:</strong> ${leavePass.rejectionReason || 'Not specified by warden'}
      </div>
      <p>You may re-apply with updated information. Contact your warden for more details.</p>
    `),
  });
};

// ── Complaint Update ──────────────────────────────────────────────────────────
const sendComplaintUpdateEmail = async (user, complaint) => {
  const statusColors = { 'in-progress': '#4299e1', resolved: '#48bb78', closed: '#718096' };
  return await sendEmail({
    to: user.email,
    subject: `🔧 Complaint Update — ${complaint.title}`,
    html: baseTemplate(`
      <h2>Your Complaint Has Been Updated</h2>
      <div class="info-box">
        <strong>Complaint:</strong> ${complaint.title}<br>
        <strong>Status:</strong> <span style="color:${statusColors[complaint.status] || '#e94560'};font-weight:bold;text-transform:uppercase">${complaint.status}</span><br>
        <strong>Category:</strong> ${complaint.category}
      </div>
      <p>Track your complaint status on the HostelHub portal.</p>
    `),
  });
};

module.exports = {
  sendOtpEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLeaveApprovedEmail,
  sendLeaveRejectedEmail,
  sendComplaintUpdateEmail,
};