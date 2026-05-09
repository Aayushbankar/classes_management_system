import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchList, postJson, putJson, deleteJson, isAdmin } from '../api';
import { exportToExcel, TEACHER_COLS } from '../utils/export';

const emptyTeacher = { name: '', email: '', phone: '', subject: '', assigned_standard: '', branch: '' };

const TEACHER_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Science", "English", "Social Studies", "Hindi", "Marathi",
  "Computer Science / IT", "Accountancy", "Economics", "Business Studies",
  "Physical Education", "Drawing / Art", "Music", "Other"
];

const TEACHER_STANDARDS = [
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11 (Sci)", "Class 11 (Com)", "Class 11 (Arts)",
  "Class 12 (Sci)", "Class 12 (Com)", "Class 12 (Arts)",
  "NEET", "JEE", "Foundation", "Other"
];

function validateTeacher(form) {
  const errs = {};
  if (!form.name?.trim() || form.name.trim().length < 2) errs.name = 'Full name required (min 2 chars)';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
  if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) errs.phone = 'Invalid phone number';
  if (!form.subject?.trim()) errs.subject = 'Subject is required';
  return errs;
}

function TeacherCard({ t, admin, onEdit, onDelete }) {
  return (
    <div className="glass-card mb-2" style={{ padding: '0.9rem 1rem' }}>
      <div className="d-flex justify-content-between align-items-start mb-1">
        <Link to={`/app/teachers/${t.id}`} className="fw-bold text-decoration-none" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          {t.name}
        </Link>
        <span className="badge rounded-pill px-3" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.7rem' }}>
          {t.subject}
        </span>
      </div>
      <div className="d-flex flex-wrap gap-3 mb-2" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {t.assigned_standard && <span>📚 {t.assigned_standard}</span>}
        {t.phone && <span>📞 {t.phone}</span>}
        {t.email && <span>✉️ {t.email}</span>}
        {t.branch_name && <span>🏢 {t.branch_name}</span>}
      </div>
      {admin && (
        <div className="d-flex gap-2 mt-2">
          <button className="btn btn-sm btn-outline-primary rounded-pill px-3" style={{ fontSize: '0.75rem' }} onClick={onEdit}>Edit</button>
          <button className="btn btn-sm btn-outline-danger rounded-pill px-3" style={{ fontSize: '0.75rem' }} onClick={onDelete}>Delete</button>
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

function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyTeacher);
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const admin = isAdmin();

  const [searchName, setSearchName] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  const load = () => {
    fetchList('/teachers/').then(setTeachers).catch(e => setError(e.message));
    fetchList('/branches/').then(setBranches).catch(() => { });
  };
  useEffect(() => { load(); }, []);

  const filteredTeachers = useMemo(() => {
    const q = searchName.toLowerCase();
    return teachers.filter(t => {
      const nameMatch = !q || (t.name && t.name.toLowerCase().includes(q)) || (t.email && t.email.toLowerCase().includes(q)) || (t.phone && t.phone.includes(q));
      const subjectMatch = !filterSubject || t.subject === filterSubject;
      const branchMatch = !filterBranch || String(t.branch || t.branch_id) === String(filterBranch);
      return nameMatch && subjectMatch && branchMatch;
    });
  }, [teachers, searchName, filterSubject, filterBranch]);

  const subjectOptions = useMemo(() => {
    return Array.from(new Set(teachers.map(t => t.subject).filter(Boolean))).sort();
  }, [teachers]);

  const openAdd = () => { setForm({ ...emptyTeacher, branch: branches[0]?.id || '' }); setEditId(null); setFormErrors({}); setModal('add'); };
  const openEdit = (t) => { setForm({ ...t, branch: t.branch || t.branch_id || '' }); setEditId(t.id); setFormErrors({}); setModal('edit'); };

  const closeModal = () => {
    setModal(null);
    setForm(emptyTeacher);
    setEditId(null);
    setFormErrors({});
    setError('');
  };

  const handleSave = async () => {
    const errs = validateTeacher(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    try {
      if (modal === 'add') await postJson('/teachers/', form);
      else await putJson(`/teachers/${editId}/`, form);
      closeModal(); load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try { await deleteJson(`/teachers/${id}/`); load(); } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in">
      <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <p className="subtitle">Faculty</p>
          <h2 className="fs-1">Teacher Directory</h2>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn rounded-pill px-4"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}
            onClick={() => exportToExcel(teachers, TEACHER_COLS, 'teachers')}
          >
            ⬇ Export
          </button>
          {admin && <button className="btn btn-premium" onClick={openAdd}>+ Add New Teacher</button>}
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4 mb-3">{error}</div>}

      <div className="dashboard-grid mb-4">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)' }}><span>👩‍🏫</span></div>
          <p className="text-muted small fw-bold m-0">Total Faculty</p>
          <span className="stat-value">{teachers.length}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><span>📅</span></div>
          <p className="text-muted small fw-bold m-0">Active Teachers</p>
          <span className="stat-value">{teachers.filter(t => t.is_active !== false).length}</span>
        </div>
      </div>

      <div className="glass-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <h3 className="fs-5 m-0">Faculty List</h3>
          <div className="d-flex flex-wrap gap-2" style={{ flex: 1, justifyContent: 'flex-end' }}>
            <input placeholder="Search name / email…" value={searchName} onChange={e => setSearchName(e.target.value)} className="input-premium py-2" style={{ maxWidth: '200px', flex: '1 1 140px' }} />
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="input-premium py-2" style={{ maxWidth: '180px', flex: '1 1 120px' }}>
              <option value="">All Subjects</option>
              {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="input-premium py-2" style={{ maxWidth: '180px', flex: '1 1 120px' }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* Desktop: Table */}
        <div className="d-none d-md-block">
          <div className="data-grid-container">
            <table className="data-grid-table">
              <thead>
                <tr>
                  <th>Teacher</th><th>Subject</th><th>Contact</th><th>Branch</th>
                  {admin && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 && <tr><td colSpan={admin ? 5 : 4} className="text-center py-5 text-muted">No teachers match your criteria.</td></tr>}
                {filteredTeachers.map(t => (
                  <tr key={t.id}>
                    <td className="fw-semibold">
                      <Link to={`/app/teachers/${t.id}`} className="text-decoration-none" style={{ color: 'var(--primary)' }}>
                        {t.name}
                      </Link>
                    </td>
                    <td><span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{t.subject}</span></td>
                    <td>
                      <div className="small fw-medium">{t.email || '—'}</div>
                      <div className="small" style={{ color: 'var(--text-muted)' }}>{t.phone || '—'}</div>
                    </td>
                    <td><span className="small">{t.branch_name || '—'}</span></td>
                    {admin && (
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary rounded-pill me-1" onClick={() => openEdit(t)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(t.id)}>Del</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: Cards */}
        <div className="d-md-none">
          {filteredTeachers.length === 0 && (
            <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
              <p className="fs-3 mb-1">👩‍🏫</p>
              <p className="m-0">No teachers match your criteria.</p>
            </div>
          )}
          {filteredTeachers.map(t => (
            <TeacherCard key={t.id} t={t} admin={admin} onEdit={() => openEdit(t)} onDelete={() => handleDelete(t.id)} />
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="command-palette-overlay" onClick={closeModal}>
          <div className="glass-card animate-fade-in m-3" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fs-4">{modal === 'add' ? '✨ Add Teacher' : '📝 Edit Faculty'}</h3>
              <button className="btn btn-link text-decoration-none fs-4" style={{ color: 'var(--text-primary)' }} onClick={closeModal}>&times;</button>
            </div>
            <div className="row g-3">
              <div className="col-12"><Field label="Full Name *" id="t_name" value={form.name} onChange={e => set('name', e.target.value)} error={formErrors.name} placeholder="e.g. Dr. Sarah Smith" /></div>
              <div className="col-md-6">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Subject *</label>
                <select value={form.subject} onChange={e => set('subject', e.target.value)} className={`input-premium ${formErrors.subject ? 'border-danger' : ''}`}>
                  <option value="">Select Subject</option>
                  {TEACHER_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {formErrors.subject && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{formErrors.subject}</span>}
              </div>
              <div className="col-md-6">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Assigned Class</label>
                <select value={form.assigned_standard} onChange={e => set('assigned_standard', e.target.value)} className="input-premium">
                  <option value="">Select Class</option>
                  {TEACHER_STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-12"><Field label="Email Address" id="t_email" type="email" value={form.email} onChange={e => set('email', e.target.value)} error={formErrors.email} placeholder="sarah@eklavya.edu" /></div>
              <div className="col-12"><Field label="Phone Number" id="t_phone" value={form.phone} onChange={e => set('phone', e.target.value)} error={formErrors.phone} placeholder="+91 9988776655" /></div>
              <div className="col-12">
                <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>Branch</label>
                <select value={form.branch} onChange={e => set('branch', e.target.value)} className="input-premium">
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-premium w-100 py-3 mt-4" onClick={handleSave}>
              {modal === 'add' ? 'Confirm Appointment' : 'Update Record'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeachersPage;
