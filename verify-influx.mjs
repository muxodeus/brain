// verify-influx.js
import { InfluxDB } from "@influxdata/influxdb-client";

// ⚡ Configura tus credenciales en variables de entorno
const url = process.env.INFLUX_URL || "https://us-east-1-1.aws.cloud2.influxdata.com";
const token = process.env.INFLUX_TOKEN || "ug7vnFSzqQseHoS9I1Jx4YL-135--9CO2DI-dL8kavBtt8KUqCcIQK0yOfPB_tXReyYb_4GIqmXW7r0D-TWXeQ==";
const org = process.env.INFLUX_ORG || "PQGenius";
const bucket = process.env.INFLUX_BUCKET || "pqgenius";

// Instancia del cliente
const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

// Query Flux: últimas 10 lecturas de energía del medidor pqgenius
const fluxQuery = `
from(bucket: "pqgenius")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "pqgenius")
  |> keep(columns: ["_time", "_field", "_value", "meter"])
  |> limit(n:20)
`;

console.log("⏳ Ejecutando query en Influx...");

(async () => {
  try {
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      const o = tableMeta.toObject(values);
      console.log(
        `${o._time} | meter=${o.meter} | ${o._field}=${o._value}`
      );
    }
    console.log("✅ Query completada");
  } catch (err) {
    console.error("❌ Error consultando Influx:", err);
  }
})();