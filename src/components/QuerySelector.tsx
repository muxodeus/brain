"use client";

import { useState } from "react";

type Props = {
  onRunQuery: (medidores: string[], fields: string[], rango: string) => void;
};

const parametros = [
  { label: "Voltaje", value: "voltage_A" },
  { label: "Corriente", value: "current_A" },
  { label: "Potencia", value: "power_kW" },
  { label: "Energía", value: "energy_kWh" },
  { label: "Frecuencia", value: "freq_Hz" },
];

const medidoresDisponibles = ["pqgenius", "medidor1", "medidor2", "medidor3"];

export default function QuerySelector({ onRunQuery }: Props) {
  const [selectedMedidores, setSelectedMedidores] = useState<string[]>(["pqgenius"]);
  const [selectedFields, setSelectedFields] = useState<string[]>(["voltage_A"]);
  const [rango, setRango] = useState("24h");

  function toggleMedidor(m: string) {
    setSelectedMedidores((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  function toggleField(f: string) {
    setSelectedFields((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  return (
    <div className="bg-slate-800 p-4 rounded space-y-4">
      <h2 className="text-lg font-semibold text-white">Configurar consulta</h2>

      {/* Medidores */}
      <div>
        <h3 className="text-slate-300 mb-2">Medidores</h3>
        <div className="flex flex-wrap gap-3">
          {medidoresDisponibles.map((m) => (
            <label key={m} className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={selectedMedidores.includes(m)}
                onChange={() => toggleMedidor(m)}
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* Parámetros */}
      <div>
        <h3 className="text-slate-300 mb-2">Parámetros</h3>
        <div className="flex flex-wrap gap-3">
          {parametros.map((p) => (
            <label key={p.value} className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={selectedFields.includes(p.value)}
                onChange={() => toggleField(p.value)}
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      {/* Rango */}
      <div>
        <h3 className="text-slate-300 mb-2">Rango de tiempo</h3>
        <select
          value={rango}
          onChange={(e) => setRango(e.target.value)}
          className="bg-slate-700 text-white px-3 py-2 rounded"
        >
          <option value="24h">Últimas 24h</option>
          <option value="48h">Últimas 48h</option>
          <option value="7d">Última semana</option>
          <option value="30d">Último mes</option>
        </select>
      </div>

      <button
        onClick={() => onRunQuery(selectedMedidores, selectedFields, rango)}
        className="bg-blue-600 px-4 py-2 rounded text-white"
      >
        Ejecutar consulta
      </button>
    </div>
  );
}