/**
 * auth.js — Shared authentication utilities
 * Used by all pages to guard routes and make authenticated API calls.
 */

const API_BASE = '';  // Same origin; Express serves both API and frontend

// Guard: redirect if not authenticated or wrong role
function requireAuth(role) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    window.location.href = role === 'ADMIN'
      ? (isInPagesDir() ? '../admin-login.html' : 'admin-login.html')
      : (isInPagesDir() ? '../login.html' : 'login.html');
    return;
  }

  if (role && userRole !== role) {
    if (userRole === 'ADMIN') {
      window.location.href = isInPagesDir() ? '../admin-dashboard.html' : 'admin-dashboard.html';
    } else {
      window.location.href = isInPagesDir() ? '../student-dashboard.html' : 'student-dashboard.html';
    }
  }
}

function isInPagesDir() {
  return window.location.pathname.includes('/pages/');
}

// Authenticated GET request
async function apiGet(url) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = isInPagesDir() ? '../login.html' : 'login.html';
    throw new Error('Unauthorized');
  }

  return res.json();
}

// Authenticated POST/PUT/DELETE with JSON body
async function apiRequest(method, url, body) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = isInPagesDir() ? '../login.html' : 'login.html';
    throw new Error('Unauthorized');
  }

  return res.json();
}

// Modal helpers (used across all admin pages)
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

// Toast notification system
function showToast(type, message, duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: 'bi-check-circle-fill', error: 'bi-exclamation-circle-fill', warning: 'bi-exclamation-triangle-fill' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="bi ${icons[type] || icons.success}"></i>
    <div class="toast-content"><p>${message}</p></div>
    <button class="toast-dismiss" onclick="this.parentElement.remove()"><i class="bi bi-x"></i></button>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'opacity .3s, transform .3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
