document.addEventListener("DOMContentLoaded", () => {
  let entries = [];
  let chart;

  btnAdd.onclick = () => {
    entries.push({
      date: new Date().toISOString().slice(0, 10),
      glucose: Math.floor(70 + Math.random() * 80)
    });
    render();
  };

  btnRefresh.onclick = render;
  btnTheme.onclick = toggleTheme;

  initChart();
  render();

  function render() {
    tableBody.innerHTML = "";
    entries.forEach(e => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${e.date}</td><td>${e.glucose}</td>`;
      tableBody.appendChild(tr);
    });

    chart.data.labels = entries.map(e => e.date);
    chart.data.datasets[0].data = entries.map(e => e.glucose);
    chart.update();
  }

  function initChart() {
    chart = new Chart(metricsChart, {
      type: "line",
      data: {
        labels: [],
        datasets: [{ label: "Glucose", data: [] }]
      }
    });
  }

  function toggleTheme() {
    document.documentElement.dataset.theme =
      document.documentElement.dataset.theme === "light"
        ? "dark"
        : "light";
  }
});
