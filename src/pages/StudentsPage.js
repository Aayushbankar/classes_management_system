import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, fetchList, postJson, putJson, deleteJson, isAdmin } from '../api';
import { exportToExcel, STUDENT_COLS } from '../utils/export';
import { formatINR } from '../utils/format';

const emptyStudent = { 
  name: '', parent_name: '', contact_number: '', standard: '', batch_time: '', 
  roll_number: '', branch: '', decided_fee: '0', paid_fee: '0', 
  status: 'active', payment_mode: 'cash' 
};

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

function validateStudent(form) {
  const errs = {};
  if (!form.name?.trim() || form.name.trim().length < 2) errs.name = 'Full name required (min 2 chars)';
  if (form.contact_number && !/^[0-9+\-\s]{7,15}$/.test(form.contact_number)) errs.contact_number = 'Invalid phone number';
  if (Number(form.decided_fee) < 0) errs.decided_fee = 'Fee cannot be negative';
  if (Number(form.paid_fee) < 0) errs.paid_fee = 'Cannot be negative';
  return errs;
}

function StudentCard({ s, admin, onEdit, onDelete }) {
  const feeLeft = Number(s.fee_left ?? (s.decided_fee - s.paid_fee));
  const decidedFee = Number(s.decided_fee) || 0;
  const paidPercent = decidedFee > 0 ? Math.min(100, Math.round(((decidedFee - feeLeft) / decidedFee) * 100)) : 100;

  return (
    <div className="mobile-list-card">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <Link to={`/app/students/${s.id}`} className="fw-bold text-decoration-none" style={{ fontSize: '0.92rem', color: 'var(--text)' }}>
          {s.name}
        </Link>
        <span className={`badge rounded-pill px-2 ${s.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.65rem' }}>
          {s.status}
        </span>
      </div>
      <div className="d-flex flex-wrap gap-3 mb-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>📚 {s.standard || '—'}</span>
        <span>🕐 {s.batch_time || '—'}</span>
        {s.contact_number && <span>📞 {s.contact_number}</span>}
      </div>
      <div className="mb-1">
        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>Fee Progress</span>
          <span className={feeLeft > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
            {feeLeft > 0 ? `${formatINR(feeLeft)} due` : 'Paid ✓'}
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'var(--border)' }}>
          <div style={{ height: '100%', width: `${paidPercent}%`, borderRadius: 2, background: feeLeft > 0 ? '#f59e0b' : '#10b981', transition: 'width 0.4s' }} />
        </div>
      </div>
      {admin && (
        <div className="d-flex gap-2 mt-2">
          <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.72rem' }} onClick={onEdit}>Edit</button>
          <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.72rem' }} onClick={onDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyStudent);
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [branches, setBranches] = useState([]);
  const admin = isAdmin();

  const [searchName, setSearchName] = useState('');
  const [searchStandard, setSearchStandard] = useState('');
  const [searchBranch, setSearchBranch] = useState('');

  const loadStudents = React.useCallback(() => {
    const params = new URLSearchParams();
    if (searchName) params.append('name', searchName);
    if (searchStandard) params.append('standard', searchStandard);
    if (searchBranch) params.append('branch', searchBranch);
    fetchList(`/students/?${params.toString()}`).then(setStudents).catch(e => setError(e.message));
  }, [searchName, searchStandard, searchBranch]);

  useEffect(() => { fetchList('/branches/').then(setBranches).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(loadStudents, 300); return () => clearTimeout(t); }, [loadStudents]);

  const activeCount = students.filter(s => s.status === 'active').length;
  const totalFee = students.reduce((s, st) => s + Number(st.decided_fee || 0), 0);
  const pendingFee = students.reduce((s, st) => s + Number(st.fee_left ?? Math.max(0, st.decided_fee - st.paid_fee) ?? 0), 0);

  const openAdd = () => { setForm({ ...emptyStudent, branch: branches[0]?.id || '', standard: STANDARDS[0] }); setEditId(null); setFormErrors({}); setModal('add'); };
  const openEdit = (s) => { setForm({ ...s, branch: s.branch || s.branch_id || '', payment_mode: 'cash' }); setEditId(s.id); setFormErrors({}); setModal('edit'); };

  const handleSave = async () => {
    const errs = validateStudent(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    try {
      if (modal === 'add') await postJson('/students/', form);
      else await putJson(`/students/${editId}/`, form);
      setModal(null); loadStudents();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try { await deleteJson(`/students/${id}/`); loadStudents(); } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div>
          <p className="subtitle">Management</p>
          <h2>Students</h2>
        </div>
        <div className="d-none d-lg-flex gap-2">
          <button
            className="btn rounded-pill px-4"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}
            onClick={() => exportToExcel(students, STUDENT_COLS, 'students')}
          >
            ⬇ Export
          </button>
          {admin && <button className="btn btn-premium" onClick={openAdd}>+ Add New</button>}
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4 mb-3">{error}</div>}

      {/* KPI Strip */}
      <div className="kpi-scroll-strip mb-3">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)', width: 32, height: 32 }}><span style={{fontSize:'0.9rem'}}>🎓</span></div>
          <p className="text-muted m-0" style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase'}}>Total</p>
          <span className="stat-value">{students.length}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16,185,129,0.1)', width: 32, height: 32 }}><span style={{fontSize:'0.9rem'}}>✅</span></div>
          <p className="text-muted m-0" style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase'}}>Active</p>
          <span className="stat-value">{activeCount}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244,63,94,0.1)', width: 32, height: 32 }}><span style={{fontSize:'0.9rem'}}>💰</span></div>
          <p className="text-muted m-0" style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase'}}>Expected</p>
          <span className="stat-value">{formatINR(totalFee)}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245,158,11,0.1)', width: 32, height: 32 }}><span style={{fontSize:'0.9rem'}}>⏳</span></div>
          <p className="text-muted m-0" style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase'}}>Pending</p>
          <span className="stat-value">{formatINR(pendingFee)}</span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mobile-search-bar">
        <input placeholder="Search students…" value={searchName} onChange={e => setSearchName(e.target.value)} />
      </div>
      <div className="filter-chip-row">
        <select value={searchStandard} onChange={e => setSearchStandard(e.target.value)} className="filter-chip" style={{ appearance: 'auto', paddingRight: '1.5rem' }}>
          <option value="">All Classes</option>
          {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={searchBranch} onChange={e => setSearchBranch(e.target.value)} className="filter-chip" style={{ appearance: 'auto', paddingRight: '1.5rem' }}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="d-none d-md-block glass-card">
        <h3 className="fs-5 mb-3">Student Registry</h3>
        <div className="data-grid-container">
          <table className="data-grid-table">
            <thead>
              <tr>
                <th>Name</th><th>Standard</th><th>Branch</th><th>Fee Balance</th><th>Status</th>
                {admin && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan={admin ? 6 : 5} className="text-center py-5 text-muted">No students match your criteria.</td></tr>}
              {students.map(s => (
                <tr key={s.id}>
                  <td className="fw-semibold">
                    <Link to={`/app/students/${s.id}`} className="text-decoration-none" style={{ color: 'var(--primary)' }}>{s.name}</Link>
                  </td>
                  <td><span className="badge bg-light text-dark border">{s.standard}</span></td>
                  <td>{s.branch_name || s.branch}</td>
                  <td><span className={Number(s.fee_left ?? (s.decided_fee - s.paid_fee)) > 0 ? 'text-danger fw-bold' : 'text-success'}>{formatINR(s.fee_left ?? (s.decided_fee - s.paid_fee))}</span></td>
                  <td>
                    <span className={`badge rounded-pill px-3 ${s.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>{s.status}</span>
                  </td>
                  {admin && (
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary rounded-pill me-1" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(s.id)}>Del</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="d-md-none">
        {students.length === 0 && (
          <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
            <p className="fs-3 mb-1">🎓</p>
            <p className="m-0">No students match your criteria.</p>
          </div>
        )}
        {students.map(s => (
          <StudentCard key={s.id} s={s} admin={admin} onEdit={() => openEdit(s)} onDelete={() => handleDelete(s.id)} />
        ))}
      </div>

      {/* FAB for mobile add */}
      {admin && <button className="fab d-lg-none" onClick={openAdd}>+</button>}

      {/* Bottom-Sheet Modal */}
      {modal && (
        <>
          <div className="mobile-sheet-overlay" onClick={() => setModal(null)} />
          <div className="mobile-sheet">
            <div className="mobile-sheet-handle" />
            <div className="mobile-sheet-header">
              <h3>{modal === 'add' ? '✨ Add Student' : '📝 Edit Student'}</h3>
              <button className="mobile-sheet-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="mobile-sheet-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} className="input-premium" placeholder="Student full name" style={{ borderColor: formErrors.name ? 'var(--danger)' : undefined }} />
                  {formErrors.name && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{formErrors.name}</span>}
                </div>
                <div className="col-6">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Standard</label>
                  <select value={form.standard} onChange={e => set('standard', e.target.value)} className="input-premium">
                    <option value="">Select</option>
                    {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Roll No.</label>
                  <input value={form.roll_number} onChange={e => set('roll_number', e.target.value)} className="input-premium" placeholder="101" />
                </div>
                <div className="col-12">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Parent Name</label>
                  <input value={form.parent_name} onChange={e => set('parent_name', e.target.value)} className="input-premium" placeholder="Parent name" />
                </div>
                <div className="col-12">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Contact Number</label>
                  <input value={form.contact_number} onChange={e => set('contact_number', e.target.value)} className="input-premium" placeholder="+91 9876543210" style={{ borderColor: formErrors.contact_number ? 'var(--danger)' : undefined }} />
                  {formErrors.contact_number && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{formErrors.contact_number}</span>}
                </div>
                <div className="col-12">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Batch / Timing</label>
                  <select value={form.batch_time} onChange={e => set('batch_time', e.target.value)} className="input-premium">
                    <option value="">Select Batch</option>
                    {BATCH_TIMES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Decided Fee (₹)</label>
                  <input type="number" value={form.decided_fee} onChange={e => set('decided_fee', e.target.value)} className="input-premium" min="0" />
                </div>
                <div className="col-6">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Paid Fee (₹)</label>
                  <input type="number" value={form.paid_fee} onChange={e => set('paid_fee', e.target.value)} className="input-premium" min="0" />
                </div>
                {Number(form.paid_fee) > 0 && (
                  <div className="col-12 animate-fade-in">
                    <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Payment Mode</label>
                    <div className="d-flex gap-2">
                      {['cash', 'upi', 'cheque'].map(mode => (
                        <button key={mode} className={`btn flex-grow-1 py-2 rounded-pill fw-bold text-uppercase ${form.payment_mode === mode ? 'btn-primary' : 'btn-outline-secondary'}`} style={{ fontSize: '0.75rem' }} onClick={() => set('payment_mode', mode)}>{mode}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="col-6">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Branch</label>
                  <select value={form.branch} onChange={e => set('branch', e.target.value)} className="input-premium">
                    <option value="">Select</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className="input-premium">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mobile-sheet-footer">
              <button className="btn btn-premium w-100 py-3" onClick={handleSave}>
                {modal === 'add' ? 'Create Student' : 'Save Changes'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StudentsPage;
