"use client";

import HighchartsWrapper from "@core/components/HighchartsWrapper";

export default function Reportes() {
  const options: Highcharts.Options = {
    chart: { type: "column" },
    title: { text: "Reporte anual de perturbaciones", style: { color: "#fff" } },
    xAxis: {
      categories: ["Enero", "Febrero", "Marzo", "Abril"],
      labels: { style: { color: "#fff" } },
    },
    yAxis: {
      title: { text: "Cantidad de eventos", style: { color: "#fff" } },
      labels: { style: { color: "#fff" } },
    },
    series: [
      { type: "column", name: "Sags", data: [12, 8, 15, 20], color: "#06b6d4" },
      { type: "column", name: "Swells", data: [5, 3, 7, 6], color: "#f97316" },
      { type: "column", name: "Interrupciones", data: [2, 1, 3, 4], color: "#ef4444" },
    ],
    exporting: { enabled: true },
  };

  return <HighchartsWrapper options={options} height={400} />;
}