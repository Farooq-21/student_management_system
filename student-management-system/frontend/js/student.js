/**
 * student.js — Shared student utilities
 * Included on student-facing pages after auth.js
 */

// Nothing extra needed — student page logic is inline.
// Kept for shared helpers.

function formatSemester(num) {
  if (!num) return '—';
  const suffixes = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  return suffixes[num] ? suffixes[num] + ' Semester' : `Semester ${num}`;
}
