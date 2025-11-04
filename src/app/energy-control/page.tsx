"use client";

import { useState, useEffect } from "react";
import HighchartsWrapper from "@core/components/HighchartsWrapper";

export default function EnergyControlPage() {
  const [range, setRange] = useState("-7d");
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    async function loadChart() {
      const res = await fetch(`/api/consumption?meter=pqgenius&range=${range}&window=1d`);
      const json = await res.json();
      console.log("Chart data:", json);
      if (json.ok && json.rows) {
        const data = json.rows.map((r: any) => [
          new Date(r._time).getTime(),
          Number(r._value),
        ]);
        setSeries([{ name: "pqgenius", type: "column", data }]);
      }
    }
    loadChart();
  }, [range]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Energy Control Center</h1>

      <div className="mb-6">
        <label className="block text-sm text-slate-500 mb-1">Rango histórico</label>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-700 dark:text-slate-200"
        >
          <option value="-24h">Últimas 24h</option>
          <option value="-7d">Últimos 7 días</option>
          <option value="-30d">Últimos 30 días</option>
        </select>
      </div>

      <div className="rounded-lg bg-white dark:bg-slate-900 p-5 shadow mb-8">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Consumo energético
        </h3>
        {series.length > 0 ? (
          <HighchartsWrapper
            options={{
              chart: { type: "column", backgroundColor: "transparent" },
              title: { text: undefined },
              xAxis: { type: "datetime" },
              yAxis: { title: { text: "kWh" } },
              series,
              tooltip: { shared: true },
            }}
            height={400}
          />
        ) : (
          <p className="text-sm text-slate-500">No hay datos disponibles en este rango.</p>
        )}
      </div>
    </div>
  );
}