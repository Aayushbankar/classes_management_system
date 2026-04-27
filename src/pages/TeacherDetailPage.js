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
      <div className="page-panel">
        <div className="dashboard-header">
          <p className="subtitle">Faculty</p>
          <h2>Teacher Details</h2>
        </div>
        <div className="error-box">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/app/teachers')}>Back to faculty</button>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="page-panel">
        <div className="dashboard-header">
          <p className="subtitle">Faculty</p>
          <h2>Teacher Details</h2>
        </div>
        <div className="card-grid">
          <div className="stat-card"><p className="kpi-title">Loading teacher…</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-panel animate-fade-in">
      <div className="dashboard-header">
        <div>
          <p className="subtitle">Faculty</p>
          <h2>{teacher.name}</h2>
        </div>
        <div className="page-header-actions">
          <Link className="btn btn-secondary" to="/app/teachers">Back</Link>
          <button className="btn btn-primary" onClick={() => navigate('/app/teachers')}>Faculty list</button>
        </div>
      </div>

      <div className="card-grid">
        <div className="stat-card"><p className="stat-label">Subject</p><h3>{teacher.subject || 'N/A'}</h3></div>
        <div className="stat-card"><p className="stat-label">Class</p><h3>{teacher.assigned_standard || 'N/A'}</h3></div>
        <div className="stat-card"><p className="stat-label">Branch</p><h3>{teacher.branch_name || 'N/A'}</h3></div>
        <div className="stat-card">
          <p className="stat-label">Status</p>
          <span className={`badge rounded-pill px-3 ${teacher.is_active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ width: 'fit-content', marginTop: '0.5rem' }}>
            {teacher.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-heading">
          <h3>Personal Details</h3>
          <p className="panel-subtitle">Contact and employment information.</p>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-header">
              <h4>Contact Info</h4>
            </div>
            <div className="info-stat-grid">
              <div className="info-stat"><label>Email</label><span>{teacher.email || '-'}</span></div>
              <div className="info-stat"><label>Phone</label><span>{teacher.phone || '-'}</span></div>
              <div className="info-stat"><label>Subject</label><span>{teacher.subject || '-'}</span></div>
              <div className="info-stat"><label>Primary Class</label><span>{teacher.assigned_standard || '-'}</span></div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Weekly Schedule</h3>
          <div className="excel-table-wrapper">
            <table className="excel-table">
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
                  <tr><td colSpan={5} className="empty-state">No schedule slots assigned</td></tr>
                )}
                {slots.map(slot => (
                  <tr key={slot.id}>
                    <td className="fw-bold" style={{ textTransform: 'capitalize' }}>{slot.day_of_week}</td>
                    <td>{slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}</td>
                    <td>{slot.subject}</td>
                    <td><span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{slot.standard}</span></td>
                    <td>{slot.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDetailPage;
