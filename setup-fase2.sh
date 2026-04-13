#!/bin/bash
# ════════════════════════════════════════════════
#  NUVITA — Correção de fluxo (Fase 2)
#
#  Objetivo: forçar todo usuário a passar pelo diagnóstico
#  ANTES de acessar dashboard/revisão/pagamento.
#
#  Fluxo correto após essas mudanças:
#    Landing → /diagnostico → /revisao → /planos → /pagamento/sucesso → /dashboard
#                             └─ free continua aqui
# ════════════════════════════════════════════════

set -e

echo "🔍 Verificando estrutura do projeto..."
if [ ! -f "app/page.tsx" ] || [ ! -f "app/cadastro/page.tsx" ] || [ ! -f "app/planos/page.tsx" ]; then
  echo "❌ ERRO: rode esse script de dentro da pasta nuvita/"
  exit 1
fi
echo "✓ Tá no lugar certo: $(pwd)"
echo ""

# ════════════════════════════════════════════════
# PARTE 1 — Criar middleware.ts com gate de diagnóstico
# ════════════════════════════════════════════════
echo "🛡️  Criando middleware.ts (gate de diagnóstico)..."

cat > middleware.ts <<'MWEOF'
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
MWEOF

echo "✓ middleware.ts criado"
echo ""

# ════════════════════════════════════════════════
# PARTE 2 — Instalar dependência @supabase/ssr (necessária pro middleware)
# ════════════════════════════════════════════════
echo "📦 Verificando se @supabase/ssr está instalado..."
if ! grep -q '"@supabase/ssr"' package.json; then
  echo "⚠️  Instalando @supabase/ssr..."
  npm install @supabase/ssr
  echo "✓ @supabase/ssr instalado"
else
  echo "✓ @supabase/ssr já está no package.json"
fi
echo ""

# ════════════════════════════════════════════════
# PARTE 3 — Landing: mudar CTAs de planos pagos pra /diagnostico?plan=X
# ════════════════════════════════════════════════
echo "🎯 Ajustando CTAs da landing (app/page.tsx)..."

python3 <<'PYEOF'
with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# CTAs dos planos pagos apontam pro diagnóstico com intent de plano
content = content.replace(
    "href: '/cadastro?plan=essencial'",
    "href: '/diagnostico?plan=essencial'"
)
content = content.replace(
    "href: '/cadastro?plan=pro'",
    "href: '/diagnostico?plan=pro'"
)

if content == original:
    print("⚠️  Landing: nada pra alterar (já estava ok ou arquivo diferente)")
else:
    with open('app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Landing CTAs apontam pra /diagnostico?plan=X")
PYEOF
echo ""

# ════════════════════════════════════════════════
# PARTE 4 — /cadastro: preservar ?plan= e ?next= no redirect pós-cadastro
# ════════════════════════════════════════════════
echo "🔐 Ajustando app/cadastro/page.tsx (preservar intent do plano)..."

python3 <<'PYEOF'
import re

with open('app/cadastro/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# Garante que o redirect pós-cadastro respeita o ?next= ou ?plan=
# Troca o hardcoded /planos?origem=diagnostico por uma função que lê searchParams
old_google_redirect = "options: { redirectTo: `${window.location.origin}/planos?origem=diagnostico` }"
new_google_redirect = (
    "options: { redirectTo: `${window.location.origin}"
    "${searchParams?.get('next') || "
    "(searchParams?.get('plan') ? `/revisao?plan=${searchParams.get('plan')}` : '/planos?origem=diagnostico')}` }"
)

if old_google_redirect in content:
    content = content.replace(old_google_redirect, new_google_redirect)
    print("✓ Google OAuth redirect ajustado")

if content == original:
    print("⚠️  Cadastro: nenhuma alteração feita (padrão não encontrado)")
else:
    with open('app/cadastro/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Cadastro atualizado")
PYEOF
echo ""

# ════════════════════════════════════════════════
# PARTE 5 — /pagamento/sucesso: redirecionar pro /dashboard (não /revisao)
# ════════════════════════════════════════════════
echo "💳 Ajustando app/pagamento/sucesso/page.tsx..."

python3 <<'PYEOF'
with open('app/pagamento/sucesso/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# Troca qualquer redirect pra /revisao por /dashboard
content = content.replace("router.push('/revisao')", "router.push('/dashboard')")
content = content.replace('router.push("/revisao")', 'router.push("/dashboard")')
content = content.replace("router.replace('/revisao')", "router.replace('/dashboard')")
content = content.replace('router.replace("/revisao")', 'router.replace("/dashboard")')

# Atualiza a mensagem também
content = content.replace(
    "Seu plano foi ativado. Redirecionando para revisar seu protocolo...",
    "Seu plano foi ativado. Redirecionando para o painel..."
)

if content == original:
    print("⚠️  Pagamento/sucesso: nada alterado (pode já estar ok)")
else:
    with open('app/pagamento/sucesso/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ /pagamento/sucesso agora vai pro /dashboard")
PYEOF
echo ""

# ════════════════════════════════════════════════
# PARTE 6 — Limpeza e commit
# ════════════════════════════════════════════════
echo "🧹 Limpando backups..."
find . -name "*.bak" -not -path "./node_modules/*" -delete 2>/dev/null || true

echo ""
echo "📦 Status:"
git status --short
echo ""

echo "💾 Commitando..."
git add -A
git commit -m "feat: middleware de gate de diagnóstico + correção do fluxo de pagamento

- Novo middleware.ts garante que /dashboard e rotas protegidas só
  são acessíveis após o usuário completar o diagnóstico
- CTAs da landing de planos pagos (Essencial/Pro) agora apontam
  pra /diagnostico?plan=X em vez de /cadastro (pular o diagnóstico)
- /pagamento/sucesso redireciona pro /dashboard (não mais /revisao)
- /cadastro preserva intent de plano no redirect pós-Google OAuth"

echo ""
echo "🚀 Empurrando pro GitHub..."
git push origin main

echo ""
echo "✅ TUDO PRONTO!"
echo ""
echo "Aguarde ~1-2min o Vercel deployar e teste o fluxo:"
echo ""
echo "  CENÁRIO 1 — Free:"
echo "    Landing → 'Começar grátis' → /diagnostico → /revisao → /dashboard ✓"
echo ""
echo "  CENÁRIO 2 — Pagante (Essencial):"
echo "    Landing → 'Assinar Essencial' → /diagnostico?plan=essencial"
echo "    → /revisao (vê protocolo) → /planos (escolhe de novo, mas já sabe o intent)"
echo "    → Stripe → /pagamento/sucesso → /dashboard ✓"
echo ""
echo "  CENÁRIO 3 — Tentar pular:"
echo "    Entra logado mas sem diagnóstico em /dashboard"
echo "    → Middleware intercepta → /diagnostico?origem=gate ✓"
echo ""
echo "Se algo não funcionar:"
echo "  • Cheque o build no Vercel (pode ser erro de TS)"
echo "  • Teste em aba anônima (cookies antigos podem mascarar o gate)"
