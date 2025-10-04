import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

export async function POST(req: Request) {
  try {
    const { groups, range, window } = await req.json();
    const bucket = process.env.INFLUX_BUCKET!;

    const client = new InfluxDB({
      url: process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    });
    const queryApi = client.getQueryApi(process.env.INFLUX_ORG!);

    const results: any[] = [];

    for (const g of groups) {
      const flux = `
        from(bucket: "${bucket}")
          |> range(start: ${range ?? "-7d"})
          |> filter(fn: (r) => r._measurement == "pqgenius")
          |> filter(fn: (r) => r._field == "energy_kwh")
          |> filter(fn: (r) => contains(value: r.host, set: ${JSON.stringify(g.meters)}))
          |> derivative(unit: ${window ?? "1d"}, nonNegative: true)
          |> aggregateWindow(every: ${window ?? "1d"}, fn: sum, createEmpty: false)
          |> group()
      `;

      const rows: any[] = [];
      for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
        rows.push(tableMeta.toObject(values));
      }

      results.push({ group: g.name, rows });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}