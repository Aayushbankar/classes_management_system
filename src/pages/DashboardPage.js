import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  // Mini sparkline data for KPI cards (derived from real stats when available)
  const sparkData = [
    { name: 'M', value: 30 },
    { name: 'T', value: 45 },
    { name: 'W', value: 35 },
    { name: 'T', value: 60 },
    { name: 'F', value: 50 },
    { name: 'S', value: 75 },
    { name: 'S', value: 65 },
  ];

  const pieData = [
    { name: 'Collected', value: collected },
    { name: 'Pending', value: pending },
  ];
  const COLORS = ['var(--primary)', 'var(--border)'];

  const kpis = [
    { label: 'Total Students', value: stats?.total_students ?? '—', icon: '🎓', trend: 'Enrolled', color: 'var(--primary-soft)', trendUp: true },
    { label: 'Total Teachers', value: stats?.total_teachers ?? '—', icon: '👩‍🏫', trend: 'Active', color: 'rgba(16, 185, 129, 0.1)', trendUp: true },
    { label: 'Active Branches', value: stats?.total_branches ?? '—', icon: '🏢', trend: 'Operational', color: 'rgba(245, 158, 11, 0.1)', trendUp: true },
    { label: 'Revenue Collected', value: fmt(collected), icon: '💰', trend: `${collectionRate}% collected`, color: 'rgba(244, 63, 94, 0.1)', trendUp: collectionRate >= 50 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-3">
        <p className="subtitle">Overview</p>
        <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)' }}>Analytics Dashboard</h2>
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4">{error}</div>}

      <div className="dashboard-grid">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-card stat-card hover-lift">
            <div className="d-flex justify-content-between align-items-start">
              <div className="stat-icon-wrapper" style={{ background: kpi.color, marginBottom: 0 }}>
                <span>{kpi.icon}</span>
              </div>
              <div className={`stat-trend ${kpi.trendUp ? 'trend-up' : 'trend-down'} small fw-bold`}>
                {kpi.trend}
              </div>
            </div>
            <div className="mt-3">
              <p className="small fw-bold m-0" style={{ letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{kpi.label}</p>
              <h3 className="stat-value m-0">{kpi.value}</h3>
            </div>
            <div style={{ width: '100%', height: '40px', marginTop: '1rem', overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={idx % 2 === 0 ? 'var(--primary)' : 'var(--success)'}
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill={idx % 2 === 0 ? 'var(--primary)' : 'var(--success)'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        ))}
      </div>

      <div className="row mt-4 g-4">
        <div className="col-12 col-xl-8">
          <div className="glass-card" style={{ height: 'clamp(280px, 40vw, 400px)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-5">Weekly Revenue Trend</h3>

            </div>
            <div style={{ width: '100%', height: 'calc(100% - 60px)', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      boxShadow: 'var(--shadow-md)',
                      color: 'var(--text)'
                    }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="glass-card" style={{ height: 'clamp(280px, 40vw, 400px)' }}>
            <h3 className="fs-5 mb-3">Collection Rate</h3>
            <div className="d-flex flex-column align-items-center justify-content-center h-75">
              <div style={{ width: '100%', height: '200px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                      data={pieData}
                      innerRadius="60%"
                      outerRadius="80%"
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
                  <span className="fs-2 fw-bold">{collectionRate}%</span>
                  <p className="small text-muted m-0">Collected</p>
                </div>
              </div>
              <div className="w-100 mt-4">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Collected</span>
                  <span className="fw-bold">{fmt(collected)}</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '8px' }}>
                  <div className="progress-bar" style={{ width: `${collectionRate}%`, background: 'var(--primary-gradient)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-header">
          <div>
            <h3 className="fs-4">Upcoming Tests</h3>
            <p className="text-muted small">Academic schedule for next 7 days</p>
          </div>
          <Link to="/app/timetable" className="btn btn-premium btn-sm">View Calendar</Link>
        </div>

        <div className="row g-3">
          {reminders.length ? reminders.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <div className="list-item">
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-3">📝</div>
                  <div>
                    <p className="m-0 fw-bold">{item.title}</p>
                    <p className="m-0 small text-muted">{item.standard} &bull; {item.test_date}</p>
                  </div>
                </div>
                <Badge bg="primary" pill className="px-3 py-2">{item.reminder_days_before}d</Badge>
              </div>
            </div>
          )) : (
            <div className="col-12">
              <div className="glass-card text-center py-5">
                <p className="text-muted">No upcoming tests in the next week.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
