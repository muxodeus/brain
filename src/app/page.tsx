"use client";

import { useState } from "react";
import MultiParamDashboard from "@/components/MultiParamDashboard";
import MeterSelector from "@/components/MeterSelector";

export default function OverviewPage() {
  const [meter, setMeter] = useState<string>("pqgenius");
  const [range, setRange] = useState("-1h");

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MeterSelector value={meter} onChange={setMeter} />
        <div>
          <label className="block text-sm text-slate-400 mb-1">Rango histórico</label>
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
      </div>

      <MultiParamDashboard meter={meter} range={range} window="1m" />
    </div>
  );
}