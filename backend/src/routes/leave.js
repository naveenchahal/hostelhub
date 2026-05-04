const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaveController');
const { protect, authorize, requireVerified } = require('../middleware/auth');

router.use(protect, requireVerified);

router.post('/', authorize('student'), ctrl.applyLeave);
router.get('/', ctrl.getLeaves);
router.get('/:id', ctrl.getLeaveById);
router.put('/:id/approve', authorize('warden', 'admin'), ctrl.approveLeave);
router.put('/:id/reject', authorize('warden', 'admin'), ctrl.rejectLeave);
router.post('/scan-qr', ctrl.scanQR);
router.delete('/:id', authorize('student'), ctrl.cancelLeave);

module.exports = router;