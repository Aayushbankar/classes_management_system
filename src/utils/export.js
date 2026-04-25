/**
 * Export utilities for Eklavya
 * Client-side Excel export using the xlsx library
 */

let XLSX = null;

async function getXLSX() {
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
  return XLSX;
}

/**
 * Export an array of objects to an .xlsx file.
 * @param {Object[]} rows  - Array of data objects
 * @param {Array}    cols  - Array of { key, label } column definitions
 * @param {string}   name  - Base filename (without extension)
 */
export async function exportToExcel(rows, cols, name = 'export') {
  const lib = await getXLSX();
  const data = rows.map(row =>
    Object.fromEntries(cols.map(c => [c.label, row[c.key] ?? '']))
  );
  const ws = lib.utils.json_to_sheet(data);

  // Auto-width columns
  const colWidths = cols.map(c => ({
    wch: Math.max(c.label.length, ...rows.map(r => String(r[c.key] ?? '').length)) + 2,
  }));
  ws['!cols'] = colWidths;

  const wb = lib.utils.book_new();
  lib.utils.book_append_sheet(wb, ws, 'Sheet1');

  const dateStr = new Date().toISOString().slice(0, 10);
  lib.writeFile(wb, `${name}_${dateStr}.xlsx`);
}

// Pre-defined column configs for each module
export const STUDENT_COLS = [
  { key: 'name', label: 'Student Name' },
  { key: 'standard', label: 'Standard' },
  { key: 'batch_time', label: 'Batch / Timing' },
  { key: 'roll_number', label: 'Roll Number' },
  { key: 'parent_name', label: 'Parent Name' },
  { key: 'contact_number', label: 'Contact Number' },
  { key: 'branch_name', label: 'Branch' },
  { key: 'decided_fee', label: 'Decided Fee (₹)' },
  { key: 'paid_fee', label: 'Paid Fee (₹)' },
  { key: 'fee_left', label: 'Pending Fee (₹)' },
  { key: 'status', label: 'Status' },
];

export const TEACHER_COLS = [
  { key: 'name', label: 'Teacher Name' },
  { key: 'subject', label: 'Subject' },
  { key: 'assigned_standard', label: 'Assigned Class' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'branch_name', label: 'Branch' },
];

export const PAYMENT_COLS = [
  { key: 'student_name', label: 'Student Name' },
  { key: 'amount', label: 'Amount (₹)' },
  { key: 'payment_date', label: 'Payment Date' },
  { key: 'payment_mode', label: 'Mode' },
  { key: 'reference', label: 'Reference / TXN ID' },
  { key: 'notes', label: 'Notes' },
];
