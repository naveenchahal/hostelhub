const jwt = require('jsonwebtoken');
const User = require('../model/User');

// ── Protect Routes ────────────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User no longer exists.' });
    if (!req.user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated.' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// ── Role Guard ────────────────────────────────────────────────────────────────
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized.` });
  }
  next();
};

// ── Verified Email Guard ──────────────────────────────────────────────────────
exports.requireVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ success: false, message: 'Please verify your email first.' });
  }
  next();
};

// ── Global Error Handler ──────────────────────────────────────────────────────
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, message: error.message });
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists.`;
    return res.status(400).json({ success: false, message: error.message });
  }
  // Validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};