import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    total: 1234.56,
    moneda: "USD",
  });
}