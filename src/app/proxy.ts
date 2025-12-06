import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  // Ejemplo: proteger rutas privadas
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const token = req.cookies.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Si no hay reglas, continuar
  return NextResponse.next();
}