import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

// GET /api/config/measurements?bucket=pqgenius
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket") || "pqgenius";

  const flux = `
    import "influxdata/influxdb/schema"
    schema.measurements(bucket: "${bucket}")
  `;

  try {
    const rows = await runFlux(flux);
    const measurements = rows.map((r) => r._value);
    return NextResponse.json({ ok: true, measurements });
  } catch (err) {
    console.error("Error en /api/config/measurements:", err);
    return NextResponse.json({ ok: false, error: "Query failed" }, { status: 500 });
  }
}