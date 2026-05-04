const mongoose = require('mongoose');

const leavePassSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  destination: { type: String, required: true },
  contactDuringLeave: { type: String, required: true },
  parentPhone: { type: String, required: true },

  departureDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired', 'returned'],
    default: 'pending'
  },

  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,

  // QR Code
  qrCode: { type: String },         // base64 QR image
  qrToken: { type: String, unique: true, sparse: true }, // unique token embedded in QR
  qrScannedAt: Date,
  qrScannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // AI Risk Flag
  aiRiskScore: { type: Number, default: 0 }, // 0-100
  aiRiskReason: String,

}, { timestamps: true });

module.exports = mongoose.model('LeavePass', leavePassSchema);