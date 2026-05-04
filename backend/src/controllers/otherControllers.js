const { Poll, Notification, LostFound } = require('../model/index');
const { hostelChatbot } = require('../services/aiService');

// ═══════════════════════════════════════════════════════════════════════════════
// POLLS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/polls
exports.createPoll = async (req, res, next) => {
  try {
    const { question, description, options, isAnonymous, expiresAt, targetAudience } = req.body;
    if (!options || options.length < 2) return res.status(400).json({ success: false, message: 'Minimum 2 options required.' });

    const poll = await Poll.create({
      createdBy: req.user._id,
      question, description,
      options: options.map(o => ({ text: o, votes: [] })),
      isAnonymous, targetAudience,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await Notification.create({
      title: '📊 New Poll',
      message: `New poll: "${question}" — cast your vote now!`,
      type: 'poll',
      isGlobal: true,
      sender: req.user._id,
    });

    res.status(201).json({ success: true, poll });
  } catch (err) { next(err); }
};

// GET /api/polls
exports.getPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find({ isActive: true })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    // Attach vote count but hide voter identities if anonymous
    const formatted = polls.map(p => {
      const obj = p.toObject();
      obj.options = obj.options.map(o => ({
        ...o,
        voteCount: o.votes.length,
        hasVoted: o.votes.map(String).includes(req.user._id.toString()),
        votes: p.isAnonymous ? [] : o.votes,
      }));
      obj.totalVotes = obj.options.reduce((s, o) => s + o.voteCount, 0);
      return obj;
    });

    res.json({ success: true, polls: formatted });
  } catch (err) { next(err); }
};

// POST /api/polls/:id/vote
exports.vote = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll || !poll.isActive) return res.status(404).json({ success: false, message: 'Poll not found or closed.' });
    if (poll.expiresAt && new Date() > poll.expiresAt) return res.status(400).json({ success: false, message: 'Poll has expired.' });

    const userId = req.user._id;
    const alreadyVoted = poll.options.some(o => o.votes.map(String).includes(userId.toString()));
    if (alreadyVoted) return res.status(400).json({ success: false, message: 'You have already voted.' });

    const option = poll.options.id(req.body.optionId);
    if (!option) return res.status(404).json({ success: false, message: 'Option not found.' });

    option.votes.push(userId);
    await poll.save();
    res.json({ success: true, message: 'Vote recorded!' });
  } catch (err) { next(err); }
};

// DELETE /api/polls/:id — warden only
exports.closePoll = async (req, res, next) => {
  try {
    await Poll.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Poll closed.' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { isGlobal: true },
        { recipients: req.user._id }
      ]
    })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter(n => !n.readBy.map(String).includes(req.user._id.toString())).length;
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { $or: [{ isGlobal: true }, { recipients: req.user._id }] },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
};

// POST /api/notifications/broadcast — warden sends announcement
exports.broadcast = async (req, res, next) => {
  try {
    const notif = await Notification.create({
      title: req.body.title,
      message: req.body.message,
      type: 'announcement',
      isGlobal: true,
      sender: req.user._id,
      priority: req.body.priority || 'normal',
    });
    res.status(201).json({ success: true, notification: notif });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOST & FOUND
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/lost-found
exports.createPost = async (req, res, next) => {
  try {
    const images = req.files ? req.files.map(f => `/uploads/lost-found/${f.filename}`) : [];
    const post = await LostFound.create({ ...req.body, postedBy: req.user._id, images });

    await Notification.create({
      title: `${req.body.type === 'lost' ? '🔍 Lost Item' : '📦 Found Item'}`,
      message: `${req.user.name} posted: "${req.body.title}" — check the Lost & Found board.`,
      type: 'lost-found',
      isGlobal: true,
      sender: req.user._id,
    });

    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
};

// GET /api/lost-found
exports.getPosts = async (req, res, next) => {
  try {
    const { type, category, search, page = 1, limit = 10 } = req.query;
    const filter = { isResolved: false };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];

    const posts = await LostFound.find(filter)
      .populate('postedBy', 'name roomNumber hostelBlock profilePhoto')
      .sort({ createdAt: -1 })
      .limit(+limit).skip((page - 1) * limit);

    const total = await LostFound.countDocuments(filter);
    res.json({ success: true, posts, total });
  } catch (err) { next(err); }
};

// PUT /api/lost-found/:id/resolve
exports.resolvePost = async (req, res, next) => {
  try {
    const post = await LostFound.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    post.isResolved = true;
    post.resolvedWith = req.body.resolvedWith;
    await post.save();
    res.json({ success: true, message: 'Marked as resolved!' });
  } catch (err) { next(err); }
};

// ═══════════════════════════════════════════════════════════════════════════════
// AI CHATBOT
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/ai/chat
exports.aiChat = async (req, res, next) => {
  try {
    const reply = await hostelChatbot(req.body.message, { hostelName: 'HostelHub' });
    res.json({ success: true, reply });
  } catch (err) { next(err); }
};

// GET /api/ai/mess-summary — warden
exports.getMessAISummary = async (req, res, next) => {
  try {
    const { MessFeedback } = require('../models/Mess');
    const data = await MessFeedback.aggregate([
      { $match: { date: { $gte: new Date(Date.now() - 7 * 86400000) } } },
      { $group: { _id: '$mealType', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const { generateMessSummary } = require('../services/aiService');
    const summary = await generateMessSummary(data);
    res.json({ success: true, summary });
  } catch (err) { next(err); }
};