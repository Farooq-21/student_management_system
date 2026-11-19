/**
 * admin.js — Shared admin utilities
 * Included on all admin pages after auth.js
 */

// Nothing extra needed here — all admin logic lives inline in each page.
// This file is kept for future shared admin helpers.

// Example: format date nicely
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// Truncate long strings for table cells
function truncate(str, max = 30) {
  if (!str) return '—';
  return str.length > max ? str.substring(0, max) + '…' : str;
}
