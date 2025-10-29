import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const range = searchParams.get("range") || "7d";
    const bucket = process.env.INFLUX_BUCKET || "pqgenius";

    const rows = await runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}")
        |> range(start: -${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
        |> aggregateWindow(every: 1h, fn: sum, createEmpty: false)
        |> yield(name: "sum")
    `);

    const data = rows.map((r) => {
      const date = new Date(r._time);
      const day = date.toISOString().split("T")[0];
      const hour = date.getHours();
      return { day, hour, value: Number(r._value) };
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("Error en /api/consumption-heatmap:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}