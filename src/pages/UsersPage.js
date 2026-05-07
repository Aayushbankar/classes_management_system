import React, { useEffect, useState } from 'react';
import { fetchList, postJson, putJson, deleteJson, getCurrentUser, canManageUsers } from '../api';

const emptyForm = { username: '', email: '', first_name: '', last_name: '', role: 'assistant', branch: '', password: '', password_confirm: '' };

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const user = getCurrentUser();
  const allowed = canManageUsers();
  const isOwner = user && user.role === 'owner';
  const isAdminUser = user && user.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const [usersData, branchesData] = await Promise.all([fetchList('/auth/users/'), fetchList('/branches/')]);
      setUsers(usersData); setBranches(branchesData);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (allowed) load(); }, [allowed]);

  const openAdd = () => { setError(''); setSuccess(''); setEditId(null); setForm({ ...emptyForm, role: 'assistant', branch: isAdminUser ? user.branch : '' }); setModal('add'); };
  const openEdit = (item) => { setError(''); setSuccess(''); setEditId(item.id); setForm({ username: item.username || '', email: item.email || '', first_name: item.first_name || '', last_name: item.last_name || '', role: item.role || 'assistant', branch: item.branch_id || '', password: '', password_confirm: '' }); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(emptyForm); setEditId(null); };

  const handleSave = async () => {
    try {
      setError(''); setSuccess('');
      const payload = { username: form.username, email: form.email, first_name: form.first_name, last_name: form.last_name, role: form.role, branch: form.branch || null };
      if (form.password) { payload.password = form.password; payload.password_confirm = form.password_confirm; }
      if (isAdminUser) { payload.branch = user.branch; payload.role = 'assistant'; }
      if (editId) { await putJson(`/auth/users/${editId}/`, payload); setSuccess('User updated.'); }
      else { await postJson('/auth/users/', payload); setSuccess('User created.'); }
      closeModal(); load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await deleteJson(`/auth/users/${id}/`); setSuccess('User deleted.'); load(); } catch (e) { setError(e.message); }
  };

  if (!allowed) return (
    <div className="animate-fade-in">
      <div className="mobile-page-header"><p className="subtitle">Administration</p><h2>Users</h2></div>
      <div className="glass-card text-center py-5"><p className="text-muted m-0">You do not have permission to manage users.</p></div>
    </div>
  );

  const roleOptions = isOwner ? [{ value: 'owner', label: 'Owner' }, { value: 'admin', label: 'Admin' }, { value: 'assistant', label: 'Assistant' }] : [{ value: 'assistant', label: 'Assistant' }];

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div><p className="subtitle">Administration</p><h2>Users</h2></div>
        <button className="btn btn-premium d-none d-lg-inline-flex" onClick={openAdd}>+ Add User</button>
      </div>

      {error && <div className="error-box mb-2">{error}</div>}
      {success && <div className="alert alert-success rounded-pill px-4 mb-2" style={{ fontSize: '0.85rem' }}>{success}</div>}

      <div className="kpi-scroll-strip mb-3" style={{ maxWidth: '320px' }}>
        <div className="glass-card stat-card"><p className="filter-label m-0">Users</p><span className="stat-value">{users.length}</span></div>
        <div className="glass-card stat-card"><p className="filter-label m-0">Branch</p><span className="stat-value" style={{ fontSize: '0.9rem' }}>{isAdminUser ? branches.find(b => b.id === user.branch)?.name || 'N/A' : 'All'}</span></div>
      </div>

      {/* Desktop table */}
      <div className="glass-card d-none d-md-block">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }} className="mb-3">User List</h3>
        {loading ? <p>Loading…</p> : (
          <div className="data-grid-container">
            <table className="data-grid-table">
              <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Branch</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {users.length === 0 ? <tr><td colSpan={5} className="text-center py-5 text-muted">No users found</td></tr> : users.map(u => (
                  <tr key={u.id}>
                    <td className="fw-semibold">{u.username}</td>
                    <td>{`${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'}</td>
                    <td><span className="badge rounded-pill px-2" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.65rem' }}>{u.role}</span></td>
                    <td className="small">{u.branch_name || '-'}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary rounded-pill me-1" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(u.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="d-md-none">
        {loading ? <p className="text-muted">Loading…</p> : users.length === 0 ? <div className="glass-card text-center py-4"><p className="text-muted m-0">No users found</p></div> : users.map(u => (
          <div key={u.id} className="mobile-list-card">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{u.username}</span>
              <span className="badge rounded-pill px-2" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.65rem' }}>{u.role}</span>
            </div>
            <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>👤 {`${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'}</span>
              <span>📧 {u.email || '—'}</span>
              <span>🏢 {u.branch_name || '—'}</span>
            </div>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.72rem' }} onClick={() => openEdit(u)}>Edit</button>
              <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.72rem' }} onClick={() => handleDelete(u.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <button className="fab d-lg-none" onClick={openAdd}>+</button>

      {modal && (
        <>
          <div className="mobile-sheet-overlay" onClick={closeModal} />
          <div className="mobile-sheet">
            <div className="mobile-sheet-handle" />
            <div className="mobile-sheet-header">
              <h3>{modal === 'add' ? '👤 Add User' : '📝 Edit User'}</h3>
              <button className="mobile-sheet-close" onClick={closeModal}>✕</button>
            </div>
            <div className="mobile-sheet-body">
              <div className="row g-3">
                <div className="col-6"><label className="small fw-bold text-muted mb-1">Username</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="input-premium" /></div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-premium" /></div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">First Name</label><input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="input-premium" /></div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">Last Name</label><input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="input-premium" /></div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-premium">
                    {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">Branch</label>
                  <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="input-premium" disabled={isAdminUser}>
                    <option value="">Select</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-premium" /></div>
                <div className="col-6"><label className="small fw-bold text-muted mb-1">Confirm</label><input type="password" value={form.password_confirm} onChange={e => setForm(f => ({ ...f, password_confirm: e.target.value }))} className="input-premium" /></div>
              </div>
            </div>
            <div className="mobile-sheet-footer">
              <button className="btn btn-premium w-100 py-3" onClick={handleSave}>{modal === 'add' ? 'Create User' : 'Save Changes'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UsersPage;
