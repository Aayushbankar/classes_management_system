import React from 'react';
import { createPortal } from 'react-dom';

function FeeReceipt({ payment, student }) {
  if (!payment) return null;

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const dateStr = payment.payment_date
    ? new Date(payment.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  
  const modeLabel = { 
    cash: 'CASH PAYMENT', 
    cheque: 'CHEQUE / DD',  
    upi: 'DIGITAL UPI', 
    other: 'OTHER MODE' 
  }[payment.payment_mode] || payment.payment_mode.toUpperCase();

  const content = (
    <div className="fee-receipt" id="fee-receipt-print">
      <div className="receipt-container" style={{
        backgroundColor: '#f1f5f9',
        minHeight: '100vh',
        padding: '30px',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#1e293b'
      }}>
        {/* Main Document Body */}
        <div className="receipt-card" style={{
          width: '100%',
          maxWidth: '850px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Header Block: Deep Indigo with Logo */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', 
            padding: '40px 50px', 
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Subtle Pattern Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontFamily: "'Outfit', sans-serif", 
                fontSize: '2.2rem', 
                fontWeight: 900, 
                letterSpacing: '-0.05em',
                marginBottom: '2px'
              }}>
                EKLAVYA
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: '#818cf8', 
                textTransform: 'uppercase', 
                letterSpacing: '0.2em' 
              }}>
                Educational Excellence
              </div>
            </div>

            <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                color: '#818cf8', 
                textTransform: 'uppercase', 
                marginBottom: '6px' 
              }}>
                Payment Document
              </div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                padding: '8px 16px', 
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)'
              }}>
                RECEIPT #{payment.id?.toString().padStart(6, '0')}
              </div>
            </div>
          </div>

          <div style={{ padding: '40px 50px', position: 'relative' }}>
            
            {/* Background Watermark Arrow */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              fontSize: '25rem',
              color: '#f8fafc',
              zIndex: 0,
              userSelect: 'none',
              pointerEvents: 'none',
              fontWeight: 900,
              opacity: 0.6
            }}>
              E
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '40px' }}>
                <div style={{ borderLeft: '3px solid #6366f1', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Issued To</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{student?.name || payment.student_name || '—'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                    {student?.roll_number ? `Roll: ${student.roll_number}` : 'Standard Student'}
                  </div>
                </div>

                <div style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Academic Track</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{student?.standard || 'N/A'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{student?.batch_time || 'General Batch'}</div>
                </div>

                <div style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: '20px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Issuance Detail</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{dateStr}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{student?.branch_name || 'Main Campus'}</div>
                </div>
              </div>

              {/* Payment Table */}
              <div style={{ marginBottom: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0 20px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Description</th>
                      <th style={{ textAlign: 'center', padding: '0 20px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Method</th>
                      <th style={{ textAlign: 'right', padding: '0 20px', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <td style={{ padding: '20px', borderRadius: '12px 0 0 12px', border: '1px solid #f1f5f9', borderRight: 'none' }}>
                        <div style={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>Academic Tuition Fee</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Ref ID: {payment.reference || 'Auto-generated'}</div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ 
                          backgroundColor: '#e0e7ff', 
                          color: '#4338ca', 
                          padding: '4px 12px', 
                          borderRadius: '99px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700 
                        }}>
                          {modeLabel}
                        </span>
                      </td>
                      <td style={{ 
                        textAlign: 'right', 
                        padding: '20px', 
                        borderRadius: '0 12px 12px 0', 
                        border: '1px solid #f1f5f9', 
                        borderLeft: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#1e1b4b'
                      }}>
                        {fmt(payment.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Block & Stamp Area */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                {/* Status Ribbon / Stamp - Now placed inside the flex container for better alignment */}
                <div style={{ transform: 'rotate(-5deg)', opacity: 0.8 }}>
                  <div style={{
                    border: '4px double #10b981',
                    borderRadius: '12px',
                    padding: '8px 24px',
                    color: '#10b981',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    Official Payment Success
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: '#1e1b4b', 
                  color: '#ffffff', 
                  padding: '25px 40px', 
                  borderRadius: '20px', 
                  textAlign: 'right',
                  boxShadow: '0 15px 30px -10px rgba(30, 27, 75, 0.4)',
                  minWidth: '300px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', marginBottom: '4px' }}>Total Amount Settled</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>{fmt(payment.amount)}</div>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
                  <div style={{ fontSize: '0.7rem', color: '#818cf8', fontStyle: 'italic' }}>
                    Payment confirmed and recorded in system.
                  </div>
                </div>
              </div>

              {/* Footer / Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '2px dashed #e2e8f0', paddingTop: '30px' }}>
                <div style={{ maxWidth: '400px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>Important Documentation Note:</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
                    This receipt serves as an official confirmation of fees paid to Eklavya Coaching Institute. 
                    Please retain this document for future correspondence. 
                    Fees once paid are non-refundable and non-transferable under policy.
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '70px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png" 
                      alt="Signature" 
                      style={{ height: '100%', opacity: 0.7, filter: 'grayscale(1) brightness(0.5)' }} 
                    />
                  </div>
                  <div style={{ width: '220px', height: '1px', backgroundColor: '#334155', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1b4b' }}>HEAD OF FINANCE</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Eklavya Academic Council</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Accreditation Bar */}
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '15px 50px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '0.65rem',
            color: '#94a3b8',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span>&copy; 2026 Eklavya Education Systems</span>
            <span>Accredited Academic Partner</span>
            <span>www.eklavya.institute</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @media screen {
          .fee-receipt { 
            position: absolute;
            left: -9999px;
            top: -9999px;
            visibility: hidden;
            height: 0;
            overflow: hidden;
          }
        }
        @media print {
          .receipt-container {
            background-color: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
          }
          .receipt-card {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}

export default FeeReceipt;
