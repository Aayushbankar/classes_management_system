import React, { useEffect, useState } from 'react';
import { fetchJson, putJson, postJson } from '../api';

function getInitials(username = '', firstName = '', lastName = '') {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  return username ? username[0].toUpperCase() : '?';
}

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { score, label: 'Medium', color: '#f59e0b' };
  return { score, label: 'Strong', color: '#10b981' };
}

const ROLE_BADGES = {
  owner: { label: 'Owner', bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
  admin: { label: 'Admin', bg: 'rgba(99,102,241,0.15)', color: '#6366f1' },
  assistant: { label: 'Assistant', bg: 'rgba(100,116,139,0.15)', color: '#64748b' },
};

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', new_password_confirm: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    fetchJson('/auth/profile/')
      .then(data => {
        setProfile(data);
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
        });
      })
      .catch(e => setError(e.message));
  }, []);

  const validateProfile = () => {
    const errs = {};
    if (!form.email?.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    return errs;
  };

  const handleUpdate = async () => {
    const errs = validateProfile();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    try {
      setError(''); setSuccess('');
      await putJson('/auth/profile/update/', form);
      setSuccess('Profile updated successfully!');
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const strength = getStrength(pwForm.new_password);

  const validatePassword = () => {
    const errs = {};
    if (!pwForm.old_password) errs.old_password = 'Current password required';
    if (!pwForm.new_password) errs.new_password = 'New password required';
    else if (pwForm.new_password.length < 6) errs.new_password = 'Minimum 6 characters';
    if (pwForm.new_password !== pwForm.new_password_confirm) errs.new_password_confirm = 'Passwords do not match';
    return errs;
  };

  const handlePassword = async () => {
    const errs = validatePassword();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setChangingPw(true);
    try {
      setError(''); setSuccess('');
      await postJson('/auth/change-password/', pwForm);
      setSuccess('Password changed successfully!');
      setPwForm({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (e) { setError(e.message); }
    setChangingPw(false);
  };

  const roleBadge = ROLE_BADGES[profile?.role] || ROLE_BADGES.assistant;
  const initials = getInitials(profile?.username, profile?.first_name, profile?.last_name);

  const Field = ({ label, id, type = 'text', value, onChange, error: fieldError, placeholder }) => (
    <div className="mb-3">
      <label htmlFor={id} className="d-block mb-1" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-premium"
        style={{ borderColor: fieldError ? 'var(--danger)' : undefined }}
      />
      {fieldError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{fieldError}</span>}
    </div>
  );

  return (
    <div className="animate-fade-in dashboard-shell">
      {/* Header */}
      <div className="analysis-header mb-4">
        <div>
          <p className="subtitle">Account</p>
          <h2 className="fs-1">My Profile</h2>
        </div>
      </div>

      {error && <div className="error-box mb-3">{error}</div>}
      {success && (
        <div className="mb-3 px-4 py-3 rounded-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)' }}>
          ✓ {success}
        </div>
      )}

      {/* Identity Card */}
      {profile && (
        <div className="glass-card mb-4 d-flex align-items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', fontWeight: 800, color: 'white',
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="m-0 fw-bold" style={{ fontSize: '1.25rem' }}>
              {profile.first_name || profile.last_name
                ? `${profile.first_name} ${profile.last_name}`.trim()
                : profile.username}
            </h3>
            <p className="m-0 mt-1" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              @{profile.username} · {profile.branch_name || 'All Branches'}
            </p>
            <div className="mt-2">
              <span className="px-3 py-1 rounded-pill fw-bold" style={{ fontSize: '0.72rem', background: roleBadge.bg, color: roleBadge.color }}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Profile Info Card */}
        <div className="col-12 col-lg-6">
          <div className="glass-card h-100">
            <h4 className="fs-5 mb-4 fw-bold">Profile Information</h4>
            <Field label="First Name" id="first_name" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="John" />
            <Field label="Last Name" id="last_name" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Doe" />
            <Field label="Email Address" id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={formErrors.email} placeholder="john@eklavya.edu" />
            <button
              className="btn btn-premium w-100 py-3 mt-2"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Security Card */}
        <div className="col-12 col-lg-6">
          <div className="glass-card h-100">
            <h4 className="fs-5 mb-4 fw-bold">Security</h4>
            <Field label="Current Password" id="old_password" type="password" value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} error={formErrors.old_password} placeholder="••••••••" />
            <Field label="New Password" id="new_password" type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} error={formErrors.new_password} placeholder="••••••••" />

            {/* Strength meter */}
            {pwForm.new_password && (
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Password Strength</span>
                  <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(strength.score / 5) * 100}%`, background: strength.color, transition: 'width 0.3s ease, background 0.3s ease', borderRadius: 3 }} />
                </div>
              </div>
            )}

            <Field label="Confirm New Password" id="confirm_password" type="password" value={pwForm.new_password_confirm} onChange={e => setPwForm(f => ({ ...f, new_password_confirm: e.target.value }))} error={formErrors.new_password_confirm} placeholder="••••••••" />
            <button
              className="btn btn-premium w-100 py-3 mt-2"
              onClick={handlePassword}
              disabled={changingPw}
            >
              {changingPw ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
