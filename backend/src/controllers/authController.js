const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/User');
const Otp = require('../model/Otp');
const { sendOtpEmail, sendPasswordResetEmail } = require('../services/emailService');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
const signRefresh = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });

const sendTokens = async (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signRefresh(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  res.status(statusCode).json({ success: true, token, refreshToken, user });
};

// ── Register → OTP bhejo ──────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, roomNumber, rollNumber, phone, hostelBlock, course, year } = req.body;

    const existing = await User.findOne({ email });
    if (existing && existing.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Agar pehle se unverified user hai toh delete karo
    if (existing && !existing.isEmailVerified) {
      await User.deleteOne({ email });
    }

    // Naya user banao — unverified
    const user = await User.create({
      name, email, password,
      role: role === 'warden' ? 'warden' : 'student',
      roomNumber, rollNumber, phone, hostelBlock, course, year,
      isEmailVerified: false,
    });

    // OTP banao aur bhejo
    const otp = crypto.randomInt(100000, 999999).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    const result = await sendOtpEmail({ email, name }, otp);
    console.log('OTP Email Result:', result);

    res.status(201).json({
      success: true,
      message: 'OTP bhej diya! Email check karo.',
      email,
    });
  } catch (err) { next(err); }
};

// ── Verify OTP → Email verify karo ───────────────────────────────────────────
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP galat ya expire ho gaya!' });
    }

    // User ko verified mark karo
    const user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila!' });
    }

    await Otp.deleteMany({ email });

    // Seedha login kara do
    await sendTokens(user, 200, res);
  } catch (err) { next(err); }
};

// ── Resend OTP ────────────────────────────────────────────────────────────────
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User nahi mila!' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified hai!' });

    const otp = crypto.randomInt(100000, 999999).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
    await sendOtpEmail({ email, name: user.name }, otp);

    res.json({ success: true, message: 'OTP dobara bhej diya!' });
  } catch (err) { next(err); }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email aur password dono chahiye.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isEmailVerified) {
      // OTP dobara bhejo
      const otp = crypto.randomInt(100000, 999999).toString();
      await Otp.deleteMany({ email });
      await Otp.create({ email, otp });
      await sendOtpEmail({ email, name: user.name }, otp);

      return res.status(403).json({
        success: false,
        message: 'Email verify nahi hui! OTP bhej diya — check karo.',
        needsVerification: true,
        email,
      });
    }

    user.lastLogin = Date.now();
    await sendTokens(user, 200, res);
  } catch (err) { next(err); }
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token.' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const newToken = signToken(user._id);
    res.json({ success: true, token: newToken });
  } catch (err) { next(err); }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'Is email se koi account nahi mila.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, resetToken);
    res.json({ success: true, message: 'Password reset email bhej diya.' });
  } catch (err) { next(err); }
};

// ── Reset Password ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendTokens(user, 200, res);
  } catch (err) { next(err); }
};

// ── Get Me ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'course', 'year', 'hostelBlock', 'aiPreferences'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (req.file) updates.profilePhoto = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// ── Change Password ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password galat hai.' });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password update ho gaya.' });
  } catch (err) { next(err); }
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logout successful.' });
  } catch (err) { next(err); }
};