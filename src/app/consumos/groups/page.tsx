"use client";

import { useState } from "react";
import GroupConsumptionChart from "@core/components/GroupConsumptionChart";
import GroupConsumptionAlerts from "@core/components/GroupConsumptionAlerts";
import AlertTimeline from "@core/components/AlertTimeline";

export default function GroupConsumosPage() {
  const [range, setRange] = useState("-7d");

  const groups = [
    { name: "Site A", meters: ["medidor1", "medidor2"] },
    { name: "Site B", meters: ["medidor3", "medidor4"] },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Comparación de grupos</h1>

      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-1">Rango histórico</label>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
        >
          <option value="-24h">Últimas 24h</option>
          <option value="-7d">Últimos 7 días</option>
          <option value="-30d">Últimos 30 días</option>
        </select>
      </div>

      <GroupConsumptionChart groups={groups} range={range} window="1d" />
      <GroupConsumptionAlerts groups={groups} range={range} window="1d" />
      <GroupConsumptionChart groups={groups} range={range} window="1d" />
<GroupConsumptionAlerts groups={groups} range={range} window="1d" />
<AlertTimeline range={range} />
    </div>
  );
}