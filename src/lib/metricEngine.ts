import { InfluxDB } from "@influxdata/influxdb-client";

export type MetricKPIs = {
  field: string;
  totalSamples: number;
  promedio: number;
  minimo: number;
  maximo: number;
  desviacion: number;
  bajoUmbral?: {
    umbral: number;
    muestras: number;
    porcentaje: number;
  };
};

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
function stddev(arr: number[]) {
  if (!arr.length) return 0;
  const m = avg(arr);
  const v = arr.reduce((s, x) => s + (x - m) * (x - m), 0) / arr.length;
  return Math.sqrt(v);
}

export async function computeKPIs(
  field: string,
  range: string = "-24h",
  umbral?: number
): Promise<MetricKPIs> {
  const url = process.env.INFLUX_URL || "http://localhost:8086";
  const token = process.env.INFLUX_TOKEN || "";
  const org = process.env.INFLUX_ORG || "";
  const bucket = process.env.INFLUX_BUCKET || "pqgenius";

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "${field}")
      |> keep(columns: ["_time", "_value"])
  `;

  const values: number[] = [];
  await new Promise<void>((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, meta) {
        const o = meta.toObject(row);
        if (o._value !== undefined) {
          values.push(Number(o._value));
        }
      },
      error(err) {
        reject(err);
      },
      complete() {
        resolve();
      },
    });
  });

  const total = values.length;
  const promedio = avg(values);
  const minimo = total ? Math.min(...values) : 0;
  const maximo = total ? Math.max(...values) : 0;
  const desviacion = stddev(values);

  let bajoUmbral;
  if (umbral !== undefined) {
    const muestras = values.filter((v) => v < umbral).length;
    bajoUmbral = {
      umbral,
      muestras,
      porcentaje: total ? (muestras / total) * 100 : 0,
    };
  }

  return {
    field,
    totalSamples: total,
    promedio: Number(promedio.toFixed(3)),
    minimo,
    maximo,
    desviacion: Number(desviacion.toFixed(3)),
    ...(bajoUmbral ? { bajoUmbral } : {}),
  };
}