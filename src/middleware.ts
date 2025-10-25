import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Si l'utilisateur est sur la page d'accueil et connecté, rediriger vers le dashboard
    if (req.nextUrl.pathname === "/" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    
    // Si l'utilisateur essaie d'accéder au dashboard sans être connecté
    if (req.nextUrl.pathname.startsWith("/dashboard") && !req.nextauth.token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true // On laisse le middleware ci-dessus gérer la logique
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (page de connexion)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}