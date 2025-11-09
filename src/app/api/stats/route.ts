import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    kpis: {
      consumoPromedio: "120 kWh",
      factorCarga: "0.85",
      eficiencia: "92%",
      disponibilidad: "99.5%",
    },
  });
}