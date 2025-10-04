import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "-7d";

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "alerts")
      |> keep(columns: ["_time", "explanation", "severity"])
      |> sort(columns: ["_time"], desc: true)
      |> limit(n:50)
  `;

  const rows: any[] = [];
  try {
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
        error: reject,
        complete: () => resolve(),
      });
    });

    const alerts = rows.map(r => ({
      timestamp: r._time,
      explanation: r.explanation ?? "Sin explicación",
      severity: r.severity ?? "low",
    }));

    return NextResponse.json({ ok: true, alerts });
  } catch (err: any) {
    console.error("❌ Error Influx alerts:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}