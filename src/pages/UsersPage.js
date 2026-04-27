import React, { useEffect, useState } from 'react';
import { fetchJson, fetchList, postJson, putJson, deleteJson, getCurrentUser, canManageUsers } from '../api';

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

  const user = getCurrentUser();
  const allowed = canManageUsers();
  const isOwner = user && user.role === 'owner';
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
      role: isOwner ? 'assistant' : 'assistant',
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
          <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="data-table" style={{ width: '100%', marginTop: 12 }}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{`${u.first_name || ''} ${u.last_name || ''}`.trim()}</td>
                  <td>{u.role}</td>
                  <td>{u.branch_name || '-'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)} style={{ marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3>{modal === 'add' ? 'Add User' : 'Edit User'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div>
              <div className="form-row">
                <div className="form-group"><label>Username</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Branch</label>
                  <select
                    value={form.branch}
                    onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                    disabled={isAdminUser}
                  >
                    <option value="">Select branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                <div className="form-group"><label>Confirm Password</label><input type="password" value={form.password_confirm} onChange={e => setForm(f => ({ ...f, password_confirm: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{modal === 'add' ? 'Create User' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
