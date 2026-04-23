// =====================================================
// Health Tracker — Working Baseline
// =====================================================
(() => {
  let entries = [];
  let chart = null;


console.log("✅ DOMContentLoaded reached");


  document.addEventListener("DOMContentLoaded", init);

  function init() {
    console.log("✅ app.js loaded");

    btnTheme.addEventListener("click", toggleTheme);
    btnAdd.addEventListener("click", addEntry);
    btnRefresh.addEventListener("click", refreshUI);

    restoreTheme();
    initChart();
    refreshUI();
  }
  
const handlers = {
  btnRefresh: refreshUI,
  btnFields: () => console.log("Select Fields clicked"),
  btnThresholds: () => console.log("Thresholds clicked"),
  btnSaveCSV: () => console.log("Save CSV clicked"),
  btnSavePDF: () => console.log("Save PDF clicked"),
  btnImportCSV: () => {
    console.log("Import CSV clicked");
    document.getElementById("importFile")?.click();
  },
  btnOptions: () => console.log("Options clicked")
};

Object.entries(handlers).forEach(([id, fn]) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", fn);
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
