// proxy.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get full session using NextAuth
  const session = await auth()
  const isLoggedIn = !!session?.user

  // Routes
  const isLandingPage = pathname === '/'
  
  // Define route types
  const isAuthRoute = pathname.startsWith('/sign-in') || 
                      pathname.startsWith('/sign-up') ||
                      pathname.startsWith('/forgot-password') ||
                      pathname.startsWith('/reset-password') ||
                      pathname.startsWith('/error')
  
  const isProfileSetupPage = pathname === '/complete-profile'
  
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/properties') ||
                          pathname.startsWith('/leases') ||
                          pathname.startsWith('/payments') ||
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/profile') ||
                          pathname.startsWith('/vendors') ||
                          pathname.startsWith('/maintenance') ||
                          pathname.startsWith('/tenants')
  
  // ✅ ADD: Admin-specific routes
  const isAdminRoute = pathname.startsWith('/admin')
  
  // 1. Not logged in trying to access protected routes
  if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // ✅ ADD: Check if non-admin user tries to access admin routes
  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ✅ ADD: Role-based route protection
  // Tenants should only access tenant-specific routes
  if (session?.user?.role === 'TENANT') {
    const tenantAllowedRoutes = [
      '/dashboard',
      '/dashboard/tenant',
      '/dashboard/my-lease',
      '/dashboard/payments',
      '/dashboard/maintenance',
      '/dashboard/messages',
      '/dashboard/profile',
      '/dashboard/settings',
      '/dashboard/notifications',
      '/dashboard/lease-signing',
    ]

    const isTenantAllowed = tenantAllowedRoutes.some(route =>
      pathname === route || pathname.startsWith(route + '/')
    )

    // Block tenants from accessing landlord/vendor/admin routes
    const isLandlordRoute = pathname.startsWith('/dashboard/landlord') ||
                            pathname.startsWith('/dashboard/properties') ||
                            pathname.startsWith('/dashboard/tenants') ||
                            pathname.startsWith('/dashboard/vendors') ||
                            pathname.startsWith('/dashboard/leases') ||
                            pathname.startsWith('/dashboard/expenses') ||
                            pathname.startsWith('/dashboard/reports')

    const isVendorRoute = pathname.startsWith('/dashboard/vendor')

    if (isLandlordRoute || isVendorRoute || !isTenantAllowed) {
      return NextResponse.redirect(new URL('/dashboard/tenant', request.url))
    }
  }

  // Landlords should not access tenant-only routes
  if (session?.user?.role === 'LANDLORD') {
    if (pathname.startsWith('/dashboard/my-lease') ||
        pathname.startsWith('/dashboard/tenant')) {
      return NextResponse.redirect(new URL('/dashboard/landlord', request.url))
    }
  }

  // Vendors should not access landlord/tenant routes
  if (session?.user?.role === 'VENDOR') {
    if (pathname.startsWith('/dashboard/landlord') ||
        pathname.startsWith('/dashboard/tenant') ||
        pathname.startsWith('/dashboard/my-lease') ||
        pathname.startsWith('/dashboard/properties')) {
      return NextResponse.redirect(new URL('/dashboard/vendor', request.url))
    }
  }
  
  // 2. Logged in user needs to complete profile (OAuth users)
  // ✅ FIX: Skip profile setup for ADMIN users
  if (isLoggedIn && session?.user?.needsProfileSetup && session?.user?.role !== 'ADMIN') {
    if (!isProfileSetupPage && !isAuthRoute) {
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }
  }
  
  // 3. Profile completed but still on profile setup page
  if (isLoggedIn && !session?.user?.needsProfileSetup && isProfileSetupPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // 4. Logged in users with completed profile trying to access auth pages
  if (
    isLoggedIn &&
    !session.user.needsProfileSetup &&
    (isAuthRoute || isLandingPage)
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}