// app.js
(() => {
  const App = {
    init() {
      DB.init();
      State.load();
      UI.init();
      Charts.init();
      Updates.init();
      Accessibility.init();
    }
  };

  document.addEventListener("DOMContentLoaded", App.init);

  /* ================= STATE ================= */
  const State = { /* filters, selections */ };

 /* ================== DATABASE (IndexedDB) =================*/
const DB = {
  NAME: "healthDB",
  VERSION: 2,
  db: null,

  init() {
    const open = indexedDB.open(this.NAME, this.VERSION);

    open.onupgradeneeded = (e) => {
      const db = e.target.result;
      const oldVersion = e.oldVersion;

      if (oldVersion < 1) {
        db.createObjectStore("entries", { keyPath: "id" });
      }

      if (oldVersion < 2) {
        const store = e.target.transaction.objectStore("entries");
        store.createIndex("byDate", "date");
      }
    };

    open.onsuccess = () => {
      this.db = open.result;
    };
  }
};

  /* ================= UI ================= */
  const UI = { /* DOM reads/writes only */ };

  /* ================= CHARTS ================= */
  const Charts = { /* Chart.js only */ };

  /* ================= UPDATES ================= */
  const Updates = { /* version check */ };
  const Updates = {
  CURRENT: "1.5.0",

  async init() {
    try {
      const res = await fetch('/version.json', { cache: 'no-store' });
      const { version } = await res.json();
      if (version !== this.CURRENT) {
        document.getElementById('updateToast').classList.add('show');
      }
    } catch {}
  }
};

  /* ================= ACCESSIBILITY ================= */
  const Accessibility = { /* focus traps */ };
  const Accessibility = {
  init() {
    document.querySelectorAll(".modal-backdrop").forEach(m =>
      this.trapFocus(m)
    );
  },

  trapFocus(container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    let first = focusable[0];
    let last = focusable[focusable.length - 1];

    container.addEventListener("keydown", e => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }
};
  
  /* ================= APP-SIDE LISTENER ============= */
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
  window.location.reload();
});
})();
``
