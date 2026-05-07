import React, { useEffect, useState } from 'react';
import { fetchList } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TimetablePage() {
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1] || 'Monday');

  const [branches, setBranches] = useState([]);
  const [searchStandard, setSearchStandard] = useState('');
  const [searchBatch, setSearchBatch] = useState('');
  const [searchBranch, setSearchBranch] = useState('');

  const loadSlots = React.useCallback(() => {
    const params = new URLSearchParams();
    if (searchStandard) params.append('standard', searchStandard);
    if (searchBatch) params.append('batch_time', searchBatch);
    if (searchBranch) params.append('branch', searchBranch);
    fetchList(`/schedule/timetable/?${params.toString()}`).then(setSlots).catch(e => setError(e.message));
  }, [searchStandard, searchBatch, searchBranch]);

  useEffect(() => { fetchList('/branches/').then(setBranches).catch(() => {}); }, []);
  useEffect(() => { const timer = setTimeout(loadSlots, 300); return () => clearTimeout(timer); }, [loadSlots]);

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week.toLowerCase() === day.toLowerCase());
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header mb-3">
        <p className="subtitle">Academic</p>
        <h2>Timetable</h2>
      </div>

      {error && <div className="error-box">{error}</div>}

      {/* Filters */}
      <div className="filter-chip-row">
        <input placeholder="Standard…" value={searchStandard} onChange={e => setSearchStandard(e.target.value)} className="filter-chip" style={{ width: '120px', border: '1.5px solid var(--border)' }} />
        <input placeholder="Batch…" value={searchBatch} onChange={e => setSearchBatch(e.target.value)} className="filter-chip" style={{ width: '120px', border: '1.5px solid var(--border)' }} />
        <select value={searchBranch} onChange={e => setSearchBranch(e.target.value)} className="filter-chip" style={{ appearance: 'auto' }}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Day tabs — mobile */}
      <div className="day-tab-bar d-md-none">
        {DAYS.map(day => (
          <button key={day} className={`day-tab ${selectedDay === day ? 'active' : ''}`} onClick={() => setSelectedDay(day)}>
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Mobile: show selected day only */}
      <div className="d-md-none">
        <h3 className="mobile-section-title" style={{ color: 'var(--primary)' }}>{selectedDay}</h3>
        {grouped[selectedDay]?.length === 0 ? (
          <p className="small" style={{ color: 'var(--text-muted)' }}>No slots scheduled</p>
        ) : grouped[selectedDay]?.map(s => (
          <div key={s.id} className="mobile-list-card">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{s.subject}</span>
              <span className="badge rounded-pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.65rem' }}>{s.standard}</span>
            </div>
            <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>🕐 {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</span>
              <span>👩‍🏫 {s.teacher_name || '—'}</span>
              <span>📍 {s.location || '—'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: show all days */}
      <div className="d-none d-md-block">
        {DAYS.map(day => (
          <div className="mb-4" key={day}>
            <h3 className="fs-5 mb-3" style={{ color: 'var(--primary)' }}>{day}</h3>
            {grouped[day].length === 0 ? (
              <p className="small" style={{ color: 'var(--text-muted)' }}>No slots scheduled</p>
            ) : (
              <div className="data-grid-container">
                <table className="data-grid-table">
                  <thead><tr><th>Time</th><th>Subject</th><th>Standard</th><th>Teacher</th><th>Room</th></tr></thead>
                  <tbody>
                    {grouped[day].map(s => (
                      <tr key={s.id}>
                        <td>{s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</td>
                        <td className="fw-semibold">{s.subject}</td>
                        <td><span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{s.standard}</span></td>
                        <td>{s.teacher_name || s.teacher}</td>
                        <td>{s.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimetablePage;
