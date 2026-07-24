export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { safeCompare } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Valida o PIN do balcão de farmácia.
// O PIN vive no servidor (env FARMACIA_PIN), nunca é enviado ao browser.
// Default 4823 caso a env não esteja configurada.
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Poucas tentativas por minuto para dificultar brute-force.
    const rl = rateLimit(`farmacia-auth:${ip}`, 8, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: 'Muitas tentativas. Aguarde um instante.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const pin = String(body?.pin || '').replace(/\D/g, '').slice(0, 8);
    const expected = process.env.FARMACIA_PIN || '4823';

    if (!pin || !safeCompare(pin, expected)) {
      return NextResponse.json({ ok: false, error: 'PIN incorreto' }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Erro' }, { status: 500 });
  }
}
