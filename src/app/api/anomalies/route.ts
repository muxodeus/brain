import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

type RawRow = Record<string, any>;

const PARAMS = [
  { key: "voltage_A", label: "Voltaje (V)", window: "1m", agg: "mean" },
  { key: "current_A", label: "Corriente (A)", window: "1m", agg: "mean" },
  { key: "power_kW", label: "Potencia (kW)", window: "1m", agg: "mean" },
  { key: "freq_Hz", label: "Frecuencia (Hz)", window: "1m", agg: "mean" },
  // Energía acumulada: detectamos picos con derivative por minuto
  { key: "energy_kwh", label: "Energía (kWh)", window: "1m", agg: "last", derivative: true },
];

function buildFlux({
  bucket,
  meter,
  param,
  range,
  window,
  agg,
  derivative,
}: {
  bucket: string;
  meter: string;
  param: string;
  range: string;
  window: string;
  agg: "mean" | "last";
  derivative?: boolean;
}) {
  // Para energía acumulada, transformamos a consumo por ventana con derivative
  const preAgg = derivative
    ? `
        |> derivative(unit: 1m, nonNegative: true)
        |> aggregateWindow(every: ${window}, fn: sum, createEmpty: false)
      `
    : `
        |> aggregateWindow(every: ${window}, fn: ${agg}, createEmpty: false)
      `;

  // Algoritmo MAD con umbral 3.0 (típico para outliers robustos)
  return `
    import "contrib/anaisdg/anomalydetection"

    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "pqgenius")
      |> filter(fn: (r) => r.host == "${meter}")
      |> filter(fn: (r) => r._field == "${param}")
      ${preAgg}
      |> anomalydetection.mad(threshold: 3.0)
  `;
}

function mapSeverity(param: string, value: number) {
  // Heurística simple: potencia y corriente son más sensibles
  if (param === "power_kW" || param === "current_A") return Math.abs(value) > 2 ? "high" : "medium";
  if (param === "voltage_A") return Math.abs(value) > 1 ? "medium" : "low";
  if (param === "freq_Hz") return Math.abs(value) > 0.2 ? "medium" : "low";
  if (param === "energy_kwh") return Math.abs(value) > 0.5 ? "medium" : "low";
  return "low";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const meter = searchParams.get("meter") ?? "pqgenius";
    const range = searchParams.get("range") ?? "-1h";
    const window = searchParams.get("window") ?? "1m";
    const bucket = process.env.INFLUX_BUCKET!;

    const client = new InfluxDB({
      url: process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    });
    const queryApi = client.getQueryApi(process.env.INFLUX_ORG!);

    const allAnomalies: any[] = [];

    for (const p of PARAMS) {
      const flux = buildFlux({
        bucket,
        meter,
        param: p.key,
        range,
        window: p.window || window,
        agg: (p.agg as "mean" | "last") ?? "mean",
        derivative: p.derivative,
      });

      for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
        const row = tableMeta.toObject(values) as RawRow;
        if (row.level === "anomaly") {
          const val = Number(row._value);
          allAnomalies.push({
            meter,
            param: p.key,
            label: p.label,
            timestamp: row._time,
            value: val,
            severity: mapSeverity(p.key, val),
            explanation:
              p.key === "energy_kwh"
                ? "Incremento de energía inusual detectado en la ventana actual (derivative + MAD)."
                : `Valor fuera de rango robusto (MAD) en ${p.label}.`,
          });
        }
      }
    }

    // Ordenamos por severidad y tiempo (más críticos primero)
    const severityRank: Record<string, number> = { high: 3, medium: 2, low: 1 };
    allAnomalies.sort((a, b) => {
      const s = severityRank[b.severity] - severityRank[a.severity];
      if (s !== 0) return s;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({
      ok: true,
      anomalies: allAnomalies,
      used: { meter, range, window, bucket },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}