import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

// GET /api/metrics?meter=pqgenius&param=voltage_A&range=-24h&window=15m
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const meter = searchParams.get("meter") || "pqgenius";
  const param = searchParams.get("param") || "voltage_A";
  const range = searchParams.get("range") || "-24h";
  const window = searchParams.get("window") || "15m";
  const bucket = searchParams.get("bucket") || "pqgenius";

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "${meter}" and r._field == "${param}")
      |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;

  try {
    const rows = await runFlux(flux);
    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    console.error("Error en /api/metrics:", err);
    return NextResponse.json({ ok: false, error: "Query failed" }, { status: 500 });
  }
}