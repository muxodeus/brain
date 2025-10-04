import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const meter = searchParams.get("meter") || "pqgenius";
  const param = searchParams.get("param") || "power_kW";
  const range = searchParams.get("range") || "-1h";
  const window = searchParams.get("window") || "1m";

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "${meter}" and r._field == "${param}")
      |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
      |> yield(name: "mean")
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

    return NextResponse.json({ ok: true, rows, used: { meter, param, range, window } });
  } catch (err: any) {
    console.error("❌ Error Influx /api/metrics:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}