"use client";

import { generateMockEvents } from "../data/eventGenerator";
import HighchartsWrapper from "@core/components/HighchartsWrapper";

export default function CBEMA() {
  const events = generateMockEvents(100);
  const eventData = events.map((e) => [e.durationMs, e.magnitude]);

  const options: Highcharts.Options = {
    chart: { type: "scatter", zoomType: "xy" },
    title: { text: "Curva CBEMA / ITIC", style: { color: "#fff" } },
    xAxis: {
      type: "logarithmic",
      title: { text: "Duración (ms)", style: { color: "#fff" } },
      labels: { style: { color: "#fff" } },
      min: 1,
      max: 10000,
    },
    yAxis: {
      title: { text: "Voltaje (%)", style: { color: "#fff" } },
      labels: { style: { color: "#fff" } },
      min: -100,
      max: 200,
    },
    series: [
      { type: "scatter", name: "Eventos", data: eventData, color: "#06b6d4" },
      {
        type: "line",
        name: "Curva CBEMA",
        color: "#f97316",
        dashStyle: "ShortDash",
        data: [[1, -10], [10, -30], [100, -40], [1000, -50], [10000, -60]],
      },
    ],
  };

  return <HighchartsWrapper options={options} height={400} />;
}