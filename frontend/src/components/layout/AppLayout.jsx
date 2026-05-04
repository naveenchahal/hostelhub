import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';
import styles from './AppLayout.module.css';
import ChatBot from '../common/ChatBot';

const STUDENT_NAV = [
  { to: '/dashboard',     icon: '⊞', label: 'Dashboard' },
  { to: '/leave',         icon: '✈', label: 'Leave Pass' },
  { to: '/complaints',    icon: '🔧', label: 'Complaints' },
  { to: '/mess',          icon: '🍛', label: 'Mess Menu' },
  { to: '/marketplace',   icon: '🛒', label: 'Marketplace' },
  { to: '/polls',         icon: '📊', label: 'Polls & Voting' },
  { to: '/lost-found',    icon: '🔍', label: 'Lost & Found' },
  { to: '/notifications', icon: '🔔', label: 'Notifications', badge: true },
];

const WARDEN_NAV = [
  { to: '/warden/dashboard',      icon: '⊞', label: 'Dashboard' },
  { to: '/warden/leave-requests', icon: '✈', label: 'Leave Requests', badge: true },
  { to: '/warden/complaints',     icon: '🔧', label: 'Complaints' },
  { to: '/warden/mess-manager',   icon: '🍛', label: 'Mess Manager' },
  { to: '/warden/polls',          icon: '📊', label: 'Polls' },
  { to: '/warden/students',       icon: '👥', label: 'Students' },
  { to: '/warden/notifications',  icon: '🔔', label: 'Notifications', badge: true },
];

export default function AppLayout({ warden }) {
  const { user, logout, isWarden } = useAuth();
  const { unread } = useNotif() || {};
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = isWarden ? WARDEN_NAV : STUDENT_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`${styles.layout} ${collapsed ? styles.collapsed : ''}`}>
      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <span className={styles.logoText}>HostelHive</span>
            {!collapsed && <span className={styles.logoSub}>{user?.hostelBlock ? `Block ${user.hostelBlock}` : 'Management'}</span>}
          </div>

          {!collapsed && <p className={styles.navSection}>Navigation</p>}
          <nav className={styles.nav}>
            {navItems.map(({ to, icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              >
                <span className={styles.navIcon}>{icon}</span>
                {!collapsed && <span className={styles.navLabel}>{label}</span>}
                {badge && unread > 0 && (
                  <span className={styles.navBadge}>{unread > 9 ? '9+' : unread}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ── USER CARD ── */}
        <div className={styles.sidebarBottom}>
          <div className={styles.userCard}>
            <div className={`${styles.userAvatar} ${isWarden ? styles.wardenAvatar : ''}`}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.userRole}>
                  <span className={`${styles.rolePill} ${isWarden ? styles.rolePillWarden : styles.rolePillStudent}`}>
                    {isWarden ? '🏛 Warden' : '🎓 Student'}
                  </span>
                </p>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            {collapsed ? '⏻' : '⏻ Sign Out'}
          </button>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(p => !p)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* ── AI CHATBOT ── */}
      <ChatBot />
    </div>
  );
}