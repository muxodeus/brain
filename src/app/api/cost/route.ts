import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    totalKWh,
    peakKW,
    fp,
    puntaRate,
    valleRate,
    restoRate,
    demandRate,
    fpPenaltyEnabled,
  } = body;

  // Ejemplo de cálculo simple
  const avgRate = (puntaRate + valleRate + restoRate) / 3;
  const energyCost = totalKWh * avgRate;
  const demandCost = peakKW * demandRate;
  const penalty = fpPenaltyEnabled && fp < 0.9 ? energyCost * 0.05 : 0;
  const totalCost = energyCost + demandCost + penalty;

  return NextResponse.json({
    energyCost,
    demandCost,
    penalty,
    totalCost,
  });
}