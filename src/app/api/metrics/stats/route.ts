import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

// GET /api/metrics/stats?meter=pqgenius&param=voltage_A&range=-24h
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const meter = searchParams.get("meter") || "pqgenius";
  const param = searchParams.get("param") || "voltage_A";
  const range = searchParams.get("range") || "-24h";
  const bucket = searchParams.get("bucket") || "pqgenius";

  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "${meter}" and r._field == "${param}")
      |> keep(columns: ["_value"])
      |> reduce(
        identity: {min: 9999999.0, max: -9999999.0, sum: 0.0, count: 0.0},
        fn: (r, accumulator) => ({
          min: if r._value < accumulator.min then r._value else accumulator.min,
          max: if r._value > accumulator.max then r._value else accumulator.max,
          sum: accumulator.sum + r._value,
          count: accumulator.count + 1.0
        })
      )
  `;

  try {
    const rows = await runFlux(flux);
    if (!rows.length) return NextResponse.json({ ok: true, stats: {} });

    const { min, max, sum, count } = rows[0];
    const avg = count ? sum / count : undefined;

    return NextResponse.json({
      ok: true,
      stats: { min, max, avg }
    });
  } catch (err) {
    console.error("Error en /api/metrics/stats:", err);
    return NextResponse.json({ ok: false, error: "Query failed" }, { status: 500 });
  }
}