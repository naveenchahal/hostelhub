import client from './client';

// ── AUTH ──────────────────────────────────────────────────
export const authApi = {
  login:          (d) => client.post('/auth/login', d),
  register:       (d) => client.post('/auth/register', d),
  verifyOtp:      (d) => client.post('/auth/verify-otp', d),   // ✅ naya
  resendOtp:      (d) => client.post('/auth/resend-otp', d),   // ✅ naya
  forgotPassword: (e) => client.post('/auth/forgot-password', { email: e }),
  resetPassword:  (t, p) => client.put(`/auth/reset-password/${t}`, { password: p }),
  getMe:          () => client.get('/auth/me'),
  updateProfile:  (d) => client.put('/auth/update-profile', d),
  changePassword: (d) => client.put('/auth/change-password', d),
  logout:         () => client.post('/auth/logout'),
};

// ── LEAVE ─────────────────────────────────────────────────
export const leaveApi = {
  apply:    (d)  => client.post('/leave', d),
  getAll:   (p)  => client.get('/leave', { params: p }),
  getById:  (id) => client.get(`/leave/${id}`),
  approve:  (id) => client.put(`/leave/${id}/approve`),
  reject:   (id, reason) => client.put(`/leave/${id}/reject`, { reason }),
  cancel:   (id) => client.delete(`/leave/${id}`),
  scanQR:   (d)  => client.post('/leave/scan-qr', d),
};

// ── COMPLAINTS ────────────────────────────────────────────
export const complaintApi = {
  create:       (d)  => client.post('/complaints', d),
  getAll:       (p)  => client.get('/complaints', { params: p }),
  getById:      (id) => client.get(`/complaints/${id}`),
  updateStatus: (id, d) => client.put(`/complaints/${id}/status`, d),
  rate:         (id, rating) => client.put(`/complaints/${id}/rate`, { rating }),
  getStats:     () => client.get('/complaints/stats'),
};

// ── MESS ──────────────────────────────────────────────────
export const messApi = {
  createMenu:      (d)  => client.post('/mess/menu', d),
  getTodayMenu:    () => client.get('/mess/menu/today'),
  getWeekMenu:     () => client.get('/mess/menu/week'),
  publishMenu:     (id) => client.put(`/mess/menu/${id}/publish`),
  submitFeedback:  (d)  => client.post('/mess/feedback', d),
  getAnalytics:    () => client.get('/mess/feedback/analytics'),
};

// ── MARKETPLACE ───────────────────────────────────────────
export const marketApi = {
  create:          (d)  => client.post('/marketplace', d),
  getAll:          (p)  => client.get('/marketplace', { params: p }),
  getById:         (id) => client.get(`/marketplace/${id}`),
  expressInterest: (id) => client.post(`/marketplace/${id}/interest`),
  markSold:        (id) => client.put(`/marketplace/${id}/sold`),
  deleteListing:   (id) => client.delete(`/marketplace/${id}`),
  getMyListings:   () => client.get('/marketplace/my-listings'),
};

// ── POLLS ─────────────────────────────────────────────────
export const pollApi = {
  create:  (d)  => client.post('/polls', d),
  getAll:  () => client.get('/polls'),
  vote:    (id, optionId) => client.post(`/polls/${id}/vote`, { optionId }),
  close:   (id) => client.delete(`/polls/${id}`),
};

// ── NOTIFICATIONS ─────────────────────────────────────────
export const notifApi = {
  getAll:     () => client.get('/notifications'),
  markRead:   (id) => client.put(`/notifications/${id}/read`),
  markAllRead:() => client.put('/notifications/read-all'),
  broadcast:  (d)  => client.post('/notifications/broadcast', d),
};

// ── LOST & FOUND ──────────────────────────────────────────
export const lostFoundApi = {
  create:  (d)  => client.post('/lost-found', d),
  getAll:  (p)  => client.get('/lost-found', { params: p }),
  resolve: (id, resolvedWith) => client.put(`/lost-found/${id}/resolve`, { resolvedWith }),
};

// ── AI ────────────────────────────────────────────────────
export const aiApi = {
  chat:       (message) => client.post('/ai/chat', { message }),
  messSummary:() => client.get('/ai/mess-summary'),
};

// ── ADMIN ─────────────────────────────────────────────────
export const adminApi = {
  getStudents:   (p)  => client.get('/admin/students', { params: p }),
  updateRoom:    (id, d) => client.put(`/admin/students/${id}/room`, d),
  toggleStudent: (id) => client.put(`/admin/students/${id}/toggle`),
  getDashboard:  () => client.get('/admin/dashboard'),
};