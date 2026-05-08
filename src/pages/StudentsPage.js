import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchList, postJson, putJson, deleteJson, isAdmin } from '../api';
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
    <div className="glass-card mb-2" style={{ padding: '0.9rem 1rem' }}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <Link to={`/app/students/${s.id}`} className="fw-bold text-decoration-none" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {s.name}
        </Link>
        <span className={`badge rounded-pill px-3 ${s.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.7rem' }}>
          {s.status}
        </span>
      </div>
      <div className="d-flex flex-wrap gap-3 mb-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>📚 {s.standard || '—'}</span>
        <span>🕐 {s.batch_time || '—'}</span>
        {s.roll_number && <span>🪪 Roll #{s.roll_number}</span>}
        {s.contact_number && <span>📞 {s.contact_number}</span>}
      </div>
      <div className="mb-2">
        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Fee Paid</span>
          <span className={feeLeft > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
            {feeLeft > 0 ? `${formatINR(feeLeft)} pending` : 'Paid in full'}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'var(--border)' }}>
          <div style={{ height: '100%', width: `${paidPercent}%`, borderRadius: 3, background: feeLeft > 0 ? '#f59e0b' : '#10b981', transition: 'width 0.4s' }} />
        </div>
      </div>
      {admin && (
        <div className="d-flex gap-2 mt-2">
          <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.75rem' }} onClick={onEdit}>Edit</button>
          <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.75rem' }} onClick={onDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, id, type = 'text', value, onChange, error: fe, placeholder }) => (
  <div>
    <label htmlFor={id} className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>{label}</label>
    <input id={id} type={type} value={value} onChange={onChange} className="input-premium" placeholder={placeholder} style={{ borderColor: fe ? 'var(--danger)' : undefined }} />
    {fe && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{fe}</span>}
  </div>
);

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

  useEffect(() => { fetchList('/branches/').then(setBranches).catch(() => { }); }, []);
  useEffect(() => { const t = setTimeout(loadStudents, 300); return () => clearTimeout(t); }, [loadStudents]);

  const activeCount = students.filter(s => s.status === 'active').length;
  const totalFee = students.reduce((s, st) => s + Number(st.decided_fee || 0), 0);
  const pendingFee = students.reduce((s, st) => s + Number(st.fee_left ?? Math.max(0, st.decided_fee - st.paid_fee) ?? 0), 0);

  const openAdd = () => { setForm({ ...emptyStudent, branch: branches[0]?.id || '', standard: STANDARDS[0] }); setEditId(null); setFormErrors({}); setModal('add'); };
  const openEdit = (s) => { setForm({ ...s, branch: s.branch || s.branch_id || '', payment_mode: 'cash' }); setEditId(s.id); setFormErrors({}); setModal('edit'); };

  const closeModal = () => {
    setModal(null);
    setForm(emptyStudent);
    setEditId(null);
    setFormErrors({});
    setError('');
  };

  const handleSave = async () => {
    const errs = validateStudent(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    try {
      if (modal === 'add') await postJson('/students/', form);
      else await putJson(`/students/${editId}/`, form);
      closeModal(); loadStudents();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try { await deleteJson(`/students/${id}/`); loadStudents(); } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in">
      <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <p className="subtitle">Management</p>
          <h2 className="fs-1">Student Directory</h2>
        </div>
        <div className="d-flex gap-2">
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

      <div className="dashboard-grid mb-4">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)' }}><span>🎓</span></div>
          <p className="text-muted small fw-bold m-0">Total Students</p>
          <span className="stat-value">{students.length}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><span>✅</span></div>
          <p className="text-muted small fw-bold m-0">Active Now</p>
          <span className="stat-value">{activeCount}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.1)' }}><span>💰</span></div>
          <p className="text-muted small fw-bold m-0">Expected Revenue</p>
          <span className="stat-value">{formatINR(totalFee)}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><span>⏳</span></div>
          <p className="text-muted small fw-bold m-0">Pending Fees</p>
          <span className="stat-value">{formatINR(pendingFee)}</span>
        </div>
      </div>

      <div className="glass-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <h3 className="fs-5 m-0">Student Registry</h3>
          <div className="d-flex flex-wrap gap-2" style={{ flex: 1, justifyContent: 'flex-end' }}>
            <input placeholder="Search name…" value={searchName} onChange={e => setSearchName(e.target.value)} className="input-premium py-2" style={{ maxWidth: '180px', flex: '1 1 120px' }} />
            <input placeholder="Standard…" value={searchStandard} onChange={e => setSearchStandard(e.target.value)} className="input-premium py-2" style={{ maxWidth: '140px', flex: '1 1 100px' }} />
            <select value={searchBranch} onChange={e => setSearchBranch(e.target.value)} className="input-premium py-2" style={{ maxWidth: '180px', flex: '1 1 120px' }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <div className="d-none d-md-block">
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
      </div>

      {modal && (
        <div className="command-palette-overlay" onClick={closeModal}>
          <div className="glass-card animate-fade-in m-3" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fs-4 m-0">{modal === 'add' ? '✨ Add New Student' : '📝 Edit Student Record'}</h3>
              <button className="btn btn-link text-decoration-none fs-4 p-0 m-0" style={{ color: 'var(--text-primary)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeModal}>&times;</button>
            </div>
            <div className="row g-3">
              <div className="col-12"><Field label="Full Name *" id="s_name" value={form.name} onChange={e => set('name', e.target.value)} error={formErrors.name} placeholder="Student full name" /></div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Standard / Class</label>
                <select value={form.standard} onChange={e => set('standard', e.target.value)} className="input-premium">
                  <option value="">Select Standard</option>
                  {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="col-md-6"><Field label="Roll Number" id="s_roll" value={form.roll_number} onChange={e => set('roll_number', e.target.value)} placeholder="e.g. 101" /></div>
              <div className="col-12"><Field label="Parent / Guardian Name" id="s_parent" value={form.parent_name} onChange={e => set('parent_name', e.target.value)} placeholder="Parent name" /></div>
              <div className="col-12"><Field label="Contact Number" id="s_phone" value={form.contact_number} onChange={e => set('contact_number', e.target.value)} error={formErrors.contact_number} placeholder="+91 9876543210" /></div>
              <div className="col-12">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Batch / Timing</label>
                <select value={form.batch_time} onChange={e => set('batch_time', e.target.value)} className="input-premium">
                  <option value="">Select Batch/Time</option>
                  {BATCH_TIMES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Decided Fee (₹)</label>
                <input type="number" value={form.decided_fee} onChange={e => set('decided_fee', e.target.value)} className="input-premium" min="0" />
                {formErrors.decided_fee && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{formErrors.decided_fee}</span>}
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Paid Fee (₹)</label>
                <input type="number" value={form.paid_fee} onChange={e => set('paid_fee', e.target.value)} className="input-premium" min="0" />
                {formErrors.paid_fee && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{formErrors.paid_fee}</span>}
              </div>

              {Number(form.paid_fee) > 0 && (
                <div className="col-12 animate-fade-in">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Initial Payment Mode</label>
                  <div className="d-flex gap-2">
                    {['cash', 'upi', 'cheque'].map(mode => (
                      <button
                        key={mode}
                        className={`btn flex-grow-1 py-2 rounded-pill fw-bold text-uppercase ${form.payment_mode === mode ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => set('payment_mode', mode)}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Branch</label>
                <select value={form.branch} onChange={e => set('branch', e.target.value)} className="input-premium">
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input-premium">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button className="btn btn-premium w-100 py-3" onClick={handleSave}>
                {modal === 'add' ? 'Create Student' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;
