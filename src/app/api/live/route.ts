import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    liveParams: [
      { param: "power_kW", value: 120 },
      { param: "voltage_A", value: 230 },
      { param: "current_A", value: 15 },
      { param: "energy_kWh", value: 5400 },
    ],
  });
}