// src/app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const users = [
    { email: "demo@mail.com", password: "demo", role: "admin" },
    { email: "eng@mail.com", password: "eng", role: "engineer" },
    { email: "view@mail.com", password: "view", role: "viewer" },
  ];

  const found = users.find(
    (u) => u.email === email.trim() && u.password === password.trim()
  );

  if (!found) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  // Sin cookies: solo devolvemos el usuario
  return NextResponse.json({ success: true, user: found });
}