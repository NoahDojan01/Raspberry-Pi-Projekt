import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Never intercept API routes or the maintenance page itself
  const isApiRoute = pathname.startsWith('/api/')
  const isMaintenancePage = pathname.startsWith('/maintenance')
  const isStaticAsset =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  const isAdmin = Boolean(adminEmail && user?.email === adminEmail)

  // ── Maintenance mode check ─────────────────────────────────────────────────
  if (!isApiRoute && !isMaintenancePage && !isStaticAsset && !isAdmin) {
    const { data: settings } = await supabase
      .from('app_settings')
      .select('maintenance_enabled, maintenance_until')
      .eq('id', 1)
      .single()

    if (settings?.maintenance_enabled) {
      const until = settings.maintenance_until
      const stillActive = !until || new Date(until) > new Date()
      if (stillActive) {
        const url = request.nextUrl.clone()
        url.pathname = '/maintenance'
        return NextResponse.redirect(url)
      }
    }
  }

  // ── User ban check ─────────────────────────────────────────────────────────
  if (user && !isAdmin && !isApiRoute && !isMaintenancePage && !isStaticAsset) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('banned_until')
      .eq('id', user.id)
      .single()

    if (profile?.banned_until && new Date(profile.banned_until) > new Date()) {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      url.search = '?banned=1'
      return NextResponse.redirect(url)
    }
  }

  // ── Standard auth guards ───────────────────────────────────────────────────
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')

  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/test') ||
    pathname.startsWith('/results') ||
    pathname.startsWith('/upload') ||
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/katalog') ||
    pathname.startsWith('/profile')

  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
