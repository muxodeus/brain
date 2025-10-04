// explore-influx.mjs
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL || "https://us-east-1-1.aws.cloud2.influxdata.com";
const token = process.env.INFLUX_TOKEN || "ug7vnFSzqQseHoS9I1Jx4YL-135--9CO2DI-dL8kavBtt8KUqCcIQK0yOfPB_tXReyYb_4GIqmXW7r0D-TWXeQ==";
const org = process.env.INFLUX_ORG || "PQGenius";
const bucket = process.env.INFLUX_BUCKET || "pqgenius";

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

// 1. Listar mediciones distintas
const measurementsQuery = `
  import "influxdata/influxdb/schema"
  schema.measurements(bucket: "${bucket}")
`;

// 2. Listar campos (_field) de cada medición
const fieldsQuery = `
  import "influxdata/influxdb/schema"
  schema.fieldKeys(bucket: "${bucket}")
`;

// 3. Últimos valores por medidor (potencia, tensión, pf)
const latestValuesQuery = `
  from(bucket: "${bucket}")
    |> range(start: -1d)
    |> filter(fn: (r) => r._measurement == "energy")
    |> last()
    |> keep(columns: ["_time", "_field", "_value", "meter"])
`;

async function runQuery(name, flux) {
  console.log(`\n🔎 Ejecutando: ${name}`);
  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(flux)) {
      const o = tableMeta.toObject(values);
      console.log(o);
    }
    console.log(`✅ ${name} completado`);
  } catch (err) {
    console.error(`❌ Error en ${name}:`, err);
  }
}

(async () => {
  await runQuery("Mediciones disponibles", measurementsQuery);
  await runQuery("Campos (_field) disponibles", fieldsQuery);
  await runQuery("Últimos valores por medidor", latestValuesQuery);
})();