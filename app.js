document.addEventListener("DOMContentLoaded", () => {
  console.log("Chart =", window.Chart);

  if (!window.Chart) {
    alert("❌ Chart.js not loaded");
    return;
  }

  new Chart(document.getElementById("metricsChart"), {
    type: "line",
    data: {
      labels: ["A", "B", "C"],
      datasets: [{
        label: "Test",
        data: [1, 2, 3]
      }]
    }
  });

  alert("✅ Chart rendered");
});
