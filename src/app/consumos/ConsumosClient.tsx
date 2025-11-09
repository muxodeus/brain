"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useHighcharts } from "@core/hooks/useHighcharts";

const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

type KPI = { label: string; value: string };

function useSyncedRange() {
  const [range, setRange] = useState("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    if (from && to) setRange("");
  }, [from, to]);

  const selectRange = (r: string) => {
    setRange(r);
    setFrom("");
    setTo("");
  };

  return { range, from, to, setFrom, setTo, selectRange };
}

export default function ConsumosClient() {
  const { range, from, to, setFrom, setTo, selectRange } = useSyncedRange();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [consumoOptions, setConsumoOptions] = useState<any>(null);
  const Highcharts = useHighcharts();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/consumption?range=${range}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();

        setKpis([
          { label: "Última semana", value: data.kpis.ultimaSemana },
          { label: "Ayer", value: data.kpis.ayer },
          { label: "Promedio", value: data.kpis.promedio },
          { label: "Pico", value: data.kpis.pico },
        ]);

        setConsumoOptions({
          chart: { type: "line", backgroundColor: "transparent" },
          title: { text: "Consumo energético" },
          xAxis: { type: "datetime" },
          yAxis: { title: { text: "kWh" } },
          series: [{ name: "kWh", data: data.series }],
        });
      } catch (err) {
        console.error("Error cargando datos de consumo:", err);
      }
    }
    fetchData();
  }, [range, from, to]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">🔆 Consumos energéticos</h1>

        {/* Selectores de rango */}
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { label: "1h", value: "1h" },
            { label: "24h", value: "1d" },
            { label: "7d", value: "7d" },
            { label: "30d", value: "30d" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => selectRange(btn.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                range === btn.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300"
              }`}
            >
              {btn.label}
            </button>
          ))}

          {/* Datepickers personalizados */}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-2 py-1 rounded-md text-sm bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-400">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-2 py-1 rounded-md text-sm bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-slate-800 p-4 rounded-lg shadow text-center"
          >
            <div className="text-sm text-slate-400">{kpi.label}</div>
            <div className="text-xl font-bold">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de consumo */}
      <div className="bg-slate-800 p-4 rounded-lg">
        {typeof window !== "undefined" &&
          Highcharts &&
          consumoOptions &&
          consumoOptions.series && (
            <HighchartsReact highcharts={Highcharts} options={consumoOptions} />
          )}
      </div>
    </div>
  );
}