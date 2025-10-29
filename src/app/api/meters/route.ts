import { InfluxDB } from "@influxdata/influxdb-client";
import { apiHandler } from "@/lib/apiHandler";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = "mediciones_trends";

export async function GET(req: Request): Promise<Response> {
  return apiHandler(async () => {
    const { searchParams } = new URL(req.url);
    const site = searchParams.get("site");

    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    let flux = `
      import "influxdata/influxdb/schema"
      schema.tagValues(bucket: "${bucket}", tag: "meter")
    `;
    if (site) {
      flux = `
        import "influxdata/influxdb/schema"
        schema.tagValues(bucket: "${bucket}", tag: "meter", predicate: (r) => r.site == "${site}")
      `;
    }

    const meters: string[] = [];

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, meta) => {
          const o = meta.toObject(row);
          if (o._value) meters.push(o._value);
        },
        error: (err) => reject(err),
        complete: () => resolve(),
      });
    });

    return meters;
  });
}