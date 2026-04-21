// app.js - Health Tracker v4.3
const VERSION = "4.3.0";
let currentTheme = localStorage.getItem('theme') || 'dark';
let db; // IndexedDB reference

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initUpdateChecking();
  addAccessibilityFeatures();

  // Existing init code for DB, table, chart, etc.
  console.log('Health Tracker v' + VERSION + ' initialized');
});

function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.getElementById('themeToggle').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

async function initUpdateChecking() {
  const checkBtn = document.getElementById('btnCheckUpdates');
  if (checkBtn) checkBtn.addEventListener('click', checkForUpdate);

  // Auto-check on load (once per day)
  const lastCheck = localStorage.getItem('lastUpdateCheck');
  if (!lastCheck || (Date.now() - parseInt(lastCheck)) > 86400000) {
    setTimeout(checkForUpdate, 2000);
  }
}

async function checkForUpdate() {
  try {
    const res = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Version file not found');
    const remote = await res.json();

    if (compareVersions(remote.version, VERSION) > 0) {
      showUpdateToast(remote);
    } else {
      showToast("You are on the latest version ✓", "ok");
    }
    localStorage.setItem('lastUpdateCheck', Date.now());
  } catch (e) {
    console.warn("Update check failed:", e);
  }
}

function compareVersions(v1, v2) {
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) > (b[i] || 0)) return 1;
    if ((a[i] || 0) < (b[i] || 0)) return -1;
  }
  return 0;
}

function showUpdateToast(remote) {
  const toast = document.getElementById('updateToast');
  document.getElementById('updateMessage').textContent = 
    `New version ${remote.version} available (${remote.date})`;
  
  document.getElementById('btnReloadNow').onclick = () => {
    window.location.reload(true);
  };
  toast.classList.add('show');
}

// Toast helper
function showToast(msg, type = "info") {
  // Reuse or create a simple toast
  console.log("%c" + msg, "color:" + (type==="ok"?"#27d79b":"#4ba3ff"));
}

function addAccessibilityFeatures() {
  // Keyboard navigation for modals, table rows, etc.
  document.addEventListener('keydown', e => {
    if (e.key === "Escape") {
      document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
    }
  });

  // ARIA live regions already added in HTML
  console.log('Accessibility enhancements applied');
}

// Expose UI helpers for inline onclicks
window.UI = {
  closeEntry: () => document.getElementById('entryModal').classList.remove('show'),
  closeFields: () => document.getElementById('fieldsModal').classList.remove('show'),
  // ... add other close functions as needed
  applyTheme: (theme) => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
};