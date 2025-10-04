import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "-24h";
  const field = searchParams.get("field") || "power_kW";

  // Ajuste automático de ventana
  let window = "1h";
  if (range === "-7d" || range === "-30d") {
    window = "1d";
  }

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${field}")
      |> aggregateWindow(every: ${window}, fn: ${field == "energy_kWh" ? "last" : "mean"}, createEmpty: false)
      |> yield(name: "series")
  `;

  const rows: any[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const o = tableMeta.toObject(row);
          rows.push({ _time: o._time, _value: o._value });
        },
        error: reject,
        complete: () => resolve(),
      });
    });

    return NextResponse.json({ ok: true, rows, used: { range, field, window } });
  } catch (err: any) {
    console.error("❌ Error Influx timeseries:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}