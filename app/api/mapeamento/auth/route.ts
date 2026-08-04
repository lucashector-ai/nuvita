export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { safeCompare } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// ════════════════════════════════════════════════
//  NUVITA — Acesso do Mapeamento (dois usuários)
//
//  Dois acessos independentes, para duas pessoas mapearem em campo. Cada um
//  tem seu próprio PIN; o nome do acesso é gravado em cada farmácia cadastrada
//  (coluna criado_por), para o relatório.
//
//  Ideal: configurar no Vercel (senão usa os defaults abaixo):
//    MAPEAMENTO_PIN_1 / MAPEAMENTO_NOME_1
//    MAPEAMENTO_PIN_2 / MAPEAMENTO_NOME_2
// ════════════════════════════════════════════════

function usuarios() {
  return [
    { nome: process.env.MAPEAMENTO_NOME_1 || 'Acesso 1', pin: process.env.MAPEAMENTO_PIN_1 || '620418' },
    { nome: process.env.MAPEAMENTO_NOME_2 || 'Acesso 2', pin: process.env.MAPEAMENTO_PIN_2 || '935172' },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`mapa-auth:${getClientIp(req)}`, 8, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Muitas tentativas. Aguarde um instante.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const pin = String(body?.pin || '').replace(/\D/g, '').slice(0, 8);
    if (!pin) return NextResponse.json({ ok: false, error: 'PIN vazio' }, { status: 400 });

    const encontrado = usuarios().find((u) => safeCompare(pin, u.pin));
    if (!encontrado) return NextResponse.json({ ok: false, error: 'PIN incorreto' }, { status: 401 });

    return NextResponse.json({ ok: true, nome: encontrado.nome });
  } catch {
    return NextResponse.json({ ok: false, error: 'Erro' }, { status: 500 });
  }
}
