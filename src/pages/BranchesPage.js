import React, { useEffect, useState } from 'react';
import { fetchJson, postJson, putJson, deleteJson, isAdmin } from '../api';

const emptyBranch = { name: '', code: '', address: '', city: '', is_active: true };

function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyBranch);
  const [editId, setEditId] = useState(null);
  const admin = isAdmin();

  const load = () => fetchJson('/branches/').then(setBranches).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyBranch); setEditId(null); setModal('add'); };
  const openEdit = (b) => { setForm({ name: b.name, code: b.code, address: b.address || '', city: b.city || '', is_active: b.is_active !== false }); setEditId(b.id); setModal('edit'); };

  const handleSave = async () => {
    try {
      if (modal === 'add') await postJson('/branches/', form);
      else await putJson(`/branches/${editId}/`, form);
      setModal(null); load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this branch?')) return;
    try { await deleteJson(`/branches/${id}/`); load(); } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in">
      <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <p className="subtitle">Infrastructure</p>
          <h2 className="fs-1">Branch Locations</h2>
        </div>
        {admin && <button className="btn btn-premium" onClick={openAdd}>+ Add New Branch</button>}
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4">{error}</div>}

      <div className="dashboard-grid mb-5">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)' }}><span>🏢</span></div>
          <p className="text-muted small fw-bold m-0">Total Centers</p>
          <span className="stat-value">{branches.length}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><span>🟢</span></div>
          <p className="text-muted small fw-bold m-0">Operational</p>
          <span className="stat-value">{branches.filter(b => b.is_active !== false).length}</span>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="fs-4 mb-4">Branch Registry</h3>
        <div className="data-grid-container">
          <table className="data-grid-table">
            <thead>
              <tr>
                <th>Branch Details</th>
                <th>Code</th>
                <th>Location</th>
                <th>Status</th>
                {admin && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 && (
                <tr><td colSpan={admin ? 5 : 4} className="text-center py-5 text-muted">No branches configured.</td></tr>
              )}
              {branches.map(b => (
                <tr key={b.id}>
                  <td className="fw-semibold">{b.name}</td>
                  <td><code className="bg-light px-2 py-1 rounded text-primary">{b.code}</code></td>
                  <td className="small text-muted">{b.address || '—'} {b.city ? `(${b.city})` : ''}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 ${b.is_active !== false ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                      {b.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {admin && (
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary rounded-pill me-1" onClick={() => openEdit(b)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(b.id)}>Del</button>
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
              <h3 className="fs-4">{modal === 'add' ? '🏢 New Branch' : '📝 Edit Branch'}</h3>
              <button className="btn btn-link text-dark text-decoration-none fs-4" onClick={() => setModal(null)}>&times;</button>
            </div>
            
            <div className="row g-3">
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Branch Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input-premium" placeholder="e.g. Downtown Center" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Branch Code</label>
                <input value={form.code} onChange={e => set('code', e.target.value)} className="input-premium" placeholder="e.g. DT01" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">City</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} className="input-premium" placeholder="e.g. Mumbai" />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Address</label>
                <textarea value={form.address} onChange={e => set('address', e.target.value)} className="input-premium" rows={3} placeholder="Full postal address..." />
              </div>
              <div className="col-12">
                <div className="form-check form-switch p-0 d-flex align-items-center gap-3">
                  <label className="small fw-bold text-muted mb-0" htmlFor="is_active">Is Branch Operational?</label>
                  <input
                    id="is_active"
                    type="checkbox"
                    className="form-check-input ms-0"
                    style={{ cursor: 'pointer', width: '40px', height: '20px' }}
                    checked={form.is_active}
                    onChange={e => set('is_active', e.target.checked)}
                  />
                </div>
              </div>
            </div>

            <button className="btn btn-premium w-100 py-3 mt-4" onClick={handleSave}>
              {modal === 'add' ? 'Register Branch' : 'Update Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BranchesPage;
