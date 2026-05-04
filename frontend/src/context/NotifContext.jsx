import React, { createContext, useContext, useState, useEffect } from 'react';
import { notifApi } from '../api';
import { useAuth } from './AuthContext';

const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifs = async () => {
    if (!token) return;
    try {
      const { data } = await notifApi.getAll();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [token]); // eslint-disable-line

  const markRead = async (id) => {
    try {
      await notifApi.markRead(id);
      // ✅ Update readBy in local state so UI reflects immediately
      setNotifications(prev =>
        prev.map(n =>
          n._id === id
            ? { ...n, readBy: [...(n.readBy || []), user?._id] }
            : n
        )
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notifApi.markAllRead();
      // ✅ Mark all as read in local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, readBy: [...(n.readBy || []), user?._id] }))
      );
      setUnread(0);
    } catch {}
  };

  return (
    <NotifContext.Provider value={{ notifications, unread, fetchNotifs, markRead, markAllRead, user }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotif = () => useContext(NotifContext);