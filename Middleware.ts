import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Mantenha aqui apenas para checagem interna se desejar
const AUTH_ONLY_ROUTES = ['/rooms', '/profile', '/chat']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Criamos a resposta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualiza os cookies na requisição para que o getUser() veja a mudança
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Atualiza os cookies na resposta que será enviada ao navegador
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Importante: use getUser() em vez de getSession() para segurança real no server-side
  const { data: { user } } = await supabase.auth.getUser()

  const isProtectedRoute = AUTH_ONLY_ROUTES.some(route => pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    // Opcional: guardar a URL original para redirecionar após login
    // url.searchParams.set('next', pathname) 
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Garanta que todas as rotas sensíveis passem por aqui
  matcher: [
    '/rooms/:path*', 
    '/chat/:path*', 
    '/profile/:path*',
    '/setup/:path*' // Vi na sua árvore que tem uma pasta setup
  ],
}