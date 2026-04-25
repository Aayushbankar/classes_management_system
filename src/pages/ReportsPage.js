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
    <div className="page-panel">
      <div className="dashboard-header">
        <p className="subtitle">Finance</p>
        <h2>Fee Reports</h2>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="card-grid">
        <div className="stat-card"><p className="stat-label">Expected Revenue</p><h3>{fmt(expected)}</h3></div>
        <div className="stat-card"><p className="stat-label">Collected</p><h3>{fmt(collected)}</h3></div>
        <div className="stat-card"><p className="stat-label">Pending</p><h3>{fmt(pending)}</h3></div>
        <div className="stat-card"><p className="stat-label">Collection Rate</p><h3>{rate}%</h3></div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Collection Progress</h3>
            <span>{rate}%</span>
          </div>
          <div className="progress-block">
            <div className="progress-label">Collected vs Expected</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${rate}%` }} />
            </div>
            <div className="progress-insight">{fmt(collected)} of {fmt(expected)}</div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Revenue Breakdown</h3>
          </div>
          <div className="report-row">
            <span>Expected</span><strong>{fmt(expected)}</strong>
          </div>
          <div className="report-row">
            <span>Collected</span><strong style={{ color: '#22c55e' }}>{fmt(collected)}</strong>
          </div>
          <div className="report-row">
            <span>Pending</span><strong style={{ color: '#ef4444' }}>{fmt(pending)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
