require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db.js');
const { errorHandler } = require('./middleware/auth.js');

// Routes
const authRouter = require('./routes/auth.js');
const leaveRouter = require('./routes/leave.js');
const complaintRouter = require('./routes/complaints.js');
const adminRouter = require('./routes/admin.js');
const { messRouter, mkRouter, pollRouter, notifRouter, lfRouter, aiRouter } = require('./routes/index.js');

// Init
const app = express();
const server = http.createServer(app);

// ── Socket.IO for real-time notifications ─────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`🔌 User ${userId} connected.`);
  });
  socket.on('disconnect', () => console.log('🔌 Client disconnected.'));
});

// Make io available in controllers via app locals
app.set('io', io);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests. Please slow down.' }
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/complaints', complaintRouter);
app.use('/api/mess', messRouter);
app.use('/api/marketplace', mkRouter);
app.use('/api/polls', pollRouter);
app.use('/api/notifications', notifRouter);
app.use('/api/lost-found', lfRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => res.json({
  success: true,
  message: '🏛️ HostelHub API is running',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` }));

// Global error handler
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // Start cron jobs after DB connected
  require('./utils/cronJobs');

  server.listen(PORT, () => {
    console.log('\n══════════════════════════════════════════');
    console.log(`🏛️  HostelHub API running on port ${PORT}`);
    console.log(`📡  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗  Health: http://localhost:${PORT}/api/health`);
    console.log('══════════════════════════════════════════\n');
  });
});

module.exports = { app, io };