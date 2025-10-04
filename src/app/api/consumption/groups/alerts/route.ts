import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

export async function POST(req: Request) {
  try {
    const { groups, range, window } = await req.json();
    const bucket = process.env.INFLUX_BUCKET!;

    const client = new InfluxDB({
      url: process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    });
    const queryApi = client.getQueryApi(process.env.INFLUX_ORG!);

    const totals: Record<string, number> = {};

    for (const g of groups) {
      const flux = `
        from(bucket: "${bucket}")
          |> range(start: ${range ?? "-7d"})
          |> filter(fn: (r) => r._measurement == "pqgenius")
          |> filter(fn: (r) => r._field == "energy_kwh")
          |> filter(fn: (r) => contains(value: r.host, set: ${JSON.stringify(g.meters)}))
          |> derivative(unit: ${window ?? "1d"}, nonNegative: true)
          |> sum()
      `;

      let total = 0;
      for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
        const row = tableMeta.toObject(values);
        total += Number(row._value);
      }
      totals[g.name] = total;
    }

    // Comparar grupos entre sí
    const alerts: any[] = [];
    const names = Object.keys(totals);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i];
        const b = names[j];
        const valA = totals[a];
        const valB = totals[b];
        if (valA > 0 && valB > 0) {
          const ratio = valA / valB;
          if (ratio > 1.2) {
            alerts.push({
              groupA: a,
              groupB: b,
              ratio,
              severity: ratio > 1.5 ? "high" : "medium",
              explanation: `${a} consumió ${(ratio * 100 - 100).toFixed(
                1
              )}% más que ${b} en el rango ${range}.`,
            });
          } else if (1 / ratio > 1.2) {
            alerts.push({
              groupA: b,
              groupB: a,
              ratio: 1 / ratio,
              severity: 1 / ratio > 1.5 ? "high" : "medium",
              explanation: `${b} consumió ${((1 / ratio) * 100 - 100).toFixed(
                1
              )}% más que ${a} en el rango ${range}.`,
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true, alerts, totals });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}