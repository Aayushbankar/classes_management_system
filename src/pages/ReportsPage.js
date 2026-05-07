import React, { useEffect, useState } from 'react';
import { fetchJson } from '../api';

function ReportsPage() {
  const [fees, setFees] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { fetchJson('/reports/fees/').then(setFees).catch(e => setError(e.message)); }, []);

  const expected = fees ? Number(fees.total_expected_revenue || 0) : 0;
  const collected = fees ? Number(fees.total_collected_revenue || 0) : 0;
  const pending = fees ? Number(fees.pending_revenue || 0) : 0;
  const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0;

  const fmt = (n) => { if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`; if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`; return `₹${n}`; };

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header mb-3">
        <p className="subtitle">Financial</p>
        <h2>Reports</h2>
      </div>

      {error && <div className="alert alert-danger rounded-pill px-4">{error}</div>}

      <div className="kpi-scroll-strip mb-3">
        <div className="glass-card stat-card hover-lift"><p className="filter-label m-0">Expected</p><h3 className="stat-value">{fmt(expected)}</h3></div>
        <div className="glass-card stat-card hover-lift"><p className="filter-label m-0">Collected</p><h3 className="stat-value text-success">{fmt(collected)}</h3></div>
        <div className="glass-card stat-card hover-lift"><p className="filter-label m-0">Pending</p><h3 className="stat-value text-danger">{fmt(pending)}</h3></div>
        <div className="glass-card stat-card hover-lift"><p className="filter-label m-0">Rate</p><h3 className="stat-value">{rate}%</h3></div>
      </div>

      <div className="glass-card mb-3">
        <h3 className="mobile-section-title mt-0 mb-3">Collection Progress</h3>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Overall Progress</span>
          <span className="badge bg-primary-subtle text-primary rounded-pill px-3" style={{ fontSize: '0.72rem' }}>{rate}%</span>
        </div>
        <div className="progress rounded-pill mb-3" style={{ height: '10px' }}>
          <div className="progress-bar" style={{ width: `${rate}%`, background: 'var(--primary-gradient)' }}></div>
        </div>
        <p className="text-muted m-0" style={{ fontSize: '0.8rem' }}>
          Collected <strong>{fmt(collected)}</strong> of <strong>{fmt(expected)}</strong> expected.
        </p>
      </div>

      <div className="glass-card">
        <h3 className="mobile-section-title mt-0 mb-3">Breakdown</h3>
        {[
          ['Expected Revenue', fmt(expected), ''],
          ['Total Collected', fmt(collected), 'text-success'],
          ['Total Pending', fmt(pending), 'text-danger'],
        ].map(([label, value, cls]) => (
          <div key={label} className="info-stat">
            <label>{label}</label><span className={`fw-bold ${cls}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportsPage;
