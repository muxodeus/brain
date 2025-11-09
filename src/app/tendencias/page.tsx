"use client";

import { useState, useEffect } from "react";
import TendenciaCard from "@core/components/TendenciaCard";
import { getParamLabel } from "@/utils/getParamLabel";

export default function TendenciasPage() {
  const [sites, setSites] = useState<string[]>([]);
  const [meters, setMeters] = useState<string[]>([]);
  const [fields, setFields] = useState<{ field: string; label: string; unit: string; color?: string }[]>([]);

  const [site, setSite] = useState("");
  const [meter, setMeter] = useState("");
  const [range, setRange] = useState("-1h");

  // ✅ Estado para la hora de última actualización
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Defaults para las 6 gráficas
  const defaultParams = [
    "current_mean",     // Corriente
    "voltage_mean",     // Voltaje
    "vthd_mean",        // VTHD
    "p_act_mean",       // Potencia Activa
    "pf_mean",          // Factor de Potencia
    "ithd_mean",        // THD Corriente
  ];
  const [selectedParams, setSelectedParams] = useState<string[]>(defaultParams);

  // Mock data en vez de fetch
  useEffect(() => {
    const mockSites = ["Planta Avícola", "Data Center San Miguel", "Hospital Regional"];
    setSites(mockSites);
    if (!site) setSite(mockSites[0]);

    const mockMeters: Record<string, string[]> = {
      "Planta Avícola": ["Subestación 1", "Panel Proceso", "Panel Aire Acondicionado", "Panel Bombas"],
      "Data Center San Miguel": ["UPS Principal", "Panel Servidores", "Climatización"],
      "Hospital Regional": ["Subestación Principal", "Panel Emergencias", "Panel Quirófanos"],
    };
    setMeters(mockMeters[site] || []);
    if (!meter && mockMeters[site]) setMeter(mockMeters[site][0]);

    const mockFields = [
      "current_mean",
      "voltage_mean",
      "vthd_mean",
      "p_act_mean",
      "pf_mean",
      "ithd_mean",
      "freq_mean",
      "energy_act",
    ].map((f) => {
      const { label, unit, color } = getParamLabel(f);
      return { field: f, label, unit, color };
    });
    setFields(mockFields);
  }, [site]);

  // ✅ Calcular hora en cliente para evitar mismatch
  useEffect(() => {
    setLastUpdate(new Date().toLocaleString("es-SV", { hour12: false }));
  }, []);

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
          Última actualización: {lastUpdate || "—"}
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