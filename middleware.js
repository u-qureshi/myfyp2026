import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Public routes - always allow
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')
  ) {
    return NextResponse.next()
  }

  // Get session cookie - try both cookie names
  const sessionCookie = request.cookies.get('user_session') || request.cookies.get('session')
  console.log('[Middleware] All cookies:', request.cookies.getAll())
  console.log('[Middleware] user_session cookie:', sessionCookie)

  // No session - redirect to login
  if (!sessionCookie) {
    console.log('[Middleware] No session cookie found for:', pathname)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Parse session
  let session
  try {
    session = JSON.parse(sessionCookie.value)
    console.log('[Middleware] Session parsed:', { role: session.role, path: pathname })
  } catch (e) {
    console.error('[Middleware] Error parsing session:', e)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check role-based access
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    console.log('[Middleware] Admin access denied for role:', session.role)
    return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url))
  }

  if (pathname.startsWith('/faculty') && session.role !== 'faculty' && session.role !== 'admin') {
    console.log('[Middleware] Faculty access denied for role:', session.role)
    return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url))
  }

  if (pathname.startsWith('/student') && session.role !== 'student' && session.role !== 'admin') {
    console.log('[Middleware] Student access denied for role:', session.role)
    return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url))
  }

  console.log('[Middleware] Access allowed for:', { role: session.role, path: pathname })
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|public).*)'
  ],
}
