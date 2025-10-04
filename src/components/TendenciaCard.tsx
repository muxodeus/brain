"use client";

import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Módulos extra de Highcharts
import Exporting from "highcharts/modules/exporting";
import ExportData from "highcharts/modules/export-data";
import FullScreen from "highcharts/modules/full-screen";

if (typeof Highcharts === "object") {
  Exporting(Highcharts);
  ExportData(Highcharts);
  FullScreen(Highcharts);
}

type Props = {
  meter: string;
  range: string;
};

const paramOptions = [
  { field: "voltage_A", label: "Voltaje (V)" },
  { field: "current_A", label: "Corriente (A)" },
  { field: "power_kW", label: "Potencia (kW)" },
  { field: "freq_Hz", label: "Frecuencia (Hz)" },
];

export default function TendenciaCard({ meter, range }: Props) {
  const [param, setParam] = useState("power_kW");
  const [series, setSeries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const window =
        range === "-1h" ? "10m" : range === "-24h" ? "1h" : "1d";

      const res = await fetch(
        `/api/metrics?meter=${meter}&param=${param}&range=${range}&window=${window}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (json.ok && json.rows) {
        const data = json.rows.map((r: any) => [
          new Date(r._time).getTime(),
          Number(r._value),
        ]);
        setSeries([{ name: paramOptions.find(p => p.field === param)?.label, data }]);

        // Calcular stats básicos
        const values = data.map((d: any) => d[1]);
        if (values.length > 0) {
          const sorted = [...values].sort((a, b) => a - b);
          const p = (q: number) =>
            sorted[Math.floor((q / 100) * sorted.length)];
          setStats({
            min: Math.min(...values).toFixed(2),
            max: Math.max(...values).toFixed(2),
            avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
            p50: p(50).toFixed(2),
            p90: p(90).toFixed(2),
          });
        }
      }
    }
    loadData();
  }, [param, meter, range]);

  const options: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      zoomType: "x", // zoom horizontal
    },
    title: { text: undefined },
    xAxis: { type: "datetime" },
    yAxis: { title: { text: paramOptions.find(p => p.field === param)?.label } },
    tooltip: {
      shared: true,
      formatter: function () {
        const point = this.points?.[0];
        if (!point) return "";
        const value = point.y;
        const prev = point.series.data[point.point.index - 1]?.y;
        const diff = prev ? (value - prev).toFixed(2) : "N/A";
        const avg = (
          point.series.data.reduce((a, p) => a + p.y, 0) /
          point.series.data.length
        ).toFixed(2);

        return `
          <b>${point.series.name}</b><br/>
          Valor: ${value}<br/>
          Δ respecto anterior: ${diff}<br/>
          Promedio serie: ${avg}
        `;
      },
    },
    series,
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "downloadCSV",
            "downloadXLS",
            "viewData",
          ],
        },
      },
    },
  };

  return (
    <div className="rounded-lg bg-white dark:bg-slate-900 p-5 shadow">
      {/* Header con selector */}
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-sm font-semibold">
          {paramOptions.find(p => p.field === param)?.label}
        </h3>
        <select
          value={param}
          onChange={(e) => setParam(e.target.value)}
          className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-xs"
        >
          {paramOptions.map((p) => (
            <option key={p.field} value={p.field}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gráfica */}
      {series.length > 0 ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        <p className="text-sm text-slate-500">Cargando datos...</p>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="mt-3 text-xs text-slate-400 grid grid-cols-2 gap-2">
          <p>Promedio: {stats.avg}</p>
          <p>Máximo: {stats.max}</p>
          <p>Mínimo: {stats.min}</p>
          <p>P50: {stats.p50}</p>
          <p>P90: {stats.p90}</p>
        </div>
      )}
    </div>
  );
}