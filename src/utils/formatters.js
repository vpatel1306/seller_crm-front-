/**
 * Utility helper functions for formatting currency and date/time in the application.
 */

/**
 * Formats a numeric value into Indian Rupees (₹) format with lakh/thousand grouping.
 * Negative values will have the minus sign placed before the rupee symbol (-₹1,23,456.78).
 * 
 * @param {number|string} value - The numeric value to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (value) => {
  const num = Number(value) || 0;
  const str = Math.abs(num).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return num < 0 ? `-₹${str}` : `₹${str}`;
};

/**
 * Formats a date string into Indian locale date format (DD/MM/YYYY).
 * 
 * @param {string|Date} value - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (value) => {
  if (!value) return '-';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleDateString('en-IN');
};

/**
 * Formats a date string into Indian locale date and time format (DD/MM/YYYY, HH:MM:SS).
 * 
 * @param {string|Date} value - The date/time to format.
 * @returns {string} The formatted date/time string.
 */
export const formatDateTime = (value) => {
  if (!value) return '-';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleString('en-IN');
};
