#!/usr/bin/env tsx
/**
 * Script CLI para depurar InfluxDB:
 * - Lista mediciones
 * - Lista campos
 * - Trae últimas 5 muestras de cada campo
 *
 * Uso:
 *   npx tsx scripts/check-influx.ts
 */

import { InfluxDB, flux } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL || "http://localhost:8086";
const token = process.env.INFLUX_TOKEN || "";
const org = process.env.INFLUX_ORG || "";
const bucket = process.env.INFLUX_BUCKET || "pqgenius";

// Tipos para los resultados de Influx
type FluxRow = { _value: string; _time?: string; _field?: string };

async function main() {
  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  console.log(`🔎 Explorando bucket: ${bucket}\n`);

  // 1. Mediciones
  const measurementsQuery = `
    import "influxdata/influxdb/schema"
    schema.measurements(bucket: "${bucket}")
  `;
  console.log("📌 Mediciones disponibles:");
  const measurements = await queryApi.collectRows<FluxRow>(measurementsQuery);
  measurements.forEach((r) => console.log(" -", r._value));

  // 2. Campos
  const fieldKeysQuery = `
    import "influxdata/influxdb/schema"
    schema.fieldKeys(bucket: "${bucket}")
  `;
  console.log("\n📌 Campos disponibles:");
  const fields = await queryApi.collectRows<FluxRow>(fieldKeysQuery);
  fields.forEach((r) => console.log(" -", r._value));

  // 3. Últimas 5 muestras por campo
  console.log("\n📌 Últimas 5 muestras por campo:");
  for (const f of fields) {
    const field = f._value;
    const sampleQuery = flux`from(bucket: "${bucket}")
      |> range(start: -24h)
      |> filter(fn: (r) => r._field == "${field}")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n:5)`;

    const samples = await queryApi.collectRows<FluxRow>(sampleQuery);
    console.log(`\nCampo: ${field}`);
    samples.forEach((s) =>
      console.log(` - ${s._time}: ${s._value}`)
    );
  }
}

main().catch((err) => {
  console.error("❌ Error al consultar InfluxDB:", err);
});