/**
 * Formats a number according to the Indian numbering system (e.g., 3,00,000).
 * @param {number|string} n - The number to format
 * @returns {string} - Formatted number
 */
export const formatCurrency = (n) => {
  if (n === null || n === undefined) return '0';
  return Number(n).toLocaleString('en-IN');
};

/**
 * Formats a number with Indian currency symbol (₹).
 * @param {number|string} n - The number to format
 * @returns {string} - Formatted currency string
 */
export const formatINR = (n) => {
  return `₹${formatCurrency(n)}`;
};
