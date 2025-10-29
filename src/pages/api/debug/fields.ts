import type { NextApiRequest, NextApiResponse } from "next";
import { runFlux } from "@/lib/influx"; // Asegúrate de tener esta función

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const meter = "pqgenius"; // fijo por ahora

  const flux = `
    import "influxdata/influxdb/schema"
    schema.fields(bucket: "energia", predicate: (r) => r._measurement == "${meter}")
  `;

  try {
    const rows = await runFlux(flux);
    const fields = rows.map((r: any) => r._value);
    return res.status(200).json({ ok: true, fields });
  } catch (err) {
    console.error("Error en /api/debug/fields:", err);
    return res.status(500).json({ ok: false, error: "Query failed" });
  }
}