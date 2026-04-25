import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

function ReportsPage() {
  const [fees, setFees] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJson('/reports/fees/').then(setFees).catch(e => setError(e.message));
  }, []);

  const expected = fees ? Number(fees.total_expected_revenue || 0) : 0;
  const collected = fees ? Number(fees.total_collected_revenue || 0) : 0;
  const pending = fees ? Number(fees.pending_revenue || 0) : 0;
  const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0;

  const fmt = (n) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  };

  return (
    <div className="animate-fade-in dashboard-shell">
      <div className="analysis-header">
        <div>
          <p className="subtitle">Financial Integrity</p>
          <h2 className="fs-1">Fee Reports</h2>
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4">{error}</div>}

      <div className="dashboard-grid">
        <div className="glass-card stat-card hover-lift">
          <p className="filter-label m-0">Expected Revenue</p>
          <h3 className="stat-value">{fmt(expected)}</h3>
          <div className="small text-muted mt-2">Target for current session</div>
        </div>
        <div className="glass-card stat-card hover-lift">
          <p className="filter-label m-0">Collected</p>
          <h3 className="stat-value text-success">{fmt(collected)}</h3>
          <div className="progress mt-3" style={{ height: '6px' }}>
            <div className="progress-bar bg-success" style={{ width: `${rate}%` }}></div>
          </div>
        </div>
        <div className="glass-card stat-card hover-lift">
          <p className="filter-label m-0">Pending</p>
          <h3 className="stat-value text-danger">{fmt(pending)}</h3>
          <p className="small text-muted mt-2">Requires immediate attention</p>
        </div>
        <div className="glass-card stat-card hover-lift">
          <p className="filter-label m-0">Collection Rate</p>
          <h3 className="stat-value">{rate}%</h3>
          <div className="small text-muted mt-2">Efficiency index</div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-12 col-lg-6">
          <div className="glass-card">
            <h3 className="fs-5 mb-4">Collection Progress</h3>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold">Total Collection Progress</span>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3">{rate}%</span>
            </div>
            <div className="progress rounded-pill mb-3" style={{ height: '12px' }}>
              <div className="progress-bar" style={{ width: `${rate}%`, background: 'var(--primary-gradient)' }}></div>
            </div>
            <p className="text-muted small m-0">
              You have collected <strong>{fmt(collected)}</strong> out of a total expected <strong>{fmt(expected)}</strong>.
            </p>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="glass-card">
            <h3 className="fs-5 mb-4">Detailed Breakdown</h3>
            <div className="list-group list-group-flush">
              <div className="list-group-item bg-transparent d-flex justify-content-between px-0 py-3 border-light">
                <span className="text-muted">Expected Revenue</span>
                <span className="fw-bold">{fmt(expected)}</span>
              </div>
              <div className="list-group-item bg-transparent d-flex justify-content-between px-0 py-3 border-light">
                <span className="text-muted">Total Collected</span>
                <span className="fw-bold text-success">{fmt(collected)}</span>
              </div>
              <div className="list-group-item bg-transparent d-flex justify-content-between px-0 py-3 border-light">
                <span className="text-muted">Total Pending</span>
                <span className="fw-bold text-danger">{fmt(pending)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
