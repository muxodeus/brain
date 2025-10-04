import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

const client = new InfluxDB({ url, token });

export async function queryPowerData() {
  const queryApi = client.getQueryApi(org);
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "power")
      |> filter(fn: (r) => r._field == "kW")
      |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;

  const rows: { t: number; y: number }[] = [];
  return new Promise<typeof rows>((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        rows.push({ t: new Date(o._time).getTime(), y: o._value });
      },
      error(err) {
        reject(err);
      },
      complete() {
        resolve(rows);
      },
    });
  });
}