"use client";

import { useMemo } from "react";
import HighchartsWrapper from "./HighchartsWrapper";

export type Point = { t: number; y: number };
export type Anomaly = { t: number; y: number };

export default function AnomalyChart({
  data,
  anomalies = [],
  unit = "kW",
}: {
  data: Point[];
  anomalies?: Anomaly[];
  unit?: string;
}) {
  const options = useMemo<Highcharts.Options>(() => ({
    title: { text: "Potencia con anomalías" },
    chart: { type: "line" },
    xAxis: { type: "datetime" },
    yAxis: { title: { text: unit } },
    series: [
      {
        type: "line",
        name: "Carga",
        data: data.map((p) => [p.t, p.y]),
      },
      {
        type: "scatter",
        name: "Anomalías",
        data: anomalies.map((a) => [a.t, a.y]),
        color: "#EF4444",
        marker: { radius: 4, symbol: "circle" },
      },
    ],
  }), [data, anomalies, unit]);

  return <HighchartsWrapper options={options} height={320} />;
}