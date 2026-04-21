(() => {
  let entries = [];
  let chart;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    btnTheme.onclick = toggleTheme;
    btnAdd.onclick = addEntry;
    btnRefresh.onclick = refreshUI;

    restoreTheme();
    initChart();
    refreshUI();

    console.log("✅ App initialized");
  }

  /* ---------------- THEME ---------------- */
  function restoreTheme() {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.dataset.theme = saved;
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme;
    const next = current === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  }

  /* ---------------- CRUD ---------------- */
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

  /* ---------------- CHART ---------------- */
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
