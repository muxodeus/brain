import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

export async function GET() {
  try {
    const bucket = process.env.INFLUX_BUCKET || "pqgenius";

    // Parámetros que queremos mostrar en vivo
    const params = ["voltage_A", "current_A", "power_kW", "energy_kWh"];

    const results = await Promise.all(
      params.map(async (p) => {
        const rows = await runFlux<{ _value: string }>(`
          from(bucket: "${bucket}")
            |> range(start: -5m)
            |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${p}")
            |> last()
        `);
        return {
          param: p,
          value: rows.length ? Number(rows[0]._value).toFixed(2) : "—",
        };
      })
    );

    return NextResponse.json({ ok: true, liveParams: results });
  } catch (err: any) {
    console.error("Error en /api/live:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}