import { NextResponse } from "next/server";

export async function GET() {
  // Mock inicial de insights
  const insights = [
    {
      id: 1,
      type: "forecast",
      message: "Se espera un aumento del 12% en el consumo entre 18:00 y 21:00 horas.",
    },
    {
      id: 2,
      type: "anomaly",
      message: "Se detectó un pico inusual de potencia ayer a las 14:30.",
    },
    {
      id: 3,
      type: "recommendation",
      message: "Considera desplazar cargas no críticas fuera de horas pico para reducir costos.",
    },
  ];

  return NextResponse.json({ ok: true, insights });
}