import { NextRequest, NextResponse } from "next/server";
import { InfluxDB, flux } from "@influxdata/influxdb-client";
import { fetchSummary } from "@/lib/influx";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

type InfluxRow = { _value: any; _time?: string };

export async function GET(req: NextRequest) {
  try {
    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    // KPIs agregados
    const summary = await fetchSummary(bucket, "-24h");

    // Medidas y campos
    const measurementsQuery = `
      import "influxdata/influxdb/schema"
      schema.measurements(bucket: "${bucket}")
    `;
    const measurements = (await queryApi.collectRows(
      measurementsQuery
    )) as InfluxRow[];

    const fieldKeysQuery = `
      import "influxdata/influxdb/schema"
      schema.fieldKeys(bucket: "${bucket}")
    `;
    const fields = (await queryApi.collectRows(
      fieldKeysQuery
    )) as InfluxRow[];

    // Últimas N muestras crudas por campo
    const samples: Record<string, any[]> = {};
    for (const f of fields) {
      const field = f._value;
      const sampleQuery = flux`from(bucket: "${bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r._field == "${field}")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n:10)`;

      const rows = (await queryApi.collectRows(sampleQuery)) as InfluxRow[];
      samples[field] = rows.map((r) => ({
        time: r._time,
        value: r._value,
      }));
    }

    return NextResponse.json({
      status: "ok",
      bucket,
      summary,
      measurements: measurements.map((m) => m._value),
      fields: fields.map((f) => f._value),
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