/* =========================================================
   Health Tracker – app.js (Refactored, Stable, PWA‑ready)
   HTML remains unchanged
   ========================================================= */
(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    DB.init();
    State.init();
    Accessibility.init();
    PWA.init();
    Updates.init();

    UI.init();
    Charts.init();
    Thresholds.init();
    Fields.init();

    UI.refresh();
    console.info("[App] Initialized successfully");
  }

  /* =====================================================
     STATE
     ===================================================== */
  const State = {
    entries: [],
    selectedFields: [],
    thresholds: {},
    options: {},

    init() {
      // hydrated later
    }
  };

  /* =====================================================
     DATABASE (IndexedDB + migrations)
     ===================================================== */
  const DB = {
    NAME: "healthDB",
    VERSION: 2,
    db: null,

    init() {
      const open = indexedDB.open(this.NAME, this.VERSION);

      open.onupgradeneeded = (e) => {
        const db = e.target.result;
        const old = e.oldVersion;

        if (old < 1) {
          db.createObjectStore("entries", { keyPath: "id" });
        }
        if (old < 2) {
          const store = e.target.transaction.objectStore("entries");
          store.createIndex("byDate", "date");
        }
      };

      open.onsuccess = () => (this.db = open.result);
    },

    store(mode = "readonly") {
      return this.db.transaction("entries", mode).objectStore("entries");
    },

    getAll() {
      return new Promise((res, rej) => {
        const r = this.store().getAll();
        r.onsuccess = () => res(r.result || []);
        r.onerror = () => rej(r.error);
      });
    },

    save(entry) {
      return new Promise((res, rej) => {
        const r = this.store("readwrite").put(entry);
        r.onsuccess = res;
        r.onerror = () => rej(r.error);
      });
    },

    remove(id) {
      return new Promise((res, rej) => {
        const r = this.store("readwrite").delete(id);
        r.onsuccess = res;
        r.onerror = () => rej(r.error);
      });
    }
  };

  /* =====================================================
     UI + CRUD
     ===================================================== */
  const UI = {
    init() {
      bind("btnAdd", this.openEntryModal);
      bind("btnRefresh", this.refresh);
      bind("btnSaveEntry", this.saveEntry);
      bind("btnSaveCSV", ExportCSV.run);
      bind("btnSavePDF", ExportPDF.run);
    },

    async refresh() {
      State.entries = await DB.getAll();
      this.renderTable();
      Charts.update(State.entries);
    },

    renderTable() {
      const body = document.getElementById("tableBody");
      if (!body) return;
      body.innerHTML = "";

      State.entries.forEach(e => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${e.date || ""}</td>
          <td>${e.glucose ?? ""}</td>
          <td>
            <button class="btn danger">Delete</button>
          </td>`;
        tr.querySelector("button").onclick = () =>
          this.deleteEntry(e.id);
        body.appendChild(tr);
      });
    },

    async saveEntry() {
      const entry = {
        id: crypto.randomUUID(),
        date: f_date.value,
        glucose: +f_glucose.value || null
      };
      await DB.save(entry);
      this.closeEntryModal();
      this.refresh();
    },

    async deleteEntry(id) {
      await DB.remove(id);
      this.refresh();
    },

    openEntryModal() {
      entryModal.classList.add("show");
      Accessibility.focusFirst(entryModal);
    },

    closeEntryModal() {
      entryModal.classList.remove("show");
    }
  };

  /* =====================================================
     CHARTS (Chart.js isolated)
     ===================================================== */
  const Charts = {
    chart: null,

    init() {
      const ctx = document.getElementById("metricsChart");
      if (!ctx) return;

      this.chart = new Chart(ctx, {
        type: "line",
        data: { labels: [], datasets: [] },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: { x: { type: "time", time: { unit: "day" } } }
        }
      });
    },

    update(entries) {
      if (!this.chart) return;

      this.chart.data.labels = entries.map(e => e.date);
      this.chart.data.datasets = [{
        label: "Glucose",
        data: entries.map(e => e.glucose ?? null),
        borderColor: "#4ba3ff",
        tension: 0.3
      }];
      this.chart.update();
    }
  };

  /* =====================================================
   THRESHOLDS (definition + evaluation)
   ===================================================== */
const Thresholds = {
  /**
   * Canonical threshold definitions
   * Units MUST match stored values
   */
  definitions: {
    glucose: {
      bands: [
        { min: 0,   max: 70,  level: "danger", label: "Low" },
        { min: 70,  max: 100, level: "ok",     label: "Normal" },
        { min: 100, max: 125, level: "warn",   label: "Elevated" },
        { min: 125, max: 300, level: "danger", label: "High" }
      ]
    }
  },

  /**
   * Return annotation config for Chart.js
   */
  getChartAnnotations(metric) {
    const def = this.definitions[metric];
    if (!def?.bands) return {};

    const annotations = {};

    def.bands.forEach((band, i) => {
      annotations[`band_${metric}_${i}`] = {
        type: "box",
        yMin: band.min,
        yMax: band.max,
        backgroundColor: this.colorForLevel(band.level, 0.12),
        borderWidth: 0,
        label: {
          display: true,
          content: band.label,
          position: "start",
          color: "#cfd8ff",
          font: { size: 11 }
        }
      };
    });

    return annotations;
  },

  colorForLevel(level, alpha = 0.1) {
    switch (level) {
      case "ok":     return `rgba(39, 215, 155, ${alpha})`;
      case "warn":   return `rgba(255, 204, 102, ${alpha})`;
      case "danger": return `rgba(255, 92, 92, ${alpha})`;
      default:       return `rgba(120, 120, 120, ${alpha})`;
    }
  }
};
  /* =====================================================
     FIELDS SELECTION
     ===================================================== */
  const Fields = {
    init() {
      bind("btnFields", this.open);
    },

    open() {
      fieldsModal.classList.add("show");
      Accessibility.focusFirst(fieldsModal);
    },

    close() {
      fieldsModal.classList.remove("show");
    }
  };

  /* =====================================================
     EXPORT – CSV
     ===================================================== */
  const ExportCSV = {
    run() {
      if (!State.entries.length) return;
      const rows = ["date,glucose"];
      State.entries.forEach(e =>
        rows.push(`${e.date},${e.glucose ?? ""}`)
      );
      download("health.csv", rows.join("\n"));
    }
  };

  /* =====================================================
     EXPORT – PDF
     ===================================================== */
  const ExportPDF = {
    run() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text("Health Tracker", 10, 10);
      doc.save("health.pdf");
    }
  };

  /* =====================================================
     ACCESSIBILITY (WCAG AA focus traps)
     ===================================================== */
  const Accessibility = {
    init() {
      document.querySelectorAll(".modal-backdrop")
        .forEach(m => this.trap(m));
    },

    trap(container) {
      container.addEventListener("keydown", e => {
        if (e.key !== "Tab") return;
        const f = container.querySelectorAll(
          "button,input,select,textarea"
        );
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        }
        if (!e.shiftKey &&
            document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      });
    },

    focusFirst(container) {
      container.querySelector("button,input,select,textarea")?.focus();
    }
  };

  /* =====================================================
     UPDATES (version.json)
     ===================================================== */
  const Updates = {
    CURRENT: "1.5.0",
    async init() {
      try {
        const r = await fetch("/version.json", { cache: "no-store" });
        const { version } = await r.json();
        if (version !== this.CURRENT) {
          updateToast.classList.add("show");
        }
      } catch {}
    }
  };

  /* =====================================================
     PWA – service worker updates
     ===================================================== */
  const PWA = {
    init() {
      navigator.serviceWorker?.addEventListener(
        "controllerchange",
        () => location.reload()
      );
    }
  };

  /* =====================================================
     HELPERS
     ===================================================== */
  function bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn.bind(UI));
  }

  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([text], { type: "text/plain" })
    );
    a.download = name;
    a.click();
  }

})();
