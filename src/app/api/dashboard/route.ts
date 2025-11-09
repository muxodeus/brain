import { NextResponse } from "next/server";

export async function GET() {
  const canales = {
    A: Math.round(Math.random() * 100),
    B: Math.round(Math.random() * 100),
    C: Math.round(Math.random() * 100),
  };
  const totales = canales.A + canales.B + canales.C;

  return NextResponse.json({ canales, totales });
}