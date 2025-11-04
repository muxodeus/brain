"use client";

import { useEffect, useState } from "react";
import ChartCard from "@core/components/ChartCard";
import HighchartsWrapper from "@core/components/HighchartsWrapper";

export default function ForecastsPage() {
  const [data, setData] = useState<[number, number][]>([]);

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          const points = json.rows
            .filter((r: any) => r._field === "voltage_A" && r._value !== null)
            .map((r: any) => [
              new Date(r._time).getTime(),
              r._value as number,
            ]);
          setData(points);
        }
      });
  }, []);

  // Forecast simple: extrapolación lineal
  const forecast = (() => {
    if (data.length < 2) return [];
    const [x1, y1] = data[data.length - 2];
    const [x2, y2] = data[data.length - 1];
    const slope = (y2 - y1) / (x2 - x1);
    const future: [number, number][] = [];
    for (let i = 1; i <= 5; i++) {
      const t = x2 + i * 60_000; // +1min
      const y = y2 + slope * (t - x2);
      future.push([t, y]);
    }
    return future;
  })();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Forecasts</h1>
      <ChartCard title="Voltage A con proyección">
        <HighchartsWrapper
          options={{
            chart: { type: "line" },
            xAxis: { type: "datetime" },
            yAxis: { title: { text: "Volts" } },
            series: [
              { type: "line", name: "Histórico", data },
              { type: "line", name: "Forecast", data: forecast, dashStyle: "Dash" },
            ],
          }}
          height={350}
        />
      </ChartCard>
    </div>
  );
}