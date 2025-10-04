"use client";

import { useEffect, useState } from "react";

type Alert = {
  meter: string;
  current: number;
  baseline: number;
  ratio: number;
  severity: "low" | "medium" | "high";
  explanation: string;
};

const severityColors: Record<string, string> = {
  low: "bg-green-500/15 text-green-400 border border-green-500/20",
  medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  high: "bg-red-500/15 text-red-400 border border-red-500/20",
};

export default function ConsumptionAlerts({ range }: { range: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/consumption/alerts?range=${range}`);
      const json = await res.json();
      if (json.ok) setAlerts(json.alerts);
      else setAlerts([]);
      setLoading(false);
    }
    load();
  }, [range]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mt-8">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">
        Alertas de consumo inusual
      </h2>
      {loading ? (
        <div className="text-slate-400">Cargando alertas…</div>
      ) : alerts.length === 0 ? (
        <div className="text-slate-500">No se detectaron alertas en este rango.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 ${severityColors[a.severity]} shadow`}
            >
              <h3 className="text-sm font-semibold mb-2">{a.meter}</h3>
              <p className="text-slate-300 text-sm mb-2">{a.explanation}</p>
              <p className="text-xs text-slate-400">
                Actual: {a.current.toFixed(2)} kWh • Promedio:{" "}
                {a.baseline.toFixed(2)} kWh
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}