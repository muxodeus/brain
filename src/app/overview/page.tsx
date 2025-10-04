"use client";

import { useEffect, useState } from "react";
import { useMeter } from "@/context/MeterContext";

export default function OverviewPage() {
  const { meter, setMeter } = useMeter();
  const [meters, setMeters] = useState<string[]>([]);

  useEffect(() => {
    async function loadMeters() {
      const res = await fetch("/api/metrics/meta", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.meters) setMeters(json.meters);
    }
    loadMeters();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Overview</h1>

      {/* Selector global de medidor */}
      <div className="mb-6">
        <label className="block text-sm text-slate-500 mb-1">Medidor</label>
        <select
          value={meter}
          onChange={(e) => setMeter(e.target.value)}
          className="bg-white dark:bg-slate-900 border rounded px-3 py-2"
        >
          {meters.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Aquí tus KPIs y gráficas, usando `meter` */}
    </div>
  );
}