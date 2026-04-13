// ════════════════════════════════════════════════
//  NUVITA — middleware.ts
//  Gate de diagnóstico: rotas protegidas só acessíveis
//  após o usuário ter concluído o diagnóstico.
// ════════════════════════════════════════════════

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Rotas que exigem diagnóstico feito
const GATED_ROUTES = [
  '/dashboard',
  '/revisao',
  '/protocolo',
  '/conta',
  '/perfil',
  '/coach',
  '/ia',
  '/diario',
  '/analise',
  '/historico',
  '/calendario',
  '/estoque',
  '/rotina',
  '/detector',
  '/simulador',
  '/ajuste',
  '/calculadora',
  '/exportacao',
  '/configuracoes',
  '/mapa',
  '/consistencia',
];

// Rotas que precisam de autenticação mas NÃO de diagnóstico
const AUTH_ONLY_ROUTES = ['/planos', '/pagamento'];

// Rotas públicas (nunca intercepta)
const PUBLIC_ROUTES = ['/', '/login', '/cadastro', '/diagnostico', '/termos', '/privacidade', '/biblioteca'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Deixa passar tudo que é asset ou API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.') // arquivos estáticos
  ) {
    return NextResponse.next();
  }

  // Deixa passar rotas públicas
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next();
  }

  // Só intercepta rotas que realmente precisam de gate
  const isGated = GATED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
  const isAuthOnly = AUTH_ONLY_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  if (!isGated && !isAuthOnly) {
    return NextResponse.next();
  }

  // Pega sessão do Supabase via cookie
  const res = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Sem config de Supabase, deixa passar (evita quebrar build)
    return res;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        res.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Sem sessão → manda pra login (preservando redirect)
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se é auth-only (tipo /planos), já tá autenticado, libera
  if (isAuthOnly) {
    return res;
  }

  // É gated (dashboard etc) → checa se tem diagnóstico
  const { data: user } = await supabase
    .from('usuarios')
    .select('diagnostico')
    .eq('id', session.user.id)
    .single();

  const hasDiagnostico =
    user?.diagnostico && typeof user.diagnostico === 'object' && Object.keys(user.diagnostico).length > 0;

  if (!hasDiagnostico) {
    const diagUrl = req.nextUrl.clone();
    diagUrl.pathname = '/diagnostico';
    diagUrl.searchParams.set('origem', 'gate');
    return NextResponse.redirect(diagUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas exceto:
     * - _next (Next internals)
     * - favicon e assets estáticos
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
