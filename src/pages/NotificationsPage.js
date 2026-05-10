import React, { useEffect, useState } from 'react';
import { fetchList, postJson } from '../api';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = () => fetchList('/notifications/')
    .then(setItems)
    .catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  const unread = items.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    try {
      await postJson(`/notifications/${id}/mark-read/`, {});
      load();
    } catch (e) { setError(e.message); }
  };

  const markAllRead = async () => {
    try {
      await postJson('/notifications/mark-all-read/', {});
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="animate-fade-in dashboard-shell">
      <div className="analysis-header mb-4">
        <div>
          <p className="subtitle">Administration</p>
          <h2 className="fs-1">Notifications</h2>
        </div>
        <div className="d-flex gap-2">
          {unread > 0 && (
            <button className="btn btn-outline-primary rounded-pill px-4" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-3 mb-4">{error}</div>}

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="glass-card stat-card h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper bg-primary-soft text-primary m-0">🔔</div>
              <div>
                <p className="filter-label m-0">Total</p>
                <h3 className="m-0 fs-2 fw-bold">{items.length}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="glass-card stat-card h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="stat-icon-wrapper bg-danger-soft text-danger m-0">🔴</div>
              <div>
                <p className="filter-label m-0">Unread</p>
                <h3 className="m-0 fs-2 fw-bold" style={{ color: unread > 0 ? 'var(--danger)' : 'var(--success)' }}>{unread}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
          <h3 className="fs-5 m-0">Inbox</h3>
          <span className="badge rounded-pill bg-light text-dark px-3">{items.length} Items</span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <p className="fs-1 mb-2">✨</p>
            <p className="m-0">No notifications yet</p>
          </div>
        ) : (
          <div className="notification-list">
            {items.map(n => {
              const isWelcome = n.title.toLowerCase().includes('welcome');
              const isPayment = n.title.toLowerCase().includes('payment') || n.title.toLowerCase().includes('fee');
              const isTest = n.title.toLowerCase().includes('test') || n.title.toLowerCase().includes('exam');
              
              let icon = '📢';
              let iconColor = 'var(--primary)';
              if (isWelcome) { icon = '👋'; iconColor = 'var(--success)'; }
              if (isPayment) { icon = '💰'; iconColor = 'var(--warning)'; }
              if (isTest) { icon = '📝'; iconColor = 'var(--accent)'; }

              return (
                <div 
                  key={n.id} 
                  className={`notification-item d-flex align-items-start p-4 ${n.is_read ? 'is-read' : 'unread'}`}
                  style={{ 
                    borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.03)',
                    transition: 'var(--transition)',
                    position: 'relative'
                  }}
                >
                  <div 
                    className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle me-3" 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      background: n.is_read ? 'var(--surface-muted)' : 'white',
                      fontSize: '1.5rem',
                      boxShadow: n.is_read ? 'none' : 'var(--shadow-sm)',
                      border: n.is_read ? 'none' : `1px solid ${iconColor}20`
                    }}
                  >
                    {icon}
                  </div>
                  
                  <div className="flex-grow-1 min-width-0 pe-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h4 className="m-0 fw-bold" style={{ fontSize: '1rem', color: n.is_read ? 'var(--text-muted)' : 'var(--text)' }}>
                        {n.title}
                      </h4>
                      <span className="small text-muted flex-shrink-0 ms-2" style={{ fontSize: '0.7rem' }}>
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="m-0" style={{ 
                      fontSize: '0.9rem', 
                      color: n.is_read ? 'var(--text-muted)' : 'var(--text)',
                      opacity: n.is_read ? 0.7 : 0.9,
                      lineHeight: '1.5'
                    }}>
                      {n.message}
                    </p>
                  </div>

                  {!n.is_read && (
                    <div className="flex-shrink-0 d-flex align-items-center">
                      <button 
                        className="btn btn-sm btn-premium-subtle rounded-pill px-3"
                        style={{ 
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: 'var(--primary-soft)',
                          color: 'var(--primary)',
                          border: 'none'
                        }}
                        onClick={() => markRead(n.id)}
                      >
                        Mark Read
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
