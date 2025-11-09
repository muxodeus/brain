"use client";
import React, { useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

if (typeof window !== "undefined") {
  const heatmapMod = require("highcharts/modules/heatmap");
  const exportingMod = require("highcharts/modules/exporting");
  if (typeof heatmapMod === "function") heatmapMod(Highcharts);
  if (typeof exportingMod === "function") exportingMod(Highcharts);
}

const tabs = [
  { id: "clasica", label: "Energía" },
  { id: "demanda", label: "Demanda" },
  { id: "areas", label: "Comparativa entre Áreas" },

  { id: "ejecutiva", label: "Vista Ejecutiva" },
];

type MaxDemanda = {
  valor: number;
  timestamp: string;
  contribuyentes: { name: string; valor: number }[];
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function formatTimestamp(date: Date): string {
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return `${dias[date.getDay()]} ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)} ${pad2(date.getHours())}:${pad2(
    date.getMinutes()
  )}`;
}

function toInputDateTimeLocal(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function ConsumosPage() {
  const [activeTab, setActiveTab] = useState("demanda");

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [categorias, setCategorias] = useState<string[]>([]);
  const [potencia, setPotencia] = useState<number[]>([]);
  const [demanda, setDemanda] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMedidores, setSelectedMedidores] = useState<string[]>([]);

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

  useEffect(() => {
    const now = new Date();
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    setFromDate(toInputDateTimeLocal(from));
    setToDate(toInputDateTimeLocal(now));
  }, []);

  const from = useMemo(() => (fromDate ? new Date(fromDate) : undefined), [fromDate]);
  const to = useMemo(() => (toDate ? new Date(toDate) : undefined), [toDate]);

  useEffect(() => {
    if (!from || !to) return;
    let cancelled = false;
    setLoading(true);

    const categoriasGen: string[] = [];
    const potenciaGen: number[] = [];
    const demandaGen: number[] = [];

    const durationMs = to.getTime() - from.getTime();
    const hours = durationMs / (1000 * 60 * 60);

    let steps;
    if (hours <= 1) {
      steps = 6; // cada 10 min
    } else if (hours <= 24) {
      steps = 24; // por hora
    } else if (hours <= 24 * 7) {
      steps = Math.ceil(hours / 24); // por día (p.ej. 7d → 7 puntos)
    } else {
      steps = Math.min(30, Math.ceil(hours / 24)); // por día (máx 30)
    }

    for (let i = 0; i < steps; i++) {
      const d = new Date(from.getTime() + Math.floor((i * durationMs) / steps));
      categoriasGen.push(formatTimestamp(d));
      potenciaGen.push(Math.round(100 + 35 * Math.sin(i / 2) + (i % 5) * 3));
      demandaGen.push(Math.round(120 + 45 * Math.cos(i / 3) + (i % 3) * 2));
    }

    if (!cancelled) {
      setCategorias(categoriasGen);
      setPotencia(potenciaGen);
      setDemanda(demandaGen);
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  // Consumos en kWh por medidor (mock independiente)
  const consumosSeries: Record<string, number[]> = {
    "Producción A": categorias.map((_, i) => Math.round(potencia[i] * 0.42)),
    "Producción B": categorias.map((_, i) => Math.round(potencia[i] * 0.33)),
    Servicios: categorias.map((_, i) => Math.round(potencia[i] * 0.25)),
  };

  const consumos: Record<string, number> = {
    "Producción A": consumosSeries["Producción A"].reduce((a, b) => a + b, 0),
    "Producción B": consumosSeries["Producción B"].reduce((a, b) => a + b, 0),
    Servicios: consumosSeries["Servicios"].reduce((a, b) => a + b, 0),
  };

  const toggleMedidor = (m: string) => {
    setSelectedMedidores((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const tarifaKw = 1.5;
  const axisStyle = { style: { color: "#fff", fontSize: "12px", fontWeight: "bold" } };
  const maxDemandaValor = demanda.length ? Math.max(...demanda) : 0;
  const idxMax = demanda.indexOf(maxDemandaValor);
  const maxDemanda: MaxDemanda | null =
    idxMax >= 0
      ? {
          valor: maxDemandaValor,
          timestamp: categorias[idxMax],
          contribuyentes: [
            { name: "Producción A", valor: Math.round(maxDemandaValor * 0.5) },
            { name: "Producción B", valor: Math.round(maxDemandaValor * 0.3) },
            { name: "Servicios", valor: Math.round(maxDemandaValor * 0.2) },
          ],
        }
      : null;

  const costoPico = maxDemanda ? (maxDemanda.valor * tarifaKw).toFixed(2) : "0.00";

  const pastelOptions = useMemo(() => {
    if (!maxDemanda) return {};
    const total = maxDemanda.valor || 1;
    return {
      chart: { type: "pie", backgroundColor: "#0b1220" },
      title: { text: `Distribución del pico — Costo total: $${costoPico}` },
      series: [
        {
          name: "Demanda",
          data: maxDemanda.contribuyentes.map((c) => {
            const pct = ((c.valor / total) * 100).toFixed(1);
            const usd = (c.valor * tarifaKw).toFixed(2);
            return { name: c.name, y: c.valor, label: `${c.name}: ${pct}% — $${usd}` };
          }),
          colors: ["#60a5fa", "#fbbf24", "#10b981"],
        },
      ],
      tooltip: { pointFormat: "<b>{point.label}</b>" },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            formatter: function () {
              // @ts-ignore
              return this.point.label;
            },
            style: { color: "#fff" },
          },
        },
      },
      legend: { itemStyle: { color: "#fff" } },
    } as Highcharts.Options;
  }, [maxDemanda, costoPico]);

  const demandaOptions = useMemo(
    () =>
      ({
        chart: { backgroundColor: "#0b1220" },
        title: { text: "Potencia activa y demanda" },
        xAxis: { categories: categorias, labels: axisStyle },
        yAxis: { title: { text: "kW" }, labels: axisStyle, gridLineColor: "#334155" },
        series: [
          { type: "column", name: "kW", data: potencia, color: "#60a5fa", pointPadding: 0.1, borderColor: "transparent" },
          { type: "line", name: "Demanda", data: demanda, color: "#ef4444", lineWidth: 2, marker: { enabled: false } },
        ],
        legend: { itemStyle: { color: "#fff" } },
        tooltip: { shared: true, backgroundColor: "#0b1220", style: { color: "#fff" } },
      } as Highcharts.Options),
    [categorias, potencia, demanda]
  );

  const heatmapOptions = useMemo(
    () =>
      ({
        chart: { type: "heatmap", backgroundColor: "#0b1220" },
        title: { text: "Mapa de calor" },
        xAxis: { categories: categorias, labels: axisStyle },
        yAxis: { categories: ["Producción A", "Producción B", "Servicios"], labels: axisStyle, title: null },
        colorAxis: {
          min: 0,
          max: 100,
          stops: [
            [0, "#0ea5e9"],
            [0.4, "#60a5fa"],
            [0.6, "#fde047"],
            [0.8, "#f59e0b"],
            [1, "#ef4444"],
          ],
        },
        series: [
          {
            name: "Intensidad",
            borderWidth: 1,
            borderColor: "#334155",
            // @ts-ignore (algunas versiones ignoran borderRadius en heatmap)
            borderRadius: 8,
            data: categorias
              .map((_, x) => [x, 0, Math.min(100, Math.max(0, potencia[x] % 100))] as [number, number, number])
              .concat(
                categorias.map((_, x) => [x, 1, Math.min(100, Math.max(0, demanda[x] % 100))] as [number, number, number])
              )
              .concat(
                categorias.map(
                  (_, x) =>
                    [x, 2, Math.min(100, Math.max(0, (((potencia[x] + demanda[x]) / 2) % 100)))] as [number, number, number]
                )
              ),
            dataLabels: { enabled: false },
          },
        ],
        legend: { itemStyle: { color: "#fff" } },
        tooltip: {
          backgroundColor: "#0b1220",
          style: { color: "#fff" },
          formatter: function () {
            // @ts-ignore
            const xCat = this.series.xAxis.categories[this.point.x];
            // @ts-ignore
            const yCat = this.series.yAxis.categories[this.point.y];
            // @ts-ignore
            return `<b>${yCat}</b><br/>${xCat}<br/>Intensidad: ${this.point.value}`;
          },
        },
      } as Highcharts.Options),
    [categorias, potencia, demanda]
  );
  return (
    <div style={{ background: "#0f172a", color: "#f9fafb", minHeight: "100vh", padding: "1rem" }}>
      {/* Header: Tabs + Rangos rápidos + Lector de fechas */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "1rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "6px",
                border: "1px solid #334155",
                background: activeTab === t.id ? "#1e3a8a" : "#0b1220",
                color: "#f9fafb",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Rangos rápidos + fechas */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {["1h", "24h", "7d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setQuickRange(r as "1h" | "24h" | "7d" | "30d")}
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #334155",
                background: "#0b1220",
                color: "#f9fafb",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              {r}
            </button>
          ))}
          <label style={{ color: "#cbd5e1", fontSize: "0.85rem", marginLeft: "0.5rem" }}>Desde</label>
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ background: "#0b1220", color: "#f9fafb", border: "1px solid #334155", borderRadius: "6px", padding: "0.25rem" }}
          />
          <label style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>Hasta</label>
          <input
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ background: "#0b1220", color: "#f9fafb", border: "1px solid #334155", borderRadius: "6px", padding: "0.25rem" }}
          />
        </div>
      </div>

      {loading && (
        <div style={{ marginBottom: "0.75rem", color: "#9ca3af", fontSize: "0.9rem" }}>
          Cargando datos del intervalo seleccionado...
        </div>
      )}

      {/* Pestaña Vista Clásica */}
      {activeTab === "clasica" && (
        <div>
          {/* Selección de medidores y resumen */}
          <div
            style={{
              background: "#111827",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            {/* Cuadro de selección */}
            <div style={{ flex: 2 }}>
              <h3 style={{ color: "#f9fafb", marginBottom: "0.5rem" }}>Selecciona medidores</h3>
              {["Producción A", "Producción B", "Servicios"].map((m) => (
                <label key={m} style={{ display: "block", color: "#f9fafb", marginBottom: "0.4rem" }}>
                  <input
                    type="checkbox"
                    checked={selectedMedidores.includes(m)}
                    onChange={() => toggleMedidor(m)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {m}
                </label>
              ))}
              <div style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Selecciona uno o más medidores para graficar sus consumos en el periodo.
              </div>
            </div>

            {/* Cuadro de resumen con porcentajes */}
            <div style={{ flex: 1, background: "#0b1220", borderRadius: "6px", border: "1px solid #334155", padding: "0.75rem" }}>
              <h4 style={{ color: "#f9fafb", marginBottom: "0.5rem" }}>Consumo total</h4>
              {selectedMedidores.length === 0 && (
                <div style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Elige medidores para ver sus totales.</div>
              )}
              {selectedMedidores.map((m) => {
                const totalSel = selectedMedidores.reduce((acc, med) => acc + consumos[med], 0);
                const porcentaje = totalSel > 0 ? ((consumos[m] / totalSel) * 100).toFixed(1) : "0.0";
                return (
                  <div
                    key={m}
                    style={{
                      color: "#f9fafb",
                      fontSize: "0.9rem",
                      marginBottom: "0.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{m}</span>
                    <span>
                      {consumos[m]} kWh ({porcentaje}%)
                    </span>
                  </div>
                );
              })}
              {selectedMedidores.length > 1 && (
                <div style={{ color: "#f9fafb", fontWeight: 700, marginTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                  <span>Total</span>
                  <span>{selectedMedidores.reduce((acc, m) => acc + consumos[m], 0)} kWh</span>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de barras de consumos */}
          <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: "column", backgroundColor: "#0b1220" },
                title: { text: "Consumos de energía por medidor" },
                xAxis: { categories: categorias, labels: axisStyle },
                yAxis: { title: { text: "kWh" }, labels: axisStyle, gridLineColor: "#334155" },
                series:
                  selectedMedidores.length === 0
                    ? []
                    : selectedMedidores.map((m, idx) => ({
                        type: "column",
                        name: m,
                        data: consumosSeries[m],
                        color: ["#60a5fa", "#fbbf24", "#10b981"][idx % 3],
                        borderColor: "transparent",
                        pointPadding: 0.05,
                      })),
                legend: { itemStyle: { color: "#fff" } },
                tooltip: { shared: true, backgroundColor: "#0b1220", style: { color: "#fff" } },
              }}
            />
          </div>

          {/* Heatmap */}
          <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
            <HighchartsReact highcharts={Highcharts} options={heatmapOptions} />
          </div>
        </div>
      )}

      {/* Pestaña Demanda */}
      {activeTab === "demanda" && maxDemanda && (
        <div>
          {/* Cuadro Pico */}
          <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, marginBottom: "0.75rem", color: "#f9fafb" }}>Pico de demanda del rango</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
              <div style={{ background: "#0b1220", padding: "0.75rem", borderRadius: "6px", border: "1px solid #334155" }}>
                <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Máxima demanda</div>
                <div style={{ color: "#f9fafb", fontSize: "1.2rem", fontWeight: 700 }}>{maxDemanda.valor} kW</div>
              </div>
              <div style={{ background: "#0b1220", padding: "0.75rem", borderRadius: "6px", border: "1px solid #334155" }}>
                <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Estampa de tiempo</div>
                <div style={{ color: "#f9fafb", fontSize: "1.2rem", fontWeight: 700 }}>{maxDemanda.timestamp}</div>
              </div>
              <div style={{ background: "#0b1220", padding: "0.75rem", borderRadius: "6px", border: "1px solid #334155" }}>
                <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Costo total del pico</div>
                <div style={{ color: "#f9fafb", fontSize: "1.2rem", fontWeight: 700 }}>${costoPico}</div>
              </div>
            </div>
          </div>

          {/* Pastel + Demanda */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
              <HighchartsReact highcharts={Highcharts} options={pastelOptions} />
            </div>
            <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
              <HighchartsReact highcharts={Highcharts} options={demandaOptions} />
            </div>
          </div>

          {/* Heatmap */}
          <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
            <HighchartsReact highcharts={Highcharts} options={heatmapOptions} />
          </div>
        </div>
      )}

      {/* Pestaña Comparativa entre Áreas */}
      {activeTab === "areas" && (
        <div>
          <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: "column", backgroundColor: "#0b1220" },
                title: { text: "Comparativa de consumos por área" },
                xAxis: { categories: categorias, labels: axisStyle },
                yAxis: { title: { text: "kWh" }, labels: axisStyle },
                series: [
                  { type: "column", name: "Producción A", data: consumosSeries["Producción A"], color: "#60a5fa" },
                  { type: "column", name: "Producción B", data: consumosSeries["Producción B"], color: "#fbbf24" },
                  { type: "column", name: "Servicios", data: consumosSeries["Servicios"], color: "#10b981" },
                ],
                legend: { itemStyle: { color: "#fff" } },
                tooltip: { shared: true, backgroundColor: "#0b1220", style: { color: "#fff" } },
              }}
            />
          </div>

          <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
            <HighchartsReact highcharts={Highcharts} options={heatmapOptions} />
          </div>
        </div>
      )}

      {/* Pestaña Vista Ejecutiva */}
      {activeTab === "ejecutiva" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
              <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Consumo total</div>
              <div style={{ color: "#f9fafb", fontSize: "1.2rem", fontWeight: 700 }}>
                {Object.values(consumos).reduce((a, b) => a + b, 0)} kWh
              </div>
            </div>
            <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
              <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Pico de demanda</div>
              <div style={{ color: "#f9fafb", fontSize: "1.2rem", fontWeight: 700 }}>{maxDemanda?.valor ?? 0} kW</div>
            </div>
            <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
              <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Costo estimado pico</div>
              <div style={{ color: "#f9fafb", fontSize: "1.2rem", fontWeight: 700 }}>${costoPico}</div>
            </div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #334155", borderRadius: "8px", padding: "1rem" }}>
            <HighchartsReact highcharts={Highcharts} options={heatmapOptions} />
          </div>
        </div>
      )}
    </div>
  );
}