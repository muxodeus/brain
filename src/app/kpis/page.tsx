"use client";

import { useEffect, useMemo, useState } from "react";

// 🚦 Semáforo dinámico con bandas y pendiente
function getAlarmColor(value: number, min: number, max: number, series?: number[]): string {
  if (!Number.isFinite(value)) return "bg-slate-500";

  const span = max - min || 1;
  const dist = Math.min(1, Math.max(0, (value - min) / span)); // 0..1
  const nearEdge = dist < 0.1 || dist > 0.9;
  const warnBand = dist < 0.2 || dist > 0.8;
  const midBand = dist >= 0.2 && dist <= 0.8;

  // pendiente (sensibilidad al trend)
  let slope = 0;
  if (series && series.length >= 2) {
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    slope = last - prev;
  }

  if (value < min || value > max) return "bg-red-600";
  if (nearEdge && Math.abs(slope) > 0.8) return "bg-orange-500"; // borde + pendiente alta
  if (warnBand) return "bg-yellow-400";
  if (midBand && Math.abs(slope) > 0.6) return "bg-green-400"; // bien, pero cambiante
  return "bg-green-600";
}

// Clase semántica por métrica (para colores)
function getParamClass(field: string): string {
  const f = field.toLowerCase();
  if (f.includes("voltaje")) return "voltage";
  if (f.includes("corriente")) return "current";
  if (f.includes("potencia activa")) return "p-act";
  if (f.includes("potencia reactiva")) return "p-react";
  if (f.includes("potencia aparente")) return "p-app";
  if (f.includes("factor")) return "pf";
  if (f.includes("vthd")) return "vthd";
  if (f.includes("hp")) return "hp";
  if (f.includes("torque")) return "torque";
  if (f.includes("velocidad")) return "speed";
  if (f.includes("secuencia")) return "seq";
  if (f.includes("temperatura")) return "temp";
  if (f.includes("vibración")) return "vibration";
  if (f.includes("irradiancia")) return "irradiance";
  if (f.includes("eficiencia")) return "efficiency";
  if (f.includes("kvar")) return "kvar";
  if (f.includes("etapas")) return "stages";
  if (f.includes("dc")) return "voltage"; // estilo compartido para DC
  if (f.includes("thd i")) return "thd-i";
  if (f.includes("thd v")) return "thd-v";
  if (f.includes("conmutaciones")) return "switching";
  if (f.includes("energía")) return "energy";
  return "default";
}

// Sparkline con ejes X/Y y ticks
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return <div className="text-xs text-slate-400">Sin datos</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = ((d - min) / (max - min || 1)) * 30;
      return `${x},${30 - y}`;
    })
    .join(" ");

  const tickStep = Math.ceil(data.length / 6);
  const ticks = [];
  for (let i = 0; i < data.length; i += tickStep) {
    const x = (i / (data.length - 1)) * 100 + 5;
    ticks.push({ x, label: `${i}` });
  }

  return (
    <svg viewBox="0 0 120 45" className="w-full h-16">
      <line x1="5" y1="35" x2="115" y2="35" stroke="#64748b" strokeWidth="0.5" />
      <line x1="5" y1="5" x2="5" y2="35" stroke="#64748b" strokeWidth="0.5" />
      <text x="0" y="38" fontSize="5" fill="#94a3b8">{min}</text>
      <text x="0" y="12" fontSize="5" fill="#94a3b8">{max}</text>
      {ticks.map((t, idx) => (
        <text key={idx} x={t.x} y="42" fontSize="5" fill="#94a3b8">{t.label}</text>
      ))}
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} transform="translate(5,5)" />
    </svg>
  );
}

// 📦 Card reutilizable (incluye semáforo sensible a tendencia)
function Card({
  label,
  value,
  unit,
  min,
  max,
  series,
}: {
  label: string;
  value: number | string;
  unit: string;
  min: number;
  max: number;
  series?: number[];
}) {
  const paramClass = getParamClass(label);
  const isNumber = typeof value === "number" && Number.isFinite(value as number);
  const alarmColor = isNumber ? getAlarmColor(value as number, min, max, series) : "bg-slate-500";
  return (
    <div className="p-4 rounded-lg shadow flex flex-col text-white bg-slate-800">
      <div className={`w-full h-1 rounded-t mb-2 ${alarmColor}`} />
      <div className="text-sm opacity-80">{label}</div>
      <div className="text-xl font-bold" style={{ color: `hsl(var(--${paramClass}))` }}>
        {isNumber ? value : "—"} {unit}
      </div>
    </div>
  );
}

const tabs = [
  { id: "panel", label: "Panel" },
  { id: "motor", label: "Motor" },
  { id: "solar", label: "Panel Solar" },
  { id: "capacitores", label: "Banco de Capacitores" },
];

