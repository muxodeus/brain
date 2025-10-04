"use client";

import { useEffect, useState } from "react";

type Alert = {
  type: "param" | "group";
  param?: string;
  groupA?: string;
  groupB?: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  explanation: string;
};

const severityColors: Record<string, string> = {
  low: "border-green-400 text-green-400",
  medium: "border-yellow-400 text-yellow-400",
  high: "border-red-400 text-red-400",
};

export default function AlertTimeline({
  range,
}: {
  range: string;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "param" | "group">("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/alerts/timeline?range=${range}`);
      const json = await res.json();
      if (json.ok) setAlerts(json.alerts);
      else setAlerts([]);
      setLoading(false);
    }
    load();
  }, [range]);

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-200">Histórico de alertas</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
        >
          <option value="all">Todas</option>
          <option value="param">Parámetros</option>
          <option value="group">Consumos de grupos</option>
        </select>
      </div>

      {loading ? (
        <div className="text-slate-400">Cargando timeline…</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-500">No se detectaron alertas en este rango.</div>
      ) : (
        <ul className="relative border-l border-slate-700">
          {filtered.map((a, i) => (
            <li key={i} className="mb-6 ml-4">
              <div
                className={`absolute w-3 h-3 rounded-full -left-1.5 border ${severityColors[a.severity]} bg-slate-900`}
              ></div>
              <time className="mb-1 text-xs text-slate-400">
                {new Date(a.timestamp).toLocaleString()}
              </time>
              <h3 className="text-sm font-semibold text-slate-200">
                {a.type === "param"
                  ? `Anomalía en ${a.param}`
                  : `Comparación ${a.groupA} vs ${a.groupB}`}
              </h3>
              <p className="text-slate-300 text-sm">{a.explanation}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}