export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { normalizarTelefone } from '@/lib/whatsappMeta';
import { relayConfigurado, silenciarEmiliViaNexxus } from '@/lib/nexxusRelay';

// ════════════════════════════════════════════════
//  Prepara o número para o fluxo do balcão: pede à Nexxus para silenciar a IA
//  (Emili) na conversa, para que o "oi" que a pessoa manda só para abrir a
//  janela de 24h não receba resposta automática fora de contexto.
//  Chamado quando o atendente termina de digitar o WhatsApp, ANTES do "oi".
//  Best-effort: nunca deve travar o atendimento.
// ════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`wa-mute:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, error: 'Muitas requisições — aguarde.' }, { status: 429 });
    }
    if (!relayConfigurado()) {
      return NextResponse.json({ ok: false, naoConfigurado: true }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const telefone = normalizarTelefone(String(body?.telefone || ''));
    if (telefone.length < 12) {
      return NextResponse.json({ ok: false, error: 'Telefone inválido.' }, { status: 400 });
    }

    const ok = await silenciarEmiliViaNexxus(telefone);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
