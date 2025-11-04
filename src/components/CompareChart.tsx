"use client";

import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import StatsCards from "./StatsCards";

import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import "highcharts/modules/full-screen";

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

  useEffect(() => {
    async function loadData() {
      const window =
        range === "-1h" ? "10m" : range === "-24h" ? "1h" : "1d";

      // Serie A
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
          { name: meterA, data, color: "#3b82f6" }, // azul
          ...(prev.filter((s) => s.name !== meterA)),
        ]);
      }

      // Serie B
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
          { name: meterB, data, color: "#f97316" }, // naranja
        ]);
      }

      // Stats A
      const resStatsA = await fetch(
        `/api/metrics/stats?meter=${meterA}&param=${param}&range=${range}`,
        { cache: "no-store" }
      );
      const jsonStatsA = await resStatsA.json();
      if (jsonStatsA.ok) setStatsA(jsonStatsA.stats);

      // Stats B
      const resStatsB = await fetch(
        `/api/metrics/stats?meter=${meterB}&param=${param}&range=${range}`,
        { cache: "no-store" }
      );
      const jsonStatsB = await resStatsB.json();
      if (jsonStatsB.ok) setStatsB(jsonStatsB.stats);
    }

    loadData();
  }, [meterA, meterB, param, range]);

  const options: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      zooming: { type: "x" }, // ✅ reemplazo de zoomType
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
      {series.length > 0 ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        <p className="text-sm text-slate-500">Cargando datos...</p>
      )}

      {/* Stats Medidor A */}
      {statsA && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-1">
            {meterA}
          </h4>
          <StatsCards stats={statsA} />
        </div>
      )}

      {/* Stats Medidor B */}
      {statsB && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-1">
            {meterB}
          </h4>
          <StatsCards stats={statsB} />
        </div>
      )}
    </div>
  );
}