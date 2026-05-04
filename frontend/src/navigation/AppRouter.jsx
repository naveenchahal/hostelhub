import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotifProvider } from '../context/NotifContext';

// Auth screens
import LoginScreen      from '../screens/auth/LoginScreen';
import RegisterScreen   from '../screens/auth/RegisterScreen';
import ForgotScreen     from '../screens/auth/ForgotScreen';
import ResetScreen      from '../screens/auth/ResetScreen';
import VerifyScreen     from '../screens/auth/VerifyScreen';

// Layout
import AppLayout        from '../components/layout/AppLayout';
import LoadingScreen    from '../screens/auth/LoadingScreen';

// Student screens
import StudentDashboard     from '../screens/student/DashboardScreen';
import LeaveScreen          from '../screens/student/LeaveScreen';
import ComplaintsScreen     from '../screens/student/ComplaintsScreen';
import MessScreen           from '../screens/student/MessScreen';
import MarketplaceScreen    from '../screens/student/MarketplaceScreen';
import PollsScreen          from '../screens/student/PollsScreen';
import LostFoundScreen      from '../screens/student/LostFoundScreen';
import NotificationsScreen  from '../screens/student/NotificationsScreen';

// Warden screens
import WardenDashboard      from '../screens/warden/DashboardScreen';
import WardenLeaveScreen    from '../screens/warden/LeaveScreen';
import WardenComplaintsScreen from '../screens/warden/ComplaintsScreen';
import WardenMessScreen     from '../screens/warden/MessScreen';
import WardenPollsScreen    from '../screens/warden/PollsScreen';
import WardenStudentsScreen from '../screens/warden/StudentsScreen';

// Route guards
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading, isWarden } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={isWarden ? '/warden' : '/dashboard'} replace />;
  return children;
}

function WardenRoute({ children }) {
  const { user, loading, isWarden } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  // Role enforced server-side — if DB says student, redirect to student pages
  if (!isWarden) return <Navigate to="/dashboard" replace />;
  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login"    element={<PublicRoute><LoginScreen /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterScreen /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotScreen /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetScreen /></PublicRoute>} />
        <Route path="/verify-email/:token"   element={<VerifyScreen />} />

        {/* Student Routes */}
        <Route path="/" element={<ProtectedRoute><NotifProvider><AppLayout /></NotifProvider></ProtectedRoute>}>
          <Route index              element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<StudentDashboard />} />
          <Route path="leave"       element={<LeaveScreen />} />
          <Route path="complaints"  element={<ComplaintsScreen />} />
          <Route path="mess"        element={<MessScreen />} />
          <Route path="marketplace" element={<MarketplaceScreen />} />
          <Route path="polls"       element={<PollsScreen />} />
          <Route path="lost-found"  element={<LostFoundScreen />} />
          <Route path="notifications" element={<NotificationsScreen />} />
        </Route>

        {/* Warden Routes */}
        <Route path="/warden" element={<WardenRoute><NotifProvider><AppLayout warden /></NotifProvider></WardenRoute>}>
          <Route index                  element={<Navigate to="/warden/dashboard" replace />} />
          <Route path="dashboard"       element={<WardenDashboard />} />
          <Route path="leave-requests"  element={<WardenLeaveScreen />} />
          <Route path="complaints"      element={<WardenComplaintsScreen />} />
          <Route path="mess-manager"    element={<WardenMessScreen />} />
          <Route path="polls"           element={<WardenPollsScreen />} />
          <Route path="students"        element={<WardenStudentsScreen />} />
          <Route path="notifications"   element={<NotificationsScreen />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}