export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/serverAuth';

// ════════════════════════════════════════════════
//  Balcão → WhatsApp (API oficial da Meta / WhatsApp Cloud API)
//
//  Fluxo novo (interativo):
//   1) O balcão manda o protocolo (texto) + telefone.
//   2) Guardamos o protocolo em farmacia_protocolos (por telefone).
//   3) Enviamos uma mensagem com 2 botões:
//        [RECEBER PROTOCOLO] [NÃO RECEBER]
//   4) Quando a pessoa toca "RECEBER", o webhook
//      (/api/farmacia/whatsapp-webhook) gera o PDF e envia o arquivo.
//
//  Configure no Vercel:
//   WHATSAPP_PHONE_NUMBER_ID  → ID do número (Meta)
//   WHATSAPP_TOKEN            → token de acesso permanente (Meta)
//   WHATSAPP_API_VERSION      → opcional (default v21.0)
// ════════════════════════════════════════════════

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

const CONVITE =
  'Olá, tudo bem? 👋 Recebemos seu pedido de protocolo. ' +
  'Deseja receber aqui mesmo, de forma gratuita, o seu protocolo completo?';

function normalizarTelefone(tel: string): string {
  let d = (tel || '').replace(/\D/g, '');
  // Sem DDI reconhecido (55 Brasil / 595 Paraguai) e curto → assume Brasil.
  if (d.length <= 11 && !d.startsWith('55') && !d.startsWith('595')) d = '55' + d;
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`wa-send:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, error: 'Muitas requisições — aguarde.' }, { status: 429 });
    }

    if (!PHONE_ID || !TOKEN) {
      return NextResponse.json(
        { ok: false, error: 'Envio automático não configurado.', naoConfigurado: true },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const telefone = normalizarTelefone(String(body?.telefone || ''));
    const mensagem = String(body?.mensagem || '').slice(0, 6000);
    const nome = String(body?.nome || '').slice(0, 120).trim() || null;
    if (telefone.length < 12) {
      return NextResponse.json({ ok: false, error: 'Telefone inválido.' }, { status: 400 });
    }
    if (!mensagem) {
      return NextResponse.json({ ok: false, error: 'Mensagem vazia.' }, { status: 400 });
    }

    // 1) Guarda o protocolo para o webhook entregar quando confirmarem.
    try {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('farmacia_protocolos')
        .insert({ telefone, nome, mensagem, entregue: false });
      if (error) console.warn('farmacia_protocolos insert:', error.message);
    } catch (e: any) {
      console.warn('protocolo store (supabase indisponível):', e?.message);
      // Sem persistência não dá para entregar depois — avisa e para.
      return NextResponse.json(
        { ok: false, error: 'Armazenamento indisponível. Configure o Supabase.' },
        { status: 503 },
      );
    }

    // 2) Envia a mensagem interativa com os botões.
    const payload = {
      messaging_product: 'whatsapp',
      to: telefone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: CONVITE },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'receber_protocolo', title: 'Receber protocolo' } },
            { type: 'reply', reply: { id: 'nao_receber', title: 'Não receber' } },
          ],
        },
      },
    };

    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.error?.message || 'Falha no envio.';
      const code = data?.error?.code;
      // 131047 / 131026: fora da janela de 24h → precisa de template aprovado.
      const foraDaJanela = code === 131047 || code === 131026;
      console.warn('WhatsApp send error:', code, msg);
      return NextResponse.json(
        {
          ok: false,
          error: foraDaJanela
            ? 'A pessoa precisa mandar uma mensagem primeiro (janela de 24h). Peça para ela abrir a conversa e enviar um "oi".'
            : msg,
          code,
          foraDaJanela,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.messages?.[0]?.id || null });
  } catch (e: any) {
    console.error('WhatsApp send exception:', e?.message);
    return NextResponse.json({ ok: false, error: 'Erro ao enviar.' }, { status: 500 });
  }
}
