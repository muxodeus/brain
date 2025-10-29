"use client";

import Highcharts from "highcharts";
import dynamic from "next/dynamic";

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  require("highcharts/modules/heatmap")(Highcharts);
  require("highcharts/modules/exporting")(Highcharts);
}

function generateHeatmapData() {
  const data: [number, number, number][] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      data.push([hour, day, Math.floor(Math.random() * 100)]);
    }
  }
  return data;
}

const options: Highcharts.Options = {
  chart: { type: "heatmap", backgroundColor: "transparent", height: 400 },
  title: { text: "Mapa de calor de consumos", style: { color: "#fff" } },
  xAxis: {
    categories: Array.from({ length: 24 }, (_, i) => `${i}h`),
    labels: { style: { color: "#ccc" } },
  },
  yAxis: {
    categories: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    title: { text: "Día de la semana", style: { color: "#ccc" } },
    labels: { style: { color: "#ccc" } },
    reversed: true,
  },
  colorAxis: {
    min: 0,
    stops: [
      [0, "#f0f9ff"],
      [0.5, "#bae6fd"],
      [1, "#38bdf8"],
    ],
  },
  series: [
    {
      type: "heatmap",
      name: "Consumo",
      borderWidth: 2,
      borderColor: "#1e293b",
      borderRadius: 6,
      data: generateHeatmapData(),
    },
  ],
};

export default function HeatmapConsumos() {
  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-lg text-white">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}