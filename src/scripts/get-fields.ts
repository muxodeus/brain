import fs from "fs";
import path from "path";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = "energia";

const influx = new InfluxDB({ url, token });
const queryApi = influx.getQueryApi(org);

async function getMeasurements(): Promise<string[]> {
  const flux = `import "influxdata/influxdb/schema"
    schema.measurements(bucket: "${bucket}")`;

  const rows: string[] = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(flux, {
      next(row, tableMeta) {
        const obj = tableMeta.toObject(row);
        rows.push(obj._value);
      },
      error: reject,
      complete: () => resolve(rows),
    });
  });
}

async function getFields(measurement: string): Promise<string[]> {
  const flux = `import "influxdata/influxdb/schema"
    schema.fields(bucket: "${bucket}", predicate: (r) => r._measurement == "${measurement}")`;

  const fields: string[] = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(flux, {
      next(row, tableMeta) {
        const obj = tableMeta.toObject(row);
        fields.push(obj._value);
      },
      error: reject,
      complete: () => resolve(fields),
    });
  });
}

async function run() {
  const result: Record<string, string[]> = {};
  const measurements = await getMeasurements();

  for (const m of measurements) {
    const fields = await getFields(m);
    result[m] = fields;
    console.log(`✔ ${m}: ${fields.length} campos`);
  }

  const outputPath = path.join(__dirname, "config-fields.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`✅ Guardado en ${outputPath}`);
}

run().catch((err) => {
  console.error("❌ Error:", err);
});