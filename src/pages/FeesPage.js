import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson, fetchList, postJson, isAdmin } from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import FeeReceipt from '../components/FeeReceipt';
import { exportToExcel, PAYMENT_COLS } from '../utils/export';
import { formatINR } from '../utils/format';

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
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

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

  const load = React.useCallback(() => {
    let query = '?';
    if (filterBranch) query += `branch=${filterBranch}&`;
    if (filterStandard && filterStandard !== 'All Classes') query += `standard=${filterStandard}&`;
    if (filterBatch) query += `batch=${encodeURIComponent(filterBatch)}&`;

    fetchList(`/finance/payments/${query}`)
      .then(data => setPayments(sortPayments(data)))
      .catch(e => setError(e.message));

    fetchJson(`/reports/fees/${query}`)
      .then(setFeesData)
      .catch(() => { });

    fetchList('/students/').then(setStudents).catch(() => { });
    fetchList('/branches/').then(setBranches).catch(() => { });
  }, [filterBranch, filterStandard, filterBatch]);

  useEffect(() => { load(); }, [load]);

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

  const COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--accent)', 'var(--danger)'];

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

  const closeModal = () => {
    setModal(false);
    setForm({ student: '', amount: '', payment_date: '', payment_mode: 'cash', reference: '', notes: '' });
    setStudentSearch('');
    setShowStudentDropdown(false);
    setError('');
  };

  const handleSave = async () => {
    if (!form.student) { setError('Please select a student'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError('Amount must be greater than 0'); return; }
    try {
      await postJson('/finance/payments/', form);
      closeModal();
      load();
    } catch (e) { setError(e.message); }
  };

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [showFilters, setShowFilters] = useState(false);
  const [printPayment, setPrintPayment] = useState(null);

  const renderFilters = () => (
    <div className="filter-pane-inner">
      <div className="d-flex justify-content-between align-items-center mb-4 d-lg-none">
        <h4 className="m-0 fw-bold fs-4">Filters</h4>
        <button className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: '40px', height: '40px', fontSize: '1.25rem' }} 
                onClick={() => setShowFilters(false)}>
          &times;
        </button>
      </div>
      <h4 className="fs-6 m-0 d-none d-lg-block mb-3">Slicers & Filters</h4>

      <div className="filter-group mb-3">
        <label className="filter-label">Branch</label>
        <select className="input-premium py-2" value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setFilterBatch(''); }}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="filter-group mb-3">
        <label className="filter-label">Class / Standard</label>
        <select className="input-premium py-2" value={filterStandard} onChange={e => setFilterStandard(e.target.value)}>
          {standards.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {batchOptions.length > 0 && (
        <div className="filter-group mb-3">
          <label className="filter-label">Batch Time</label>
          <select className="input-premium py-2" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
            <option value="">All Batches</option>
            {batchOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

      <div className="mt-3">
        <label className="filter-label">Search</label>
        <input
          type="text"
          className="input-premium py-2"
          placeholder="🔍 Student name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in dashboard-shell">
      <div className="analysis-header">
        <div>
          <p className="subtitle">Finance Analysis</p>
          <h2 className="fs-1">Revenue Dashboard</h2>
        </div>
        <div className="mobile-action-bar d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary d-lg-none rounded-pill px-4" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? '✕ Close Filters' : '🔍 Filter Data'}
          </button>
          <button
            className="btn rounded-pill px-4"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}
            onClick={() => exportToExcel(filteredPayments, PAYMENT_COLS, 'fee_payments')}
          >
            ⬇ Export
          </button>
          {admin && (
            <button className="btn btn-premium pulse-primary" onClick={() => setModal(true)}>
              + Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Mobile Collapsible Filters */}
      {showFilters && (
        <div className="col-12 d-lg-none animate-fade-in mb-3">
          <div className="glass-card">
            {renderFilters()}
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Sidebar Filters */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="filter-pane sticky-top" style={{ top: '1rem' }}>
            {renderFilters()}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-12 col-lg-9">
          <div className="dashboard-grid mb-4">
            <div className="glass-card stat-card hover-lift">
              <p className="filter-label m-0">Total Collected</p>
              <h3 className="stat-value text-success">{formatINR(collected)}</h3>
              <div className="small text-muted mt-2">Total received</div>
            </div>
            <div className="glass-card stat-card hover-lift">
              <p className="filter-label m-0">Expected</p>
              <h3 className="stat-value">{formatINR(expected)}</h3>
              <div className="progress mt-3" style={{ height: '6px' }}>
                <div className="progress-bar bg-primary" style={{ width: `${collectionEfficiency}%` }}></div>
              </div>
            </div>
            <div className="glass-card stat-card hover-lift">
              <p className="filter-label m-0">Efficiency</p>
              <h3 className="stat-value">{collectionEfficiency}%</h3>
              <p className="small text-muted mt-2">Target: 95%</p>
            </div>
            <div className="glass-card stat-card hover-lift">
              <p className="filter-label m-0">Pending</p>
              <h3 className="stat-value text-danger">{formatINR(pending)}</h3>
              <div className="small text-muted mt-2">{payments.length} transactions</div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12 col-xl-8">
              <div className="glass-card" style={{ height: '400px' }}>
                <h3 className="fs-5 mb-4">Revenue Collection Timeline</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={v => `₹${v / 1000}K`} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-4">
              <div className="glass-card" style={{ height: '400px' }}>
                <h3 className="fs-5 mb-4">Payment Modes</h3>
                <div style={{ width: '100%', height: '260px' }}>
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie data={modeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {modeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        formatter={(value, entry) => (
                          <span style={{ color: 'var(--text)', fontSize: '0.78rem', fontWeight: '500' }}>
                            {value}: <span style={{ color: entry.color, fontWeight: '700', marginLeft: '4px' }}>{entry.payload.percent}%</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '6px' }}>({formatINR(entry.payload.value)})</span>
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="fs-4 mb-4">Transaction Ledger</h3>
            <div className="data-grid-container">
              <table className="data-grid-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Branch &amp; Batch</th>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>Amount</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p.id}>
                      <td data-label="Student">
                        <Link to={`/app/students/${p.student}`} className="text-decoration-none fw-semibold">
                          {p.student_name || p.student}
                        </Link>
                        <div className="small text-muted">{p.student_standard}</div>
                      </td>
                      <td data-label="Branch">
                        <div className="small fw-medium">{p.student_branch_name}</div>
                        <div className="small text-muted">{p.student_batch_time}</div>
                      </td>
                      <td data-label="Date"><span className="small">{p.payment_date}</span></td>
                      <td data-label="Mode">
                        <span className={`badge rounded-pill px-3 py-1 ${p.payment_mode === "cash" ? "bg-success-subtle text-success" : "bg-primary-subtle text-primary"}`}>
                          {p.payment_mode.toUpperCase()}
                        </span>
                      </td>
                      <td className="fw-bold text-primary">{formatINR(p.amount)}</td>
                      <td>
                        <button
                          className="btn btn-sm rounded-pill px-3"
                          style={{ border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.72rem" }}
                          onClick={() => { 
                            setPrintPayment(p); 
                            setTimeout(() => {
                              window.print();
                              setPrintPayment(null);
                            }, 150); 
                          }}
                          title="Print receipt"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>



      {modal && (
        <div className="command-palette-overlay" onClick={closeModal}>
          <div className="glass-card animate-fade-in m-3" style={{ maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fs-4">💸 Record New Payment</h3>
              <button className="btn btn-link text-dark text-decoration-none fs-4" onClick={closeModal}>&times;</button>
            </div>
            
            {error && <div className="alert alert-danger mb-3 py-2 small">{error}</div>}

            <div className="row g-3">
              <div className="col-12" style={{ position: 'relative' }}>
                <label className="small fw-bold text-muted mb-1">Select Student</label>
                {form.student ? (
                  <div className="input-premium d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }}
                    onClick={() => { updateField('student', ''); setStudentSearch(''); setShowStudentDropdown(true); }}>
                    <span className="fw-semibold">{(() => { const s = students.find(s => String(s.id) === String(form.student)); return s ? `${s.name} (${s.standard})` : 'Selected'; })()}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✕ Change</span>
                  </div>
                ) : (
                  <input
                    className="input-premium"
                    placeholder="🔍 Type to search students..."
                    value={studentSearch}
                    onChange={e => { setStudentSearch(e.target.value); setShowStudentDropdown(true); }}
                    onFocus={() => setShowStudentDropdown(true)}
                    autoComplete="off"
                  />
                )}
                {showStudentDropdown && !form.student && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '0.75rem', maxHeight: '200px', overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', marginTop: '4px'
                  }}>
                    {students
                      .filter(s => {
                        const q = studentSearch.toLowerCase();
                        return !q || (s.name && s.name.toLowerCase().includes(q)) || (s.standard && s.standard.toLowerCase().includes(q)) || (s.branch_name && s.branch_name.toLowerCase().includes(q));
                      })
                      .slice(0, 30)
                      .map(s => (
                        <div key={s.id}
                          className="px-3 py-2"
                          style={{ cursor: 'pointer', fontSize: '0.88rem', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-soft)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => { updateField('student', s.id); setStudentSearch(s.name); setShowStudentDropdown(false); }}
                        >
                          <span className="fw-semibold">{s.name}</span>
                          <span className="ms-2 text-muted" style={{ fontSize: '0.76rem' }}>{s.standard} {s.branch_name ? `· ${s.branch_name}` : ''}</span>
                        </div>
                      ))}
                    {students.filter(s => { const q = studentSearch.toLowerCase(); return !q || (s.name && s.name.toLowerCase().includes(q)) || (s.standard && s.standard.toLowerCase().includes(q)); }).length === 0 && (
                      <div className="px-3 py-3 text-center text-muted" style={{ fontSize: '0.85rem' }}>No students found</div>
                    )}
                  </div>
                )}
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

      {/* Fee Receipt */}
      <FeeReceipt payment={printPayment} student={students.find(s => s.id === printPayment?.student)} />
    </div>
  );
}

export default FeesPage;
