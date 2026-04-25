import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, fetchList, postJson, putJson, deleteJson, isAdmin } from '../api';

const emptyStudent = { name: '', parent_name: '', contact_number: '', standard: '', batch_time: '', roll_number: '', branch: '', decided_fee: '0', paid_fee: '0', status: 'active' };

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyStudent);
  const [editId, setEditId] = useState(null);
  const [branches, setBranches] = useState([]);
  const admin = isAdmin();

  const [searchName, setSearchName] = useState('');
  const [searchStandard, setSearchStandard] = useState('');
  const [searchBranch, setSearchBranch] = useState('');

  const loadStudents = React.useCallback(() => {
    const params = new URLSearchParams();
    if (searchName) params.append('name', searchName);
    if (searchStandard) params.append('standard', searchStandard);
    if (searchBranch) params.append('branch', searchBranch);
    fetchList(`/students/?${params.toString()}`).then(setStudents).catch(e => setError(e.message));
  }, [searchName, searchStandard, searchBranch]);

  useEffect(() => {
    fetchList('/branches/').then(setBranches).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadStudents, 300);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  const activeCount = students.filter(s => s.status === 'active').length;
  const totalFee = students.reduce((s, st) => s + Number(st.decided_fee || 0), 0);
  const pendingFee = students.reduce((s, st) => s + Number(st.fee_left || (st.decided_fee - st.paid_fee) || 0), 0);

  const openAdd = () => { setForm({ ...emptyStudent, branch: branches[0]?.id || '' }); setEditId(null); setModal('add'); };
  const openEdit = (s) => { setForm({ ...s, branch: s.branch || s.branch_id || '' }); setEditId(s.id); setModal('edit'); };

  const handleSave = async () => {
    try {
      if (modal === 'add') await postJson('/students/', form);
      else await putJson(`/students/${editId}/`, form);
      setModal(null); loadStudents();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try { await deleteJson(`/students/${id}/`); loadStudents(); } catch (e) { setError(e.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <p className="subtitle">Management</p>
        <h2 className="fs-1">Student Directory</h2>
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4">{error}</div>}

      <div className="dashboard-grid mb-5">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)' }}><span>🎓</span></div>
          <p className="text-muted small fw-bold m-0">Total Students</p>
          <span className="stat-value">{students.length}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><span>✅</span></div>
          <p className="text-muted small fw-bold m-0">Active Now</p>
          <span className="stat-value">{activeCount}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.1)' }}><span>💰</span></div>
          <p className="text-muted small fw-bold m-0">Expected Revenue</p>
          <span className="stat-value">₹{(totalFee / 1000).toFixed(1)}K</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><span>⏳</span></div>
          <p className="text-muted small fw-bold m-0">Pending Fees</p>
          <span className="stat-value">₹{(pendingFee / 1000).toFixed(1)}K</span>
        </div>
      </div>

      <div className="glass-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <h3 className="fs-4 m-0">Student Registry</h3>
          <div className="d-flex gap-2">
            <input 
              placeholder="Search by name..." 
              value={searchName} 
              onChange={e => setSearchName(e.target.value)} 
              className="input-premium py-2"
              style={{ maxWidth: '200px' }}
            />
            {admin && <button className="btn btn-premium btn-sm" onClick={openAdd}>+ Add New</button>}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <input 
            placeholder="Filter by Standard..." 
            value={searchStandard} 
            onChange={e => setSearchStandard(e.target.value)} 
            className="input-premium py-2"
            style={{ maxWidth: '160px' }}
          />
          <select 
            value={searchBranch} 
            onChange={e => setSearchBranch(e.target.value)} 
            className="input-premium py-2"
            style={{ maxWidth: '180px' }}
          >
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="data-grid-container">
          <table className="data-grid-table">
            <thead>
              <tr>
                <th>Name</th><th>Standard</th><th>Branch</th><th>Fee Balance</th><th>Status</th>
                {admin && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr><td colSpan={admin ? 6 : 5} className="text-center py-5 text-muted">No students found matches your criteria.</td></tr>
              )}
              {students.map(s => (
                <tr key={s.id}>
                  <td className="fw-semibold">
                    <Link to={`/app/students/${s.id}`} className="text-decoration-none text-primary">
                      {s.name}
                    </Link>
                  </td>
                  <td><span className="badge bg-light text-dark border">{s.standard}</span></td>
                  <td>{s.branch_name || s.branch}</td>
                  <td><span className={s.fee_left > 0 ? "text-danger fw-bold" : "text-success"}>₹{s.fee_left || (s.decided_fee - s.paid_fee)}</span></td>
                  <td>
                    <span className={`badge rounded-pill px-3 ${s.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                      {s.status}
                    </span>
                  </td>
                  {admin && (
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary rounded-pill me-1" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(s.id)}>Del</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Modal */}
      {modal && (
        <div className="command-palette-overlay" onClick={() => setModal(null)}>
          <div className="glass-card animate-fade-in m-3" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fs-4">{modal === 'add' ? '✨ Add New Student' : '📝 Edit Student Record'}</h3>
              <button className="btn btn-link text-dark text-decoration-none fs-4" onClick={() => setModal(null)}>&times;</button>
            </div>
            
            <div className="row g-3">
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input-premium" placeholder="John Doe" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Standard / Class</label>
                <input value={form.standard} onChange={e => set('standard', e.target.value)} className="input-premium" placeholder="10th" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Roll Number</label>
                <input value={form.roll_number} onChange={e => set('roll_number', e.target.value)} className="input-premium" placeholder="101" />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Parent/Guardian Name</label>
                <input value={form.parent_name} onChange={e => set('parent_name', e.target.value)} className="input-premium" placeholder="Robert Doe" />
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Contact Number</label>
                <input value={form.contact_number} onChange={e => set('contact_number', e.target.value)} className="input-premium" placeholder="+91 9876543210" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Decided Fee (₹)</label>
                <input type="number" value={form.decided_fee} onChange={e => set('decided_fee', e.target.value)} className="input-premium" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Paid Fee (₹)</label>
                <input type="number" value={form.paid_fee} onChange={e => set('paid_fee', e.target.value)} className="input-premium" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Branch</label>
                <select value={form.branch} onChange={e => set('branch', e.target.value)} className="input-premium">
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Current Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input-premium">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-5 d-flex gap-2">
              <button className="btn btn-premium w-100 py-3" onClick={handleSave}>
                {modal === 'add' ? 'Confirm & Create Student' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;
