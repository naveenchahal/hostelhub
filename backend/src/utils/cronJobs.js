const cron = require('node-cron');
const LeavePass = require('../model/LeavePass');
const { Notification } = require('../model/index');
const User = require('../model/User');

// ── Every hour: expire overdue leave passes ───────────────────────────────────
cron.schedule('0 * * * *', async () => {
  try {
    const expired = await LeavePass.updateMany(
      { status: 'approved', returnDate: { $lt: new Date() } },
      { status: 'expired' }
    );
    if (expired.modifiedCount > 0) console.log(`⏰ Expired ${expired.modifiedCount} leave pass(es).`);
  } catch (err) { console.error('Cron (expire leaves):', err.message); }
});

// ── Daily 8am: remind students with pending leave about return ────────────────
cron.schedule('0 8 * * *', async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const leavesReturningTomorrow = await LeavePass.find({
      status: 'approved',
      returnDate: {
        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        $lte: new Date(tomorrow.setHours(23, 59, 59, 999)),
      },
    }).populate('student');

    for (const leave of leavesReturningTomorrow) {
      await Notification.create({
        title: '🏠 Return Reminder',
        message: `Reminder: You are due to return from ${leave.destination} tomorrow. Make sure to reach before curfew!`,
        type: 'leave',
        recipients: [leave.student._id],
      });
    }
    if (leavesReturningTomorrow.length) console.log(`📨 Sent ${leavesReturningTomorrow.length} return reminders.`);
  } catch (err) { console.error('Cron (return reminder):', err.message); }
});

// ── Daily 9am: send mess menu notification ────────────────────────────────────
cron.schedule('0 9 * * *', async () => {
  try {
    const { MessMenu } = require('../models/Mess');
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    const menu = await MessMenu.findOne({ day: today, isPublished: true });
    if (menu) {
      await Notification.create({
        title: `🍛 Today's Mess Menu — ${today}`,
        message: `Check out today's meals including: ${menu.meals?.lunch?.items?.map(i => i.name).join(', ') || 'Lunch available'}`,
        type: 'mess',
        isGlobal: true,
      });
    }
  } catch (err) { console.error('Cron (mess menu notif):', err.message); }
});

console.log('✅ Cron jobs initialized.');