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

  return (
    <div className="animate-fade-in dashboard-shell">
      <div className="analysis-header">
        <div>
          <p className="subtitle">Administration</p>
          <h2 className="fs-1">Notifications</h2>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="dashboard-grid mb-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="glass-card stat-card">
          <p className="filter-label m-0">Total</p>
          <span className="stat-value">{items.length}</span>
        </div>
        <div className="glass-card stat-card">
          <p className="filter-label m-0">Unread</p>
          <span className="stat-value" style={{ color: unread > 0 ? 'var(--danger)' : 'var(--success)' }}>{unread}</span>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="fs-5 mb-3">All Notifications</h3>
        {items.length === 0 ? (
          <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <p className="fs-3 mb-2">🔔</p>
            <p className="m-0">No notifications yet</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {items.map(n => (
              <div 
                key={n.id} 
                className="d-flex justify-content-between align-items-start p-3 rounded-3"
                style={{ 
                  background: n.is_read ? 'transparent' : 'var(--primary-soft)',
                  border: `1px solid ${n.is_read ? 'var(--border)' : 'var(--primary)'}`,
                  opacity: n.is_read ? 0.7 : 1,
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="fw-bold m-0" style={{ fontSize: '0.9rem' }}>{n.title}</p>
                  <p className="m-0 mt-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</p>
                  <p className="m-0 mt-1" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                {!n.is_read && (
                  <button 
                    className="btn btn-sm rounded-pill px-3 ms-2 flex-shrink-0"
                    style={{ 
                      background: 'var(--primary-gradient)', 
                      color: 'white', 
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                    onClick={() => markRead(n.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
