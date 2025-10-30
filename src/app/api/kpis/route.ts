import { InfluxDB } from "@influxdata/influxdb-client";
import { apiHandler } from "@/lib/apiHandler";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = "mediciones_trends";

export async function GET(req: Request): Promise<Response> {
  // 👇 Tipamos explícitamente el callback
  return apiHandler(async (): Promise<{ kpi: string; value: number }[]> => {
    const { searchParams } = new URL(req.url);
    const site = searchParams.get("site");

    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    let flux = `
      from(bucket: "${bucket}")
        |> range(start: -1h)
        |> filter(fn: (r) => r._measurement == "kpis")
    `;
    if (site) {
      flux += `|> filter(fn: (r) => r.site == "${site}")`;
    }

    const kpis: { kpi: string; value: number }[] = [];

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, meta) => {
          const o = meta.toObject(row);
          if (o._field && o._value !== undefined) {
            kpis.push({ kpi: o._field, value: Number(o._value) });
          }
        },
        error: (err) => reject(err),
        complete: () => resolve(),
      });
    });

    return kpis; // 👈 apiHandler lo envuelve en NextResponse.json()
  });
}