const express = require('express');
const { protect, authorize, requireVerified } = require('../middleware/auth');
const { uploadMarketplaceImages, uploadLostFoundImages } = require('../middleware/upload');

const messCtrl = require('../controllers/messController');
const mkCtrl = require('../controllers/marketplaceController');
const {
  createPoll, getPolls, vote, closePoll,
  getNotifications, markRead, markAllRead, broadcast,
  createPost, getPosts, resolvePost,
  aiChat, getMessAISummary,
} = require('../controllers/otherControllers');

// ─── MESS ─────────────────────────────────────────────────────────────────────
const messRouter = express.Router();
messRouter.use(protect, requireVerified);
messRouter.post('/menu', authorize('warden', 'admin'), messCtrl.createMenu);
messRouter.get('/menu/today', messCtrl.getTodayMenu);
messRouter.get('/menu/week', messCtrl.getWeekMenu);
messRouter.put('/menu/:id/publish', authorize('warden', 'admin'), messCtrl.publishMenu);
messRouter.post('/feedback', authorize('student'), messCtrl.submitFeedback);
messRouter.get('/feedback/analytics', authorize('warden', 'admin'), messCtrl.getFeedbackAnalytics);

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
const mkRouter = express.Router();
mkRouter.use(protect, requireVerified);
mkRouter.post('/', authorize('student'), uploadMarketplaceImages, mkCtrl.createListing);
mkRouter.get('/', mkCtrl.getListings);
mkRouter.get('/my-listings', mkCtrl.getMyListings);
mkRouter.get('/:id', mkCtrl.getListingById);
mkRouter.post('/:id/interest', authorize('student'), mkCtrl.expressInterest);
mkRouter.put('/:id/sold', authorize('student'), mkCtrl.markSold);
mkRouter.delete('/:id', mkCtrl.deleteListing);

// ─── POLLS ────────────────────────────────────────────────────────────────────
const pollRouter = express.Router();
pollRouter.use(protect, requireVerified);
pollRouter.post('/', authorize('warden', 'admin'), createPoll);
pollRouter.get('/', getPolls);
pollRouter.post('/:id/vote', vote);
pollRouter.delete('/:id', authorize('warden', 'admin'), closePoll);

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const notifRouter = express.Router();
notifRouter.use(protect);
notifRouter.get('/', getNotifications);
notifRouter.put('/read-all', markAllRead);
notifRouter.put('/:id/read', markRead);
notifRouter.post('/broadcast', authorize('warden', 'admin'), broadcast);

// ─── LOST & FOUND ─────────────────────────────────────────────────────────────
const lfRouter = express.Router();
lfRouter.use(protect, requireVerified);
lfRouter.post('/', uploadLostFoundImages, createPost);
lfRouter.get('/', getPosts);
lfRouter.put('/:id/resolve', resolvePost);

// ─── AI ───────────────────────────────────────────────────────────────────────
const aiRouter = express.Router();
aiRouter.use(protect);
aiRouter.post('/chat', aiChat);
aiRouter.get('/mess-summary', authorize('warden', 'admin'), getMessAISummary);

module.exports = { messRouter, mkRouter, pollRouter, notifRouter, lfRouter, aiRouter };