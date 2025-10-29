import { NextRequest, NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";
import { buildFluxQueries } from "@/lib/queryBuilder";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET || "pqgenius";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    // Generar queries dinámicas
    const queries = buildFluxQueries(bucket, prompt);

    const results: any[] = [];

    for (const q of queries) {
      const rows: any[] = [];
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(q, {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            rows.push({ time: o._time, value: o._value });
          },
          error(err) {
            reject(err);
          },
          complete() {
            resolve();
          },
        });
      });

      // Extraer medidor y campo del query
      const medidorMatch = q.match(/_measurement == "([^"]+)"/);
      const fieldMatch = q.match(/_field == "([^"]+)"/);

      results.push({
        medidor: medidorMatch ? medidorMatch[1] : "unknown",
        field: fieldMatch ? fieldMatch[1] : "unknown",
        data: rows,
      });
    }

    return NextResponse.json({
      status: "ok",
      bucket,
      results,
    });
  } catch (err) {
    console.error("❌ Error en /api/ai/query:", err);
    return NextResponse.json(
      { status: "error", message: "No se pudo procesar la consulta" },
      { status: 500 }
    );
  }
}