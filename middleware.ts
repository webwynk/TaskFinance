import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isAuthenticated = !!session?.user
  const isAdmin = session?.user?.role === 'ADMIN'

  const isAuthPage = nextUrl.pathname.startsWith('/login')
  const isApiAuthPage = nextUrl.pathname.startsWith('/api/auth')
  const isAdminPage =
    nextUrl.pathname.startsWith('/admin') ||
    nextUrl.pathname.startsWith('/api/users') ||
    (nextUrl.pathname.startsWith('/api/categories') &&
      ['POST', 'PUT', 'DELETE'].includes(req.method))

  // Allow public API auth routes
  if (isApiAuthPage) return NextResponse.next()

  // Redirect authenticated users away from login
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Redirect unauthenticated users to login
  if (!isAuthPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Block non-admin from admin routes
  if (isAdminPage && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
