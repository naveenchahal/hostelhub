require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/auth');

// Routes
const authRouter = require('./routes/auth');
const leaveRouter = require('./routes/leave');
const complaintRouter = require('./routes/complaints');
const adminRouter = require('./routes/admin');
const { messRouter, mkRouter, pollRouter, notifRouter, lfRouter, aiRouter } = require('./routes/index');

// Init
const app = express();
const server = http.createServer(app);

// ── Allowed Origins ───────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  // Local development

  
  'https://hostelhub02.vercel.app',

  // Allow any extra origin set in .env (e.g. staging URL)
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// ── Socket.IO for real-time notifications ─────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
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
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // preflight for all routes
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