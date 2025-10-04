import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "-24h";
    const bucket = process.env.INFLUX_BUCKET!;

    const client = new InfluxDB({
      url: process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    });
    const queryApi = client.getQueryApi(process.env.INFLUX_ORG!);

    // ⚡ Query: consumo actual vs histórico (últimos 7d)
    const flux = `
      import "math"

      current = from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kwh")
        |> derivative(unit: 1h, nonNegative: true)
        |> group(columns: ["host"])
        |> sum()
        |> set(key: "period", value: "current")

      baseline = from(bucket: "${bucket}")
        |> range(start: -7d)
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kwh")
        |> derivative(unit: 1h, nonNegative: true)
        |> group(columns: ["host"])
        |> mean()
        |> set(key: "period", value: "baseline")

      join(
        tables: {c: current, b: baseline},
        on: ["host"],
        method: "inner"
      )
      |> map(fn: (r) => ({
        host: r.host,
        current: r._value_c,
        baseline: r._value_b,
        ratio: if r._value_b > 0.0 then (r._value_c / r._value_b) else 0.0
      }))
    `;

    const alerts: any[] = [];
    for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
      const row = tableMeta.toObject(values);
      const ratio = Number(row.ratio);
      let severity: "low" | "medium" | "high" | null = null;
      if (ratio > 1.5) severity = "high";
      else if (ratio > 1.2) severity = "medium";
      else if (ratio > 1.1) severity = "low";

      if (severity) {
        alerts.push({
          meter: row.host,
          current: row.current,
          baseline: row.baseline,
          ratio,
          severity,
          explanation: `El medidor ${row.host} consumió ${(ratio * 100 - 100).toFixed(
            1
          )}% más que su promedio histórico (${row.baseline.toFixed(
            2
          )} kWh) en el rango ${range}.`,
        });
      }
    }

    return NextResponse.json({ ok: true, alerts });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}