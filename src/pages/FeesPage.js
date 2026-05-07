import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, fetchList, postJson, isAdmin } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import FeeReceipt from '../components/FeeReceipt';
import { exportToExcel, PAYMENT_COLS } from '../utils/export';
import { formatCurrency, formatINR } from '../utils/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-2 rounded shadow-lg border-0" style={{ background: 'var(--surface)', minWidth: '120px' }}>
        <p className="small fw-bold mb-1 text-muted">{label || payload[0].name}</p>
        <p className="fs-5 fw-bold m-0 text-primary">{formatINR(payload[0].value)}</p>
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
  const [showFilters, setShowFilters] = useState(false);
  const [printPayment, setPrintPayment] = useState(null);
  
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

  const sortPayments = (items) => [...items].sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

  const load = () => {
    let query = '?';
    if (filterBranch) query += `branch=${filterBranch}&`;
    if (filterStandard && filterStandard !== 'All Classes') query += `standard=${filterStandard}&`;
    if (filterBatch) query += `batch=${encodeURIComponent(filterBatch)}&`;
    
    fetchList(`/finance/payments/${query}`)
      .then(data => setPayments(sortPayments(data)))
      .catch(e => setError(e.message));
    fetchJson(`/reports/fees/${query}`).then(setFeesData).catch(() => {});
    fetchList('/students/').then(setStudents).catch(() => {});
    fetchList('/branches/').then(setBranches).catch(() => {});
  };

  useEffect(() => { load(); }, [filterBranch, filterStandard, filterBatch]);

  const collected = feesData ? Number(feesData.total_collected_revenue || 0) : 0;
  const expected = feesData ? Number(feesData.total_expected_revenue || 0) : 0;
  const pending = feesData ? Number(feesData.pending_revenue || 0) : 0;
  const collectionEfficiency = expected > 0 ? Math.round((collected / expected) * 100) : 0;

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
    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    return Object.keys(grouped).map(mode => ({
      name: mode.charAt(0).toUpperCase() + mode.slice(1),
      value: grouped[mode],
      percent: total > 0 ? ((grouped[mode] / total) * 100).toFixed(1) : 0
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
    if (!form.student) { setError('Please select a student'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError('Amount must be greater than 0'); return; }
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
      <div className="mobile-page-header d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div>
          <p className="subtitle">Finance</p>
          <h2>Revenue</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="d-lg-none btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.78rem' }} onClick={() => setShowFilters(true)}>
            🔍 Filters
          </button>
          <button className="btn btn-sm rounded-pill px-3 d-none d-lg-inline-flex" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.78rem' }} onClick={() => exportToExcel(filteredPayments, PAYMENT_COLS, 'fee_payments')}>
            ⬇ Export
          </button>
          {admin && <button className="btn btn-premium d-none d-lg-inline-flex" onClick={() => setModal(true)}>+ Record</button>}
        </div>
      </div>

      {error && <div className="error-box mb-3">{error}</div>}

      {/* KPI Strip */}
      <div className="kpi-scroll-strip mb-3">
        <div className="glass-card stat-card">
          <p className="filter-label m-0">Collected</p>
          <h3 className="stat-value text-success">{formatINR(collected)}</h3>
        </div>
        <div className="glass-card stat-card">
          <p className="filter-label m-0">Expected</p>
          <h3 className="stat-value">{formatINR(expected)}</h3>
          <div className="progress mt-2" style={{ height: '4px' }}>
            <div className="progress-bar bg-primary" style={{ width: `${collectionEfficiency}%` }}></div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <p className="filter-label m-0">Efficiency</p>
          <h3 className="stat-value">{collectionEfficiency}%</h3>
        </div>
        <div className="glass-card stat-card">
          <p className="filter-label m-0">Pending</p>
          <h3 className="stat-value text-danger">{formatINR(pending)}</h3>
        </div>
      </div>

      <div className="row g-3">
        {/* Desktop Sidebar Filters */}
        <div className="col-12 col-lg-3 d-none d-lg-block">
          <div className="filter-pane" style={{ position: 'sticky', top: '1rem' }}>
            <h4 className="fs-6 m-0">Filters</h4>
            <div className="filter-group">
              <label className="filter-label">Branch</label>
              <select className="input-premium py-2" value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setFilterBatch(''); }}>
                <option value="">All Branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Standard</label>
              <select className="input-premium py-2" value={filterStandard} onChange={e => setFilterStandard(e.target.value)}>
                {standards.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {batchOptions.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Batch</label>
                <select className="input-premium py-2" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                  <option value="">All Batches</option>
                  {batchOptions.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}
            <input type="text" className="input-premium py-2" placeholder="🔍 Search…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Main Content */}
        <div className="col-12 col-lg-9">
          {/* Charts row */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-xl-8">
              <div className="glass-card" style={{ minHeight: '280px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }} className="mb-3">Revenue Timeline</h3>
                <div style={{ width: '100%', height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={v => `₹${v/1000}K`} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-4">
              <div className="glass-card" style={{ minHeight: '280px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }} className="mb-3">Payment Modes</h3>
                <div style={{ width: '100%', height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={modeData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {modeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" align="center" iconType="circle" 
                        formatter={(value, entry) => (
                          <span style={{ color: 'var(--text)', fontSize: '0.72rem', fontWeight: '500' }}>
                            {value} <span style={{ color: entry.color, fontWeight: '700' }}>{entry.payload.percent}%</span>
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="d-lg-none mobile-search-bar mb-2">
            <input placeholder="Search transactions…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          {/* Transaction list — Desktop table */}
          <div className="glass-card d-none d-md-block">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }} className="mb-3">Transactions</h3>
            <div className="data-grid-container">
              <table className="data-grid-table">
                <thead>
                  <tr>
                    <th>Student</th><th>Branch</th><th>Date</th><th>Mode</th><th>Amount</th><th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p.id}>
                      <td data-label="Student">
                        <Link to={`/app/students/${p.student}`} className="text-decoration-none fw-semibold">{p.student_name || p.student}</Link>
                        <div className="small text-muted">{p.student_standard}</div>
                      </td>
                      <td data-label="Branch">
                        <div className="small fw-medium">{p.student_branch_name}</div>
                        <div className="small text-muted">{p.student_batch_time}</div>
                      </td>
                      <td data-label="Date"><span className="small">{p.payment_date}</span></td>
                      <td data-label="Mode">
                        <span className={`badge-mode ${p.payment_mode}`}>{p.payment_mode.toUpperCase()}</span>
                      </td>
                      <td className="fw-bold text-primary">{formatINR(p.amount)}</td>
                      <td>
                        <button className="btn btn-sm rounded-pill px-3" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.72rem' }}
                          onClick={() => { setPrintPayment(p); setTimeout(() => window.print(), 100); }}>Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction list — Mobile cards */}
          <div className="d-md-none">
            <h3 className="mobile-section-title">Transactions</h3>
            {filteredPayments.length === 0 && (
              <div className="text-center py-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No transactions found.</div>
            )}
            {filteredPayments.map(p => (
              <Link key={p.id} to={`/app/students/${p.student}`} className="txn-card text-decoration-none">
                <div className="txn-card-left">
                  <div className="txn-name">{p.student_name || p.student}</div>
                  <div className="txn-meta">{p.student_standard} · {p.payment_date}</div>
                </div>
                <div className="txn-card-right">
                  <div className="txn-amount">{formatINR(p.amount)}</div>
                  <span className={`badge-mode ${p.payment_mode}`}>{p.payment_mode}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FAB for mobile */}
      {admin && <button className="fab d-lg-none" onClick={() => setModal(true)}>+</button>}

      {/* Filter Bottom Sheet (mobile) */}
      {showFilters && (
        <>
          <div className="mobile-sheet-overlay" onClick={() => setShowFilters(false)} />
          <div className="mobile-sheet">
            <div className="mobile-sheet-handle" />
            <div className="mobile-sheet-header">
              <h3>Filters</h3>
              <button className="mobile-sheet-close" onClick={() => setShowFilters(false)}>✕</button>
            </div>
            <div className="mobile-sheet-body">
              <div className="filter-group mb-3">
                <label className="filter-label">Branch</label>
                <select className="input-premium py-2" value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setFilterBatch(''); }}>
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="filter-group mb-3">
                <label className="filter-label">Standard</label>
                <select className="input-premium py-2" value={filterStandard} onChange={e => setFilterStandard(e.target.value)}>
                  {standards.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {batchOptions.length > 0 && (
                <div className="filter-group mb-3">
                  <label className="filter-label">Batch</label>
                  <select className="input-premium py-2" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                    <option value="">All Batches</option>
                    {batchOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="mobile-sheet-footer">
              <button className="btn btn-premium w-100 py-3" onClick={() => setShowFilters(false)}>Apply Filters</button>
            </div>
          </div>
        </>
      )}

      {/* Record Payment Bottom Sheet */}
      {modal && (
        <>
          <div className="mobile-sheet-overlay" onClick={() => setModal(false)} />
          <div className="mobile-sheet">
            <div className="mobile-sheet-handle" />
            <div className="mobile-sheet-header">
              <h3>💸 Record Payment</h3>
              <button className="mobile-sheet-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="mobile-sheet-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="small fw-bold text-muted mb-1">Select Student</label>
                  <select className="input-premium" value={form.student} onChange={e => updateField('student', e.target.value)}>
                    <option value="">Choose Student…</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.standard})</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="small fw-bold text-muted mb-1">Amount (₹)</label>
                  <input type="number" className="input-premium" value={form.amount} onChange={e => updateField('amount', e.target.value)} placeholder="0.00" />
                </div>
                <div className="col-6">
                  <label className="small fw-bold text-muted mb-1">Date</label>
                  <input type="date" className="input-premium" value={form.payment_date} onChange={e => updateField('payment_date', e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="small fw-bold text-muted mb-1">Mode</label>
                  <select className="input-premium" value={form.payment_mode} onChange={e => updateField('payment_mode', e.target.value)}>
                    {paymentModeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="small fw-bold text-muted mb-1">Reference</label>
                  <input className="input-premium" value={form.reference} onChange={e => updateField('reference', e.target.value)} placeholder="UPI ID / Cheque No." />
                </div>
              </div>
            </div>
            <div className="mobile-sheet-footer">
              <button className="btn btn-premium w-100 py-3" onClick={handleSave}>Confirm Payment</button>
            </div>
          </div>
        </>
      )}

      <FeeReceipt payment={printPayment} student={students.find(s => s.id === printPayment?.student)} />
    </div>
  );
}

export default FeesPage;
