import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchList, postJson, putJson, deleteJson, isAdmin } from '../api';
import { exportToExcel, TEACHER_COLS } from '../utils/export';
import { formatCurrency } from '../utils/format';

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
    <div className="mobile-list-card">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <Link to={`/app/teachers/${t.id}`} className="fw-bold text-decoration-none" style={{ fontSize: '0.92rem', color: 'var(--text)' }}>
          {t.name}
        </Link>
        <span className="badge rounded-pill px-2" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.65rem' }}>
          {t.subject}
        </span>
      </div>
      <div className="d-flex flex-wrap gap-3 mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {t.assigned_standard && <span>📚 {t.assigned_standard}</span>}
        {t.phone && <span>📞 {t.phone}</span>}
        {t.branch_name && <span>🏢 {t.branch_name}</span>}
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

function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyTeacher);
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const admin = isAdmin();

  const load = () => {
    fetchList('/teachers/').then(setTeachers).catch(e => setError(e.message));
    fetchList('/branches/').then(setBranches).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ ...emptyTeacher, branch: branches[0]?.id || '' }); setEditId(null); setFormErrors({}); setModal('add'); };
  const openEdit = (t) => { setForm({ ...t, branch: t.branch || t.branch_id || '' }); setEditId(t.id); setFormErrors({}); setModal('edit'); };

  const handleSave = async () => {
    const errs = validateTeacher(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    try {
      if (modal === 'add') await postJson('/teachers/', form);
      else await putJson(`/teachers/${editId}/`, form);
      setModal(null); load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try { await deleteJson(`/teachers/${id}/`); load(); } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div>
          <p className="subtitle">Faculty</p>
          <h2>Teachers</h2>
        </div>
        <div className="d-none d-lg-flex gap-2">
          <button className="btn rounded-pill px-4" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }} onClick={() => exportToExcel(teachers, TEACHER_COLS, 'teachers')}>
            ⬇ Export
          </button>
          {admin && <button className="btn btn-premium" onClick={openAdd}>+ Add Teacher</button>}
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4 mb-3">{error}</div>}

      <div className="kpi-scroll-strip mb-3">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)', width: 32, height: 32 }}><span style={{fontSize:'0.9rem'}}>👩‍🏫</span></div>
          <p className="text-muted m-0" style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase'}}>Total Faculty</p>
          <span className="stat-value">{teachers.length}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16,185,129,0.1)', width: 32, height: 32 }}><span style={{fontSize:'0.9rem'}}>📅</span></div>
          <p className="text-muted m-0" style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase'}}>Active</p>
          <span className="stat-value">{teachers.filter(t => t.is_active !== false).length}</span>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="glass-card d-none d-md-block">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }} className="mb-3">Faculty List</h3>
        <div className="data-grid-container">
          <table className="data-grid-table">
            <thead><tr><th>Teacher</th><th>Subject</th><th>Contact</th><th>Branch</th>{admin && <th className="text-end">Actions</th>}</tr></thead>
            <tbody>
              {teachers.length === 0 && <tr><td colSpan={admin ? 5 : 4} className="text-center py-5 text-muted">No teachers found.</td></tr>}
              {teachers.map(t => (
                <tr key={t.id}>
                  <td className="fw-semibold"><Link to={`/app/teachers/${t.id}`} className="text-decoration-none" style={{ color: 'var(--primary)' }}>{t.name}</Link></td>
                  <td><span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{t.subject}</span></td>
                  <td><div className="small fw-medium">{t.email || '—'}</div><div className="small" style={{ color: 'var(--text-muted)' }}>{t.phone || '—'}</div></td>
                  <td><span className="small">{t.branch_name || '—'}</span></td>
                  {admin && (<td className="text-end"><button className="btn btn-sm btn-outline-primary rounded-pill me-1" onClick={() => openEdit(t)}>Edit</button><button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(t.id)}>Del</button></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="d-md-none">
        {teachers.length === 0 && <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}><p className="fs-3 mb-1">👩‍🏫</p><p className="m-0">No teachers found.</p></div>}
        {teachers.map(t => <TeacherCard key={t.id} t={t} admin={admin} onEdit={() => openEdit(t)} onDelete={() => handleDelete(t.id)} />)}
      </div>

      {admin && <button className="fab d-lg-none" onClick={openAdd}>+</button>}

      {/* Bottom Sheet Modal */}
      {modal && (
        <>
          <div className="mobile-sheet-overlay" onClick={() => setModal(null)} />
          <div className="mobile-sheet">
            <div className="mobile-sheet-handle" />
            <div className="mobile-sheet-header">
              <h3>{modal === 'add' ? '✨ Add Teacher' : '📝 Edit Faculty'}</h3>
              <button className="mobile-sheet-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="mobile-sheet-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} className="input-premium" placeholder="Dr. Sarah Smith" style={{ borderColor: formErrors.name ? 'var(--danger)' : undefined }} />
                  {formErrors.name && <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{formErrors.name}</span>}
                </div>
                <div className="col-6">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Subject *</label>
                  <select value={form.subject} onChange={e => set('subject', e.target.value)} className={`input-premium ${formErrors.subject ? 'border-danger' : ''}`}>
                    <option value="">Select</option>
                    {TEACHER_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Class</label>
                  <select value={form.assigned_standard} onChange={e => set('assigned_standard', e.target.value)} className="input-premium">
                    <option value="">Select</option>
                    {TEACHER_STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-premium" placeholder="sarah@eklavya.edu" style={{ borderColor: formErrors.email ? 'var(--danger)' : undefined }} />
                </div>
                <div className="col-12">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Phone</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-premium" placeholder="+91 9988776655" />
                </div>
                <div className="col-12">
                  <label className="small fw-bold mb-1 d-block" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem' }}>Branch</label>
                  <select value={form.branch} onChange={e => set('branch', e.target.value)} className="input-premium">
                    <option value="">Select</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="mobile-sheet-footer">
              <button className="btn btn-premium w-100 py-3" onClick={handleSave}>{modal === 'add' ? 'Add Teacher' : 'Update'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TeachersPage;
