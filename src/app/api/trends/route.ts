import { NextResponse } from "next/server";

export async function GET() {
  const now = Date.now();
  return NextResponse.json({
    series: [
      {
        name: "Canal A",
        color: "#465fff",
        data: Array.from({ length: 10 }, (_, i) => [now - i * 3600_000, Math.random() * 100]),
      },
      {
        name: "Canal B",
        color: "#12b76a",
        data: Array.from({ length: 10 }, (_, i) => [now - i * 3600_000, Math.random() * 80]),
      },
    ],
  });
}