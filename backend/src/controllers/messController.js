const { MessMenu, MessFeedback } = require('../model/Mess');
const { generateMessSummary } = require('../services/aiService');

// POST /api/mess/menu — warden creates/updates menu
exports.createMenu = async (req, res, next) => {
  try {
    const { day, date, meals } = req.body;
    const existing = await MessMenu.findOne({ day, date: date ? new Date(date) : undefined });
    if (existing) {
      Object.assign(existing, { meals, createdBy: req.user._id });
      await existing.save();
      return res.json({ success: true, menu: existing });
    }
    const menu = await MessMenu.create({ day, date, meals, createdBy: req.user._id });
    res.status(201).json({ success: true, menu });
  } catch (err) { next(err); }
};

// GET /api/mess/menu/today
exports.getTodayMenu = async (req, res, next) => {
  try {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    const menu = await MessMenu.findOne({ day: today, isPublished: true });
    res.json({ success: true, menu, day: today });
  } catch (err) { next(err); }
};

// GET /api/mess/menu/week
exports.getWeekMenu = async (req, res, next) => {
  try {
    const menus = await MessMenu.find({ isPublished: true }).sort({ createdAt: -1 }).limit(7);
    res.json({ success: true, menus });
  } catch (err) { next(err); }
};

// PUT /api/mess/menu/:id/publish — warden
exports.publishMenu = async (req, res, next) => {
  try {
    const menu = await MessMenu.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
    res.json({ success: true, menu });
  } catch (err) { next(err); }
};

// POST /api/mess/feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { menuId, mealType, rating, comment } = req.body;
    const feedback = await MessFeedback.findOneAndUpdate(
      { student: req.user._id, menu: menuId, mealType },
      { rating, comment, date: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, feedback });
  } catch (err) { next(err); }
};

// GET /api/mess/feedback/analytics — warden
exports.getFeedbackAnalytics = async (req, res, next) => {
  try {
    const analytics = await MessFeedback.aggregate([
      { $group: {
        _id: '$mealType',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
        ratings: { $push: '$rating' }
      }}
    ]);

    const recentFeedback = await MessFeedback.find()
      .populate('student', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    // AI weekly summary
    const aiSummary = await generateMessSummary(analytics);

    res.json({ success: true, analytics, recentFeedback, aiSummary });
  } catch (err) { next(err); }
};