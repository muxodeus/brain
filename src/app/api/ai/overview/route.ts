import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const range = searchParams.get("range") || "24h";
    const bucket = process.env.INFLUX_BUCKET || "pqgenius";

    let every = "1h";
    if (range === "7d") every = "12h";
    if (range === "1m") every = "1d";
    if (range === "6m") every = "1mo";

    // Serie de potencia promedio
    const avgRows = await runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}")
        |> range(start: -${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> aggregateWindow(every: ${every}, fn: mean, createEmpty: false)
    `);

    const avgSeries = avgRows.map((r) => [
      new Date(r._time).getTime(),
      Number(r._value),
    ]);

    // Serie de picos diarios
    const peakRows = await runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}")
        |> range(start: -${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> aggregateWindow(every: 1d, fn: max, createEmpty: false)
    `);

    const peakSeries = peakRows.map((r) => [
      new Date(r._time).getTime(),
      Number(r._value),
    ]);

    // KPIs
    const potenciaActual = avgRows.length ? Number(avgRows[avgRows.length - 1]._value) : 0;
    const promedio = avgRows.length
      ? avgRows.reduce((a, b) => a + Number(b._value), 0) / avgRows.length
      : 0;
    const pico = peakRows.length
      ? Math.max(...peakRows.map((r) => Number(r._value)))
      : 0;

    const format = (n: number | string) =>
      typeof n === "number" ? n.toLocaleString("en-US") : n;

    const kpis = {
      potencia: `${format(potenciaActual)} kW`,
      promedio: `${format(promedio)} kW`,
      pico: `${format(pico)} kW`,
    };

    const insights: string[] = [];
    if (pico && promedio && pico / promedio > 1.5) {
      insights.push("⚠️ Pico de potencia muy superior al promedio.");
    }
    insights.push("💡 Revisa horarios de mayor demanda para optimizar costos.");

    return NextResponse.json({
      kpis,
      series: { avgSeries, peakSeries },
      insights,
    });
  } catch (err: any) {
    console.error("Error en /api/overview:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}