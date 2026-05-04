const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const LeavePass = require('../model/LeavePass');
const { Notification } = require('../model/index');
const { sendLeaveApprovedEmail, sendLeaveRejectedEmail } = require('../services/emailService');
const { scoreLeaveRisk } = require('../services/aiService');

// POST /api/leave — apply for leave
exports.applyLeave = async (req, res, next) => {
  try {
    const { reason, destination, contactDuringLeave, parentPhone, departureDate, returnDate } = req.body;

    // AI risk scoring
    const riskData = await scoreLeaveRisk(req.user, { reason, destination, departureDate, returnDate });

    const leave = await LeavePass.create({
      student: req.user._id,
      reason, destination, contactDuringLeave, parentPhone,
      departureDate: new Date(departureDate),
      returnDate: new Date(returnDate),
      aiRiskScore: riskData.riskScore,
      aiRiskReason: riskData.flags?.join('; '),
    });

    // Notify wardens
    await Notification.create({
      title: 'New Leave Application',
      message: `${req.user.name} (${req.user.roomNumber || 'Room N/A'}) applied for leave to ${destination}.`,
      type: 'leave',
      isGlobal: false,
      sender: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Leave application submitted.', leave });
  } catch (err) { next(err); }
};

// GET /api/leave — student: own leaves; warden: all
exports.getLeaves = async (req, res, next) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user._id } : {};
    const { status, page = 1, limit = 10 } = req.query;
    if (status) filter.status = status;

    const leaves = await LeavePass.find(filter)
      .populate('student', 'name email roomNumber rollNumber')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await LeavePass.countDocuments(filter);
    res.json({ success: true, leaves, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/leave/:id
exports.getLeaveById = async (req, res, next) => {
  try {
    const leave = await LeavePass.findById(req.params.id)
      .populate('student', 'name email roomNumber phone')
      .populate('approvedBy', 'name');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });
    res.json({ success: true, leave });
  } catch (err) { next(err); }
};

// PUT /api/leave/:id/approve — warden only
exports.approveLeave = async (req, res, next) => {
  try {
    const leave = await LeavePass.findById(req.params.id).populate('student');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Leave is already processed.' });

    // Generate QR token & code
    const qrToken = uuidv4();
    const qrPayload = JSON.stringify({
      leaveId: leave._id,
      token: qrToken,
      student: leave.student.name,
      room: leave.student.roomNumber,
      departure: leave.departureDate,
      returnDate: leave.returnDate,
    });

    const qrBase64 = await QRCode.toDataURL(qrPayload, {
      width: 300,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });

    leave.status = 'approved';
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    leave.qrCode = qrBase64;
    leave.qrToken = qrToken;
    await leave.save();

    await sendLeaveApprovedEmail(leave.student, leave, qrBase64);

    await Notification.create({
      title: 'Leave Approved ✅',
      message: `Your leave to ${leave.destination} has been approved. Check your email for the QR pass.`,
      type: 'leave',
      recipients: [leave.student._id],
      sender: req.user._id,
    });

    res.json({ success: true, message: 'Leave approved and QR sent.', leave });
  } catch (err) { next(err); }
};

// PUT /api/leave/:id/reject — warden only
exports.rejectLeave = async (req, res, next) => {
  try {
    const leave = await LeavePass.findById(req.params.id).populate('student');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });

    leave.status = 'rejected';
    leave.rejectionReason = req.body.reason || 'Not approved by warden';
    leave.approvedBy = req.user._id;
    await leave.save();

    await sendLeaveRejectedEmail(leave.student, leave);

    await Notification.create({
      title: 'Leave Rejected ❌',
      message: `Your leave application has been rejected. Reason: ${leave.rejectionReason}`,
      type: 'leave',
      recipients: [leave.student._id],
      sender: req.user._id,
    });

    res.json({ success: true, message: 'Leave rejected.', leave });
  } catch (err) { next(err); }
};

// POST /api/leave/scan-qr — gate guard scans QR
exports.scanQR = async (req, res, next) => {
  try {
    const { leaveId, token } = req.body;
    const leave = await LeavePass.findById(leaveId).populate('student', 'name roomNumber');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });
    if (leave.qrToken !== token) return res.status(400).json({ success: false, message: 'Invalid QR code.' });
    if (leave.status !== 'approved') return res.status(400).json({ success: false, message: `Leave is ${leave.status}.` });
    if (new Date() > new Date(leave.returnDate)) return res.status(400).json({ success: false, message: 'Leave pass has expired.' });

    leave.qrScannedAt = new Date();
    leave.qrScannedBy = req.user._id;
    await leave.save();

    res.json({
      success: true,
      message: 'QR verified successfully.',
      student: leave.student,
      departure: leave.departureDate,
      returnDate: leave.returnDate,
      destination: leave.destination,
    });
  } catch (err) { next(err); }
};

// DELETE /api/leave/:id — student can cancel pending
exports.cancelLeave = async (req, res, next) => {
  try {
    const leave = await LeavePass.findOne({ _id: req.params.id, student: req.user._id });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found.' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Can only cancel pending applications.' });
    await leave.deleteOne();
    res.json({ success: true, message: 'Leave application cancelled.' });
  } catch (err) { next(err); }
};