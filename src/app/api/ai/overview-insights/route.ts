import { NextResponse } from "next/server";
import { generarRecomendaciones } from "@/lib/generarRecomendaciones";
import { runFlux } from "@/lib/influx";

export async function GET() {
  try {
    const bucket = process.env.INFLUX_BUCKET || "pqgenius";

    // Ejemplo simple de breakdown (ajusta a tu esquema real)
    const breakdownRows = await runFlux<{ device: string; _value: string }>(`
      from(bucket: "${bucket}") |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
      |> group(columns: ["device"])
      |> last()
    `);

    const breakdown = (breakdownRows || [])
      .slice(0, 4)
      .map((r) => ({
        name: r.device || "Equipo",
        value: `${Number(r._value || 0).toFixed(1)} kWh`,
        trend: "N/A",
      }));

    const prompt =
      "Genera 3 insights concretos y accionables sobre consumo energético industrial, con enfoque en ahorro, alertas y eficiencia. Usa frases cortas y concluye cada frase con punto.";
    const insights = await generarRecomendaciones(prompt);

    return NextResponse.json({
      breakdown,
      insights, // array de strings
      cached: false,
    });
  } catch (err: any) {
    // Fallback seguro para el frontend
    return NextResponse.json(
      {
        breakdown: [],
        insights: ["No se pudieron generar insights en este momento."],
        cached: true,
        error: err.message || "Error en overview-insights",
      },
      { status: 200 }
    );
  }
}