import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 1, nombre: "Ana", rol: "Operador", jerarquia: "Nivel 2" },
    { id: 2, nombre: "Luis", rol: "Supervisor", jerarquia: "Nivel 1" },
  ]);
}