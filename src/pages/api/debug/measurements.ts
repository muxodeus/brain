import type { NextApiRequest, NextApiResponse } from "next";
import { runFlux } from "@/lib/influx";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const flux = `
    import "influxdata/influxdb/schema"
    schema.measurements(bucket: "energia")
  `;

  try {
    const rows = await runFlux(flux);
    const measurements = rows.map((r: any) => r._value);
    return res.status(200).json({ ok: true, measurements });
  } catch (err) {
    console.error("Error en /api/debug/measurements:", err);
    return res.status(500).json({ ok: false, error: "Query failed" });
  }
}