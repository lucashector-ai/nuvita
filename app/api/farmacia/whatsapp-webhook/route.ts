export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from '@/lib/serverAuth';
import { gerarPdfProtocolo } from '@/lib/gerarPdfProtocolo';
import { uploadPdf, enviarDocumento, enviarTexto } from '@/lib/whatsappMeta';

// ════════════════════════════════════════════════
//  Webhook do WhatsApp (Meta Cloud API).
//
//  ⚠️ HOJE ESTE WEBHOOK ESTÁ DORMENTE: o número do balcão é o mesmo
//  da Nexxus, e a Meta só permite UM webhook por número — ele é da
//  Nexxus. O balcão entrega o PDF direto (ver /api/farmacia/enviar-whatsapp).
//
//  Este endpoint fica pronto para o dia em que:
//   - o balcão usar um número próprio (aponte o webhook aqui), OU
//   - a Nexxus repassar os eventos de botão para esta URL.
//  Aí voltamos ao fluxo com botões RECEBER / NÃO RECEBER.
//
//  Configure no Vercel:
//   WHATSAPP_VERIFY_TOKEN   → string que você define aqui e na Meta
//   WHATSAPP_APP_SECRET     → opcional: valida X-Hub-Signature-256
// ════════════════════════════════════════════════

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'nuvita-verify';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

// ─── Verificação do webhook (Meta chama com GET) ───
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge || '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// ─── Eventos (cliques de botão) ───
export async function POST(req: NextRequest) {
  const raw = await req.text();

  if (APP_SECRET) {
    const sig = req.headers.get('x-hub-signature-256') || '';
    if (!assinaturaValida(raw, sig, APP_SECRET)) {
      console.warn('webhook: assinatura inválida');
      return new NextResponse('Invalid signature', { status: 401 });
    }
  }

  let payload: any = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    for (const m of extrairMensagens(payload)) {
      const de = m.from as string;
      const acao = idDoClique(m);
      if (!acao || !de) continue;

      if (acao === 'receber_protocolo') {
        await entregarProtocolo(de);
      } else if (acao === 'nao_receber') {
        await enviarTexto(
          de,
          'Sem problemas! 💚 Se mudar de ideia, é só voltar aqui e pedir seu protocolo. Estamos à disposição.',
        );
      }
    }
  } catch (e: any) {
    console.error('webhook processing error:', e?.message);
  }

  return NextResponse.json({ ok: true }); // a Meta espera 200 rápido, sempre
}

// ─── Busca o protocolo, gera o PDF e envia o arquivo ───
async function entregarProtocolo(telefone: string) {
  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    await enviarTexto(telefone, 'Tivemos um probleminha para localizar seu protocolo. Fale com o atendente, por favor.');
    return;
  }

  const { data } = await admin
    .from('farmacia_protocolos')
    .select('id, nome, mensagem')
    .eq('telefone', telefone)
    .eq('entregue', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.mensagem) {
    await enviarTexto(
      telefone,
      'Não encontrei um protocolo pendente para este número. Se precisar, peça um novo no balcão. 💚',
    );
    return;
  }

  try {
    const pdf = await gerarPdfProtocolo(data.mensagem, data.nome || undefined);
    const mediaId = await uploadPdf(pdf, 'Protocolo-Nuvita.pdf');
    if (!mediaId) throw new Error('sem media id');

    await enviarDocumento(
      telefone,
      mediaId,
      'Protocolo Nuvita.pdf',
      'Aqui está o seu protocolo completo, montado especialmente para você. 💚',
    );

    await admin
      .from('farmacia_protocolos')
      .update({ entregue: true, entregue_at: new Date().toISOString() })
      .eq('id', data.id);
  } catch (e: any) {
    console.error('entregarProtocolo erro:', e?.message);
    await enviarTexto(telefone, 'Tivemos um problema ao gerar seu PDF. Já avisamos o atendente — tente novamente em instantes.');
  }
}

// ─── Parsing do payload da Meta ───
function extrairMensagens(payload: any): any[] {
  const out: any[] = [];
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  for (const e of entries) {
    const changes = Array.isArray(e?.changes) ? e.changes : [];
    for (const c of changes) {
      const msgs = c?.value?.messages;
      if (Array.isArray(msgs)) out.push(...msgs);
    }
  }
  return out;
}

function idDoClique(m: any): string | null {
  if (m?.type === 'interactive' && m?.interactive?.type === 'button_reply') {
    return m.interactive.button_reply?.id || null;
  }
  if (m?.type === 'button') {
    return m.button?.payload || m.button?.text || null;
  }
  return null;
}

function assinaturaValida(raw: string, header: string, secret: string): boolean {
  try {
    const esperado = 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex');
    const a = Buffer.from(header);
    const b = Buffer.from(esperado);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
