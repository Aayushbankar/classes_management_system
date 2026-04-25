import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchJson } from '../api';

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
        const paymentData = await fetchJson(`/finance/payments/?student=${id}`);
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
      <div className="page-panel">
        <div className="dashboard-header">
          <p className="subtitle">Student</p>
          <h2>Student Details</h2>
        </div>
        <div className="error-box">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/app/students')}>Back to students</button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="page-panel">
        <div className="dashboard-header">
          <p className="subtitle">Student</p>
          <h2>Student Details</h2>
        </div>
        <div className="card-grid">
          <div className="stat-card"><p className="kpi-title">Loading student…</p></div>
        </div>
      </div>
    );
  }

  const feeLeft = Number(student.fee_left || (student.decided_fee || 0) - (student.paid_fee || 0));

  return (
    <div className="page-panel">
      <div className="dashboard-header">
        <div>
          <p className="subtitle">Student</p>
          <h2>{student.name}</h2>
        </div>
        <div className="page-header-actions">
          <Link className="btn btn-secondary" to="/app/students">Back</Link>
          <button className="btn btn-primary" onClick={() => navigate('/app/students')}>Student list</button>
        </div>
      </div>

      <div className="card-grid">
        <div className="stat-card"><p className="stat-label">Standard</p><h3>{student.standard || 'N/A'}</h3></div>
        <div className="stat-card"><p className="stat-label">Batch</p><h3>{student.batch_time || 'N/A'}</h3></div>
        <div className="stat-card"><p className="stat-label">Branch</p><h3>{student.branch_name || student.branch || 'N/A'}</h3></div>
        <div className="stat-card"><p className="stat-label">Status</p><h3>{student.status || 'N/A'}</h3></div>
      </div>

      <div className="panel-section">
        <div className="panel-heading">
          <div>
            <h3>Student Card</h3>
            <p className="panel-subtitle">Complete student profile and latest payments.</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-card-header">
              <h4>Personal Details</h4>
            </div>
            <div className="info-stat-grid">
              <div className="info-stat"><label>Roll Number</label><span>{student.roll_number || '-'}</span></div>
              <div className="info-stat"><label>Parent</label><span>{student.parent_name || '-'}</span></div>
              <div className="info-stat"><label>Contact</label><span>{student.contact_number || '-'}</span></div>
              <div className="info-stat"><label>Admission</label><span>{student.admission_date || '-'}</span></div>
              <div className="info-stat"><label>Fee Decided</label><span>₹{Number(student.decided_fee || 0).toLocaleString()}</span></div>
              <div className="info-stat"><label>Paid Fee</label><span>₹{Number(student.paid_fee || 0).toLocaleString()}</span></div>
              <div className="info-stat highlight"><label>Fee Left</label><span>₹{feeLeft.toLocaleString()}</span></div>
              <div className="info-stat"><label>Notes</label><span className="prewrap">{student.critical_notes || '-'}</span></div>
            </div>
          </div>
        </div>

        <div>
          <h3>Recent Payments</h3>
          <div className="excel-table-wrapper">
            <table className="excel-table">
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
                  <tr><td colSpan={4} className="empty-state">No payments found</td></tr>
                )}
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.payment_date}</td>
                    <td>₹{Number(payment.amount).toLocaleString()}</td>
                    <td>{payment.payment_mode}</td>
                    <td>{payment.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailPage;
