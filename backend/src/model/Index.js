const mongoose = require('mongoose');

// ─── COMPLAINT ────────────────────────────────────────────────────────────────
const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['electricity','plumbing','furniture','internet','cleanliness','pest','security','other'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [String],
  roomNumber: String,
  priority: { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
  status: {
    type: String,
    enum: ['open','in-progress','resolved','closed','reopened'],
    default: 'open'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeline: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }],
  resolvedAt: Date,
  rating: { type: Number, min: 1, max: 5 },
  // AI: auto-categorized priority
  aiSuggestedPriority: String,
}, { timestamps: true });

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
const marketplaceSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['books','electronics','clothing','stationery','appliances','food','other'],
    required: true
  },
  price: { type: Number, required: true },
  originalPrice: Number,
  condition: { type: String, enum: ['new','like-new','good','fair','poor'], default: 'good' },
  images: [String],
  isAvailable: { type: Boolean, default: true },
  isSold: { type: Boolean, default: false },
  interestedBuyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  // AI: suggested price
  aiSuggestedPrice: Number,
}, { timestamps: true });

// ─── POLL ─────────────────────────────────────────────────────────────────────
const pollSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  description: String,
  options: [{
    text: String,
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
  isAnonymous: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  targetAudience: { type: String, enum: ['all','students','wardens'], default: 'all' },
}, { timestamps: true });

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['announcement','leave','complaint','marketplace','poll','lost-found','mess','system'],
    default: 'announcement'
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGlobal: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  link: String,
  priority: { type: String, enum: ['low','normal','high'], default: 'normal' },
}, { timestamps: true });

// ─── LOST & FOUND ─────────────────────────────────────────────────────────────
const lostFoundSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['lost','found'], required: true },
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['electronics','keys','clothing','books','wallet','id-card','other'],
    default: 'other'
  },
  images: [String],
  lastSeenLocation: String,
  foundLocation: String,
  date: { type: Date, default: Date.now },
  isResolved: { type: Boolean, default: false },
  resolvedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactInfo: String,
}, { timestamps: true });

module.exports = {
  Complaint: mongoose.model('Complaint', complaintSchema),
  Marketplace: mongoose.model('Marketplace', marketplaceSchema),
  Poll: mongoose.model('Poll', pollSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  LostFound: mongoose.model('LostFound', lostFoundSchema),
};