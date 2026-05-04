const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/complaintController');
const { protect, authorize, requireVerified } = require('../middleware/auth');
const { uploadComplaintImages } = require('../middleware/upload');

router.use(protect, requireVerified);

router.post('/', authorize('student'), uploadComplaintImages, ctrl.createComplaint);
router.get('/', ctrl.getComplaints);
router.get('/stats', authorize('warden', 'admin'), ctrl.getStats);
router.get('/:id', ctrl.getComplaintById);
router.put('/:id/status', authorize('warden', 'admin'), ctrl.updateStatus);
router.put('/:id/rate', authorize('student'), ctrl.rateResolution);

module.exports = router;