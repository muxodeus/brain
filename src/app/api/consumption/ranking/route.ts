import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "-24h";

    const client = new InfluxDB({
      url: process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    });
    const queryApi = client.getQueryApi(process.env.INFLUX_ORG!);

    const flux = `
      from(bucket: "${process.env.INFLUX_BUCKET}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius")
        |> filter(fn: (r) => r._field == "energy_kwh")
        |> derivative(unit: 1h, nonNegative: true)
        |> group(columns: ["host"])
        |> sum()
        |> keep(columns: ["host", "_value"])
        |> sort(columns: ["_value"], desc: true)
    `;

    const ranking: any[] = [];
    for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
      const row = tableMeta.toObject(values);
      ranking.push({ meter: row.host, value: row._value });
    }

    return NextResponse.json({ ok: true, ranking });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}