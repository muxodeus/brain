"use client";

import { useState, useEffect } from "react";
import TendenciaCard from "@/components/TendenciaCard";
import { paramAliases } from "@/config/paramAliases";



// Alias de parámetros → nombres legibles en español
const paramAliases: Record<string, { label: string; unit: string }> = {
  voltage_mean: { label: "Voltaje RMS", unit: "V" },
  current_mean: { label: "Corriente RMS", unit: "A" },
  frequency_mean: { label: "Frecuencia", unit: "Hz" },
  p_act_mean: { label: "Potencia Activa", unit: "kW" },
  pf_mean: { label: "Factor de Potencia", unit: "" },
  ithd_mean: { label: "THD Corriente", unit: "%" },
  vthd_mean: { label: "THD Voltaje", unit: "%" },
  // agrega más según tus métricas
};

export default function TendenciasPage() {
  const [sites, setSites] = useState<string[]>([]);
  const [meters, setMeters] = useState<string[]>([]);
  const [fields, setFields] = useState<{ field: string; label: string; unit: string }[]>([]);

  const [site, setSite] = useState("");
  const [meter, setMeter] = useState("");
  const [range, setRange] = useState("-1h");

  // Defaults para las 6 gráficas
  const defaultParams = [
    "current_mean",     // Corriente
    "voltage_mean",     // Voltaje
    "vthd_mean",        // VTHD (en vez de frecuencia)
    "p_act_mean",       // Potencia Activa
    "pf_mean",          // Factor de Potencia
    "ithd_mean",        // THD Corriente
  ];
  const [selectedParams, setSelectedParams] = useState<string[]>(defaultParams);

  // Cargar sitios, medidores y fields
  useEffect(() => {
    async function fetchSites() {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(data);
      if (data.length > 0 && !site) setSite(data[0]);
    }
    async function fetchMeters() {
      if (!site) return;
      const res = await fetch(`/api/meters?site=${encodeURIComponent(site)}`);
      const data = await res.json();
      setMeters(data);
      if (data.length > 0 && !meter) setMeter(data[0]);
    }
async function fetchFields() {
  const res = await fetch("/api/fields");
  const data = await res.json();
  const mapped = data.map((f: string) => {
    if (paramAliases[f]) {
      return { field: f, label: paramAliases[f].label, unit: paramAliases[f].unit };
    }
    return { field: f, label: f.replace("_mean", "").toUpperCase(), unit: "" };
  });
  setFields(mapped);
}
    fetchSites();
    fetchMeters();
    fetchFields();
  }, [site, meter]);

  const updateParam = (index: number, newParam: string) => {
    const updated = [...selectedParams];
    updated[index] = newParam;
    setSelectedParams(updated);
  };

  const quickRanges = [
    { label: "1h", value: "-1h" },
    { label: "24h", value: "-24h" },
    { label: "7d", value: "-7d" },
    { label: "30d", value: "-30d" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📈 Tendencias</h2>
        <div className="text-xs text-slate-400">
          Última actualización: {new Date().toLocaleString("es-SV", { hour12: false })}
        </div>
      </header>

      {/* Controles superiores */}
      <div className="flex flex-wrap gap-4 items-center bg-slate-900 p-4 rounded-lg shadow">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Sitio</label>
          <select
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm min-w-48"
          >
            {sites.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Medidor</label>
          <select
            value={meter}
            onChange={(e) => setMeter(e.target.value)}
            className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm min-w-48"
          >
            {meters.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Rango</span>
          <div className="flex gap-2">
            {quickRanges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 rounded text-sm ${
                  range === r.value ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de 6 gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {selectedParams.map((param, i) => (
          <TendenciaCard
            key={i}
            site={site}
            meter={meter}
            param={param}
            range={range}
            allParams={fields}
            onParamChange={(newParam) => updateParam(i, newParam)}
          />
        ))}
      </div>
    </div>
  );
}