import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = "mediciones_trends";

function mapField(param: string) {
  // Mapea parámetros base al campo agregado con sufijo _mean
  // Ejemplos: voltage -> voltage_mean, p_act -> p_act_mean, pf -> pf_mean
  // Si ya viene con _mean, respétalo.
  return param.endsWith("_mean") ? param : `${param}_mean`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawParam = searchParams.get("param") || "voltage";
  const field = mapField(rawParam);
  const range = searchParams.get("range") || "-1h";
  const meter = searchParams.get("meter") || "";
  const site = searchParams.get("site") || "";
  const channel = searchParams.get("channel") || ""; // "A", "B", "C", "Total"

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  const filters: string[] = [
    `|> filter(fn: (r) => r._measurement == "meters")`,
    `|> filter(fn: (r) => r._field == "${field}")`,
  ];
  if (site) filters.push(`|> filter(fn: (r) => r.site == "${site}")`);
  if (meter) filters.push(`|> filter(fn: (r) => r.meter == "${meter}")`);
  if (channel) filters.push(`|> filter(fn: (r) => r.channel == "${channel}")`);

  const fluxSeries = [
    `from(bucket: "${bucket}")`,
    `|> range(start: ${range})`,
    ...filters,
    `|> yield(name: "series")`,
  ].join("\n");

  const fluxStats = [
    `data = from(bucket: "${bucket}")`,
    `|> range(start: ${range})`,
    ...filters,
    ``,
    `minVal = data |> min() |> set(key: "_stat", value: "min")`,
    `maxVal = data |> max() |> set(key: "_stat", value: "max")`,
    `meanVal = data |> mean() |> set(key: "_stat", value: "mean")`,
    `p5Val = data |> quantile(q: 0.05, method: "estimate_tdigest") |> set(key: "_stat", value: "p5")`,
    `p95Val = data |> quantile(q: 0.95, method: "estimate_tdigest") |> set(key: "_stat", value: "p95")`,
    `union(tables: [minVal, maxVal, meanVal, p5Val, p95Val]) |> yield(name: "stats")`,
  ].join("\n");

  const fluxQuery = `${fluxSeries}\n\n${fluxStats}`;

  const rows: any[] = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next: (row, meta) => rows.push(meta.toObject(row)),
      error: (err) => reject(NextResponse.json({ error: err.message }, { status: 500 })),
      complete: () => {
        const series: { time: string; value: number }[] = [];
        const stats: Record<string, number> = {};
        for (const r of rows) {
          if (r._time && typeof r._value === "number" && r._field === field) {
            series.push({ time: r._time, value: Math.round(r._value * 100) / 100 });
          }
          if (r._stat && typeof r._value === "number") {
            stats[r._stat] = Math.round(r._value * 100) / 100;
          }
        }
        resolve(NextResponse.json({ series, stats, meta: { field, channel } }));
      },
    });
  });
}