import { NextResponse } from "next/server";

function generateDailySeries(start: Date, end: Date, base: number, variation: number) {
  const series: { fecha: string; consumo: number }[] = [];
  const current = new Date(start);
  while (current <= end) {
    const consumo = base + (Math.random() - 0.5) * variation;
    series.push({
      fecha: current.toISOString().split("T")[0],
      consumo: +Math.max(0, consumo).toFixed(2),
    });
    current.setDate(current.getDate() + 1);
  }
  return series;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const medidor = searchParams.get("medidor") ?? "M1";
  const inicio = searchParams.get("inicio") ?? "2025-11-01";
  const fin = searchParams.get("fin") ?? "2025-11-07";

  const startDate = new Date(inicio);
  const endDate = new Date(fin);
  const base = medidor === "M1" ? 120 : medidor === "M2" ? 150 : 100;
  const series = generateDailySeries(startDate, endDate, base, 30);

  const total = series.reduce((sum, d) => sum + d.consumo, 0);
  const promedio = +(total / series.length).toFixed(2);
  const maxDia = series.reduce((max, d) => (d.consumo > max.consumo ? d : max), series[0]);

  return NextResponse.json({
    medidor,
    inicio,
    fin,
    total,
    promedio,
    maxDia,
    series,
  });
}