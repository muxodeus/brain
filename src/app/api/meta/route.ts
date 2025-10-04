import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

export async function GET() {
  try {
    const client = new InfluxDB({
      url: process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    });
    const queryApi = client.getQueryApi(process.env.INFLUX_ORG!);

    const fluxQuery = `
      import "influxdata/influxdb/schema"

      schema.tagValues(
        bucket: "${process.env.INFLUX_BUCKET}",
        tag: "host",
        predicate: (r) => r._measurement == "pqgenius",
        start: -30d
      )
    `;

    const hosts: string[] = [];
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      const obj = tableMeta.toObject(values);
      if (obj._value && typeof obj._value === "string") {
        hosts.push(obj._value);
      }
    }

    // Fallback si no encuentra nada
    const unique = Array.from(new Set(hosts));
    return NextResponse.json({ ok: true, meters: unique.length ? unique : ["pqgenius"] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, meters: ["pqgenius"] }, { status: 200 });
  }
}