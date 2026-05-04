const express = require('express');
const router = express.Router();
const User = require('../model/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('warden', 'admin'));

// GET /api/admin/students — list all students
router.get('/students', async (req, res, next) => {
  try {
    const { search, block, page = 1, limit = 20 } = req.query;
    const filter = { role: 'student' };
    if (block) filter.hostelBlock = block;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
      { roomNumber: { $regex: search, $options: 'i' } },
    ];

    const students = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ name: 1 })
      .limit(+limit).skip((page - 1) * limit);

    const total = await User.countDocuments(filter);
    res.json({ success: true, students, total });
  } catch (err) { next(err); }
});

// PUT /api/admin/students/:id/room — assign room
router.put('/students/:id/room', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { roomNumber: req.body.roomNumber, hostelBlock: req.body.hostelBlock },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// PUT /api/admin/students/:id/toggle — activate/deactivate
router.put('/students/:id/toggle', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (err) { next(err); }
});

// GET /api/admin/dashboard — summary stats
router.get('/dashboard', async (req, res, next) => {
  try {
    // ✅ Fixed: '../model' (singular) — same as rest of the app
    const LeavePass = require('../model/LeavePass');
    const { Complaint, Marketplace, Poll } = require('../model/index');

    const [totalStudents, pendingLeaves, openComplaints, activeListings, activePolls] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      LeavePass.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
      Marketplace.countDocuments({ isAvailable: true, isSold: false }),
      Poll.countDocuments({ isActive: true }),
    ]);

    const recentLeaves = await LeavePass.find({ status: 'pending' })
      .populate('student', 'name roomNumber')
      .sort({ createdAt: -1 }).limit(5);

    const urgentComplaints = await Complaint.find({
      priority: 'urgent',
      status: { $in: ['open', 'in-progress'] },
    })
      .populate('student', 'name roomNumber')
      .sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: { totalStudents, pendingLeaves, openComplaints, activeListings, activePolls },
      recentLeaves,
      urgentComplaints,
    });
  } catch (err) { next(err); }
});

module.exports = router;