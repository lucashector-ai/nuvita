export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getSupabaseAdmin } from '@/lib/serverAuth';
import { gerarPdfProtocolo } from '@/lib/gerarPdfProtocolo';

// ════════════════════════════════════════════════
//  Webhook do WhatsApp (Meta Cloud API) — nosso sistema.
//
//  Aponte o webhook do número na Meta para:
//     https://SEU-DOMINIO/api/farmacia/whatsapp-webhook
//  Campo assinado: "messages".
//
//  GET  → verificação do webhook (hub.challenge).
//  POST → eventos. Quando a pessoa toca "RECEBER PROTOCOLO",
//         geramos o PDF do protocolo dela e enviamos o arquivo.
//
//  Configure no Vercel:
//   WHATSAPP_PHONE_NUMBER_ID   → ID do número (Meta)
//   WHATSAPP_TOKEN             → token de acesso permanente (Meta)
//   WHATSAPP_API_VERSION       → opcional (default v21.0)
//   WHATSAPP_VERIFY_TOKEN      → string que você define aqui e na Meta
//   WHATSAPP_APP_SECRET        → opcional: valida a assinatura X-Hub-Signature-256
// ════════════════════════════════════════════════

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'nuvita-verify';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

const GRAPH = `https://graph.facebook.com/${API_VERSION}`;

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

// ─── Eventos (mensagens / cliques de botão) ───
export async function POST(req: NextRequest) {
  const raw = await req.text();

  // Valida a assinatura da Meta, se o segredo estiver configurado.
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
    return NextResponse.json({ ok: true }); // sempre 200 para a Meta não re-tentar
  }

  try {
    const msgs = extrairMensagens(payload);
    for (const m of msgs) {
      const de = m.from as string; // telefone da pessoa (dígitos, com DDI)
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

  // A Meta espera 200 rápido, sempre.
  return NextResponse.json({ ok: true });
}

// ─── Entrega: busca o protocolo, gera o PDF e envia o arquivo ───
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

// ─── Helpers Meta Cloud API ───
async function uploadPdf(bytes: Uint8Array, filename: string): Promise<string | null> {
  if (!PHONE_ID || !TOKEN) return null;
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', 'application/pdf');
  form.append(
    'file',
    new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
    filename,
  );
  const res = await fetch(`${GRAPH}/${PHONE_ID}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn('upload media erro:', data?.error?.message);
    return null;
  }
  return data?.id || null;
}

async function enviarDocumento(to: string, mediaId: string, filename: string, caption: string) {
  await enviarPayload({
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: { id: mediaId, filename, caption },
  });
}

async function enviarTexto(to: string, body: string) {
  await enviarPayload({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { preview_url: false, body },
  });
}

async function enviarPayload(payload: any) {
  if (!PHONE_ID || !TOKEN) return;
  const res = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.warn('enviarPayload erro:', data?.error?.message);
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

// Extrai o id do botão clicado (interactive) ou o payload de um quick-reply.
function idDoClique(m: any): string | null {
  if (m?.type === 'interactive' && m?.interactive?.type === 'button_reply') {
    return m.interactive.button_reply?.id || null;
  }
  // Botão de template (quick reply) chega como type "button".
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
