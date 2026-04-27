import React, { useEffect, useState } from 'react';
import { fetchJson, fetchList } from '../api';
import { formatCurrency } from '../utils/format';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TimetablePage() {
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  const [branches, setBranches] = useState([]);
  const [searchStandard, setSearchStandard] = useState('');
  const [searchBatch, setSearchBatch] = useState('');
  const [searchBranch, setSearchBranch] = useState('');

  const loadSlots = React.useCallback(() => {
    const params = new URLSearchParams();
    if (searchStandard) params.append('standard', searchStandard);
    if (searchBatch) params.append('batch_time', searchBatch);
    if (searchBranch) params.append('branch', searchBranch);
    
    fetchList(`/schedule/timetable/?${params.toString()}`)
      .then(setSlots)
      .catch(e => setError(e.message));
  }, [searchStandard, searchBatch, searchBranch]);

  useEffect(() => {
    fetchList('/branches/').then(setBranches).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadSlots, 300);
    return () => clearTimeout(timer);
  }, [loadSlots]);

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week.toLowerCase() === day.toLowerCase());
    return acc;
  }, {});

  return (
    <div className="animate-fade-in dashboard-shell">
      <div className="analysis-header">
        <div>
          <p className="subtitle">Academic</p>
          <h2 className="fs-1">Timetable</h2>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="d-flex flex-wrap gap-2 mb-4">
        <input 
          placeholder="Filter Standard..." 
          value={searchStandard} 
          onChange={e => setSearchStandard(e.target.value)} 
          className="input-premium py-2"
          style={{ maxWidth: '180px', flex: '1 1 140px' }}
        />
        <input 
          placeholder="Filter Batch/Time..." 
          value={searchBatch} 
          onChange={e => setSearchBatch(e.target.value)} 
          className="input-premium py-2"
          style={{ maxWidth: '180px', flex: '1 1 140px' }}
        />
        <select 
          value={searchBranch} 
          onChange={e => setSearchBranch(e.target.value)} 
          className="input-premium py-2"
          style={{ maxWidth: '200px', flex: '1 1 140px' }}
        >
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="dashboard-grid mb-4" style={{ gridTemplateColumns: '1fr' }}>
        <div className="glass-card stat-card">
          <p className="filter-label m-0">Total Slots</p>
          <span className="stat-value">{formatCurrency(slots.length)}</span>
        </div>
      </div>

      {DAYS.map(day => (
        <div className="mb-4" key={day}>
          <h3 className="fs-5 mb-3" style={{ color: 'var(--primary)' }}>{day}</h3>
          {grouped[day].length === 0 ? (
            <p className="small" style={{ color: 'var(--text-muted)' }}>No slots scheduled</p>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="d-none d-md-block">
                <div className="data-grid-container">
                  <table className="data-grid-table">
                    <thead>
                      <tr>
                        <th>Time</th><th>Subject</th><th>Standard</th><th>Teacher</th><th>Room</th>
                      </tr>
                    </thead>
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
              </div>

              {/* Mobile: Card List */}
              <div className="d-md-none d-flex flex-column gap-2">
                {grouped[day].map(s => (
                  <div key={s.id} className="glass-card" style={{ padding: '0.85rem 1rem' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{s.subject}</span>
                      <span className="badge rounded-pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                        {s.standard}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>🕐 {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</span>
                      <span>👩‍🏫 {s.teacher_name || s.teacher || '—'}</span>
                      <span>📍 {s.location || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default TimetablePage;
