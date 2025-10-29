import { InfluxDB } from "@influxdata/influxdb-client";

// ⚡ Configuración desde variables de entorno
const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

/**
 * Ejecuta un query Flux y devuelve las filas como objetos tipados
 */
export async function runFlux<T = any>(flux: string): Promise<T[]> {
  const rows: T[] = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(flux, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row) as T;
        rows.push(o);
      },
      error: (err) => reject(err),
      complete: () => resolve(rows),
    });
  });
}

/**
 * Devuelve una serie temporal lista para Highcharts
 */
export async function fetchSeries(bucket: string, rango: string, campo: string) {
  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;

  const rows = await runFlux<{ _time: string; _value: string }>(flux);

  return rows.map((r) => [
    new Date(r._time).getTime(),
    Number(r._value),
  ]);
}