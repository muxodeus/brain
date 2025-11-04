import { NextResponse } from "next/server";
import { runFlux } from "@/lib/influx";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "-7d";
  const bucket = process.env.INFLUX_BUCKET!;

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "alerts")
      |> keep(columns: ["_time", "explanation", "severity"])
      |> sort(columns: ["_time"], desc: true)
      |> limit(n:50)
  `;

  try {
    // ✅ usamos runFlux genérico
    const rows = await runFlux<{ _time: string; explanation?: string; severity?: string }>(fluxQuery);

    const alerts = rows.map((r) => ({
      timestamp: r._time,
      explanation: r.explanation ?? "Sin explicación",
      severity: r.severity ?? "low",
    }));

    return NextResponse.json({ ok: true, alerts });
  } catch (err: any) {
    console.error("❌ Error Influx alerts:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}