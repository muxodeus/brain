// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // No hay cookies que borrar en esta versión
  return NextResponse.json({ success: true });
}