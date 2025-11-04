"use client";

import { useState } from "react";
import OverlayChart from "@core/components/OverlayChart";
import QuerySelector from "@core/components/QuerySelector";
import InsightsBox from "@core/components/InsightsBox";

export default function DiagnosticoInfluxPage() {
  const [data, setData] = useState<any>(null);

  async function runQuery(medidores: string[], fields: string[], rango: string) {
    const prompt = `Compara ${fields.join(", ")} en ${medidores.join(
      " y "
    )} durante ${rango}`;
    const res = await fetch("/api/ai/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    setData(json);
  }

  function groupByField(results: any[]) {
    const grouped: Record<string, any[]> = {};
    results.forEach((r) => {
      if (!grouped[r.field]) grouped[r.field] = [];
      grouped[r.field].push(r);
    });
    return grouped;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Diagnóstico InfluxDB</h1>

      <QuerySelector onRunQuery={runQuery} />

      {/* Insights AI */}
      {data && data.text && (
        <InsightsBox
          text={data.text}
          resumen={data.resumen}
          recomendaciones={data.recomendaciones}
          keywords={data.keywords}
        />
      )}

      {/* Gráficos overlay */}
      {data && data.results && (
        <div className="space-y-8">
          {Object.entries(groupByField(data.results)).map(([field, series]: any, idx) => {
            const chartSeries = series.map((s: any) => ({
              name: `${s.medidor} - ${s.field}`,
              data: s.data.map((d: any) => [
                new Date(d.time).getTime(),
                d.value,
              ]) as [number, number][],
            }));

            return (
              <OverlayChart
                key={idx}
                title={`Comparación de ${field}`}
                series={chartSeries}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}