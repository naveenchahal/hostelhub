import React from 'react';
import { useNotif } from '../../context/NotifContext';
import { Card, Button } from '../../components/common';
import { timeAgo } from '../../utils/helpers';

const TYPE_ICON = {
  leave: '✈', complaint: '🔧', marketplace: '🛒',
  poll: '📊', 'lost-found': '🔍', mess: '🍛',
  announcement: '📢', system: '⚙️',
};

const TYPE_COLOR = {
  leave: 'rgba(74,222,128,0.12)',
  complaint: 'rgba(251,191,36,0.12)',
  marketplace: 'rgba(249,168,212,0.12)',
  poll: 'rgba(232,160,32,0.12)',
  announcement: 'rgba(96,165,250,0.12)',
  system: 'rgba(255,255,255,0.06)',
};

export default function NotificationsScreen() {
  const notifCtx = useNotif();

  // ✅ No more DEMO_NOTIFS — use real data only
  const notifications = notifCtx?.notifications || [];
  const currentUserId = notifCtx?.user?._id?.toString();

  return (
    <div className="page-enter">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Notifications 🔔</h1>
          <p className="pageSub">Stay updated with hostel activities</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => notifCtx?.markAllRead?.()}
          disabled={notifCtx?.unread === 0}
        >
          Mark All Read
        </Button>
      </div>

      <Card style={{ padding: 0 }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text2)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
            <div>No notifications yet</div>
          </div>
        ) : (
          notifications.map((n, i) => {
            // ✅ Check against real user._id, not the string 'me'
            const isUnread = !n.readBy?.map(String).includes(currentUserId);

            return (
              <div
                key={n._id}
                onClick={() => isUnread && notifCtx?.markRead?.(n._id)}
                style={{
                  display: 'flex', gap: '14px', padding: '18px 22px',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: isUnread ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                  background: isUnread ? 'rgba(232,160,32,0.03)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (isUnread) e.currentTarget.style.background = 'var(--surface)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isUnread ? 'rgba(232,160,32,0.03)' : 'transparent';
                }}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: TYPE_COLOR[n.type] || 'var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
                }}>
                  {TYPE_ICON[n.type] || '🔔'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: isUnread ? '700' : '600', marginBottom: '3px' }}>
                      {n.title}
                      {isUnread && (
                        <span style={{
                          display: 'inline-block', width: '6px', height: '6px',
                          borderRadius: '50%', background: 'var(--amber)',
                          marginLeft: '7px', verticalAlign: 'middle',
                        }} />
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.5' }}>
                    {n.message}
                  </div>
                  {n.sender && (
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                      from {n.sender.name}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}