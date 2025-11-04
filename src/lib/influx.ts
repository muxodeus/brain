import { InfluxDB } from "@influxdata/influxdb-client";

// ⚡ Configuración desde variables de entorno
const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

/**
 * Ejecuta un query Flux y devuelve las filas como objetos tipados.
 * El tipo T se define en cada llamada para mayor seguridad.
 */
export async function runFlux<T = any>(flux: string): Promise<T[]> {
  const rows: T[] = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(flux, {
      next: (row, tableMeta) => {
        rows.push(tableMeta.toObject(row) as T);
      },
      error: (err) => {
        console.error("❌ Influx query error:", err);
        reject(err);
      },
      complete: () => resolve(rows),
    });
  });
}

/**
 * Devuelve una serie temporal lista para Highcharts
 */
export async function fetchSeries(
  bucket: string,
  rango: string,
  campo: string,
  every: string = "1h"
) {
  const flux = `
    from(bucket: "${bucket}")
      |> range(start: ${rango})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${campo}")
      |> aggregateWindow(every: ${every}, fn: mean, createEmpty: false)
      |> yield(name: "mean")
  `;

  const rows = await runFlux<{ _time: string; _value: string }>(flux);

  return rows
    .filter((r) => r._time)
    .map((r) => [new Date(r._time!).getTime(), Number(r._value)]);
}

/**
 * Devuelve un único valor (ej. max, min, last, first)
 */
export async function fetchSingleValue(
  flux: string
): Promise<number | null> {
  const rows = await runFlux<{ _value: string }>(flux);
  return rows.length ? Number(rows[0]._value) : null;
}

/**
 * Calcula KPIs de consumo, variación, pico y factor de carga
 */
export async function fetchKPIs(bucket: string) {
  const [firstRow, lastRow, anteriorFirst, anteriorLast, maxRows, meanRows] =
    await Promise.all([
      runFlux<{ _value: string }>(`
        from(bucket: "${bucket}") |> range(start: -7d)
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
        |> first()
      `),
      runFlux<{ _value: string }>(`
        from(bucket: "${bucket}") |> range(start: -7d)
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
        |> last()
      `),
      runFlux<{ _value: string }>(`
        from(bucket: "${bucket}") |> range(start: -14d, stop: -7d)
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
        |> first()
      `),
      runFlux<{ _value: string }>(`
        from(bucket: "${bucket}") |> range(start: -14d, stop: -7d)
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
        |> last()
      `),
      runFlux<{ _value: string }>(`
        from(bucket: "${bucket}") |> range(start: -7d)
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> max()
      `),
      runFlux<{ _value: string }>(`
        from(bucket: "${bucket}") |> range(start: -7d)
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> mean()
      `),
    ]);

  const consumo =
    lastRow.length && firstRow.length
      ? Number(lastRow[0]._value) - Number(firstRow[0]._value)
      : 0;

  const consumoAnterior =
    anteriorLast.length && anteriorFirst.length
      ? Number(anteriorLast[0]._value) - Number(anteriorFirst[0]._value)
      : 0;

  let variacion = "N/A";
  if (consumoAnterior && consumoAnterior >= 100) {
    const v = ((consumo - consumoAnterior) / consumoAnterior) * 100;
    if (Math.abs(v) <= 200) variacion = `${v.toFixed(1)}%`;
  }

  const max = maxRows.length ? Number(maxRows[0]._value) : 0;
  const mean = meanRows.length ? Number(meanRows[0]._value) : 0;
  const factorCarga = max ? (mean / max) * 100 : 0;

  return [
    { label: "Consumo total (7d)", value: consumo ? `${(consumo / 1e3).toFixed(1)} kWh` : "N/A" },
    { label: "Variación vs semana anterior", value: variacion },
    { label: "Pico máximo de demanda", value: max ? `${max.toFixed(1)} kW` : "N/A" },
    { label: "Factor de carga", value: max ? `${factorCarga.toFixed(1)}%` : "N/A" },
  ];
}

/**
 * Devuelve dos series temporales (actual y anterior) listas para Highcharts
 */
export async function fetchTrendSeries(
  bucket: string,
  field: string = "power_kW",
  every: string = "30m"
) {
  const [actualRows, anteriorRows] = await Promise.all([
    runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}") |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${field}")
      |> aggregateWindow(every: ${every}, fn: mean, createEmpty: false)
    `),
    runFlux<{ _time: string; _value: string }>(`
      from(bucket: "${bucket}") |> range(start: -14d, stop: -7d)
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${field}")
      |> aggregateWindow(every: ${every}, fn: mean, createEmpty: false)
    `),
  ]);

  const actualSeries = actualRows
    .filter((r) => r._time)
    .map((r) => [new Date(r._time!).getTime(), Number(r._value)]);

  const anteriorSeries = anteriorRows
    .filter((r) => r._time)
    .map((r) => [new Date(r._time!).getTime(), Number(r._value)]);

  return { actualSeries, anteriorSeries };
}