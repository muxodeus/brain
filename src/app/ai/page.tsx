"use client";

import { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function AIPage() {
  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Flags para mostrar gráficos según el tipo de series
  const tienePastel = data?.seriesGrafico?.some((s: any) => s.type === "pie");
  const tieneLineas = data?.seriesGrafico?.some((s: any) => s.type === "line");
  const tieneHistograma = data?.seriesGrafico?.some((s: any) => s.type === "histogram");
  const tieneBarrasDiarias = data?.seriesGrafico?.some((s: any) => s.type === "column");
  const tieneCorrelacion = data?.seriesGrafico?.some((s: any) => s.type === "scatter");

  // Opciones de ejemplo para gráficos
  const pieOptions = { chart: { type: "pie" }, series: data?.seriesGrafico?.filter((s: any) => s.type === "pie") || [] };
  const lineOptions = { chart: { type: "line" }, series: data?.seriesGrafico?.filter((s: any) => s.type === "line") || [] };
  const histogramOptions = { chart: { type: "column" }, series: data?.seriesGrafico?.filter((s: any) => s.type === "histogram") || [] };
  const dailyBarOptions = { chart: { type: "column" }, series: data?.seriesGrafico?.filter((s: any) => s.type === "column") || [] };
  const correlationOptions = { chart: { type: "scatter" }, series: data?.seriesGrafico?.filter((s: any) => s.type === "scatter") || [] };

  async function enviarConsulta() {
    try {
      setLoading(true);
      setError("");
      const resp = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!resp.ok) throw new Error("Error en la consulta");
      const json = await resp.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-mono">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">
          ⚡ Asistente AI — PQGenius
        </h1>

        {/* Prompts sugeridos */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "¿Cuál fue el percentil 95 del voltaje en la última semana?",
            "Superpone voltaje y corriente en la última hora",
            "Haz un histograma diario del consumo de energía en el último mes",
            "Compara el consumo de energía de esta semana con la anterior",
          ].map((p, i) => (
            <span
              key={i}
              onClick={() => setPrompt(p)}
              className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-white/20"
            >
              {p}
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6 items-stretch">
        {/* Consulta */}
        <section className="bg-slate-800/60 border border-white/10 rounded-xl shadow-md p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-white/90 mb-2">Consulta</h2>
          <textarea
            value={prompt}
            onInput={(e) => setPrompt((e.target as HTMLTextAreaElement).value)}
            placeholder="Ej: ¿Cuál es el percentil 95 del voltaje en los últimos 3 días?"
            className="w-full bg-slate-900/60 text-white/80 p-2 rounded resize-y min-h-[100px]"
          />
          <button
            onClick={enviarConsulta}
            disabled={loading}
            className="mt-3 bg-white/10 hover:bg-white/20 text-white/90 px-4 py-2 rounded transition disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Enviar consulta"}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </section>

        {/* Resumen ejecutivo */}
        <section className="bg-slate-800/60 border border-white/10 rounded-xl shadow-md p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-white/90 mb-2">Resumen ejecutivo</h2>
          <p className="text-white/70">{data?.resumen || "Esperando consulta..."}</p>
          {data?.palabrasClave?.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm text-white/60 font-semibold">Palabras clave</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.palabrasClave.map((k: string, i: number) => (
                  <span key={i} className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Insights completos */}
        <section className="bg-slate-800/60 border border-white/10 rounded-xl shadow-md p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-white/90 mb-2">Insights completos</h2>
          <p className="text-white/70">{data?.texto || "Esperando consulta..."}</p>
        </section>

        {/* Recomendaciones + Gráficos */}
        <section className="bg-slate-800/60 border border-white/10 rounded-xl shadow-md p-4 flex flex-col">
          <h2 className="text-lg font-semibold text-white/90 mb-2">Recomendaciones</h2>
          {data?.recomendaciones?.length ? (
            <ul className="list-disc list-inside text-white/70">
              {data.recomendaciones.map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
          ) : (
            <p className="text-white/50">Sin recomendaciones aún</p>
          )}

          {tienePastel && (
            <>
              <h3 className="text-lg font-semibold mt-4 mb-2 text-white/90">Gráfico pastel</h3>
              <HighchartsReact highcharts={Highcharts} options={pieOptions} />
            </>
          )}

          {tieneLineas && (
            <>
              <h3 className="text-lg font-semibold mt-4 mb-2 text-white/90">Overlay de voltajes</h3>
              <HighchartsReact highcharts={Highcharts} options={lineOptions} />
            </>
          )}

          {tieneHistograma && (
            <>
              <h3 className="text-lg font-semibold mt-4 mb-2 text-white/90">Histograma</h3>
              <HighchartsReact highcharts={Highcharts} options={histogramOptions} />
            </>
          )}

          {tieneBarrasDiarias && (
            <>
              <h3 className="text-lg font-semibold mt-4 mb-2 text-white/90">Consumo diario</h3>
              <HighchartsReact highcharts={Highcharts} options={dailyBarOptions} />
            </>
          )}

          {tieneCorrelacion && (
            <>
              <h3 className="text-lg font-semibold mt-4 mb-2 text-white/90">Correlación</h3>
              <HighchartsReact highcharts={Highcharts} options={correlationOptions} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}