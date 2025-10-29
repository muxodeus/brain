import type { NextApiRequest, NextApiResponse } from "next";

type Gateway = {
  id: number;
  name: string;
  site: string;
  gwId: string;
};

const gateways: Gateway[] = [
  { id: 1, name: "Gateway Planta Principal", site: "Planta Principal", gwId: "GW01" },
  { id: 2, name: "Gateway Secundario", site: "Planta Secundaria", gwId: "GW02" },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json(gateways);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}