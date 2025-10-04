"use client";

import { useEffect, useState } from "react";

const KPI_OPTIONS = [
  { key: "totalConsumption", label: "Consumo total" },
  { key: "topMeter", label: "Top consumidor" },
  { key: "maxDemand", label: "Demanda máxima" },
  { key: "voltageDeviations", label: "Desviaciones de tensión" },
  { key: "voltageNow", label: "Tensión actual" },
  { key: "freqNow", label: "Frecuencia actual" },
  { key: "pfAvg", label: "Factor de potencia promedio" },
];

export default function KpiCards({ range }: { range: string }) {
  const [summary, setSummary] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);

  // Cargar perfil guardado
  useEffect(() => {
    const saved = localStorage.getItem("kpiProfile");
    if (saved) setSelected(JSON.parse(saved));
    else setSelected(KPI_OPTIONS.map((k) => k.key));
  }, []);

  // Guardar perfil
  const saveProfile = (name: string) => {
    localStorage.setItem("kpiProfile", JSON.stringify(selected));
    alert(`Perfil "${name}" guardado`);
  };

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/energy/summary?range=${range}`);
      const json = await res.json();
      if (json.ok) setSummary(json.summary);
    }
    load();
  }, [range]);

  if (!summary) return <div className="text-slate-400">Cargando KPIs…</div>;

  return (
    <div>
      {/* Selector de KPIs */}
      <div className="flex flex-wrap gap-3 mb-4">
        {KPI_OPTIONS.map((opt) => (
          <label key={opt.key} className="flex items-center gap-1 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={selected.includes(opt.key)}
              onChange={() =>
                setSelected((prev) =>
                  prev.includes(opt.key)
                    ? prev.filter((k) => k !== opt.key)
                    : [...prev, opt.key]
                )
              }
              className="accent-sky-500"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Botón para guardar perfil */}
      <button
        onClick={() => saveProfile("Operador")}
        className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1 rounded mb-6"
      >
        Guardar perfil Operador
      </button>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {selected.map((key) => (
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div className="rounded-lg bg-white dark:bg-slate-900 p-5 shadow">
    <h3 className="text-xs text-slate-500">Consumo total</h3>
    <p className="text-2xl font-bold text-sky-600">
      {summary.totalConsumption.toFixed(2)} kWh
    </p>
  </div>
  {/* ... resto de KPIs con el mismo estilo */}
</div>
        ))}
      </div>
    </div>
  );
}