"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import StatsCards from "./StatsCards";

// Import dinámico de HighchartsReact (solo cliente)
const HighchartsReact = dynamic(() => import("highcharts-react-official"), {
  ssr: false,
});

type Props = {
  meterA: string;
  meterB: string;
  param: string;
  range: string;
};

export default function CompareChart({ meterA, meterB, param, range }: Props) {
  const [series, setSeries] = useState<any[]>([]);
  const [statsA, setStatsA] = useState<any>(null);
  const [statsB, setStatsB] = useState<any>(null);
  const [Highcharts, setHighcharts] = useState<any>(null);

  // Cargar Highcharts y módulos solo en cliente
  useEffect(() => {
    (async () => {
      const HighchartsLib = (await import("highcharts")).default;
      await import("highcharts/modules/exporting").then((m) => m.default(HighchartsLib));
      await import("highcharts/modules/export-data").then((m) => m.default(HighchartsLib));
      await import("highcharts/modules/full-screen").then((m) => m.default(HighchartsLib));
      setHighcharts(HighchartsLib);
    })();
  }, []);

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      const window =
        range === "-1h" ? "10m" : range === "-24h" ? "1h" : "1d";

      const resA = await fetch(
        `/api/metrics?meter=${meterA}&param=${param}&range=${range}&window=${window}`,
        { cache: "no-store" }
      );
      const jsonA = await resA.json();
      if (jsonA.ok && jsonA.rows) {
        const data = jsonA.rows.map((r: any) => [
          new Date(r._time).getTime(),
          Number(r._value),
        ]);
        setSeries((prev) => [
          { name: meterA, data, color: "#3b82f6" },
          ...(prev.filter((s) => s.name !== meterA)),
        ]);
      }

      const resB = await fetch(
        `/api/metrics?meter=${meterB}&param=${param}&range=${range}&window=${window}`,
        { cache: "no-store" }
      );
      const jsonB = await resB.json();
      if (jsonB.ok && jsonB.rows) {
        const data = jsonB.rows.map((r: any) => [
          new Date(r._time).getTime(),
          Number(r._value),
        ]);
        setSeries((prev) => [
          ...(prev.filter((s) => s.name !== meterB)),
          { name: meterB, data, color: "#f97316" },
        ]);
      }

      const resStatsA = await fetch(
        `/api/metrics/stats?meter=${meterA}&param=${param}&range=${range}`,
        { cache: "no-store" }
      );
      const jsonStatsA = await resStatsA.json();
      if (jsonStatsA.ok) setStatsA(jsonStatsA.stats);

      const resStatsB = await fetch(
        `/api/metrics/stats?meter=${meterB}&param=${param}&range=${range}`,
        { cache: "no-store" }
      );
      const jsonStatsB = await resStatsB.json();
      if (jsonStatsB.ok) setStatsB(jsonStatsB.stats);
    }

    loadData();
  }, [meterA, meterB, param, range]);

  const options: any = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      zooming: { type: "x" },
    },
    title: { text: undefined },
    xAxis: { type: "datetime" },
    yAxis: { title: { text: param } },
    tooltip: { shared: true },
    series,
    exporting: { enabled: true },
  };

  return (
    <div className="rounded-lg bg-white dark:bg-slate-900 p-5 shadow">
      <h3 className="text-sm font-semibold mb-2">
        Comparación de {param} entre {meterA} y {meterB}
      </h3>

      {/* Gráfica */}
      {Highcharts && series.length > 0 ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        <p className="text-sm text-slate-500">Cargando datos...</p>
      )}

      {statsA && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-1">{meterA}</h4>
          <StatsCards stats={statsA} />
        </div>
      )}

      {statsB && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-1">{meterB}</h4>
          <StatsCards stats={statsB} />
        </div>
      )}
    </div>
  );
}