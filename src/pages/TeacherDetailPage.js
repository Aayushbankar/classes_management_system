import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchJson, fetchList } from '../api';

function TeacherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchJson(`/teachers/${id}/`).then(setTeacher).catch(e => setError(e.message));
    fetchList(`/schedule/timetable/?teacher=${id}`).then(setSlots).catch(() => {});
  }, [id]);

  if (error) return (
    <div className="animate-fade-in">
      <div className="mobile-page-header"><p className="subtitle">Faculty</p><h2>Details</h2></div>
      <div className="error-box">{error}</div>
      <button className="btn btn-premium mt-3" onClick={() => navigate('/app/teachers')}>← Back</button>
    </div>
  );

  if (!teacher) return (
    <div className="animate-fade-in">
      <div className="mobile-page-header"><p className="subtitle">Faculty</p><h2>Loading…</h2></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header d-flex justify-content-between align-items-end mb-3">
        <div>
          <p className="subtitle">Faculty</p>
          <h2>{teacher.name}</h2>
        </div>
        <Link className="btn btn-sm rounded-pill px-3" to="/app/teachers" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>← Back</Link>
      </div>

      <div className="kpi-scroll-strip mb-3">
        <div className="glass-card stat-card"><p className="filter-label m-0">Subject</p><span className="stat-value" style={{ fontSize: '1rem' }}>{teacher.subject || 'N/A'}</span></div>
        <div className="glass-card stat-card"><p className="filter-label m-0">Class</p><span className="stat-value" style={{ fontSize: '1rem' }}>{teacher.assigned_standard || 'N/A'}</span></div>
        <div className="glass-card stat-card"><p className="filter-label m-0">Branch</p><span className="stat-value" style={{ fontSize: '1rem' }}>{teacher.branch_name || 'N/A'}</span></div>
        <div className="glass-card stat-card"><p className="filter-label m-0">Status</p><span className={`badge rounded-pill px-2 mt-1 ${teacher.is_active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.7rem' }}>{teacher.is_active ? 'Active' : 'Inactive'}</span></div>
      </div>

      <div className="glass-card mb-3">
        <h3 className="mobile-section-title mt-0 mb-3">Contact Info</h3>
        {[
          ['Email', teacher.email || '-'],
          ['Phone', teacher.phone || '-'],
          ['Subject', teacher.subject || '-'],
          ['Primary Class', teacher.assigned_standard || '-'],
        ].map(([label, value]) => (
          <div key={label} className="info-stat"><label>{label}</label><span>{value}</span></div>
        ))}
      </div>

      <h3 className="mobile-section-title">Weekly Schedule</h3>
      {slots.length === 0 ? (
        <div className="glass-card text-center py-4"><p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>No schedule assigned</p></div>
      ) : slots.map(slot => (
        <div key={slot.id} className="mobile-list-card">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <span className="fw-bold" style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{slot.day_of_week}</span>
            <span className="badge rounded-pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.65rem' }}>{slot.standard}</span>
          </div>
          <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>🕐 {slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}</span>
            <span>📚 {slot.subject}</span>
            <span>📍 {slot.location || '—'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TeacherDetailPage;
