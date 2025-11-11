"use client";
import React, { useMemo, useState, useEffect } from "react";
import HighchartsWrapper from "@core/components/HighchartsWrapper";
import { generateMockEvents } from "./data/eventGenerator";

const tabs = [
  { id: "histograma", label: "Histogramas" },
  { id: "tiempo", label: "Diagramas de Tiempo" },
  { id: "fallas", label: "Fallas" },
  { id: "reportes", label: "Reportes" },
];

// Helpers
const pad2 = (n: number) => String(n).padStart(2, "0");
function toInputDateTimeLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function TimeRangeSelector({ fromDate, toDate, setFromDate, setToDate, setQuickRange }) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Desde:</label>
        <input
          type="datetime-local"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-700"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-300 mb-1">Hasta:</label>
        <input
          type="datetime-local"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-700"
        />
      </div>
      <div className="flex items-end gap-2">
        {["1h", "24h", "7d", "30d"].map((label) => (
          <button
            key={label}
            onClick={() => setQuickRange(label as "1h" | "24h" | "7d" | "30d")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 text-sm"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Genera formas de onda trifásicas realistas según tipo
function generateThreePhaseWaveform(
  samples = 1024,
  fs = 15360,
  magnitudePct = 100,
  type: "sag" | "swell" | "interruption" | "transient"
) {
  const f = 60;
  const t = Array.from({ length: samples }, (_, n) => n / fs);
  const baseAmp = magnitudePct / 100;

  let v1 = t.map((ti) => baseAmp * Math.sin(2 * Math.PI * f * ti));
  let v2 = t.map((ti) => baseAmp * Math.sin(2 * Math.PI * f * ti - (2 * Math.PI / 3)));
  let v3 = t.map((ti) => baseAmp * Math.sin(2 * Math.PI * f * ti + (2 * Math.PI / 3)));

  let i1 = t.map((ti) => 0.8 * baseAmp * Math.sin(2 * Math.PI * f * ti - Math.PI / 6));
  let i2 = t.map((ti) => 0.8 * baseAmp * Math.sin(2 * Math.PI * f * ti - (2 * Math.PI / 3) - Math.PI / 6));
  let i3 = t.map((ti) => 0.8 * baseAmp * Math.sin(2 * Math.PI * f * ti + (2 * Math.PI / 3) - Math.PI / 6));

  // Perturbación corta (3 ciclos)
  const cycles = 3;
  const duration = Math.floor((fs / f) * cycles);
  const start = Math.floor(samples * 0.3);
  const end = start + duration;

  if (type === "sag") {
    for (let n = start; n < end; n++) {
      v1[n] *= 0.2; v2[n] *= 0.2; v3[n] *= 0.2;
      i1[n] *= 0.2; i2[n] *= 0.2; i3[n] *= 0.2;
    }
  } else if (type === "swell") {
    for (let n = start; n < end; n++) {
      v1[n] *= 1.8; v2[n] *= 1.8; v3[n] *= 1.8;
      i1[n] *= 1.4; i2[n] *= 1.4; i3[n] *= 1.4;
    }
  } else if (type === "interruption") {
    for (let n = start; n < end; n++) {
      v1[n] = 0; v2[n] = 0; v3[n] = 0;
      i1[n] = 0; i2[n] = 0; i3[n] = 0;
    }
  } else if (type === "transient") {
    for (let n = start; n < end; n++) {
      const pulse = Math.sin(2 * Math.PI * 1000 * t[n]) * Math.exp(-80 * (n - start) / samples);
      v1[n] += 1.5 * pulse;
      v2[n] += 1.5 * pulse;
      v3[n] += 1.5 * pulse;
    }
  }

  // RMS
  const win = Math.floor(fs / f);
  const rmsCalc = (arr: number[], n: number) => {
    const s = Math.max(0, n - win);
    const seg = arr.slice(s, n + 1);
    return Math.sqrt(seg.reduce((a, b) => a + b * b, 0) / seg.length);
  };

  const rmsV1 = t.map((_, n) => rmsCalc(v1, n));
  const rmsV2 = t.map((_, n) => rmsCalc(v2, n));
  const rmsV3 = t.map((_, n) => rmsCalc(v3, n));
  const rmsI1 = t.map((_, n) => rmsCalc(i1, n));
  const rmsI2 = t.map((_, n) => rmsCalc(i2, n));
  const rmsI3 = t.map((_, n) => rmsCalc(i3, n));

  return { t: t.map((x) => x * 1000), v1, v2, v3, i1, i2, i3, rmsV1, rmsV2, rmsV3, rmsI1, rmsI2, rmsI3 };
}
export default function PerturbacionesPage() {
  const [activeTab, setActiveTab] = useState("histograma");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [waveModal, setWaveModal] = useState<{ open: boolean; eventIndex: number | null }>({ open: false, eventIndex: null });

  useEffect(() => {
    const now = new Date();
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    setFromDate(toInputDateTimeLocal(from));
    setToDate(toInputDateTimeLocal(now));
  }, []);

  const setQuickRange = (label: "1h" | "24h" | "7d" | "30d") => {
    const now = new Date();
    let fromCalc = new Date(now);
    if (label === "1h") fromCalc = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    else if (label === "24h") fromCalc = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (label === "7d") fromCalc = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (label === "30d") fromCalc = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    setFromDate(toInputDateTimeLocal(fromCalc));
    setToDate(toInputDateTimeLocal(now));
  };

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  const events = useMemo(() => generateMockEvents(300), []);
  const filteredEvents = events.filter((e) => {
    const ts = new Date(e.timestamp).getTime();
    return (!from || ts >= from.getTime()) && (!to || ts <= to.getTime());
  });

  // Conteos
  const sagCount = filteredEvents.filter((e) => e.type === "sag").length;
  const swellCount = filteredEvents.filter((e) => e.type === "swell").length;
  const interruptionCount = filteredEvents.filter((e) => e.type === "interruption").length;
  const transientCount = Math.max(filteredEvents.filter((e) => e.type === "transient").length, sagCount * 3);

  const axisStyle = { style: { color: "#fff", fontSize: "12px", fontWeight: "bold" } };

  // Histogramas
  const histogramaOptions: Highcharts.Options = {
    chart: { type: "column", backgroundColor: "transparent" },
    title: { text: "Histogramas de perturbaciones" },
    xAxis: { categories: ["Sag", "Swell", "Interrupción", "Transitorio"], labels: axisStyle },
    yAxis: { title: { text: "Cantidad de eventos" }, labels: axisStyle, min: 0 },
    series: [{ type: "column", name: "Eventos", data: [sagCount, swellCount, interruptionCount, transientCount], color: "#60a5fa" }],
    legend: { enabled: false },
  };

  // Scatter
  const durationScatterOptions: Highcharts.Options = {
    chart: { type: "scatter", backgroundColor: "transparent", zoomType: "xy" },
    title: { text: "Event Magnitude / Duration Plot" },
    xAxis: { type: "logarithmic", title: { text: "Duración (s)" }, labels: axisStyle, min: 0.01, max: 10 },
    yAxis: { title: { text: "Voltaje Magnitud (%)" }, labels: axisStyle, min: 0, max: 200 },
    series: [{ type: "scatter", name: "Eventos", data: filteredEvents.map((e) => [e.durationMs / 1000, e.magnitudePct]), color: "#06b6d4" }],
    legend: { enabled: false },
  };

  const timeScatterOptions: Highcharts.Options = {
    chart: { type: "scatter", backgroundColor: "transparent" },
    title: { text: "Event Magnitude / Time Plot" },
    xAxis: { type: "datetime", title: { text: "Fecha" }, labels: axisStyle },
    yAxis: { title: { text: "Voltaje Magnitud (%)" }, labels: axisStyle, min: 0, max: 200 },
    series: [{ type: "scatter", name: "Eventos", data: filteredEvents.map((e) => [new Date(e.timestamp).getTime(), e.magnitudePct]), color: "#60a5fa" }],
    legend: { enabled: false },
  };

  // Diagramas de tiempo
  const horas = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  function contarPorHora(tipo: "sag" | "swell" | "interruption" | "transient") {
    const counts = Array(24).fill(0);
    filteredEvents.filter((e) => e.type === tipo).forEach((e) => {
      const h = new Date(e.timestamp).getHours();
      counts[h]++;
    });
    return counts;
  }

  const sagsPorHora = contarPorHora("sag");
  const swellsPorHora = contarPorHora("swell");
  const interrupcionesPorHora = contarPorHora("interruption");
  const transitoriosPorHora = sagsPorHora.map((c) => c * 3);

  const diagramaOptions = (titulo: string, data: number[], color: string): Highcharts.Options => ({
    chart: { type: "column", backgroundColor: "transparent" },
    title: { text: titulo },
    xAxis: { categories: horas, labels: axisStyle },
    yAxis: { title: { text: "Ocurrencias" }, labels: axisStyle, min: 0, allowDecimals: false },
    series: [{ type: "column", name: "Eventos", data, color }],
    legend: { enabled: false },
    tooltip: { shared: true },
  });

  const sagsOptions = diagramaOptions("Huecos de Tensión (Sag) en el Tiempo", sagsPorHora, "#06b6d4");
  const swellsOptions = diagramaOptions("Swells en el Tiempo", swellsPorHora, "#f97316");
  const interrupcionesOptions = diagramaOptions("Interrupciones en el Tiempo", interrupcionesPorHora, "#ef4444");
  const transitoriosOptions = diagramaOptions("Transitorios en el Tiempo", transitoriosPorHora, "#22c55e");

  // Función para métricas ejecutivas
  function calcularMetricas(data: ReturnType<typeof generateThreePhaseWaveform>) {
    const pico = Math.max(...data.v1.map(Math.abs));
    const rmsMin = Math.min(...data.rmsV1);
    const rmsMax = Math.max(...data.rmsV1);
    const thdEstimado = (Math.random() * 5).toFixed(2); // placeholder
    return { pico, rmsMin, rmsMax, thdEstimado };
  }
  return (
    <div style={{ background: "#0f172a", color: "#f9fafb", minHeight: "100vh", padding: "1rem" }}>
      {/* Tabs */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded px-3 py-2 font-bold ${activeTab === tab.id ? "bg-blue-700 text-white" : "bg-slate-700 text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Histogramas */}
      {activeTab === "histograma" && (
        <div className="bg-slate-800 rounded-lg p-6">
          <TimeRangeSelector {...{ fromDate, toDate, setFromDate, setToDate, setQuickRange }} />
          <HighchartsWrapper options={histogramaOptions} height={360} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <HighchartsWrapper options={durationScatterOptions} height={300} />
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <HighchartsWrapper options={timeScatterOptions} height={300} />
            </div>
          </div>
        </div>
      )}

      {/* Diagramas de Tiempo */}
      {activeTab === "tiempo" && (
        <div className="bg-slate-800 rounded-lg p-6">
          <TimeRangeSelector {...{ fromDate, toDate, setFromDate, setToDate, setQuickRange }} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <HighchartsWrapper options={sagsOptions} height={300} />
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <HighchartsWrapper options={swellsOptions} height={300} />
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <HighchartsWrapper options={interrupcionesOptions} height={300} />
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <HighchartsWrapper options={transitoriosOptions} height={300} />
            </div>
          </div>
        </div>
      )}

      {/* Fallas */}
      {activeTab === "fallas" && (
        <div className="bg-slate-800 rounded-lg p-6">
          <TimeRangeSelector {...{ fromDate, toDate, setFromDate, setToDate, setQuickRange }} />
          <h2 className="text-xl font-bold text-white mb-4">Detalles de fallas</h2>
          <table className="w-full border-collapse border border-gray-700 text-sm text-center">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="border border-gray-700 px-4 py-2">Fecha</th>
                <th className="border border-gray-700 px-4 py-2">Duración (ms)</th>
                <th className="border border-gray-700 px-4 py-2">Magnitud (%)</th>
                <th className="border border-gray-700 px-4 py-2">Fase</th>
                <th className="border border-gray-700 px-4 py-2">Tipo</th>
                <th className="border border-gray-700 px-4 py-2">Forma de onda</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.slice(0, 40).map((e, idx) => (
                <tr key={idx} className="hover:bg-gray-800">
                  <td className="border border-gray-700 px-4 py-2">{new Date(e.timestamp).toLocaleString()}</td>
                  <td className="border border-gray-700 px-4 py-2">{e.durationMs}</td>
                  <td className="border border-gray-700 px-4 py-2">{e.magnitudePct}</td>
                  <td className="border border-gray-700 px-4 py-2">{e.phase}</td>
                  <td className="border border-gray-700 px-4 py-2 capitalize">
                    {e.type === "sag" ? "Sag" : e.type === "swell" ? "Swell" : e.type === "interruption" ? "Interrupción" : "Transitorio"}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    <button
                      onClick={() => setWaveModal({ open: true, eventIndex: idx })}
                      className="bg-slate-700 hover:bg-slate-600 text-white rounded px-2 py-1"
                    >
                      ∿
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal trifásico con métricas */}
          {waveModal.open && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-slate-900 rounded-lg p-6 w-full max-w-6xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white text-lg font-bold">Análisis de formas de onda (Trifásico)</h3>
                  <button
                    onClick={() => setWaveModal({ open: false, eventIndex: null })}
                    className="bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-1"
                  >
                    Cerrar
                  </button>
                </div>

                {(() => {
                  const idx = waveModal.eventIndex ?? 0;
                  const e = filteredEvents[idx] ?? filteredEvents[0];
                  const data = generateThreePhaseWaveform(2048, 15360, e.magnitudePct, e.type as "sag" | "swell" | "interruption" | "transient");
                  const metricas = calcularMetricas(data);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Gráficas */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 rounded p-3">
                          <HighchartsWrapper
                            options={{
                              chart: { type: "line", backgroundColor: "transparent" },
                              title: { text: `Forma de onda — Tensión (${e.type === "sag" ? "Sag" : e.type === "swell" ? "Swell" : e.type === "interruption" ? "Interrupción" : "Transitorio"})` },
                              xAxis: { title: { text: "Tiempo (ms)" }, labels: axisStyle },
                              yAxis: { title: { text: "p.u." }, labels: axisStyle, min: -2, max: 2 },
                              series: [
                                { type: "line", name: "L1", data: data.t.map((x, k) => [x, data.v1[k]]), color: "#60a5fa" },
                                { type: "line", name: "L2", data: data.t.map((x, k) => [x, data.v2[k]]), color: "#f97316" },
                                { type: "line", name: "L3", data: data.t.map((x, k) => [x, data.v3[k]]), color: "#22c55e" },
                              ],
                            }}
                            height={240}
                          />
                        </div>
                        <div className="bg-slate-800 rounded p-3">
                          <HighchartsWrapper
                            options={{
                              chart: { type: "line", backgroundColor: "transparent" },
                              title: { text: "Forma de onda — Corriente (Trifásico)" },
                              xAxis: { title: { text: "Tiempo (ms)" }, labels: axisStyle },
                              yAxis: { title: { text: "p.u." }, labels: axisStyle, min: -2, max: 2 },
                              series: [
                                { type: "line", name: "I1", data: data.t.map((x, k) => [x, data.i1[k]]), color: "#60a5fa" },
                                { type: "line", name: "I2", data: data.t.map((x, k) => [x, data.i2[k]]), color: "#f97316" },
                                { type: "line", name: "I3", data: data.t.map((x, k) => [x, data.i3[k]]), color: "#22c55e" },
                              ],
                            }}
                            height={240}
                          />
                        </div>
                        <div className="bg-slate-800 rounded p-3">
                          <HighchartsWrapper
                            options={{
                              chart: { type: "line", backgroundColor: "transparent" },
                              title: { text: "RMS de Tensión (Trifásico)" },
                              xAxis: { title: { text: "Tiempo (ms)" }, labels: axisStyle },
                              yAxis: { title: { text: "RMS (p.u.)" }, labels: axisStyle, min: 0 },
                              series: [
                                { type: "line", name: "Vrms L1", data: data.t.map((x, k) => [x, data.rmsV1[k]]), color: "#60a5fa" },
                                { type: "line", name: "Vrms L2", data: data.t.map((x, k) => [x, data.rmsV2[k]]), color: "#f97316" },
                                { type: "line", name: "Vrms L3", data: data.t.map((x, k) => [x, data.rmsV3[k]]), color: "#22c55e" },
                              ],
                            }}
                            height={240}
                          />
                        </div>
                        <div className="bg-slate-800 rounded p-3">
                          <HighchartsWrapper
                            options={{
                              chart: { type: "line", backgroundColor: "transparent" },
                              title: { text: "RMS de Corriente (Trifásico)" },
                              xAxis: { title: { text: "Tiempo (ms)" }, labels: axisStyle },
                              yAxis: { title: { text: "RMS (p.u.)" }, labels: axisStyle, min: 0 },
                              series: [
                                { type: "line", name: "Irms I1", data: data.t.map((x, k) => [x, data.rmsI1[k]]), color: "#60a5fa" },
                                { type: "line", name: "Irms I2", data: data.t.map((x, k) => [x, data.rmsI2[k]]), color: "#f97316" },
                                { type: "line", name: "Irms I3", data: data.t.map((x, k) => [x, data.rmsI3[k]]), color: "#22c55e" },
                              ],
                            }}
                            height={240}
                          />
                        </div>
                      </div>

                      {/* Panel lateral de métricas */}
                      <div className="bg-slate-800 rounded p-4">
                        <h4 className="text-white font-bold mb-3">Métricas ejecutivas</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between"><span>Tipo:</span><span className="font-semibold">{e.type === "sag" ? "Sag" : e.type === "swell" ? "Swell" : e.type === "interruption" ? "Interrupción" : "Transitorio"}</span></li>
                          <li className="flex justify-between"><span>Fecha:</span><span className="font-semibold">{new Date(e.timestamp).toLocaleString()}</span></li>
                          <li className="flex justify-between"><span>Duración (ms):</span><span className="font-semibold">{e.durationMs}</span></li>
                          <li className="flex justify-between"><span>Magnitud (%):</span><span className="font-semibold">{e.magnitudePct}</span></li>
                          <li className="flex justify-between"><span>Fase:</span><span className="font-semibold">{e.phase}</span></li>
                          <li className="flex justify-between"><span>Pico tensión (p.u.):</span><span className="font-semibold">{metricas.pico.toFixed(3)}</span></li>
                          <li className="flex justify-between"><span>Vrms min (p.u.):</span><span className="font-semibold">{metricas.rmsMin.toFixed(3)}</span></li>
                          <li className="flex justify-between"><span>Vrms max (p.u.):</span><span className="font-semibold">{metricas.rmsMax.toFixed(3)}</span></li>
                          <li className="flex justify-between"><span>THD estimado (%):</span><span className="font-semibold">{metricas.thdEstimado}</span></li>
                        </ul>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 text-sm">Exportar CSV</button>
                          <button className="bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-2 text-sm" onClick={() => setWaveModal({ open: false, eventIndex: null })}>Cerrar</button>
                        </div>

                        <blockquote className="text-xs text-slate-300 mt-4 border-l-2 border-slate-500 pl-2">
                          Tip: 
                        </blockquote>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reportes */}
      {activeTab === "reportes" && (
        <div className="bg-slate-800 rounded-lg p-6">
          <TimeRangeSelector {...{ fromDate, toDate, setFromDate, setToDate, setQuickRange }} />
          <HighchartsWrapper
            options={{
              chart: { type: "column", backgroundColor: "transparent" },
              title: { text: "Reporte anual de perturbaciones" },
              xAxis: { categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"], labels: axisStyle },
              yAxis: { title: { text: "Cantidad de eventos" }, labels: axisStyle },
              series: [
                { type: "column", name: "Sag", data: [12, 8, 15, 20, 14, 11], color: "#06b6d4" },
                { type: "column", name: "Swell", data: [5, 3, 7, 6, 9, 10], color: "#f97316" },
                { type: "column", name: "Interrupción", data: [2, 1, 3, 4, 5, 6], color: "#ef4444" },
                { type: "column", name: "Transitorio", data: [6, 9, 12, 15, 18, 20], color: "#22c55e" },
              ],
              legend: { enabled: true },
            }}
            height={360}
          />
        </div>
      )}
    </div>
  );
}