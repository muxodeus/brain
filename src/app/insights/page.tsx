"use client";

import { useEffect, useState } from "react";
import AnomalyCard, { Anomaly } from "@core/components/AnomalyCard";
import MeterSelector from "@core/components/MeterSelector";
import AlertTimeline from "@core/components/AlertTimeline";

export default function InsightsPage() {
  const [meter, setMeter] = useState("pqgenius");
  const [range, setRange] = useState("-1h");
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(
        `/api/anomalies?meter=${meter}&range=${range}&window=1m`
      );
      const json = await res.json();
      if (json.ok) setAnomalies(json.anomalies);
      else setAnomalies([]);
      setLoading(false);
    }
    load();
  }, [meter, range]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Insights y Anomalías</h1>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <MeterSelector value={meter} onChange={setMeter} label="Medidor" />
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Rango histórico
            </label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 w-full"
            >
              <option value="-5m">Últimos 5 min</option>
              <option value="-1h">Última hora</option>
              <option value="-24h">Últimas 24h</option>
              <option value="-7d">Últimos 7 días</option>
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-xs text-slate-500">
              Algoritmo MAD (Median Absolute Deviation) aplicado por ventana de
              1m.
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400">Cargando anomalías…</div>
        ) : anomalies.length === 0 ? (
          <div className="text-slate-500">
            No se detectaron anomalías en este rango.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {anomalies.map((a, i) => (
                <AnomalyCard
                  key={`${a.param}-${i}-${a.timestamp}`}
                  anomaly={a}
                />
              ))}
            </div>

            {/* Timeline global, no repetido por anomalía */}
            <AlertTimeline range="-30d" />
          </>
        )}
      </div>
    </div>
  );
}