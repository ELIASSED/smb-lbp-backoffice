import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  const path = req.nextUrl.pathname

  // Liste des routes publiques (non protégées)
  const publicRoutes = [
    '/auth/login',
    '/api/auth/signin',
    '/api/auth/session',
    '/api/auth/csrf'
  ]

  // Si la route n'est pas publique et qu'il n'y a pas de token
  if (!publicRoutes.includes(path) && !token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/staff/:path*',
    '/sessions/:path*',
    '/api/:path*'
  ]
}