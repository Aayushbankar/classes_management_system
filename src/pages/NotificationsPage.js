import React, { useEffect, useState } from 'react';
import { fetchJson, postJson } from '../api';

function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = () => fetchJson('/notifications/').then(setItems).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  const unread = items.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    try {
      await postJson(`/notifications/${id}/mark-read/`, {});
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="page-panel">
      <div className="dashboard-header">
        <p className="subtitle">Administration</p>
        <h2>Notifications</h2>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="card-grid">
        <div className="stat-card"><p className="stat-label">Total</p><h3>{items.length}</h3></div>
        <div className="stat-card"><p className="stat-label">Unread</p><h3>{unread}</h3></div>
      </div>

      <div className="panel-section" style={{ marginTop: 20 }}>
        <h3>All Notifications</h3>
        {items.length === 0 ? (
          <p className="empty-state">No notifications</p>
        ) : (
          <ul className="panel-list">
            {items.map(n => (
              <li key={n.id} className="reminder-item" style={{ opacity: n.is_read ? 0.6 : 1 }}>
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <p style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: 4 }}>{n.created_at}</p>
                </div>
                {!n.is_read && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Mark read</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
