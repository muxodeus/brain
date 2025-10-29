"use client";

import { useEffect, useState } from "react";
import { MdPriceChange } from "react-icons/md";

export default function TarifasPage() {
  const [puntaRate, setPuntaRate] = useState(0.18);
  const [valleRate, setValleRate] = useState(0.09);
  const [restoRate, setRestoRate] = useState(0.12);
  const [demandRate, setDemandRate] = useState(15);
  const [fpTarget, setFpTarget] = useState(0.9);
  const [fpPenaltyEnabled, setFpPenaltyEnabled] = useState(true);

  const [calcResult, setCalcResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Cargar configuración desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tariffs");
    if (saved) {
      const parsed = JSON.parse(saved);
      setPuntaRate(parsed.puntaRate ?? 0.18);
      setValleRate(parsed.valleRate ?? 0.09);
      setRestoRate(parsed.restoRate ?? 0.12);
      setDemandRate(parsed.demandRate ?? 15);
      setFpTarget(parsed.fpTarget ?? 0.9);
      setFpPenaltyEnabled(parsed.fpPenaltyEnabled ?? true);
    }
  }, []);

  // Guardar configuración en localStorage
  useEffect(() => {
    localStorage.setItem(
      "tariffs",
      JSON.stringify({
        puntaRate,
        valleRate,
        restoRate,
        demandRate,
        fpTarget,
        fpPenaltyEnabled,
      })
    );
  }, [puntaRate, valleRate, restoRate, demandRate, fpTarget, fpPenaltyEnabled]);

  // Simulación de cálculo de costos
  async function handleCalculate() {
    setLoading(true);
    try {
      const res = await fetch("/api/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalKWh: 12000, // ejemplo mensual
          peakKW: 450,     // ejemplo pico
          fp: 0.85,        // ejemplo FP real
          puntaRate,
          valleRate,
          restoRate,
          demandRate,
          fpPenaltyEnabled,
        }),
      });
      const json = await res.json();
      setCalcResult(json);
    } catch (err) {
      console.error("Error calculando costos:", err);
    } finally {
      setLoading(false);
    }
  }

  const format = (n: number | string) =>
    typeof n === "number"
      ? n < 1000
        ? n.toFixed(2)
        : n.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : n;

  const SkeletonBox = () => (
    <div className="h-6 bg-white/20 rounded animate-pulse w-32" />
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-8">
      <header className="flex items-center gap-2">
        <MdPriceChange className="text-3xl text-teal-400" />
        <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">
          Configuración — Tarifas
        </h1>
      </header>

      {/* Formulario de tarifas */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="text-sm text-white/70">Tarifa Punta ($/kWh)</label>
          <input
            type="number"
            step="0.01"
            value={puntaRate}
            onChange={(e) => setPuntaRate(parseFloat(e.target.value))}
            className="mt-1 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Tarifa Valle ($/kWh)</label>
          <input
            type="number"
            step="0.01"
            value={valleRate}
            onChange={(e) => setValleRate(parseFloat(e.target.value))}
            className="mt-1 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Tarifa Resto ($/kWh)</label>
          <input
            type="number"
            step="0.01"
            value={restoRate}
            onChange={(e) => setRestoRate(parseFloat(e.target.value))}
            className="mt-1 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Tarifa Demanda ($/kW)</label>
          <input
            type="number"
            step="0.01"
            value={demandRate}
            onChange={(e) => setDemandRate(parseFloat(e.target.value))}
            className="mt-1 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">Factor de potencia objetivo</label>
          <input
            type="number"
            step="0.01"
            value={fpTarget}
            onChange={(e) => setFpTarget(parseFloat(e.target.value))}
            className="mt-1 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={fpPenaltyEnabled}
            onChange={(e) => setFpPenaltyEnabled(e.target.checked)}
          />
          <span className="text-sm text-white/70">Aplicar penalización por FP bajo</span>
        </div>
      </section>

      {/* Botón de cálculo */}
      <button
        onClick={handleCalculate}
        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
      >
        Calcular ejemplo de costos
      </button>

      {/* Resultados */}
      <section className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold text-white/90">Resultados simulados</h2>
        <p>
          💡 Costo energía:{" "}
          {loading ? <SkeletonBox /> : `$${format(calcResult?.energyCost || 0)}`}
        </p>
        <p>
          ⚡ Costo demanda:{" "}
          {loading ? <SkeletonBox /> : `$${format(calcResult?.demandCost || 0)}`}
        </p>
        {fpPenaltyEnabled && (
          <p>
            ⚠️ Penalización FP:{" "}
            {loading ? <SkeletonBox /> : `$${format(calcResult?.penalty || 0)}`}
          </p>
        )}
        <p className="font-bold text-teal-400">
          Total: {loading ? <SkeletonBox /> : `$${format(calcResult?.totalCost || 0)}`}
        </p>
      </section>
    </div>
  );
}