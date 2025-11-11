"use client";

import { generateMockEvents } from "../data/eventGenerator";
import HighchartsWrapper from "@core/components/HighchartsWrapper";

export default function Histogramas() {
  const events = generateMockEvents(200);

  const sagCount = events.filter((e) => e.type === "sag").length;
  const swellCount = events.filter((e) => e.type === "swell").length;
  const interruptionCount = events.filter((e) => e.type === "interruption").length;
  const transientCount = events.filter((e) => e.type === "transient").length;

  const options: Highcharts.Options = {
    chart: { type: "column" },
    title: { text: "Histogramas de Perturbaciones", style: { color: "#fff" } },
    xAxis: {
      categories: ["Sags", "Swells", "Interrupciones", "Transitorios"],
      labels: { style: { color: "#fff" } },
    },
    yAxis: {
      title: { text: "Cantidad de eventos", style: { color: "#fff" } },
      labels: { style: { color: "#fff" } },
    },
    series: [
      {
        type: "column",
        name: "Eventos",
        data: [sagCount, swellCount, interruptionCount, transientCount],
        color: "#06b6d4",
      },
    ],
  };

  return <HighchartsWrapper options={options} height={400} />;
}
