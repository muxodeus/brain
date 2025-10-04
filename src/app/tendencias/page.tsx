"use client";

import { useEffect, useState } from "react";
import HighchartsWrapper from "@/components/HighchartsWrapper";

type Series = { name: string; type: string; data: any[] };

const params = [
  { field: "voltage_A", label: "Voltaje (V)" },
  { field: "current_A", label: "Corriente (A)" },
  { field: "power_kW", label: "Potencia (kW)" },
  { field: "freq_Hz", label: "Frecuencia (Hz)" },
];

export default function TendenciasPage() {
  const [range, setRange] = useState("-24h");
  const [meter, setMeter] = useState<string>("pqgenius");
  const [meters, setMeters] = useState<string[]>([]);
  const [seriesMap, setSeriesMap] = useState<Record<string, Series>>({});

  // Cargar lista de medidores dinámicamente
  useEffect(() => {
    async function loadMeters() {
      try {
        const res = await fetch("/api/metrics/meta", { cache: "no-store" });
        const json = await res.json();
        if (json.ok && json.meters) {
          setMeters(json.meters);
          if (!json.meters.includes(meter)) {
            setMeter(json.meters[0]); // seleccionar el primero si el actual no existe
          }
        }
      } catch (err) {
        console.error("❌ Error cargando medidores:", err);
      }
    }
    loadMeters();
  }, []);

  // Cargar series de cada parámetro
  useEffect(() => {
    async function loadAll() {
      const newSeries: Record<string, Series> = {};
      for (const p of params) {
        const window =
          range === "-1h" ? "10m" : range === "-24h" ? "1h" : "1d";

        try {
          const res = await fetch(
            `/api/metrics?meter=${meter}&param=${p.field}&range=${range}&window=${window}`,
            { cache: "no-store" }
          );
          const json = await res.json();
          if (json.ok && json.rows) {
            const data = json.rows.map((r: any) => [
              new Date(r._time).getTime(),
              Number(r._value),
            ]);
            newSeries[p.field] = { name: p.label, type: "line", data };
          }
        } catch (err) {
          console.error(`❌ Error cargando ${p.field}:`, err);
        }
      }
      setSeriesMap(newSeries);
    }
    if (meter) loadAll();
  }, [range, meter]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Tendencias</h1>

      {/* Picklists */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm text-slate-500 mb-1">Rango</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2"
          >
            <option value="-1h">Última hora</option>
            <option value="-24h">Últimas 24h</option>
            <option value="-7d">Últimos 7 días</option>
            <option value="-30d">Últimos 30 días</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-500 mb-1">Medidor</label>
          <select
            value={meter}
            onChange={(e) => setMeter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2"
          >
            {meters.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {params.map((p) => (
          <div
            key={p.field}
            className="rounded-lg bg-white dark:bg-slate-900 p-5 shadow"
          >
            <h3 className="text-sm font-semibold mb-2">{p.label}</h3>
            {seriesMap[p.field] ? (
              <HighchartsWrapper
                options={{
                  chart: { type: "line", backgroundColor: "transparent" },
                  title: { text: undefined },
                  xAxis: { type: "datetime" },
                  yAxis: { title: { text: p.label } },
                  series: [seriesMap[p.field]],
                }}
                height={300}
              />
            ) : (
              <p className="text-sm text-slate-500">Cargando datos...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}