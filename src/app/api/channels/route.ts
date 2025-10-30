import { InfluxDB } from "@influxdata/influxdb-client";
import { apiHandler } from "@/lib/apiHandler";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = "mediciones_trends";

export async function GET(req: Request): Promise<Response> {
  // 👇 Tipamos explícitamente el callback
  return apiHandler(async (): "Promise<string[]>" => {
    const { searchParams } = new URL(req.url);
    const meter = searchParams.get("meter");

    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    let flux = `
      import "influxdata/influxdb/schema"
      schema.tagValues(bucket: "${bucket}", tag: "channel")
    `;
    if (meter) {
      flux = `
        import "influxdata/influxdb/schema"
        schema.tagValues(bucket: "${bucket}", tag: "channel", predicate: (r) => r.meter == "${meter}")
      `;
    }

    const channels: string[] = [];

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, meta) => {
          const o = meta.toObject(row);
          if (o._value) channels.push(o._value);
        },
        error: (err) => reject(err),
        complete: () => resolve(),
      });
    });

    return channels; // 👈 apiHandler lo envuelve en NextResponse.json()
  });
}