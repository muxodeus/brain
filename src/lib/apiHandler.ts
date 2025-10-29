// lib/apiHandler.ts
import { NextResponse } from "next/server";

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