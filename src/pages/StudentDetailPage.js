import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchJson, fetchList } from '../api';
import { formatINR } from '../utils/format';

function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchJson(`/students/${id}/`).then(setStudent).catch(e => setError(e.message));
    fetchList(`/finance/payments/?student=${id}`).then(setPayments).catch(() => {});
  }, [id]);

  if (error) return (
    <div className="animate-fade-in">
      <div className="mobile-page-header"><p className="subtitle">Student</p><h2>Details</h2></div>
      <div className="error-box">{error}</div>
      <button className="btn btn-premium mt-3" onClick={() => navigate('/app/students')}>← Back</button>
    </div>
  );

  if (!student) return (
    <div className="animate-fade-in">
      <div className="mobile-page-header"><p className="subtitle">Student</p><h2>Loading…</h2></div>
    </div>
  );

  const feeLeft = Number(student.fee_left || (student.decided_fee || 0) - (student.paid_fee || 0));
  const decidedFee = Number(student.decided_fee) || 0;
  const paidPercent = decidedFee > 0 ? Math.min(100, Math.round(((decidedFee - feeLeft) / decidedFee) * 100)) : 100;

  return (
    <div className="animate-fade-in">
      <div className="mobile-page-header d-flex justify-content-between align-items-end mb-3">
        <div>
          <p className="subtitle">Student</p>
          <h2>{student.name}</h2>
        </div>
        <Link className="btn btn-sm rounded-pill px-3" to="/app/students" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>← Back</Link>
      </div>

      {/* Quick stats */}
      <div className="kpi-scroll-strip mb-3">
        <div className="glass-card stat-card"><p className="filter-label m-0">Standard</p><span className="stat-value" style={{ fontSize: '1rem' }}>{student.standard || 'N/A'}</span></div>
        <div className="glass-card stat-card"><p className="filter-label m-0">Batch</p><span className="stat-value" style={{ fontSize: '1rem' }}>{student.batch_time || 'N/A'}</span></div>
        <div className="glass-card stat-card"><p className="filter-label m-0">Branch</p><span className="stat-value" style={{ fontSize: '1rem' }}>{student.branch_name || 'N/A'}</span></div>
        <div className="glass-card stat-card"><p className="filter-label m-0">Status</p><span className={`badge rounded-pill px-2 mt-1 ${student.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`} style={{ fontSize: '0.7rem' }}>{student.status}</span></div>
      </div>

      {/* Fee Progress */}
      <div className="glass-card mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Fee Progress</span>
          <span className={feeLeft > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'} style={{ fontSize: '0.85rem' }}>
            {feeLeft > 0 ? `${formatINR(feeLeft)} due` : 'Paid ✓'}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--border)' }}>
          <div style={{ height: '100%', width: `${paidPercent}%`, borderRadius: 3, background: feeLeft > 0 ? '#f59e0b' : '#10b981', transition: 'width 0.4s' }} />
        </div>
        <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Decided: {formatINR(student.decided_fee)}</span>
          <span>Paid: {formatINR(student.paid_fee)}</span>
        </div>
      </div>

      {/* Personal Details */}
      <div className="glass-card mb-3">
        <h3 className="mobile-section-title mt-0 mb-3">Personal Details</h3>
        {[
          ['Roll Number', student.roll_number || '-'],
          ['Parent', student.parent_name || '-'],
          ['Contact', student.contact_number || '-'],
          ['Admission', student.admission_date || '-'],
        ].map(([label, value]) => (
          <div key={label} className="info-stat">
            <label>{label}</label><span>{value}</span>
          </div>
        ))}
        {student.critical_notes && (
          <div className="info-stat"><label>Notes</label><span className="prewrap">{student.critical_notes}</span></div>
        )}
      </div>

      {/* Payments */}
      <h3 className="mobile-section-title">Recent Payments</h3>
      {payments.length === 0 ? (
        <div className="glass-card text-center py-4"><p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>No payments found</p></div>
      ) : payments.map(p => (
        <div key={p.id} className="txn-card">
          <div className="txn-card-left">
            <div className="txn-name">{p.payment_date}</div>
            <div className="txn-meta">{p.reference || 'No reference'}</div>
          </div>
          <div className="txn-card-right">
            <div className="txn-amount">{formatINR(p.amount)}</div>
            <span className={`badge-mode ${p.payment_mode}`}>{p.payment_mode}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentDetailPage;
