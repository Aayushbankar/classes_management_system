import React from 'react';

function FeeReceipt({ payment, student }) {
  if (!payment) return null;

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const dateStr = payment.payment_date
    ? new Date(payment.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const modeLabel = { cash: 'Cash', cheque: 'Cheque', upi: 'UPI', other: 'Other' }[payment.payment_mode] || payment.payment_mode;

  return (
    <div className="fee-receipt" id="fee-receipt-print">
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }
          #fee-receipt-print, #fee-receipt-print * { visibility: visible; }
          #fee-receipt-print { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <div style={{
        fontFamily: 'Arial, sans-serif', maxWidth: 480, margin: '0 auto', padding: '2rem',
        border: '2px solid #1e1b4b', borderRadius: 8, background: '#ffffff', color: '#1e293b',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #6366f1', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4f46e5', letterSpacing: '-0.02em' }}>EKLAVYA</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>Coaching Management System</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}>FEE PAYMENT RECEIPT</div>
        </div>

        {/* Receipt meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
          <span>Receipt #<strong style={{ color: '#1e293b' }}>{payment.id}</strong></span>
          <span>Date: <strong style={{ color: '#1e293b' }}>{dateStr}</strong></span>
        </div>

        {/* Student info */}
        <div style={{ background: '#f8fafc', borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 4 }}>Student Details</div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{student?.name || payment.student_name || '—'}</div>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>
            {student?.standard && <span>Standard: {student.standard}</span>}
            {student?.batch_time && <span> &bull; Batch: {student.batch_time}</span>}
            {student?.branch_name && <span> &bull; Branch: {student.branch_name}</span>}
          </div>
          {student?.roll_number && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Roll No: {student.roll_number}</div>}
        </div>

        {/* Payment details */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <tbody>
            {[
              ['Amount Paid', fmt(payment.amount)],
              ['Payment Mode', modeLabel],
              ['Reference / TXN ID', payment.reference || '—'],
              ['Notes', payment.notes || '—'],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0', color: '#64748b' }}>{label}</td>
                <td style={{ padding: '0.5rem 0', fontWeight: 600, textAlign: 'right' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total highlight */}
        <div style={{ background: '#4f46e5', color: 'white', borderRadius: 6, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontWeight: 700 }}>AMOUNT RECEIVED</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{fmt(payment.amount)}</span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
          <span>This is a computer-generated receipt.</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ height: 40, borderBottom: '1px solid #94a3b8', width: 120, marginBottom: 4 }} />
            <div>Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeeReceipt;
