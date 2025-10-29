import { NextResponse } from "next/server";
import { meterTemplates } from "@/lib/meterTemplates"; // opcional si usas archivo local

let templates: any[] = [...meterTemplates]; // simula InfluxDB

export async function GET() {
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newTemplate = { id: Date.now(), ...body };
  templates.push(newTemplate);
  return NextResponse.json(newTemplate, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const index = templates.findIndex((t) => t.id === body.id);
  if (index === -1) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  templates[index] = { ...templates[index], ...body };
  return NextResponse.json(templates[index]);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  templates = templates.filter((t) => t.id !== id);
  return NextResponse.json({ success: true });
}