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

    const loadDetails = async () => {
      try {
        const studentData = await fetchJson(`/students/${id}/`);
        setStudent(studentData);
      } catch (e) {
        setError(e.message);
      }
    };

    const loadPayments = async () => {
      try {
        const paymentData = await fetchList(`/finance/payments/?student=${id}`);
        setPayments(paymentData);
      } catch (e) {
        // ignore payment errors, student details are primary
      }
    };

    loadDetails();
    loadPayments();
  }, [id]);

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <p className="subtitle">Student</p>
          <h2 className="fs-1">Student Details</h2>
        </div>
        <div className="alert alert-danger rounded-3 px-4">{error}</div>
        <button className="btn btn-premium" onClick={() => navigate('/app/students')}>← Back to Students</button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <p className="subtitle">Student</p>
          <h2 className="fs-1">Student Details</h2>
        </div>
        <div className="glass-card text-center py-5">
          <p className="text-muted m-0">Loading student…</p>
        </div>
      </div>
    );
  }

  const feeLeft = Number(student.fee_left || (student.decided_fee || 0) - (student.paid_fee || 0));
  const decidedFee = Number(student.decided_fee) || 0;
  const paidPercent = decidedFee > 0 ? Math.min(100, Math.round(((decidedFee - feeLeft) / decidedFee) * 100)) : 100;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <p className="subtitle">Student</p>
          <h2 className="fs-1">{student.name}</h2>
        </div>
        <Link className="btn btn-premium" to="/app/students">← Back to Students</Link>
      </div>

      <div className="dashboard-grid mb-4">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-soft)' }}><span>📚</span></div>
          <p className="text-muted small fw-bold m-0">Standard</p>
          <span className="stat-value" style={{ fontSize: '1.1rem' }}>{student.standard || 'N/A'}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}><span>🕐</span></div>
          <p className="text-muted small fw-bold m-0">Batch</p>
          <span className="stat-value" style={{ fontSize: '1.1rem' }}>{student.batch_time || 'N/A'}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><span>🏢</span></div>
          <p className="text-muted small fw-bold m-0">Branch</p>
          <span className="stat-value" style={{ fontSize: '1.1rem' }}>{student.branch_name || student.branch || 'N/A'}</span>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: student.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100,116,139,0.1)' }}><span>{student.status === 'active' ? '✅' : '⏸️'}</span></div>
          <p className="text-muted small fw-bold m-0">Status</p>
          <span className={`badge rounded-pill px-3 mt-1 ${student.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
            {student.status || 'N/A'}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Personal Details Card */}
        <div className="col-12 col-lg-6">
          <div className="glass-card h-100">
            <h4 className="fs-5 mb-4 fw-bold">Personal Details</h4>
            <div className="d-flex flex-column gap-3">
              {[
                ['🪪', 'Roll Number', student.roll_number || '—'],
                ['👨‍👩‍👦', 'Parent / Guardian', student.parent_name || '—'],
                ['📞', 'Contact', student.contact_number || '—'],
                ['📅', 'Admission Date', student.admission_date || '—'],
              ].map(([icon, label, value]) => (
                <div key={label} className="d-flex align-items-center gap-3 p-2 rounded-3" style={{ background: 'var(--surface-muted)' }}>
                  <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <p className="m-0" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</p>
                    <p className="m-0 fw-semibold" style={{ fontSize: '0.9rem' }}>{value}</p>
                  </div>
                </div>
              ))}
              {student.critical_notes && (
                <div className="p-2 rounded-3" style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                  <p className="m-0" style={{ fontSize: '0.72rem', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>📝 Notes</p>
                  <p className="m-0 mt-1" style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{student.critical_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fee Summary Card */}
        <div className="col-12 col-lg-6">
          <div className="glass-card h-100">
            <h4 className="fs-5 mb-4 fw-bold">Fee Summary</h4>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between p-3 rounded-3" style={{ background: 'var(--surface-muted)' }}>
                <span className="text-muted">Decided Fee</span>
                <span className="fw-bold">{formatINR(student.decided_fee)}</span>
              </div>
              <div className="d-flex justify-content-between p-3 rounded-3" style={{ background: 'var(--surface-muted)' }}>
                <span className="text-muted">Paid Fee</span>
                <span className="fw-bold text-success">{formatINR(student.paid_fee)}</span>
              </div>
              <div className="d-flex justify-content-between p-3 rounded-3" style={{ background: feeLeft > 0 ? 'rgba(244, 63, 94, 0.05)' : 'rgba(16, 185, 129, 0.05)', border: `1px solid ${feeLeft > 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                <span className="fw-bold">Fee Remaining</span>
                <span className={`fw-bold ${feeLeft > 0 ? 'text-danger' : 'text-success'}`}>{formatINR(feeLeft)}</span>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Collection Progress</span>
                  <span className="fw-bold">{paidPercent}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--border)' }}>
                  <div style={{ height: '100%', width: `${paidPercent}%`, borderRadius: 4, background: feeLeft > 0 ? '#f59e0b' : '#10b981', transition: 'width 0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="glass-card mt-4">
        <h4 className="fs-5 mb-3 fw-bold">Payment History</h4>
        <div className="data-grid-container">
          <table className="data-grid-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr><td colSpan={4} className="text-center py-5 text-muted">No payments recorded yet</td></tr>
              )}
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td className="small">{payment.payment_date}</td>
                  <td className="fw-bold text-primary">{formatINR(payment.amount)}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 ${payment.payment_mode === "cash" ? "bg-success-subtle text-success" : "bg-primary-subtle text-primary"}`}>
                      {payment.payment_mode?.toUpperCase()}
                    </span>
                  </td>
                  <td className="small text-muted">{payment.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailPage;
