"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useHighcharts } from "@core/hooks/useHighcharts";
import StatsCards from "@core/components/StatsCards";

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
  const Highcharts = useHighcharts(); // ✅ Hook que carga Highcharts dinámicamente
  const [series, setSeries] = useState<any[]>([]);
  const [statsA, setStatsA] = useState<any>(null);
  const [statsB, setStatsB] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const window =
        range === "-1h" ? "10m" : range === "-24h" ? "1h" : "1d";

      // Fetch de datos para A y B (igual que antes)...
      // setSeries([...])
      // setStatsA(...)
      // setStatsB(...)
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

      {/* Stats */}
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