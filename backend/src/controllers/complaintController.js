const { Complaint, Notification } = require('../model/Index');
const { analyzeComplaintPriority } = require('../services/aiService');
const { sendComplaintUpdateEmail } = require('../services/emailService');

// POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, roomNumber } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/complaints/${f.filename}`) : [];

    // AI auto-priority
    const aiResult = await analyzeComplaintPriority(title, description, category);

    const complaint = await Complaint.create({
      student: req.user._id,
      title, description, category,
      roomNumber: roomNumber || req.user.roomNumber,
      images,
      priority: aiResult.priority || 'medium',
      aiSuggestedPriority: aiResult.priority,
      timeline: [{ status: 'open', note: 'Complaint filed.', updatedBy: req.user._id }],
    });

    // Notify wardens globally
    await Notification.create({
      title: `New Complaint: ${category}`,
      message: `${req.user.name} filed a ${aiResult.priority} priority complaint — "${title}"`,
      type: 'complaint',
      isGlobal: true,
      sender: req.user._id,
    });

    res.status(201).json({ success: true, complaint });
  } catch (err) { next(err); }
};

// GET /api/complaints
exports.getComplaints = async (req, res, next) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user._id } : {};
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('student', 'name email roomNumber')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(+limit).skip((page - 1) * limit);

    const total = await Complaint.countDocuments(filter);
    res.json({ success: true, complaints, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/complaints/:id
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email roomNumber phone')
      .populate('assignedTo', 'name email')
      .populate('timeline.updatedBy', 'name role');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    res.json({ success: true, complaint });
  } catch (err) { next(err); }
};

// PUT /api/complaints/:id/status — warden
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note, assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('student');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (status === 'resolved') complaint.resolvedAt = new Date();
    complaint.timeline.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });
    await complaint.save();

    await sendComplaintUpdateEmail(complaint.student, complaint);

    await Notification.create({
      title: `Complaint ${status}`,
      message: `Your complaint "${complaint.title}" is now ${status}.`,
      type: 'complaint',
      recipients: [complaint.student._id],
      sender: req.user._id,
    });

    res.json({ success: true, complaint });
  } catch (err) { next(err); }
};

// PUT /api/complaints/:id/rate — student rates after resolution
exports.rateResolution = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, student: req.user._id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found.' });
    if (complaint.status !== 'resolved') return res.status(400).json({ success: false, message: 'Only resolved complaints can be rated.' });
    complaint.rating = req.body.rating;
    await complaint.save();
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) { next(err); }
};

// GET /api/complaints/stats — warden dashboard
exports.getStats = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const avgResolution = await Complaint.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      { $project: { hours: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000] } } },
      { $group: { _id: null, avg: { $avg: '$hours' } } }
    ]);
    res.json({ success: true, stats, byCategory, avgResolutionHours: avgResolution[0]?.avg?.toFixed(1) });
  } catch (err) { next(err); }
};