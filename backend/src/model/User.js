const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'warden', 'admin'], default: 'student' },
  roomNumber: { type: String },
  rollNumber: { type: String, unique: true, sparse: true },
  phone: { type: String },
  profilePhoto: { type: String, default: '' },
  hostelBlock: { type: String },
  course: { type: String },
  year: { type: Number },

  // Email Verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpire: Date,

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Refresh Token
  refreshToken: { type: String, select: false },

  // AI Profile: preferences for smart features
  aiPreferences: {
    dietType: { type: String, enum: ['veg', 'non-veg', 'vegan'], default: 'veg' },
    mealFeedbackHistory: [{ meal: String, rating: Number, date: Date }],
  },

  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailVerifyToken;
  delete obj.resetPasswordToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);