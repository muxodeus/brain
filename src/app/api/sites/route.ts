import { InfluxDB } from "@influxdata/influxdb-client";
import { apiHandler } from "@/lib/apiHandler";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = "mediciones_trends";

export async function GET(req: Request): Promise<Response> {
  // 👇 Tipamos explícitamente el callback
  return apiHandler(async (): Promise<string[]> => {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");

    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    let flux = `
      import "influxdata/influxdb/schema"
      schema.tagValues(bucket: "${bucket}", tag: "site")
    `;
    if (region) {
      flux = `
        import "influxdata/influxdb/schema"
        schema.tagValues(bucket: "${bucket}", tag: "site", predicate: (r) => r.region == "${region}")
      `;
    }

    const sites: string[] = [];

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, meta) => {
          const o = meta.toObject(row);
          if (o._value) sites.push(o._value);
        },
        error: (err) => reject(err),
        complete: () => resolve(),
      });
    });

    return sites; // 👈 apiHandler lo convierte en NextResponse.json(sites)
  });
}