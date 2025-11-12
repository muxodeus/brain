"use client";

import { useEffect, useState } from "react";
import { MdPriceChange } from "react-icons/md";
import { FaBolt, FaChartLine, FaBalanceScale } from "react-icons/fa";

export default function TarifasPage() {
  const [puntaRate, setPuntaRate] = useState(0.18);
  const [valleRate, setValleRate] = useState(0.09);
  const [restoRate, setRestoRate] = useState(0.12);
  const [demandRate, setDemandRate] = useState(15);
  const [fpTarget, setFpTarget] = useState(0.9);
  const [fpPenaltyEnabled, setFpPenaltyEnabled] = useState(true);

  const [calcResult, setCalcResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

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
    setSavedMsg("✅ Configuración guardada");
    const timer = setTimeout(() => setSavedMsg(""), 2000);
    return () => clearTimeout(timer);
  }, [puntaRate, valleRate, restoRate, demandRate, fpTarget, fpPenaltyEnabled]);

  // Simulación de cálculo de costos
  async function handleCalculate() {
    setLoading(true);
    try {
      const res = await fetch("/api/cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalKWh: 12000,
          peakKW: 450,
          fp: 0.85,
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

  // Skeleton corregido: usa <span> en vez de <div>
  const SkeletonBox = () => (
    <span className="inline-block h-6 bg-white/20 rounded animate-pulse w-32" />
  );
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-8">
      <header className="flex items-center gap-2">
        <MdPriceChange className="text-3xl text-teal-400" />
        <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">
          Configuración — Tarifas
        </h1>
      </header>

      {savedMsg && (
        <div className="text-sm text-teal-400 font-semibold">{savedMsg}</div>
      )}

      {/* Formulario de tarifas */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarifa Punta */}
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <FaBolt className="text-yellow-400" /> Tarifa Punta ($/kWh)
          </label>
          <input
            type="number"
            step="0.01"
            value={puntaRate}
            onChange={(e) => setPuntaRate(parseFloat(e.target.value))}
            className="mt-2 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        {/* Tarifa Valle */}
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <FaBolt className="text-blue-400" /> Tarifa Valle ($/kWh)
          </label>
          <input
            type="number"
            step="0.01"
            value={valleRate}
            onChange={(e) => setValleRate(parseFloat(e.target.value))}
            className="mt-2 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        {/* Tarifa Resto */}
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <FaBolt className="text-green-400" /> Tarifa Resto ($/kWh)
          </label>
          <input
            type="number"
            step="0.01"
            value={restoRate}
            onChange={(e) => setRestoRate(parseFloat(e.target.value))}
            className="mt-2 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        {/* Tarifa Demanda */}
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <FaChartLine className="text-pink-400" /> Tarifa Demanda ($/kW)
          </label>
          <input
            type="number"
            step="0.01"
            value={demandRate}
            onChange={(e) => setDemandRate(parseFloat(e.target.value))}
            className="mt-2 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        {/* FP objetivo */}
        <div className="bg-slate-800 p-4 rounded-lg shadow">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <FaBalanceScale className="text-purple-400" /> Factor de potencia objetivo
          </label>
          <input
            type="number"
            step="0.01"
            value={fpTarget}
            onChange={(e) => setFpTarget(parseFloat(e.target.value))}
            className="mt-2 p-2 rounded bg-slate-700 text-white w-full"
          />
        </div>
        {/* Penalización FP */}
        <div className="flex items-center gap-2 bg-slate-800 p-4 rounded-lg shadow">
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
        disabled={loading}
        className={`px-6 py-3 rounded font-semibold transition ${
          loading
            ? "bg-teal-400 text-slate-900 animate-pulse"
            : "bg-teal-600 hover:bg-teal-700 text-white"
        }`}
      >
        {loading ? "Calculando..." : "Calcular ejemplo de costos"}
      </button>

      {/* Resultados */}
      <section className="mt-6 space-y-3 bg-slate-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-white/90 mb-2">Resultados simulados</h2>

        <div className="flex gap-2 items-center">
          <span>💡 Costo energía:</span>
          {loading ? (
            <SkeletonBox />
          ) : (
            <span className="text-yellow-300">${format(calcResult?.energyCost || 0)}</span>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <span>⚡ Costo demanda:</span>
          {loading ? (
            <SkeletonBox />
          ) : (
            <span className="text-blue-300">${format(calcResult?.demandCost || 0)}</span>
          )}
        </div>

        {fpPenaltyEnabled && (
          <div className="flex gap-2 items-center">
            <span>⚠️ Penalización FP:</span>
            {loading ? (
              <SkeletonBox />
            ) : (
              <span className="text-red-400">${format(calcResult?.penalty || 0)}</span>
            )}
          </div>
        )}

        <div className="flex gap-2 items-center">
          <span className="font-bold text-white/90">Total:</span>
          {loading ? (
            <SkeletonBox />
          ) : (
            <span className="font-bold text-teal-400 text-xl">
              ${format(calcResult?.totalCost || 0)}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}