export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/serverAuth';
import { gerarPdfProtocolo } from '@/lib/gerarPdfProtocolo';
import { metaConfigurada, normalizarTelefone, uploadPdf, enviarDocumento } from '@/lib/whatsappMeta';

// ════════════════════════════════════════════════
//  Balcão → WhatsApp (API oficial da Meta / WhatsApp Cloud API)
//
//  Envio DIRETO do PDF: a pessoa já demonstrou interesse no balcão,
//  então ao clicar "Enviar" geramos o protocolo em PDF e mandamos
//  como documento — sem depender de webhook (que é da Nexxus).
//
//  Configure no Vercel (credenciais do número na Meta):
//   WHATSAPP_PHONE_NUMBER_ID  → ID do número (Meta)
//   WHATSAPP_TOKEN            → token de acesso permanente (Meta)
//   WHATSAPP_API_VERSION      → opcional (default v21.0)
// ════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`wa-send:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, error: 'Muitas requisições — aguarde.' }, { status: 429 });
    }

    if (!metaConfigurada()) {
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

    // 1) Gera o PDF do protocolo.
    let pdf: Uint8Array;
    try {
      pdf = await gerarPdfProtocolo(mensagem, nome || undefined);
    } catch (e: any) {
      console.error('gerarPdf erro:', e?.message);
      return NextResponse.json({ ok: false, error: 'Não foi possível gerar o PDF.' }, { status: 500 });
    }

    // 2) Sobe o PDF para a mídia da Meta.
    const mediaId = await uploadPdf(pdf, 'Protocolo-Nuvita.pdf');
    if (!mediaId) {
      return NextResponse.json({ ok: false, error: 'Falha ao preparar o arquivo.' }, { status: 502 });
    }

    // 3) Envia o documento direto para a pessoa.
    const primeiroNome = (nome || '').split(' ')[0];
    const caption = primeiroNome
      ? `${primeiroNome}, aqui está o seu protocolo completo, montado especialmente para você. 💚`
      : 'Aqui está o seu protocolo completo, montado especialmente para você. 💚';

    const envio = await enviarDocumento(telefone, mediaId, 'Protocolo Nuvita.pdf', caption);

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
