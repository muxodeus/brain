"use client";

import { useEffect, useState } from "react";

type Alert = {
  groupA: string;
  groupB: string;
  ratio: number;
  severity: "medium" | "high";
  explanation: string;
};

const severityColors: Record<string, string> = {
  medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  high: "bg-red-500/15 text-red-400 border border-red-500/20",
};

export default function GroupConsumptionAlerts({
  groups,
  range,
  window = "1d",
}: {
  groups: { name: string; meters: string[] }[];
  range: string;
  window?: string;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/consumption/groups/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups, range, window }),
      });
      const json = await res.json();
      if (json.ok) setAlerts(json.alerts);
      else setAlerts([]);
      setLoading(false);
    }
    load();
  }, [groups, range, window]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mt-8">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">
        Alertas de consumo entre grupos
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
              <h3 className="text-sm font-semibold mb-2">
                {a.groupA} vs {a.groupB}
              </h3>
              <p className="text-slate-300 text-sm">{a.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}