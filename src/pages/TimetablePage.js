import React, { useEffect, useState } from 'react';
import { fetchList, postJson, deleteJson, isAdmin } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STANDARDS = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11 (Sci)", "Class 11 (Com)", "Class 11 (Arts)",
  "Class 12 (Sci)", "Class 12 (Com)", "Class 12 (Arts)",
  "NEET", "JEE", "Foundation", "Other"
];

const BATCH_TIMES = [
  "07:00 AM - 09:00 AM",
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
  "Special Batch",
  "Crash Course"
];

const emptySlot = {
  branch: '',
  standard: '',
  batch_time: '',
  day_of_week: 'monday',
  start_time: '',
  end_time: '',
  subject: '',
  teacher: '',
  location: '',
  notes: ''
};

function TimetablePage() {
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  const [branches, setBranches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchStandard, setSearchStandard] = useState('');
  const [searchBatch, setSearchBatch] = useState('');
  const [searchBranch, setSearchBranch] = useState('');

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptySlot);
  const admin = isAdmin();

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
    fetchList('/teachers/').then(setTeachers).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadSlots, 300);
    return () => clearTimeout(timer);
  }, [loadSlots]);

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week.toLowerCase() === day.toLowerCase());
    return acc;
  }, {});

  const openAdd = () => {
    setForm({ ...emptySlot, branch: branches[0]?.id || '', standard: STANDARDS[0], batch_time: BATCH_TIMES[0] });
    setError('');
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setForm(emptySlot);
    setError('');
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (!payload.teacher) delete payload.teacher; // Optional foreign key
      await postJson('/schedule/timetable/', payload);
      closeModal();
      loadSlots();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await deleteJson(`/schedule/timetable/${id}/`);
      loadSlots();
    } catch (e) {
      setError(e.message);
    }
  };

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in dashboard-shell">
      <div className="analysis-header">
        <div>
          <p className="subtitle">Academic</p>
          <h2 className="fs-1">Timetable</h2>
        </div>
        <div className="d-flex gap-2">
          {admin && <button className="btn btn-premium pulse-primary" onClick={openAdd}>+ Add Slot</button>}
        </div>
      </div>

      {error && !modal && <div className="alert alert-danger mb-4">{error}</div>}

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
          <span className="stat-value">{slots.length}</span>
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
                        {admin && <th className="text-end">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[day].map(s => (
                        <tr key={s.id}>
                          <td>{s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</td>
                          <td className="fw-semibold">
                            {s.subject}
                            {s.branch_name && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{s.branch_name}</div>}
                          </td>
                          <td><span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{s.standard}</span></td>
                          <td>{s.teacher_name || s.teacher || '—'}</td>
                          <td>{s.location || '—'}</td>
                          {admin && (
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(s.id)}>Del</button>
                            </td>
                          )}
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
                      <div>
                        <span className="fw-bold d-block" style={{ fontSize: '0.95rem' }}>{s.subject}</span>
                        {s.branch_name && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.branch_name}</span>}
                      </div>
                      <span className="badge rounded-pill" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.7rem' }}>
                        {s.standard}
                      </span>
                    </div>
                    <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>🕐 {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</span>
                      <span>👩‍🏫 {s.teacher_name || s.teacher || '—'}</span>
                      <span>📍 {s.location || '—'}</span>
                    </div>
                    {admin && (
                      <div className="mt-2 text-end">
                         <button className="btn btn-sm btn-outline-danger rounded-pill" style={{fontSize: '0.7rem'}} onClick={() => handleDelete(s.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      {modal && (
        <div className="command-palette-overlay" onClick={closeModal}>
          <div className="glass-card animate-fade-in m-3" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fs-4 m-0">🗓 Add Timetable Slot</h3>
              <button className="btn btn-link text-decoration-none fs-4 p-0 m-0" style={{ color: 'var(--text-primary)', width: '32px', height: '32px' }} onClick={closeModal}>&times;</button>
            </div>
            
            {error && <div className="alert alert-danger mb-3 py-2 small">{error}</div>}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-muted text-uppercase">Branch *</label>
                <select className="input-premium" value={form.branch} onChange={e => updateField('branch', e.target.value)}>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              
              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-muted text-uppercase">Day of Week *</label>
                <select className="input-premium" value={form.day_of_week} onChange={e => updateField('day_of_week', e.target.value)}>
                  {DAYS.map(d => <option key={d.toLowerCase()} value={d.toLowerCase()}>{d}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-muted text-uppercase">Standard *</label>
                <select className="input-premium" value={form.standard} onChange={e => updateField('standard', e.target.value)}>
                  <option value="">Select Standard</option>
                  {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-muted text-uppercase">Batch Time</label>
                <select className="input-premium" value={form.batch_time} onChange={e => updateField('batch_time', e.target.value)}>
                  <option value="">Select Batch/Time</option>
                  {BATCH_TIMES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="col-12">
                <label className="small fw-bold mb-1 text-muted text-uppercase">Subject *</label>
                <input className="input-premium" value={form.subject} onChange={e => updateField('subject', e.target.value)} placeholder="e.g. Mathematics" />
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-muted text-uppercase">Start Time *</label>
                <input type="time" className="input-premium" value={form.start_time} onChange={e => updateField('start_time', e.target.value)} />
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-muted text-uppercase">End Time *</label>
                <input type="time" className="input-premium" value={form.end_time} onChange={e => updateField('end_time', e.target.value)} />
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-muted text-uppercase">Teacher</label>
                <select className="input-premium" value={form.teacher} onChange={e => updateField('teacher', e.target.value)}>
                  <option value="">Select Teacher (Optional)</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-muted text-uppercase">Room / Location</label>
                <input className="input-premium" value={form.location} onChange={e => updateField('location', e.target.value)} placeholder="e.g. Room 101" />
              </div>
            </div>

            <button className="btn btn-premium w-100 py-3 mt-4" onClick={handleSave}>Confirm & Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetablePage;
