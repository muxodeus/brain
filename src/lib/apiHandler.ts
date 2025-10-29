// lib/apiHandler.ts
import { NextResponse } from "next/server";

/**
 * Envuelve un handler asíncrono y garantiza que siempre devuelva un Response.
 * @param fn Función que devuelve datos (objeto, array, string, etc.)
 */
export async function apiHandler<T>(fn: () => Promise<T>): Promise<Response> {
  try {
    const data = await fn();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Error en API:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}