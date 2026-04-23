// =====================================================
// Health Tracker — Stable app.js
// =====================================================
(() => {
  /** -----------------------------
   * Internal state
   * ----------------------------- */
  let entries = [];
  let chart = null;

  /** -----------------------------
   * Bootstrap
   * ----------------------------- */
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    console.log("✅ DOMContentLoaded");

    initTheme();
    initChart();
    wireButtons();
    refreshUI();

    console.log("✅ App initialized");
  }

  /** -----------------------------
   * Theme
   * ----------------------------- */
  function initTheme() {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = saved;
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  }

  /** -----------------------------
   * Button wiring
   * ----------------------------- */
  function wireButtons() {
    bind("btnTheme", toggleTheme);
    bind("btnAdd", addEntry);
    bind("btnRefresh", refreshUI);

    // Toolbar buttons (stubbed, verified)
    bind("btnFields", () => log("Select Fields"));
    bind("btnThresholds", () => log("Thresholds"));
    bind("btnSaveCSV", () => log("Save CSV"));
    bind("btnSavePDF", () => log("Save PDF"));
    bind("btnOptions", () => log("Options"));

    bind("btnImportCSV", () => {
      log("Import CSV");
      document.getElementById("importFile")?.click();
    });

    console.log("✅ All buttons wired");
  }

  function bind(id, handler) {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`⚠️ Element not found: ${id}`);
      return;
    }
    el.addEventListener("click", handler);
  }

  function log(name) {
    console.log(`✅ ${name} clicked`);
  }

  /** -----------------------------
   * CRUD (in‑memory baseline)
   * ----------------------------- */
  function addEntry() {
    entries.push({
      date: new Date().toISOString().slice(0, 10),
      glucose: Math.floor(70 + Math.random() * 80)
    });
    refreshUI();
  }

  function refreshUI() {
    renderTable();
    updateChart();
  }

  function renderTable() {
    const body = document.getElementById("tableBody");
    if (!body) return;

    body.innerHTML = "";
    entries.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.glucose}</td>
      `;
      body.appendChild(row);
    });
  }

  /** -----------------------------
   * Chart
   * ----------------------------- */
  function initChart() {
    const canvas = document.getElementById("metricsChart");
    if (!canvas) {
      console.error("❌ metricsChart canvas not found");
      return;
    }

    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Glucose",
            data: [],
            borderColor: "#4ba3ff",
            backgroundColor: "rgba(75,163,255,0.15)",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "mg/dL" } }
        }
      }
    });

    console.log("✅ Chart initialized");
  }

  function updateChart() {
    if (!chart) return;

    chart.data.labels = entries.map(e => e.date);
    chart.data.datasets[0].data = entries.map(e => e.glucose);
    chart.update();
  }
})();
