// middleware.ts — versión temporal desactivada
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Mantén o elimina config según necesidad
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};