import React, { useEffect, useState } from 'react';
import { fetchJson, postJson, putJson, deleteJson, isAdmin } from '../api';

const emptyTeacher = { name: '', email: '', phone: '', subject: '', assigned_standard: '', branch: '' };

function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyTeacher);
  const [editId, setEditId] = useState(null);
  const admin = isAdmin();

  const load = () => {
    fetchJson('/teachers/').then(setTeachers).catch(e => setError(e.message));
    fetchJson('/branches/').then(setBranches).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ ...emptyTeacher, branch: branches[0]?.id || '' }); setEditId(null); setModal('add'); };
  const openEdit = (t) => { setForm({ ...t, branch: t.branch || t.branch_id || '' }); setEditId(t.id); setModal('edit'); };

  const handleSave = async () => {
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
      <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <p className="subtitle">Faculty</p>
          <h2 className="fs-1">Teacher Directory</h2>
        </div>
        {admin && <button className="btn btn-premium" onClick={openAdd}>+ Add New Teacher</button>}
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4">{error}</div>}

      <div className="dashboard-grid mb-5">
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
        <h3 className="fs-4 mb-4">Faculty List</h3>
        <div className="data-grid-container">
          <table className="data-grid-table">
            <thead>
              <tr>
                <th>Teacher Details</th>
                <th>Subject</th>
                <th>Contact Info</th>
                <th>Branch</th>
                {admin && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 && (
                <tr><td colSpan={admin ? 5 : 4} className="text-center py-5 text-muted">No teachers found in the system.</td></tr>
              )}
              {teachers.map(t => (
                <tr key={t.id}>
                  <td className="fw-semibold">{t.name}</td>
                  <td><span className="badge bg-primary-soft text-primary border-0">{t.subject}</span></td>
                  <td>
                    <div className="small fw-medium">{t.email}</div>
                    <div className="small text-muted">{t.phone}</div>
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

      {modal && (
        <div className="command-palette-overlay" onClick={() => setModal(null)}>
          <div className="glass-card animate-fade-in m-3" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fs-4">{modal === 'add' ? '✨ Add Teacher' : '📝 Edit Faculty'}</h3>
              <button className="btn btn-link text-dark text-decoration-none fs-4" onClick={() => setModal(null)}>&times;</button>
            </div>
            
            <div className="row g-3">
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input-premium" placeholder="e.g. Dr. Sarah Smith" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Subject Expertise</label>
                <input value={form.subject} onChange={e => set('subject', e.target.value)} className="input-premium" placeholder="e.g. Mathematics" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Assigned Class</label>
                <input value={form.assigned_standard} onChange={e => set('assigned_standard', e.target.value)} className="input-premium" placeholder="e.g. 12th Sci" />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Email Address</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-premium" placeholder="sarah@eklavya.edu" />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Phone Number</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-premium" placeholder="+91 9988776655" />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Branch</label>
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
