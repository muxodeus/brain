import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/apiHandler";

// ⚠️ Mock temporal en memoria
// En producción deberías reemplazar esto por DB o Influx
let gateways: Array<{ id: string; name: string; site: string }> = [
  { id: "GW01", name: "Gateway Planta Principal", site: "Planta Principal" },
  { id: "GW02", name: "Gateway Planta Secundaria", site: "Planta Secundaria" },
];

// GET → lista todos los gateways
export async function GET(): Promise<Response> {
  return apiHandler(async () => {
    return gateways;
  });
}

// POST → crea un nuevo gateway
export async function POST(req: NextRequest): Promise<Response> {
  return apiHandler(async () => {
    const body = await req.json();

    if (!body.id || !body.name || !body.site) {
      throw new Error("Faltan campos obligatorios: id, name, site");
    }

    // Validar que no exista ya
    if (gateways.find((g) => g.id === body.id)) {
      throw new Error(`Ya existe un gateway con id ${body.id}`);
    }

    const newGw = {
      id: body.id,
      name: body.name,
      site: body.site,
    };

    gateways.push(newGw);
    return { message: "Gateway creado correctamente", gateway: newGw };
  });
}