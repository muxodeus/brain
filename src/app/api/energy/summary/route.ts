import { NextResponse } from "next/server";
import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
const bucket = process.env.INFLUX_BUCKET!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "-24h";

  const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

  async function runQuery(flux: string) {
    const rows: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(flux, {
        next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
        error: reject,
        complete: () => resolve(),
      });
    });
    return rows;
  }

  try {
    const energyQ = `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "energy_kWh")
        |> difference(nonNegative: true)
        |> sum()
    `;

    const powerNowQ = `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> last()
    `;

    const voltageNowQ = `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "voltage_A")
        |> last()
    `;

    const maxDemandQ = `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "power_kW")
        |> max()
    `;

    const freqNowQ = `
      from(bucket: "${bucket}")
        |> range(start: ${range})
        |> filter(fn: (r) => r._measurement == "pqgenius" and r._field == "freq_Hz")
        |> last()
    `;

    const [energyRows, powerRows, voltRows, maxRows, freqRows] = await Promise.all([
      runQuery(energyQ),
      runQuery(powerNowQ),
      runQuery(voltageNowQ),
      runQuery(maxDemandQ),
      runQuery(freqNowQ),
    ]);

    const summary = {
      totalConsumption: energyRows[0]?._value ?? 0,
      powerNow: powerRows[0]?._value ?? 0,
      voltageNow: voltRows[0]?._value ?? 0,
      maxDemand: maxRows[0]?._value ?? 0,
      freqNow: freqRows[0]?._value ?? 0,
    };

    return NextResponse.json({ ok: true, summary });
  } catch (err: any) {
    console.error("❌ Error Influx summary:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}