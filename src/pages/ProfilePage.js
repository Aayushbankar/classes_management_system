import React, { useState, useEffect } from 'react';
import { fetchJson, postJson, putJson, getCurrentUser, clearSession } from '../api';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [showSecurity, setShowSecurity] = useState(false);

  useEffect(() => {
    fetchJson('/auth/profile/').then(data => {
      setProfile(data);
      setForm({ first_name: data.first_name || '', last_name: data.last_name || '', email: data.email || '' });
    }).catch(e => setError(e.message));
  }, []);

  const handleProfileUpdate = async () => {
    try {
      setError(''); setMessage('');
      await putJson('/auth/profile/', form);
      setMessage('Profile updated!');
    } catch (e) { setError(e.message); }
  };

  const handlePasswordChange = async () => {
    try {
      setPwError(''); setPwMessage('');
      if (passwordForm.new_password !== passwordForm.confirm_password) { setPwError('Passwords do not match'); return; }
      await postJson('/auth/change-password/', { old_password: passwordForm.old_password, new_password: passwordForm.new_password });
      setPwMessage('Password changed!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (e) { setPwError(e.message); }
  };

  const user = getCurrentUser();
  const initials = profile ? `${(profile.first_name || '')[0] || ''}${(profile.last_name || '')[0] || ''}`.toUpperCase() || '?' : '?';

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header mb-3">
        <p className="subtitle">Account</p>
        <h2>Profile</h2>
      </div>

      {/* Hero */}
      <div className="glass-card profile-hero-mobile mb-3">
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {initials}
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{profile?.first_name} {profile?.last_name}</h3>
        <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>@{profile?.username} · {user?.role}</p>
      </div>

      {/* Profile Form */}
      <div className="glass-card mb-3">
        <h3 className="mobile-section-title mt-0 mb-3">Personal Info</h3>
        {error && <div className="error-box mb-2">{error}</div>}
        {message && <div className="alert alert-success rounded-pill px-4 mb-2" style={{ fontSize: '0.85rem' }}>{message}</div>}
        <div className="row g-3">
          <div className="col-6">
            <label className="small fw-bold text-muted mb-1">First Name</label>
            <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="input-premium" />
          </div>
          <div className="col-6">
            <label className="small fw-bold text-muted mb-1">Last Name</label>
            <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="input-premium" />
          </div>
          <div className="col-12">
            <label className="small fw-bold text-muted mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-premium" />
          </div>
          <div className="col-12">
            <button className="btn btn-premium w-100 py-3" onClick={handleProfileUpdate}>Save Changes</button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-card">
        <div className="d-flex justify-content-between align-items-center cursor-pointer" onClick={() => setShowSecurity(!showSecurity)} style={{ cursor: 'pointer' }}>
          <h3 className="mobile-section-title m-0">🔒 Security</h3>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: showSecurity ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
        </div>
        {showSecurity && (
          <div className="mt-3 animate-fade-in">
            {pwError && <div className="error-box mb-2">{pwError}</div>}
            {pwMessage && <div className="alert alert-success rounded-pill px-4 mb-2" style={{ fontSize: '0.85rem' }}>{pwMessage}</div>}
            <div className="row g-3">
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Current Password</label>
                <input type="password" value={passwordForm.old_password} onChange={e => setPasswordForm(f => ({ ...f, old_password: e.target.value }))} className="input-premium" />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">New Password</label>
                <input type="password" value={passwordForm.new_password} onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))} className="input-premium" />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Confirm New Password</label>
                <input type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))} className="input-premium" />
              </div>
              <div className="col-12">
                <button className="btn btn-premium w-100 py-3" onClick={handlePasswordChange}>Update Password</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
