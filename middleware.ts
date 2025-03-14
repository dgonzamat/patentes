import { authMiddleware } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Añadir headers CORS para las rutas de API
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    // Permitir solicitudes desde cualquier origen para desarrollo
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    return response
  }

  return NextResponse.next()
}

export default authMiddleware({
  // Rutas públicas que no requieren autenticación
  publicRoutes: ["/", "/api/webhook", "/about", "/terms", "/privacy"],
})

export const config = {
  matcher: ["/api/:path*"],
}

