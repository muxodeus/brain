"use client";

import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import HighchartsWrapper from "./HighchartsWrapper";

type Point = [number, number];

const params = [
  { key: "voltage_A", label: "Voltaje (V)" },
  { key: "current_A", label: "Corriente (A)" },
  { key: "power_kW", label: "Potencia (kW)" },
  { key: "freq_Hz", label: "Frecuencia (Hz)" },
  { key: "energy_kwh", label: "Energía (kWh)" },
];

export default function MultiParamDashboard({
  meter,
  range,
  window = "1m",
}: {
  meter: string;
  range: string;
  window?: string;
}) {
  const [seriesData, setSeriesData] = useState<Record<string, Point[]>>({});

  useEffect(() => {
    async function fetchAll() {
      const all: Record<string, Point[]> = {};
      for (const p of params) {
        const res = await fetch(`/api/metrics?meter=${meter}&param=${p.key}&range=${range}&window=${window}`);
        const json = await res.json();
        if (json.ok) {
          all[p.key] = json.rows
            .filter((r: any) => r._value !== null)
            .map((r: any) => [new Date(r._time).getTime(), Number(r._value)]);
        } else {
          all[p.key] = [];
        }
      }
      setSeriesData(all);
    }
    if (meter && range) fetchAll();
  }, [meter, range, window]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {params.map((p) => (
        <ChartCard key={p.key} title={`${p.label} — ${meter}`}>
          <HighchartsWrapper
            options={{
              chart: { type: "line", backgroundColor: "#0B0F1A" },
              title: { text: undefined },
              xAxis: { type: "datetime" },
              yAxis: { title: { text: p.label } },
              series: [
                {
                  type: "line",
                  name: p.label,
                  data: seriesData[p.key] || [],
                  color: p.key === "energy_kwh" ? "#22c55e" : "#38BDF8",
                },
              ],
            }}
            height={300}
          />
        </ChartCard>
      ))}
    </div>
  );
}