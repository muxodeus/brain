"use client";

import { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { useMeter } from "@/context/MeterContext";
import CompareChart from "@/components/CompareChart";

export default function ComparePage() {
  const { config } = useConfig();
  const { selectedMeter } = useMeter(); // usamos el global como base
  const [meterA, setMeterA] = useState(selectedMeter);
  const [meterB, setMeterB] = useState(config.meters[1] || selectedMeter);
  const [param, setParam] = useState(config.params[0].field);
  const [range, setRange] = useState(config.ranges[1].value);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Comparación de Medidores</h2>

      {/* Selectores dinámicos */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Medidor A */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Medidor A</label>
          <select
            value={meterA}
            onChange={(e) => setMeterA(e.target.value)}
            className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm"
          >
            {config.meters.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Medidor B */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Medidor B</label>
          <select
            value={meterB}
            onChange={(e) => setMeterB(e.target.value)}
            className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm"
          >
            {config.meters.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Parámetro */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Parámetro</label>
          <select
            value={param}
            onChange={(e) => setParam(e.target.value)}
            className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm"
          >
            {config.params.map((p) => (
              <option key={p.field} value={p.field}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rango */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Rango</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm"
          >
            {config.ranges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CompareChart meterA={meterA} meterB={meterB} param={param} range={range} />
    </div>
  );
}