export default function KPIsPage() {
  const [data, setData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("panel");
  const [selectedMedidor, setSelectedMedidor] = useState("M1");

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/kpis");
      const json = await res.json();
      setData(json);
    }
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const medidorData = data[selectedMedidor];
  // Render fila de KPIs (7 métricas por canal)
  const renderChannelRow = (channel: "A" | "B" | "C" | "Total") => {
    if (!medidorData || !medidorData[channel]) return null;
    const metrics = [
      { key: "voltage", label: `Voltaje ${channel}`, unit: "V", min: 210, max: 240 },
      { key: "current", label: `Corriente ${channel}`, unit: "A", min: 0, max: 250 },
      { key: "p_act", label: `Potencia Activa ${channel}`, unit: "kW", min: 0, max: 800 },
      { key: "p_react", label: `Potencia Reactiva ${channel}`, unit: "kvar", min: 0, max: 800 },
      { key: "p_app", label: `Potencia Aparente ${channel}`, unit: "kVA", min: 0, max: 800 },
      { key: "pf", label: `Factor de Potencia ${channel}`, unit: "", min: 0, max: 1 },
      { key: "vthd", label: `Vthd ${channel}`, unit: "%", min: 0, max: 5 },
    ];
    return (
      <div className="space-y-2 mb-6">
        <div className="text-xs text-slate-400 font-medium">
          {channel === "Total" ? "Canal Total" : `Canal ${channel}`}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {metrics.map((m) => {
            const series: number[] = medidorData[channel][m.key] ?? [];
            const value = series.length > 0 ? series[series.length - 1] : "—";
            return (
              <Card
                key={`${channel}-${m.key}`}
                label={m.label}
                value={value}
                unit={m.unit}
                min={m.min}
                max={m.max}
                series={series}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // Tendencias del canal Total
  const renderTrendsTotal = () => {
    if (!medidorData || !medidorData.Total) return null;
    const metrics = [
      { key: "voltage", label: "Voltaje Total" },
      { key: "current", label: "Corriente Total" },
      { key: "p_act", label: "Potencia Activa Total" },
      { key: "pf", label: "Factor de Potencia Total" },
    ];
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-medium">Tendencias</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {metrics.map((m) => {
            const series: number[] = medidorData.Total[m.key] ?? [];
            const paramClass = getParamClass(m.label);
            return (
              <div
                key={`trend-${m.key}`}
                className={`p-4 rounded-lg shadow bg-slate-800 text-white flex flex-col border-t-4 border-${paramClass}`}
              >
                <div className="text-sm mb-2">{m.label}</div>
                <Sparkline data={series} color={`hsl(var(--${paramClass}))`} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Dashboard de Valores en Tiempo Real</h1>
        <div className="text-xs text-slate-400">
          Última actualización: {new Date().toLocaleString("es-SV", { hour12: false })}
        </div>
      </header>

      {/* Tabs + Picklist (medidores) */}
      <div className="flex gap-4 mb-4 items-center">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded ${activeTab === t.id ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={selectedMedidor}
          onChange={(e) => setSelectedMedidor(e.target.value)}
          className="bg-slate-800 text-white px-3 py-2 rounded border border-slate-600"
        >
          <option value="M1">Subestación Principal</option>
          <option value="M2">Panel Compresores</option>
          <option value="M3">Panel Servicios Auxiliares</option>
        </select>
      </div>

      {/* Pestaña Panel */}
      {activeTab === "panel" && (
        <>
          {renderChannelRow("A")}
          {renderChannelRow("B")}
          {renderChannelRow("C")}
          {renderChannelRow("Total")}
          {renderTrendsTotal()}
        </>
      )}

      {/* Pestaña Motor */}
      {activeTab === "motor" && medidorData && (
        <div className="space-y-6">
          <div className="text-xs text-slate-400 font-medium">KPIs del motor — {selectedMedidor}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { key: "hp", label: "Potencia HP", unit: "HP", min: 0, max: 500 },
              { key: "p_act", label: "Potencia Activa Motor", unit: "kW", min: 0, max: 800 },
              { key: "seq", label: "Secuencia Negativa", unit: "%", min: 0, max: 5 },
              { key: "torque", label: "Torque", unit: "Nm", min: 0, max: 500 },
              { key: "speed", label: "Velocidad", unit: "RPM", min: 1400, max: 1800 },
              { key: "temp", label: "Temperatura Estator", unit: "°C", min: 20, max: 120 },
              { key: "vibration", label: "Vibración RMS", unit: "mm/s", min: 0, max: 5 },
              { key: "pf", label: "Factor de Potencia Motor", unit: "", min: 0.85, max: 1 },
              { key: "current", label: "Corriente Motor", unit: "A", min: 0, max: 250 },
            ].map(m => {
              const series: number[] = medidorData.Total[m.key] ?? [];
              const value = series.length ? series[series.length - 1] : "—";
              return <Card key={`motor-${m.key}`} label={m.label} value={value} unit={m.unit} min={m.min} max={m.max} series={series} />;
            })}
          </div>
          <div className="text-xs text-slate-400">Tendencias clave</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { key: "hp", label: "Potencia HP", class: "hp" },
              { key: "torque", label: "Torque", class: "torque" },
              { key: "speed", label: "Velocidad", class: "speed" },
              { key: "seq", label: "Secuencia negativa", class: "seq" },
            ].map(m => {
              const series: number[] = medidorData.Total[m.key] ?? [];
              return (
                <div key={`motor-trend-${m.key}`} className={`p-4 rounded-lg shadow bg-slate-800 text-white flex flex-col border-t-4 border-${m.class}`}>
                  <div className="text-sm mb-2">{m.label}</div>
                  <Sparkline data={series} color={`hsl(var(--${m.class}))`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pestaña Panel Solar (más KPIs) */}
      {activeTab === "solar" && medidorData && (
        <div className="space-y-6">
          <div className="text-xs text-slate-400 font-medium">KPIs del panel solar — {selectedMedidor}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { key: "irradiance", label: "Irradiancia", unit: "W/m²", min: 0, max: 1000 },
              { key: "dc_voltage", label: "Voltaje DC", unit: "V", min: 400, max: 1000 },
              { key: "dc_current", label: "Corriente DC", unit: "A", min: 0, max: 50 },
              { key: "p_act", label: "Potencia Generada", unit: "kW", min: 0, max: 800 },
              { key: "efficiency", label: "Eficiencia panel", unit: "%", min: 10, max: 25 },
              { key: "inverter_temp", label: "Temperatura inversor", unit: "°C", min: 20, max: 80 },
              { key: "inverter_eff", label: "Eficiencia inversor", unit: "%", min: 90, max: 100 },
              { key: "energy_today", label: "Energía del día", unit: "kWh", min: 0, max: 300 },
            ].map(m => {
              const series: number[] = medidorData.Total[m.key] ?? [];
              const value = series.length ? series[series.length - 1] : "—";
              return <Card key={`solar-${m.key}`} label={m.label} value={value} unit={m.unit} min={m.min} max={m.max} series={series} />;
            })}
          </div>
          <div className="text-xs text-slate-400">Tendencias clave</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { key: "irradiance", label: "Irradiancia", class: "irradiance" },
              { key: "dc_voltage", label: "Voltaje DC", class: "voltage" },
              { key: "dc_current", label: "Corriente DC", class: "current" },
              { key: "inverter_eff", label: "Eficiencia inversor", class: "efficiency" },
            ].map(m => {
              const series: number[] = medidorData.Total[m.key] ?? [];
              return (
                <div key={`solar-trend-${m.key}`} className={`p-4 rounded-lg shadow bg-slate-800 text-white flex flex-col border-t-4 border-${m.class}`}>
                  <div className="text-sm mb-2">{m.label}</div>
                  <Sparkline data={series} color={`hsl(var(--${m.class}))`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pestaña Banco de Capacitores (más KPIs + etapas enteras) */}
      {activeTab === "capacitores" && medidorData && (
        <div className="space-y-6">
          <div className="text-xs text-slate-400 font-medium">KPIs del banco de capacitores — {selectedMedidor}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { key: "kvar", label: "kVar aportados", unit: "kvar", min: 0, max: 300 },
              { key: "pf_corrected", label: "PF corregido", unit: "", min: 0.9, max: 1 },
              { key: "stages", label: "Etapas activas", unit: "", min: 0, max: 4 },
              { key: "thd_i", label: "THD Corriente", unit: "%", min: 0, max: 12 },
              { key: "thd_v", label: "THD Voltaje", unit: "%", min: 0, max: 8 },
              { key: "switching_count", label: "Conmutaciones", unit: "", min: 0, max: 40 },
              { key: "p_act", label: "P Activa Total", unit: "kW", min: 0, max: 800 },
              { key: "pf", label: "PF Total", unit: "", min: 0.85, max: 1 },
            ].map(m => {
              const series: number[] = medidorData.Total[m.key] ?? [];
              const value = series.length ? series[series.length - 1] : "—";
              const displayValue = m.key === "stages" && typeof value === "number" ? Math.round(value) : value;
              return <Card key={`cap-${m.key}`} label={m.label} value={displayValue} unit={m.unit} min={m.min} max={m.max} series={series} />;
            })}
          </div>
          <div className="text-xs text-slate-400">Tendencias clave</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { key: "kvar", label: "kVar aportados", class: "kvar" },
              { key: "pf_corrected", label: "PF corregido", class: "pf" },
              { key: "thd_i", label: "THD Corriente", class: "thd-i" },
              { key: "stages", label: "Etapas activas", class: "stages" },
            ].map(m => {
              const series: number[] = medidorData.Total[m.key] ?? [];
              // Convertir a enteros en el sparkline de etapas
              const s = m.key === "stages" ? series.map(v => Math.round(v)) : series;
              return (
                <div key={`cap-trend-${m.key}`} className={`p-4 rounded-lg shadow bg-slate-800 text-white flex flex-col border-t-4 border-${m.class}`}>
                  <div className="text-sm mb-2">{m.label}</div>
                  <Sparkline data={s} color={`hsl(var(--${m.class}))`} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}