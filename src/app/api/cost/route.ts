import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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

    // Simulación: 1/3 del consumo en cada franja
    const kWhPunta = totalKWh / 3;
    const kWhValle = totalKWh / 3;
    const kWhResto = totalKWh / 3;

    const energyCost =
      kWhPunta * puntaRate + kWhValle * valleRate + kWhResto * restoRate;
    const demandCost = peakKW * demandRate;

    let penalty = 0;
    if (fpPenaltyEnabled && fp < 0.9) {
      penalty = peakKW * demandRate * (1 - fp);
    }

    const totalCost = energyCost + demandCost + penalty;

    return NextResponse.json({
      energyCost: energyCost.toFixed(2),
      demandCost: demandCost.toFixed(2),
      penalty: penalty.toFixed(2),
      totalCost: totalCost.toFixed(2),
    });
  } catch (err: any) {
    console.error("Error en /api/costs:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}