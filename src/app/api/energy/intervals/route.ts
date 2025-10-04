import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "-24h";

  // Definir ventana según rango
  let window = "1h";
  if (range === "-7d") window = "1d";
  if (range === "-1h") window = "10m";

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
      |> difference(nonNegative: true)
      |> aggregateWindow(every: ${window}, fn: sum, createEmpty: false)
      |> yield(name: "intervals")
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

    return NextResponse.json({ ok: true, rows, used: { range, window } });
  } catch (err: any) {
    console.error("❌ Error Influx intervals:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}