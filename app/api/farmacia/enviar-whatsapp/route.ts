export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Envia o protocolo direto para o WhatsApp da pessoa via API oficial da Meta
// (WhatsApp Cloud API) — sem precisar abrir o WhatsApp no tablet.
//
// Configure no Vercel (credenciais do número da Nexxus na Meta):
//   WHATSAPP_PHONE_NUMBER_ID  → ID do número de telefone (Meta)
//   WHATSAPP_TOKEN            → token de acesso permanente (Meta)
//   WHATSAPP_API_VERSION      → opcional (default v21.0)
//   WHATSAPP_TEMPLATE_NAME    → opcional: envia um template aprovado em vez de texto
//   WHATSAPP_TEMPLATE_LANG    → opcional (default pt_BR)

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME;
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || 'pt_BR';

function normalizarTelefone(tel: string): string {
  let d = (tel || '').replace(/\D/g, '');
  if (d.length <= 11 && !d.startsWith('55')) d = '55' + d;
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
    const mensagem = String(body?.mensagem || '').slice(0, 4000);
    if (telefone.length < 12) {
      return NextResponse.json({ ok: false, error: 'Telefone inválido.' }, { status: 400 });
    }
    if (!mensagem) {
      return NextResponse.json({ ok: false, error: 'Mensagem vazia.' }, { status: 400 });
    }

    // Monta o payload: template aprovado (para contato "frio") ou texto livre
    // (funciona dentro da janela de 24h de atendimento).
    const payload: any = TEMPLATE_NAME
      ? {
          messaging_product: 'whatsapp',
          to: telefone,
          type: 'template',
          template: {
            name: TEMPLATE_NAME,
            language: { code: TEMPLATE_LANG },
            components: [
              { type: 'body', parameters: [{ type: 'text', text: mensagem.replace(/\n+/g, ' ').slice(0, 900) }] },
            ],
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: telefone,
          type: 'text',
          text: { preview_url: false, body: mensagem },
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
        { ok: false, error: foraDaJanela ? 'Fora da janela de 24h — configure um template aprovado.' : msg, code, foraDaJanela },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.messages?.[0]?.id || null });
  } catch (e: any) {
    console.error('WhatsApp send exception:', e?.message);
    return NextResponse.json({ ok: false, error: 'Erro ao enviar.' }, { status: 500 });
  }
}
