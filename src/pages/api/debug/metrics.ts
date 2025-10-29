import type { NextApiRequest, NextApiResponse } from "next";
import { runFlux } from "@/lib/influx"; // Asegúrate de tener esta función

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { meter, param } = req.query;

  if (!meter || !param) {
    return res.status(400).json({ ok: false, error: "Missing meter or param" });
  }

  const flux = `
    from(bucket: "energia")
      |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "${meter}" and r._field == "${param}")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 10)
  `;

  try {
    const rows = await runFlux(flux);
    return res.status(200).json({ ok: true, rows });
  } catch (err) {
    console.error("Error en /api/debug/metrics:", err);
    return res.status(500).json({ ok: false, error: "Query failed" });
  }
}