import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/']
const AUTH_ONLY_ROUTES = ['/rooms', '/profile', '/chat']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Criamos a resposta base
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. Instanciamos o Server Client (Necessário aqui para ler os cookies da request)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Pegamos o usuário
  const { data: { user } } = await supabase.auth.getUser()

  const isProtectedRoute = AUTH_ONLY_ROUTES.some(route => pathname.startsWith(route))

  // 4. Proteção de Rota
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}