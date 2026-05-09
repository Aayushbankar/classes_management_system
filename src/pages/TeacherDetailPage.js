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

    const loadDetails = async () => {
      try {
        const data = await fetchJson(`/teachers/${id}/`);
        setTeacher(data);
      } catch (e) {
        setError(e.message);
      }
    };

    const loadSchedule = async () => {
      try {
        const data = await fetchList(`/schedule/timetable/?teacher=${id}`);
        setSlots(data);
      } catch (e) {
        // ignore errors for schedule
      }
    };

    loadDetails();
    loadSchedule();
  }, [id]);

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <p className="subtitle">Faculty</p>
          <h2 className="fs-1">Teacher Details</h2>
        </div>
        <div className="alert alert-danger rounded-3 px-4">{error}</div>
        <button className="btn btn-premium" onClick={() => navigate('/app/teachers')}>← Back to Faculty</button>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <p className="subtitle">Faculty</p>
          <h2 className="fs-1">Teacher Details</h2>
        </div>
        <div className="glass-card text-center py-5">
          <p className="text-muted m-0">Loading teacher…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <p className="subtitle">Faculty</p>
          <h2 className="fs-1">{teacher.name}</h2>
        </div>
        <Link className="btn btn-premium" to="/app/teachers">← Back to Faculty</Link>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)' }}><span>📚</span></div>
          <p className="text-muted small fw-bold m-0">Subject</p>
          <span className="stat-value" style={{ fontSize: '1.1rem' }}>{teacher.subject || 'N/A'}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><span>🎓</span></div>
          <p className="text-muted small fw-bold m-0">Assigned Class</p>
          <span className="stat-value" style={{ fontSize: '1.1rem' }}>{teacher.assigned_standard || 'N/A'}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><span>🏢</span></div>
          <p className="text-muted small fw-bold m-0">Branch</p>
          <span className="stat-value" style={{ fontSize: '1.1rem' }}>{teacher.branch_name || 'N/A'}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: teacher.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100,116,139,0.1)' }}><span>{teacher.is_active ? '✅' : '⏸️'}</span></div>
          <p className="text-muted small fw-bold m-0">Status</p>
          <span className={`badge rounded-pill px-3 mt-1 ${teacher.is_active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
            {teacher.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="glass-card mb-4">
        <h4 className="fs-5 mb-4 fw-bold">Contact Information</h4>
        <div className="d-flex flex-column gap-3">
          {[
            ['✉️', 'Email', teacher.email || '—'],
            ['📞', 'Phone', teacher.phone || '—'],
            ['📚', 'Subject', teacher.subject || '—'],
            ['🎓', 'Primary Class', teacher.assigned_standard || '—'],
          ].map(([icon, label, value]) => (
            <div key={label} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: 'var(--surface-muted)' }}>
              <span style={{ fontSize: '1.1rem' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <p className="m-0" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</p>
                <p className="m-0 fw-semibold" style={{ fontSize: '0.9rem' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="glass-card">
        <h4 className="fs-5 mb-3 fw-bold">Weekly Schedule</h4>

        {/* Desktop: Table */}
        <div className="d-none d-md-block">
          <div className="data-grid-container">
            <table className="data-grid-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Standard</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {slots.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-5 text-muted">No schedule slots assigned</td></tr>
                )}
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td className="fw-bold" style={{ textTransform: 'capitalize' }}>{slot.day_of_week}</td>
                    <td>{slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}</td>
                    <td className="fw-semibold">{slot.subject}</td>
                    <td><span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{slot.standard}</span></td>
                    <td>{slot.location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: Cards */}
        <div className="d-md-none d-flex flex-column gap-2">
          {slots.length === 0 && (
            <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
              <p className="fs-3 mb-1">📅</p>
              <p className="m-0">No schedule slots assigned</p>
            </div>
          )}
          {slots.map(slot => (
            <div key={slot.id} className="p-3 rounded-3" style={{ background: 'var(--surface-muted)' }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="fw-bold" style={{ textTransform: 'capitalize', fontSize: '0.95rem' }}>{slot.day_of_week}</span>
                <span className="badge rounded-pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.7rem' }}>{slot.standard}</span>
              </div>
              <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>🕐 {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}</span>
                <span>📚 {slot.subject}</span>
                <span>📍 {slot.location || '—'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeacherDetailPage;
