"use client";

import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function StatsPage() {
  const [range, setRange] = useState<"24h" | "7d" | "30d" | "6m">("24h");
  const [param, setParam] = useState<
    "Voltaje" | "Corriente" | "Potencia" | "THD" | "Factor de Potencia"
  >("Voltaje");
  const [data, setData] = useState<number[]>([]);

  // Inicializar módulo exporting en cliente con fallback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const exporting = require("highcharts/modules/exporting");
      const init = exporting.default || exporting;
      if (typeof init === "function") {
        init(Highcharts);
      }
    }
  }, []);

  // Generador de datos simulados
  const generateData = (points: number, min: number, max: number) =>
    Array.from({ length: points }, () => +(min + Math.random() * (max - min)).toFixed(2));

  // Generar datos en cliente
  useEffect(() => {
    const points =
      range === "24h" ? 96 : range === "7d" ? 96 * 7 : range === "30d" ? 96 * 30 : 96 * 180;
    let generated: number[] = [];
    switch (param) {
      case "Voltaje":
        generated = generateData(points, 210, 240);
        break;
      case "Corriente":
        generated = generateData(points, 10, 100);
        break;
      case "Potencia":
        generated = generateData(points, 50, 500);
        break;
      case "THD":
        generated = generateData(points, 0, 12);
        break;
      case "Factor de Potencia":
        generated = generateData(points, 0.7, 1);
        break;
    }
    setData(generated);
  }, [range, param]);

  // Mientras no hay datos, mostrar placeholder
  if (data.length === 0) {
    return <div className="text-white p-6">Cargando datos...</div>;
  }

  // Función auxiliar para percentiles
  const percentile = (arr: number[], p: number) => {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
  };

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const mean = +(data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
  const stddev = +Math.sqrt(data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length).toFixed(2);
  const p5 = +percentile(data, 5).toFixed(2);
  const p95 = +percentile(data, 95).toFixed(2);

  // Histograma
  const bins = 10;
  const step = (maxVal - minVal) / bins;
  const histogramData = Array.from({ length: bins }, (_, i) => {
    const from = minVal + i * step;
    const to = from + step;
    const count = data.filter((v) => v >= from && v < to).length;
    return { x: +(from + step / 2).toFixed(2), y: count };
  });

  // CDF
  const sorted = [...data].sort((a, b) => a - b);
  const cdfData = sorted.map((v, i) => [v, ((i + 1) / sorted.length) * 100]);

  // Curva de carga promedio
  const samplesPerDay = 96;
  const days = Math.floor(data.length / samplesPerDay);
  const loadCurve = Array.from({ length: samplesPerDay }, (_, i) => {
    let sum = 0,
      count = 0;
    for (let d = 0; d < days; d++) {
      const idx = d * samplesPerDay + i;
      if (idx < data.length) {
        sum += data[idx];
        count++;
      }
    }
    return [i * (24 / samplesPerDay), +(sum / count).toFixed(2)];
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Tarjetas resumen */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Mínimo", value: minVal },
          { label: "P5", value: p5 },
          { label: "Media", value: mean },
          { label: "P95", value: p95 },
          { label: "Máximo", value: maxVal },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-4 shadow text-center">
            <div className="text-sm text-slate-400">{stat.label}</div>
            <div className="text-xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          {["24h", "7d", "30d", "6m"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-2 rounded-md text-sm ${
                range === r ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["Voltaje", "Corriente", "Potencia", "THD", "Factor de Potencia"].map((p) => (
            <button
              key={p}
              onClick={() => setParam(p as any)}
              className={`px-3 py-2 rounded-md text-sm ${
                param === p ? "bg-green-500 text-white" : "bg-slate-700 text-slate-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {/* Línea 1: Distribución + CDF y Percentiles */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gráfico combinado: Histograma + CDF */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { backgroundColor: "transparent", height: 250 },
              title: { text: `Distribución + CDF de ${param}`, style: { color: "#fff" } },
              exporting: { enabled: true },
              xAxis: {
                title: { text: param },
                labels: { style: { color: "#fff" } },
              },
              yAxis: [
                {
                  title: { text: "Frecuencia" },
                  labels: { style: { color: "#fff" } },
                },
                {
                  title: { text: "%" },
                  labels: { style: { color: "#fff" } },
                  opposite: true,
                  max: 100,
                },
              ],
              series: [
                {
                  type: "column",
                  name: "Frecuencia",
                  data: histogramData.map(d => [d.x, d.y]),
                  color: "rgba(56,189,248,0.7)",
                  yAxis: 0,
                  pointPadding: 0,
                  pointWidth: 20,
                },
                {
                  type: "line",
                  name: "CDF",
                  data: cdfData,
                  color: "rgba(34,197,94,0.9)",
                  yAxis: 1,
                },
              ],
            }}
          />
        </div>

        {/* Percentiles (Mín, P5, Media, P95, Máx) */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "column", backgroundColor: "transparent", height: 250 },
              title: { text: `Percentiles de ${param}`, style: { color: "#fff" } },
              exporting: { enabled: true },
              xAxis: {
                categories: ["Mín", "P5", "Media", "P95", "Máx"],
                labels: { style: { color: "#fff" } },
              },
              yAxis: {
                title: { text: param },
                labels: { style: { color: "#fff" } },
              },
              series: [
                {
                  name: "Valores",
                  data: [minVal, p5, mean, p95, maxVal],
                  color: "rgba(239,68,68,0.7)",
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Línea 2: Curva de carga + Campana de Gauss */}
      <div className="grid grid-cols-2 gap-4">
        {/* Curva de carga (día promedio) */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "area", backgroundColor: "transparent", height: 250 },
              title: { text: `Curva de carga promedio (${param})`, style: { color: "#fff" } },
              exporting: { enabled: true },
              xAxis: {
                title: { text: "Hora del día" },
                labels: { style: { color: "#fff" } },
                tickInterval: 2,
              },
              yAxis: {
                title: { text: param },
                labels: { style: { color: "#fff" } },
              },
              series: [
                {
                  name: param,
                  data: loadCurve,
                  color: "rgba(59,130,246,0.6)",
                  fillOpacity: 0.3,
                },
              ],
            }}
          />
        </div>

        {/* Campana de Gauss con líneas de referencia */}
        <div className="bg-slate-800 p-4 rounded-lg">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "spline", backgroundColor: "transparent", height: 250 },
              title: { text: `Campana de Gauss (${param})`, style: { color: "#fff" } },
              exporting: { enabled: true },
              xAxis: {
                title: { text: param },
                labels: { style: { color: "#fff" } },
                plotLines: [
                  { value: mean, color: "yellow", width: 2, dashStyle: "Solid", label: { text: "Media", style: { color: "#fff" } } },
                  { value: mean - stddev, color: "orange", width: 1, dashStyle: "Dash", label: { text: "-1σ", style: { color: "#fff" } } },
                  { value: mean + stddev, color: "orange", width: 1, dashStyle: "Dash", label: { text: "+1σ", style: { color: "#fff" } } },
                  { value: mean - 2 * stddev, color: "red", width: 1, dashStyle: "Dot", label: { text: "-2σ", style: { color: "#fff" } } },
                  { value: mean + 2 * stddev, color: "red", width: 1, dashStyle: "Dot", label: { text: "+2σ", style: { color: "#fff" } } },
                ],
              },
              yAxis: {
                title: { text: "Densidad" },
                labels: { style: { color: "#fff" } },
              },
              series: [
                {
                  name: "Gauss",
                  data: Array.from({ length: 100 }, (_, i) => {
                    const x = minVal + (i / 99) * (maxVal - minVal);
                    const y =
                      (1 / (stddev * Math.sqrt(2 * Math.PI))) *
                      Math.exp(-0.5 * Math.pow((x - mean) / stddev, 2));
                    return [x, +(y * 1000).toFixed(2)];
                  }),
                  color: "rgba(250,204,21,0.9)",
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}