import { NextResponse } from "next/server";
import { fetchSummary } from "@/lib/influx";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "-24h";
  const bucket = process.env.INFLUX_BUCKET!;

  try {
    const summary = await fetchSummary(bucket, range);
    return NextResponse.json({ ok: true, summary });
  } catch (err: any) {
    console.error("❌ Error Influx summary:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}