import Highcharts from "highcharts";

export function initHighchartsTheme() {
  Highcharts.setOptions({
    colors: ["#38bdf8", "#22c55e", "#f97316", "#e11d48", "#a855f7", "#facc15"],

    chart: {
      backgroundColor: "#0f172a",
      style: { fontFamily: "Inter, sans-serif" },
    },

    title: {
      style: { color: "#e2e8f0", fontSize: "14px" },
    },

    xAxis: {
      gridLineColor: "#1e293b",
      labels: { style: { color: "#94a3b8" } },
      lineColor: "#334155",
      tickColor: "#334155",
    },

    yAxis: {
      gridLineColor: "#1e293b",
      labels: { style: { color: "#94a3b8" } },
      title: { style: { color: "#94a3b8" } },
    },

    legend: {
      itemStyle: { color: "#cbd5e1" },
      itemHoverStyle: { color: "#f1f5f9" },
    },

    tooltip: {
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      style: { color: "#f1f5f9" },
    },

    exporting: {
      buttons: {
        contextButton: {
          symbolStroke: "#f1f5f9",
          theme: { fill: "#1e293b" },
        },
      },
    },
  });
}