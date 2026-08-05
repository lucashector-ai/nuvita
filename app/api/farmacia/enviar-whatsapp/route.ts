export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/serverAuth';
import { gerarPdfProtocolo, gerarPdfProtocoloRich } from '@/lib/gerarPdfProtocolo';
import { normalizarTelefone } from '@/lib/whatsappMeta';
import { relayConfigurado, enviarDocumentoViaNexxus } from '@/lib/nexxusRelay';

// ════════════════════════════════════════════════
//  Balcão → WhatsApp (via relay da Nexxus)
//
//  O número está conectado à Meta pela Nexxus. Ao clicar "Enviar" geramos o
//  protocolo em PDF e o enviamos ao endpoint da Nexxus, que faz o disparo pelo
//  número. O token permanente da Meta fica só na Nexxus — aqui só o segredo do
//  relay.
//
//  Configure no Vercel:
//   NEXXUS_WHATSAPP_URL  → base da Nexxus (ex.: https://shop.nexxuslabs.de)
//   NEXXUS_RELAY_TOKEN   → o mesmo valor de WHATSAPP_RELAY_TOKEN na Nexxus
// ════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`wa-send:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, error: 'Muitas requisições — aguarde.' }, { status: 429 });
    }

    if (!relayConfigurado()) {
      return NextResponse.json(
        { ok: false, error: 'Envio automático não configurado.', naoConfigurado: true },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const telefone = normalizarTelefone(String(body?.telefone || ''));
    const mensagem = String(body?.mensagem || '').slice(0, 6000);
    const nome = String(body?.nome || '').slice(0, 120).trim() || null;
    const dados = body?.dados && Array.isArray(body.dados.itens) ? body.dados : null;
    if (telefone.length < 12) {
      return NextResponse.json({ ok: false, error: 'Telefone inválido.' }, { status: 400 });
    }
    if (!mensagem && !dados) {
      return NextResponse.json({ ok: false, error: 'Protocolo vazio.' }, { status: 400 });
    }

    // 1) Gera o PDF do protocolo (design rico se vierem os dados estruturados).
    let pdf: Uint8Array;
    try {
      pdf = dados ? await gerarPdfProtocoloRich(dados) : await gerarPdfProtocolo(mensagem, nome || undefined);
    } catch (e: any) {
      console.error('gerarPdf erro:', e?.message);
      return NextResponse.json({ ok: false, error: 'Não foi possível gerar o PDF.' }, { status: 500 });
    }

    // 2) Envia o PDF para a Nexxus, que sobe na Meta e dispara o documento.
    const primeiroNome = (nome || '').split(' ')[0];
    const caption = primeiroNome
      ? `${primeiroNome}, aqui está o seu protocolo completo, montado especialmente para você. 💚`
      : 'Aqui está o seu protocolo completo, montado especialmente para você. 💚';

    const envio = await enviarDocumentoViaNexxus(telefone, pdf, 'Protocolo Nuvita.pdf', caption);

    if (!envio.ok) {
      console.warn('WhatsApp send error:', envio.code, envio.error);
      return NextResponse.json(
        {
          ok: false,
          error: envio.foraDaJanela
            ? 'A pessoa precisa mandar uma mensagem primeiro (regra de 24h do WhatsApp). Peça para ela abrir a conversa e enviar um "oi" — depois é só reenviar.'
            : envio.error,
          code: envio.code,
          foraDaJanela: envio.foraDaJanela,
        },
        { status: 502 },
      );
    }

    // 4) Registro best-effort (não bloqueia o envio já feito).
    try {
      const admin = getSupabaseAdmin();
      await admin
        .from('farmacia_protocolos')
        .insert({ telefone, nome, mensagem, entregue: true, entregue_at: new Date().toISOString() });
    } catch {
      /* sem persistência não atrapalha o atendimento */
    }

    return NextResponse.json({ ok: true, id: envio.id });
  } catch (e: any) {
    console.error('WhatsApp send exception:', e?.message);
    return NextResponse.json({ ok: false, error: 'Erro ao enviar.' }, { status: 500 });
  }
}
