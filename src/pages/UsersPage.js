import React, { useEffect, useState } from 'react';
import { fetchList, postJson, putJson, deleteJson, getCurrentUser, canManageUsers } from '../api';
import './UsersPage.css';

const emptyForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'assistant',
  branch: '',
  password: '',
  password_confirm: '',
};

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const user = getCurrentUser();
  const allowed = canManageUsers();
  const isOwner = user && (user.role === 'owner' || user.is_superuser);
  const isAdminUser = user && user.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const [usersData, branchesData] = await Promise.all([
        fetchList('/auth/users/'),
        fetchList('/branches/'),
      ]);
      setUsers(usersData);
      setBranches(branchesData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allowed) {
      load();
    }
  }, [allowed]);

  const openAdd = () => {
    setError('');
    setSuccess('');
    setEditId(null);
    setForm({
      ...emptyForm,
      role: 'assistant',
      branch: isAdminUser ? user.branch : '',
    });
    setModal('add');
  };

  const openEdit = (item) => {
    setError('');
    setSuccess('');
    setEditId(item.id);
    setForm({
      username: item.username || '',
      email: item.email || '',
      first_name: item.first_name || '',
      last_name: item.last_name || '',
      role: item.role || 'assistant',
      branch: item.branch_id || '',
      password: '',
      password_confirm: '',
    });
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setForm(emptyForm);
    setEditId(null);
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      const payload = {
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        branch: form.branch || null,
      };

      if (form.password) {
        payload.password = form.password;
        payload.password_confirm = form.password_confirm;
      }

      if (isAdminUser) {
        payload.branch = user.branch;
        payload.role = 'assistant';
      }

      if (editId) {
        await putJson(`/auth/users/${editId}/`, payload);
        setSuccess('User updated successfully.');
      } else {
        await postJson('/auth/users/', payload);
        setSuccess('User created successfully.');
      }

      closeModal();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteJson(`/auth/users/${id}/`);
      setSuccess('User deleted successfully.');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!allowed) {
    return (
      <div className="page-panel">
        <div className="dashboard-header">
          <p className="subtitle">Administration</p>
          <h2>Users</h2>
        </div>
        <div className="panel-section">
          <p>You do not have permission to manage users.</p>
        </div>
      </div>
    );
  }

  const roleOptions = isOwner
    ? [
        { value: 'owner', label: 'Owner' },
        { value: 'admin', label: 'Admin' },
        { value: 'assistant', label: 'Assistant' },
      ]
    : [{ value: 'assistant', label: 'Assistant' }];

  return (
    <div className="page-panel">
      <div className="dashboard-header">
        <p className="subtitle">Administration</p>
        <h2>Users</h2>
      </div>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      <div className="card-grid">
        <div className="stat-card"><p className="stat-label">Total Users</p><h3>{users.length}</h3></div>
        <div className="stat-card"><p className="stat-label">Branch</p><h3>{isAdminUser ? branches.find(b => b.id === user.branch)?.name || 'N/A' : 'All'}</h3></div>
      </div>

      <div className="panel-section" style={{ marginTop: 20 }}>
        <div className="panel-heading">
          <h3>User List</h3>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <input
              placeholder="🔍 Search users…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-premium py-2"
              style={{ maxWidth: '240px', flex: '1 1 160px' }}
            />
            <button className="btn btn-primary d-none d-md-block" onClick={openAdd}>+ Add User</button>
          </div>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="user-cards-grid">
            {(() => {
              const q = searchQuery.toLowerCase();
              const filtered = users.filter(u => !q || (u.username && u.username.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)) || (`${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q)) || (u.role && u.role.toLowerCase().includes(q)) || (u.branch_name && u.branch_name.toLowerCase().includes(q)));
              if (filtered.length === 0) return <div className="glass-card text-center py-5 w-100"><p className="text-muted m-0">No users match your search.</p></div>;
              
              return filtered.map(u => (
                <div key={u.id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-avatar">
                      {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="user-info">
                      <p className="user-name">{`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username}</p>
                      <span className={`user-role-badge role-${u.role || 'assistant'}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="user-details">
                    <div className="detail-item">
                      <span>📧</span>
                      <span>{u.email || 'No email'}</span>
                    </div>
                    <div className="detail-item">
                      <span>🏢</span>
                      <span>{u.branch_name || 'All Branches'}</span>
                    </div>
                    <div className="detail-item">
                      <span>👤</span>
                      <span>@{u.username}</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    <button className="btn btn-premium btn-sm flex-grow-1" style={{ background: 'var(--surface-muted)', color: 'var(--text)', boxShadow: 'none' }} onClick={() => openEdit(u)}>
                      Edit Profile
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <button className="add-user-fab d-md-none" onClick={openAdd} aria-label="Add User">
        +
      </button>

      {modal && (
        <div className="user-modal-overlay" onClick={closeModal}>
          <div className="user-modal-container" onClick={e => e.stopPropagation()}>
            <div className="user-modal-header">
              <h3 className="m-0 fs-4">{modal === 'add' ? '✨ Add New User' : '📝 Edit User Profile'}</h3>
              <button className="btn btn-link text-dark text-decoration-none fs-3 p-0" onClick={closeModal}>&times;</button>
            </div>
            <div className="user-modal-body">
              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="filter-label">Username</label>
                  <input className="input-premium" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. jdoe" />
                </div>
                <div className="form-group">
                  <label className="filter-label">Email Address</label>
                  <input type="email" className="input-premium" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jdoe@example.com" />
                </div>
                
                <div className="form-group">
                  <label className="filter-label">First Name</label>
                  <input className="input-premium" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="John" />
                </div>
                <div className="form-group">
                  <label className="filter-label">Last Name</label>
                  <input className="input-premium" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Doe" />
                </div>
                
                <div className="form-group">
                  <label className="filter-label">Access Level</label>
                  <select className="input-premium" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="filter-label">Assigned Branch</label>
                  <select
                    className="input-premium"
                    value={form.branch}
                    onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                    disabled={isAdminUser}
                  >
                    <option value="">Select branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="filter-label">{modal === 'edit' ? 'New Password (Optional)' : 'Password'}</label>
                  <input type="password" className="input-premium" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="filter-label">Confirm Password</label>
                  <input type="password" className="input-premium" value={form.password_confirm} onChange={e => setForm(f => ({ ...f, password_confirm: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="user-modal-footer">
              <button className="btn btn-premium btn-sm" style={{ background: 'var(--surface-muted)', color: 'var(--text)', boxShadow: 'none' }} onClick={closeModal}>Cancel</button>
              <button className="btn btn-premium btn-sm px-4" onClick={handleSave}>
                {modal === 'add' ? 'Create Account' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
