import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, postJson, isAdmin } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-2 rounded shadow-lg border-0" style={{ background: 'var(--surface)', minWidth: '120px' }}>
        <p className="small fw-bold mb-1 text-muted">{label || payload[0].name}</p>
        <p className="fs-5 fw-bold m-0 text-primary">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function FeesPage() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [feesData, setFeesData] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ student: '', amount: '', payment_date: '', payment_mode: 'cash', reference: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const [branches, setBranches] = useState([]);
  const [filterBranch, setFilterBranch] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterStandard, setFilterStandard] = useState('');
  
  const standards = ['All Classes', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const admin = isAdmin();

  const batchOptions = useMemo(() => {
    const selectedStudents = students.filter(s => {
      const branchMatch = !filterBranch || String(s.branch) === String(filterBranch);
      const standardMatch = !filterStandard || filterStandard === 'All Classes' || s.standard === filterStandard;
      return branchMatch && standardMatch;
    });

    return Array.from(new Set(selectedStudents.map(s => s.batch_time).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [students, filterBranch, filterStandard]);

  const paymentModeOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'other', label: 'Other' },
  ];

  const sortPayments = (items) => {
    return [...items].sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  };

  const load = () => {
    let query = '?';
    if (filterBranch) query += `branch=${filterBranch}&`;
    if (filterStandard && filterStandard !== 'All Classes') query += `standard=${filterStandard}&`;
    if (filterBatch) query += `batch=${encodeURIComponent(filterBatch)}&`;
    
    fetchJson(`/finance/payments/${query}`)
      .then(data => setPayments(sortPayments(data)))
      .catch(e => setError(e.message));

    fetchJson(`/reports/fees/${query}`)
      .then(setFeesData)
      .catch(() => {});

    fetchJson('/students/').then(setStudents).catch(() => {});
    fetchJson('/branches/').then(setBranches).catch(() => {});
  };

  useEffect(() => { load(); }, [filterBranch, filterStandard, filterBatch]);

  const collected = feesData ? Number(feesData.total_collected_revenue || 0) : 0;
  const expected = feesData ? Number(feesData.total_expected_revenue || 0) : 0;
  const pending = feesData ? Number(feesData.pending_revenue || 0) : 0;

  const timelineData = useMemo(() => {
    const grouped = payments.reduce((acc, p) => {
      const date = p.payment_date;
      acc[date] = (acc[date] || 0) + Number(p.amount);
      return acc;
    }, {});
    return Object.keys(grouped).sort().map(date => ({ date, amount: grouped[date] }));
  }, [payments]);

  const modeData = useMemo(() => {
    const grouped = payments.reduce((acc, p) => {
      const mode = p.payment_mode || 'other';
      acc[mode] = (acc[mode] || 0) + Number(p.amount);
      return acc;
    }, {});
    return Object.keys(grouped).map(mode => ({
      name: mode.charAt(0).toUpperCase() + mode.slice(1),
      value: grouped[mode]
    }));
  }, [payments]);
  
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  const filteredPayments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return payments.filter(p => 
      (p.student_name && p.student_name.toLowerCase().includes(q)) || 
      (p.reference && p.reference.toLowerCase().includes(q)) ||
      (p.payment_mode && p.payment_mode.toLowerCase().includes(q)) ||
      (p.student_branch_name && p.student_branch_name.toLowerCase().includes(q)) ||
      (p.student_standard && p.student_standard.toLowerCase().includes(q)) ||
      (p.student_batch_time && p.student_batch_time.toLowerCase().includes(q))
    );
  }, [payments, searchQuery]);

  const handleSave = async () => {
    try {
      await postJson('/finance/payments/', form);
      setModal(false);
      setError('');
      load();
    } catch (e) { setError(e.message); }
  };

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in">
      <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <p className="subtitle">Finance</p>
          <h2 className="fs-1">Revenue Dashboard</h2>
        </div>
        <div className="d-flex gap-2">
          <select className="input-premium py-2 w-auto" value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setFilterBatch(''); }}>
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="input-premium py-2 w-auto" value={filterStandard} onChange={e => setFilterStandard(e.target.value)}>
            {standards.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><span>💰</span></div>
          <p className="text-muted small fw-bold m-0">Total Collected</p>
          <span className="stat-value text-success">₹{(collected / 1000).toFixed(1)}K</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)' }}><span>📈</span></div>
          <p className="text-muted small fw-bold m-0">Expected Revenue</p>
          <span className="stat-value">₹{(expected / 1000).toFixed(1)}K</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.1)' }}><span>⏳</span></div>
          <p className="text-muted small fw-bold m-0">Pending Amount</p>
          <span className="stat-value text-danger">₹{(pending / 1000).toFixed(1)}K</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><span>📊</span></div>
          <p className="text-muted small fw-bold m-0">Collection Efficiency</p>
          <span className="stat-value">{expected > 0 ? Math.round((collected / expected) * 100) : 0}%</span>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-8">
          <div className="glass-card" style={{ height: '400px' }}>
            <h3 className="fs-5 mb-4">Revenue Collection Timeline</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={v => `₹${v/1000}K`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="glass-card" style={{ height: '400px' }}>
            <h3 className="fs-5 mb-4">Payment Distribution</h3>
            <div style={{ width: '100%', height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={modeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {modeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <h3 className="fs-4 m-0">Recent Transactions</h3>
          <div className="d-flex gap-2">
            <input 
              type="text" 
              className="input-premium py-2" 
              placeholder="🔍 Search records..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ maxWidth: '240px' }}
            />
            {admin && (
              <button className="btn btn-premium btn-sm" onClick={() => setModal(true)}>
                + Record Payment
              </button>
            )}
          </div>
        </div>

        <div className="data-grid-container">
          <table className="data-grid-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Branch & Batch</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Reference</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/app/students/${p.student}`} className="text-decoration-none fw-semibold">
                      {p.student_name || p.student}
                    </Link>
                    <div className="small text-muted">{p.student_standard}</div>
                  </td>
                  <td>
                    <div className="small fw-medium">{p.student_branch_name}</div>
                    <div className="small text-muted">{p.student_batch_time}</div>
                  </td>
                  <td><span className="small">{p.payment_date}</span></td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 ${p.payment_mode === 'cash' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`}>
                      {p.payment_mode.toUpperCase()}
                    </span>
                  </td>
                  <td className="small text-muted">{p.reference || '-'}</td>
                  <td className="text-end fw-bold">₹{Number(p.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="command-palette-overlay" onClick={() => setModal(false)}>
          <div className="glass-card animate-fade-in m-3" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fs-4">💸 Record New Payment</h3>
              <button className="btn btn-link text-dark text-decoration-none fs-4" onClick={() => setModal(false)}>&times;</button>
            </div>
            
            <div className="row g-3">
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Select Student</label>
                <select className="input-premium" value={form.student} onChange={e => updateField('student', e.target.value)}>
                  <option value="">Choose Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.standard})</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Amount Paid (₹)</label>
                <input type="number" className="input-premium" value={form.amount} onChange={e => updateField('amount', e.target.value)} placeholder="0.00" />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Date</label>
                <input type="date" className="input-premium" value={form.payment_date} onChange={e => updateField('payment_date', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">Mode</label>
                <select className="input-premium" value={form.payment_mode} onChange={e => updateField('payment_mode', e.target.value)}>
                  {paymentModeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">Reference (Optional)</label>
                <input className="input-premium" value={form.reference} onChange={e => updateField('reference', e.target.value)} placeholder="UPI ID / Cheque No." />
              </div>
            </div>

            <button className="btn btn-premium w-100 py-3 mt-4" onClick={handleSave}>Confirm Payment</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeesPage;
