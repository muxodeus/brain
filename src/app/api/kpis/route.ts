import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

// Variables de entorno (defínelas en tu .env.local)
const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = "mediciones_raw";

export async function GET() {
  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  // Consulta: últimos valores de cada campo en el último punto
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -30s)
      |> filter(fn: (r) => r._measurement == "meters")
      |> last()
  `;

  const rows: any[] = [];

  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row);
        rows.push(o);
      },
      error: (error) => {
        console.error("❌ Error Influx:", error);
        reject(NextResponse.json({ error: error.message }, { status: 500 }));
      },
      complete: () => {
        // Agrupamos por canal
        const grouped: Record<string, Record<string, number>> = {};

        for (const r of rows) {
          const ch = r.channel || "Total";
          if (!grouped[ch]) grouped[ch] = {};
          grouped[ch][r._field] = r._value;
        }

        resolve(NextResponse.json(grouped));
      },
    });
  });
}