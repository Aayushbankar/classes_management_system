import React, { useEffect, useState } from 'react';
import { fetchJson, putJson, postJson, getCurrentUser } from '../api';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', new_password_confirm: '' });

  useEffect(() => {
    fetchJson('/auth/profile/')
      .then(data => { setProfile(data); setForm({ first_name: data.first_name || '', last_name: data.last_name || '', email: data.email || '' }); })
      .catch(e => setError(e.message));
  }, []);

  const handleUpdate = async () => {
    try {
      setError(''); setSuccess('');
      await putJson('/auth/profile/update/', form);
      setSuccess('Profile updated!');
    } catch (e) { setError(e.message); }
  };

  const handlePassword = async () => {
    try {
      setError(''); setSuccess('');
      await postJson('/auth/change-password/', pwForm);
      setSuccess('Password changed!');
      setPwForm({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="page-panel">
      <div className="dashboard-header">
        <p className="subtitle">Administration</p>
        <h2>My Profile</h2>
      </div>

      {error && <div className="error-box">{error}</div>}
      {success && <div className="success-box">{success}</div>}

      {profile && (
        <div className="card-grid">
          <div className="stat-card"><p className="stat-label">Username</p><h3>{profile.username}</h3></div>
          <div className="stat-card"><p className="stat-label">Role</p><h3>{profile.role || 'admin'}</h3></div>
        </div>
      )}

      <div className="panel-section" style={{ marginTop: 20 }}>
        <h3>Update Profile</h3>
        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
          <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        <button className="btn btn-primary" onClick={handleUpdate}>Save Profile</button>
      </div>

      <div className="panel-section" style={{ marginTop: 20 }}>
        <h3>Change Password</h3>
        <div className="form-group" style={{ marginTop: 14 }}><label>Current Password</label><input type="password" value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} /></div>
        <div className="form-row">
          <div className="form-group"><label>New Password</label><input type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} /></div>
          <div className="form-group"><label>Confirm</label><input type="password" value={pwForm.new_password_confirm} onChange={e => setPwForm(f => ({ ...f, new_password_confirm: e.target.value }))} /></div>
        </div>
        <button className="btn btn-primary" onClick={handlePassword}>Change Password</button>
      </div>
    </div>
  );
}

export default ProfilePage;
