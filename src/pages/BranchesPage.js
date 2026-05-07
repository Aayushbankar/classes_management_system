import React, { useEffect, useState } from 'react';
import { fetchJson, fetchList, postJson, putJson, deleteJson, isAdmin } from '../api';

const emptyBranch = { name: '', code: '', address: '', city: '', is_active: true };

function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyBranch);
  const [editId, setEditId] = useState(null);
  const admin = isAdmin();

  const load = () => fetchList('/branches/').then(setBranches).catch(e => setError(e.message));
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
      <div className="mobile-page-header d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div><p className="subtitle">Infrastructure</p><h2>Branches</h2></div>
        {admin && <button className="btn btn-premium d-none d-lg-inline-flex" onClick={openAdd}>+ Add Branch</button>}
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4">{error}</div>}

      <div className="kpi-scroll-strip mb-3" style={{ maxWidth: '320px' }}>
        <div className="glass-card stat-card"><div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)', width: 32, height: 32 }}><span style={{fontSize:'0.9rem'}}>🏢</span></div><p className="text-muted m-0" style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase'}}>Centers</p><span className="stat-value">{branches.length}</span></div>
        <div className="glass-card stat-card"><div className="stat-icon-wrapper" style={{ background: 'rgba(16,185,129,0.1)', width: 32, height: 32 }}><span style={{fontSize:'0.9rem'}}>🟢</span></div><p className="text-muted m-0" style={{fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase'}}>Active</p><span className="stat-value">{branches.filter(b => b.is_active !== false).length}</span></div>
      </div>

      {/* Desktop table */}
      <div className="glass-card d-none d-md-block">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }} className="mb-3">Branch Registry</h3>
        <div className="data-grid-container">
          <table className="data-grid-table">
            <thead><tr><th>Name</th><th>Code</th><th>Location</th><th>Status</th>{admin && <th className="text-end">Actions</th>}</tr></thead>
            <tbody>
              {branches.length === 0 && <tr><td colSpan={admin ? 5 : 4} className="text-center py-5 text-muted">No branches configured.</td></tr>}
              {branches.map(b => (
                <tr key={b.id}>
                  <td className="fw-semibold">{b.name}</td>
                  <td><code className="bg-light px-2 py-1 rounded text-primary">{b.code}</code></td>
                  <td className="small text-muted">{b.address || '—'} {b.city ? `(${b.city})` : ''}</td>
                  <td><span className={`badge rounded-pill px-3 ${b.is_active !== false ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>{b.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                  {admin && (<td className="text-end"><button className="btn btn-sm btn-outline-primary rounded-pill me-1" onClick={() => openEdit(b)}>Edit</button><button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(b.id)}>Del</button></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="d-md-none">
        {branches.length === 0 && <div className="glass-card text-center py-4"><p className="text-muted m-0">No branches configured.</p></div>}
        {branches.map(b => (
          <div key={b.id} className="mobile-list-card">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{b.name}</span>
              <span className={`badge rounded-pill px-2 ${b.is_active !== false ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.65rem' }}>{b.is_active !== false ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>🏷️ {b.code}</span>
              {b.city && <span>📍 {b.city}</span>}
              {b.address && <span>{b.address}</span>}
            </div>
            {admin && (
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.72rem' }} onClick={() => openEdit(b)}>Edit</button>
                <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.72rem' }} onClick={() => handleDelete(b.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {admin && <button className="fab d-lg-none" onClick={openAdd}>+</button>}

      {modal && (
        <>
          <div className="mobile-sheet-overlay" onClick={() => setModal(null)} />
          <div className="mobile-sheet">
            <div className="mobile-sheet-handle" />
            <div className="mobile-sheet-header">
              <h3>{modal === 'add' ? '🏢 New Branch' : '📝 Edit Branch'}</h3>
              <button className="mobile-sheet-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="mobile-sheet-body">
              <div className="row g-3">
                <div className="col-12"><label className="small fw-bold text-muted mb-1">Branch Name</label><input value={form.name} onChange={e => set('name', e.target.value)} className="input-premium" placeholder="Downtown Center" /></div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">Code</label><input value={form.code} onChange={e => set('code', e.target.value)} className="input-premium" placeholder="DT01" /></div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">City</label><input value={form.city} onChange={e => set('city', e.target.value)} className="input-premium" placeholder="Mumbai" /></div>
                <div className="col-12"><label className="small fw-bold text-muted mb-1">Address</label><textarea value={form.address} onChange={e => set('address', e.target.value)} className="input-premium" rows={3} placeholder="Full address…" /></div>
                <div className="col-12">
                  <div className="d-flex align-items-center gap-3">
                    <label className="small fw-bold text-muted mb-0">Operational?</label>
                    <input type="checkbox" className="form-check-input" style={{ width: '40px', height: '20px', cursor: 'pointer' }} checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mobile-sheet-footer">
              <button className="btn btn-premium w-100 py-3" onClick={handleSave}>{modal === 'add' ? 'Create Branch' : 'Update'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BranchesPage;
