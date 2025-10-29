import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = "mediciones_trends";

export async function GET() {
  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);
  const flux = `
    import "influxdata/influxdb/schema"
    schema.tagValues(bucket: "${bucket}", tag: "site")
  `;

  const sites: string[] = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(flux, {
      next: (row, meta) => {
        const o = meta.toObject(row);
        if (o._value) sites.push(o._value);
      },
      error: (err) => reject(NextResponse.json({ error: err.message }, { status: 500 })),
      complete: () => resolve(NextResponse.json(sites)),
    });
  });
}