import { NextRequest, NextResponse } from "next/server";
import { InfluxDB, flux } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL || "https://us-east-1-1.aws.cloud2.influxdata.com";
const token = process.env.INFLUX_TOKEN || "ug7vnFSzqQseHoS9I1Jx4YL-135--9CO2DI-dL8kavBtt8KUqCcIQK0yOfPB_tXReyYb_4GIqmXW7r0D-TWXeQ==";
const org = process.env.INFLUX_ORG || "PQGenius";
const bucket = process.env.INFLUX_BUCKET || "pqgenius";

export async function GET(req: NextRequest) {
  try {
    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    const measurementsQuery = `
      import "influxdata/influxdb/schema"
      schema.measurements(bucket: "${bucket}")
    `;
    const measurements = await queryApi.collectRows(measurementsQuery);

    const fieldKeysQuery = `
      import "influxdata/influxdb/schema"
      schema.fieldKeys(bucket: "${bucket}")
    `;
    const fields = await queryApi.collectRows(fieldKeysQuery);

    const samples: Record<string, any[]> = {};
    for (const f of fields) {
      const field = f._value;
      const sampleQuery = flux`from(bucket: "${bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r._field == "${field}")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n:5)`;

      const rows = await queryApi.collectRows(sampleQuery);
      samples[field] = rows.map((r: any) => ({
        time: r._time,
        value: r._value,
      }));
    }

    return NextResponse.json({
      status: "ok",
      bucket,
      measurements: measurements.map((m: any) => m._value),
      fields: fields.map((f: any) => f._value),
      samples,
    });
  } catch (err) {
    console.error("❌ Error en diagnostico-influx:", err);
    return NextResponse.json(
      { status: "error", message: "No se pudo conectar a InfluxDB" },
      { status: 500 }
    );
  }
}