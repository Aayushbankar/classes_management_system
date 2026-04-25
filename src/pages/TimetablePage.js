import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

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
    
    fetchJson(`/schedule/timetable/?${params.toString()}`)
      .then(setSlots)
      .catch(e => setError(e.message));
  }, [searchStandard, searchBatch, searchBranch]);

  useEffect(() => {
    fetchJson('/branches/').then(setBranches).catch(() => {});
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
    <div className="page-panel">
      <div className="dashboard-header">
        <p className="subtitle">Academic</p>
        <h2>Timetable</h2>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="filter-row">
        <input 
          placeholder="Filter Standard..." 
          value={searchStandard} 
          onChange={e => setSearchStandard(e.target.value)} 
          className="filter-input grow"
        />
        <input 
          placeholder="Filter Batch/Time..." 
          value={searchBatch} 
          onChange={e => setSearchBatch(e.target.value)} 
          className="filter-input grow"
        />
        <select 
          value={searchBranch} 
          onChange={e => setSearchBranch(e.target.value)} 
          className="filter-input select"
        >
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="card-grid">
        <div className="stat-card"><p className="stat-label">Total Slots</p><h3>{slots.length}</h3></div>
      </div>

      {DAYS.map(day => (
        <div className="panel-section" key={day}>
          <div className="panel-heading"><h3>{day}</h3></div>
          {grouped[day].length === 0 ? (
            <p className="empty-state">No slots</p>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr><th>Time</th><th>Subject</th><th>Standard</th><th>Teacher</th><th>Room</th></tr>
                </thead>
                <tbody>
                  {grouped[day].map(s => (
                    <tr key={s.id}>
                      <td>{s.start_time} – {s.end_time}</td>
                      <td>{s.subject}</td>
                      <td>{s.standard}</td>
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
  );
}

export default TimetablePage;
