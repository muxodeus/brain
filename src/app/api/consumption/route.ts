import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

// ✅ Evita cacheo en este endpoint
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const range = searchParams.get("range") || "7d";
    const bucket = process.env.INFLUX_BUCKET || "pqgenius";

    let every = "1h";
    if (range === "7d") every = "12h";
    if (range === "1m") every = "1d";
    if (range === "6m") every = "1mo";

    const rows = await runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}")
        |> range(start: -${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
        |> aggregateWindow(every: ${every}, fn: sum, createEmpty: false)
        |> yield(name: "sum")
    `);

    const series = rows.map((r) => [
      new Date(r._time).getTime(),
      Number(r._value),
    ]);

    const total = series.reduce((a, b) => a + b[1], 0);
    const promedio = series.length ? total / series.length : 0;
    const pico = series.length ? Math.max(...series.map((r) => r[1])) : 0;
    const ayer = series.length > 1 ? series[series.length - 2][1] : 0;

    const format = (n: number) =>
      n < 1000 ? n.toFixed(2) : n.toLocaleString("en-US", { maximumFractionDigits: 0 });

    const kpis = {
      ultimaSemana: format(total),
      ayer: format(ayer),
      promedio: format(promedio),
      pico: format(pico),
      factorCarga: "—",
    };

    return NextResponse.json({ kpis, series });
  } catch (err: any) {
    console.error("Error en /api/consumption:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}