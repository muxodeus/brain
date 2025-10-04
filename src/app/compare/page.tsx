"use client";

import { useState } from "react";
import MeterSelector from "@/components/MeterSelector";
import CompareChart from "@/components/CompareChart";

const params = [
  { key: "voltage_A", label: "Voltaje (V)" },
  { key: "current_A", label: "Corriente (A)" },
  { key: "power_kW", label: "Potencia (kW)" },
  { key: "freq_Hz", label: "Frecuencia (Hz)" },
  { key: "energy_kwh", label: "Energía (kWh)" },
];

export default function ComparePage() {
  const [meterA, setMeterA] = useState("pqgenius");
  const [meterB, setMeterB] = useState("pqgenius");
  const [range, setRange] = useState("-1h");

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Comparación entre medidores</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MeterSelector value={meterA} onChange={setMeterA} label="Medidor A" />
        <MeterSelector value={meterB} onChange={setMeterB} label="Medidor B" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {params.map((p) => (
          <CompareChart
            key={p.key}
            param={p.key}
            label={p.label}
            meterA={meterA}
            meterB={meterB}
            range={range}
          />
        ))}
      </div>
    </div>
  );
}