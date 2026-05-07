import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Badge } from 'react-bootstrap';
import { formatINR } from '../utils/format';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [fees, setFees] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, r, f] = await Promise.all([
          fetchJson('/dashboard/stats/'),
          fetchJson('/dashboard/test-reminders/').catch(() => ({ reminders: [] })),
          fetchJson('/reports/fees/').catch(() => null),
        ]);
        setStats(s);
        setReminders(r.reminders || []);
        setFees(f);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  const collected = fees ? Number(fees.total_collected_revenue || 0) : 0;
  const expected = fees ? Number(fees.total_expected_revenue || 0) : 0;
  const pending = fees ? Number(fees.pending_revenue || 0) : 0;
  const collectionRate = expected > 0 ? Math.round((collected / expected) * 100) : 0;

  const fmt = (n) => formatINR(n);

  const trendData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 700 },
  ];

  const pieData = [
    { name: 'Collected', value: collected },
    { name: 'Pending', value: pending },
  ];
  const COLORS = ['#6366f1', '#e2e8f0'];

  const kpis = [
    { label: 'Students', value: stats?.total_students ?? '—', icon: '🎓', trend: '+12%', color: 'var(--primary-soft)', trendUp: true },
    { label: 'Teachers', value: stats?.total_teachers ?? '—', icon: '👩‍🏫', trend: 'Active', color: 'rgba(16, 185, 129, 0.1)', trendUp: true },
    { label: 'Branches', value: stats?.total_branches ?? '—', icon: '🏢', trend: 'Stable', color: 'rgba(245, 158, 11, 0.1)', trendUp: true },
    { label: 'Collected', value: fmt(collected), icon: '💰', trend: `${collectionRate}%`, color: 'rgba(244, 63, 94, 0.1)', trendUp: collectionRate >= 80 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header mb-3">
        <p className="subtitle">Overview</p>
        <h2>Dashboard</h2>
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4">{error}</div>}

      {/* KPI — Horizontal scroll on mobile, grid on desktop */}
      <div className="kpi-scroll-strip">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-card stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="stat-icon-wrapper" style={{ background: kpi.color, width: 32, height: 32, marginBottom: 0, fontSize: '1rem' }}>
                <span>{kpi.icon}</span>
              </div>
              <span className={`stat-trend ${kpi.trendUp ? 'trend-up' : 'trend-down'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {kpi.trend}
              </span>
            </div>
            <p className="m-0" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{kpi.label}</p>
            <h3 className="stat-value m-0">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row mt-3 g-3">
        <div className="col-12 col-xl-8">
          <div className="glass-card" style={{ minHeight: '280px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Revenue Trend</h3>
              <select className="form-select form-select-sm w-auto border-0 bg-light rounded-pill" style={{ fontSize: '0.75rem' }}>
                <option>7 Days</option>
                <option>30 Days</option>
              </select>
            </div>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="glass-card" style={{ minHeight: '280px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }} className="mb-3">Collection Rate</h3>
            <div className="d-flex flex-column align-items-center justify-content-center">
              <div style={{ width: '100%', height: '160px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{collectionRate}%</span>
                  <p className="small text-muted m-0" style={{ fontSize: '0.7rem' }}>Collected</p>
                </div>
              </div>
              <div className="w-100 mt-3">
                <div className="d-flex justify-content-between small mb-1" style={{ fontSize: '0.78rem' }}>
                  <span>Collected</span>
                  <span className="fw-bold">{fmt(collected)}</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '6px' }}>
                  <div className="progress-bar" style={{ width: `${collectionRate}%`, background: 'var(--primary-gradient)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tests */}
      <div className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="mobile-section-title m-0">Upcoming Tests</h3>
          <button className="btn btn-premium btn-sm" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}>Calendar</button>
        </div>
        
        {reminders.length ? reminders.map((item) => (
          <div key={item.id} className="mobile-list-card d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div style={{ fontSize: '1.5rem' }}>📝</div>
              <div>
                <p className="m-0 fw-bold" style={{ fontSize: '0.9rem' }}>{item.title}</p>
                <p className="m-0" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.standard} · {item.test_date}</p>
              </div>
            </div>
            <Badge bg="primary" pill className="px-2 py-1" style={{ fontSize: '0.65rem' }}>{item.reminder_days_before}d</Badge>
          </div>
        )) : (
          <div className="glass-card text-center py-4">
            <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>No upcoming tests this week.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
