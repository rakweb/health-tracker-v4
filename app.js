// =====================================================
// Health Tracker — Working Baseline
// =====================================================
(() => {
  let entries = [];
  let chart = null;




document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOMContentLoaded reached");

  // --- existing working bindings ---
  btnTheme.addEventListener("click", toggleTheme);
  btnAdd.addEventListener("click", addEntry);
  btnRefresh.addEventListener("click", refreshUI);

  console.log("✅ Passed Add Entry / Theme wiring");

  // --- NEW wiring: remaining toolbar buttons ---
  const buttonMap = {
    btnFields: "Select Fields",
    btnThresholds: "Thresholds",
    btnSaveCSV: "Save CSV",
    btnSavePDF: "Save PDF",
    btnImportCSV: "Import CSV",
    btnOptions: "Options"
  };

  Object.entries(buttonMap).forEach(([id, label]) => {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`⚠️ ${id} not found`);
      return;
    }
    el.addEventListener("click", () => {
      console.log(`✅ ${label} clicked`);
    });
  });

  console.log("✅ All toolbar buttons wired");
});
  
  
  

  // -------------------------
  // Theme
  // -------------------------
  function restoreTheme() {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = saved;
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  }
  
  
  console.log("✅ Passed Add Entry / Theme wiring");
  
  

  // -------------------------
  // CRUD (in memory baseline)
  // -------------------------
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
    tableBody.innerHTML = "";
    entries.forEach(e => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${e.date}</td><td>${e.glucose}</td>`;
      tableBody.appendChild(tr);
    });
  }

  // -------------------------
  // Chart
  // -------------------------
  function initChart() {
    chart = new Chart(metricsChart, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "Glucose",
          data: [],
          borderColor: "#4ba3ff",
          tension: 0.3
        }]
      }
    });
  }

  function updateChart() {
    chart.data.labels = entries.map(e => e.date);
    chart.data.datasets[0].data = entries.map(e => e.glucose);
    chart.update();
  }
})();
