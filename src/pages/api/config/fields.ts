import type { NextApiRequest, NextApiResponse } from "next";
import { runFlux } from "@/lib/influx";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { bucket = "pqgenius", meter = "pqgenius" } = req.query;

  const flux = `
    import "influxdata/influxdb/schema"
    schema.fieldKeys(
      bucket: "${bucket}",
      predicate: (r) => r._measurement == "${meter}",
      start: -30d
    )
  `;

  try {
    const rows = await runFlux(flux);
    const fields = rows.map((r) => r._value);
    return res.status(200).json({ ok: true, fields });
  } catch (err) {
    console.error("Error en /api/config/fields:", err);
    return res.status(500).json({ ok: false, error: "Query failed" });
  }
}