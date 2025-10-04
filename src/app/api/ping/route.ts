import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

export async function GET() {
  try {
    const client = new InfluxDB({
      url: process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    });
    const health = await fetch(`${process.env.INFLUX_URL}/health`);
    const json = await health.json();
    return NextResponse.json({ ok: true, influx: json });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}