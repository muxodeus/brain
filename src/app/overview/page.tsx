"use client";

import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

type KPI = { label: string; value: string };

export default function OverviewPage() {
  const [range, setRange] = useState("24h");
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [chartOptions, setChartOptions] = useState<any>({});
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar serie histórica (potencia vs tiempo)
  useEffect(() => {
    async function fetchOverview() {
      setLoading(true);
      try {
        const resp = await fetch(`/api/ai/overview?range=${range}`);
        const json = await resp.json();

setChartOptions({
  chart: { backgroundColor: "#0f172a" },
  title: { text: `Potencia (${range})`, style: { color: "#fff" } },
  accessibility: { enabled: false },
  xAxis: { type: "datetime", labels: { style: { color: "#fff" } } },
  yAxis: { title: { text: "kW", style: { color: "#fff" } }, labels: { style: { color: "#fff" } } },
  legend: { itemStyle: { color: "#fff" } },
  series: [
    {
      type: "column",
      name: "Promedio",
      data: json.series.avgSeries || [],
      color: "#00ffcc",
    },
    {
      type: "line",
      name: "Pico diario",
      data: json.series.peakSeries || [],
      color: "#ff4444",
    },
  ],
});
        setInsights(json.insights || []);
      } catch (err) {
        console.error("Error cargando overview:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, [range]);

  // 🔹 Cargar KPIs en tiempo real desde /api/live
  useEffect(() => {
    async function fetchLive() {
      try {
        const resp = await fetch("/api/live");
        const json = await resp.json();
        if (json.ok) {
          const map: Record<string, string> = {};
          json.liveParams.forEach((p: any) => (map[p.param] = p.value));

          setKpis([
            { label: "Potencia instantánea", value: `${map["power_kW"] || "—"} kW` },
            { label: "Voltaje promedio", value: `${map["voltage_A"] || "—"} V` },
            { label: "Corriente promedio", value: `${map["current_A"] || "—"} A` },
            { label: "Energía acumulada", value: `${map["energy_kWh"] || "—"} kWh` },
            { label: "Factor de potencia", value: "0.92" }, // opcional: calcular si tienes campo
          ]);
        }
      } catch (err) {
        console.error("Error cargando live:", err);
      }
    }

    fetchLive();
    const id = setInterval(fetchLive, 5000); // refresco cada 5s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">⚡ Overview</h1>

      {/* KPIs en tiempo real */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/10 p-4 text-center">
            <p className="text-2xl font-bold text-white/90">{kpi.value}</p>
            <p className="text-sm text-white/60">{kpi.label}</p>
          </div>
        ))}
      </section>

      {/* Selector de rango */}
      <div className="flex gap-2 mb-4">
        {["24h", "7d", "1m", "6m"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded ${range === r ? "bg-teal-500 text-white" : "bg-slate-700 text-white/70"}`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Gráfico de potencia */}
      <section className="bg-slate-800/60 border border-white/10 rounded-xl shadow-md p-4">
        {loading ? (
          <p className="text-white/50 animate-pulse">Cargando gráfico…</p>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )}
      </section>

      {/* Insights */}
      <section>
        <h2 className="text-lg font-semibold text-white/90 mb-4">Insights automáticos</h2>
        {loading ? (
          <p className="text-white/50 animate-pulse">Cargando insights…</p>
        ) : (
          <ul className="space-y-2">
            {insights.map((txt, i) => (
              <li key={i} className="rounded-xl border border-white/10 bg-white/10 p-3">
                {txt}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}