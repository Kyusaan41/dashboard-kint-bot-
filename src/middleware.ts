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
    
    // Enforce bans: if user is banned, redirect to /banned (except when already there or on login; APIs are excluded)
    if (req.nextauth.token) {
      const userId = (req.nextauth.token as any)?.id as string | undefined
      const pathname = req.nextUrl.pathname
      const isPublic = pathname === "/login" || pathname === "/banned"
      const isApi = pathname.startsWith("/api")
      if (userId && !isApi && !isPublic) {
        const url = new URL(`/api/ban-check?userId=${encodeURIComponent(userId)}`, req.url)
        return fetch(url.toString())
          .then(async (res) => {
            if (!res.ok) return NextResponse.next()
            const data = await res.json().catch(() => ({ banned: false }))
            if (data?.banned && pathname !== "/banned") {
              return NextResponse.redirect(new URL("/banned", req.url))
            }
            return NextResponse.next()
          })
          .catch(() => NextResponse.next())
      }
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