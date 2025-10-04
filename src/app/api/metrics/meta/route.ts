import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

export async function GET() {
  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  const fluxQuery = `
    import "influxdata/influxdb/schema"
    schema.tagValues(
      bucket: "${bucket}",
      tag: "meter"
    )
  `;

  const meters: string[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const o = tableMeta.toObject(row);
          if (o._value) meters.push(o._value);
        },
        error: reject,
        complete: () => resolve(),
      });
    });

    return NextResponse.json({ ok: true, meters });
  } catch (err: any) {
    console.error("❌ Error Influx /api/metrics/meta:", err);
    // fallback: devolver un mock
    return NextResponse.json({
      ok: true,
      meters: ["PQGenius", "MED_ABC_098", "MED_XYZ_123"],
      error: String(err),
    });
  }
}