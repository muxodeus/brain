import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost"); // ✅ fix
    const range = searchParams.get("range") || "7d";
    const bucket = process.env.INFLUX_BUCKET || "pqgenius";

    const rows = await runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}")
        |> range(start: -${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> aggregateWindow(every: 15m, fn: mean, createEmpty: false)
        |> yield(name: "mean")
    `);

    const series = rows.map((r) => [
      new Date(r._time).getTime(),
      Number(r._value),
    ]);

    const pico = series.length ? Math.max(...series.map((p) => p[1])) : 0;

    return NextResponse.json({ series, pico });
  } catch (err: any) {
    console.error("Error en /api/demand:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}