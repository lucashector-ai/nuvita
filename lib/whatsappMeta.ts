// ════════════════════════════════════════════════
//  NUVITA — Helpers da WhatsApp Cloud API (Meta).
//  Envio de texto e de documento (PDF), e upload de mídia.
//  Usa as credenciais do número configurado no Vercel:
//    WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TOKEN, WHATSAPP_API_VERSION
// ════════════════════════════════════════════════

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;

export function metaConfigurada(): boolean {
  return Boolean(PHONE_ID && TOKEN);
}

export function normalizarTelefone(tel: string): string {
  let d = (tel || '').replace(/\D/g, '');
  // Sem DDI reconhecido (55 Brasil / 595 Paraguai) e curto → assume Brasil.
  if (d.length <= 11 && !d.startsWith('55') && !d.startsWith('595')) d = '55' + d;
  return d;
}

export interface EnvioResultado {
  ok: boolean;
  id?: string | null;
  error?: string;
  code?: number;
  foraDaJanela?: boolean;
  status?: number;
}

// Sobe um PDF para a mídia da Meta e devolve o media id.
export async function uploadPdf(bytes: Uint8Array, filename: string): Promise<string | null> {
  if (!metaConfigurada()) return null;
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', 'application/pdf');
  form.append('file', new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), filename);

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

async function enviarPayload(payload: any): Promise<EnvioResultado> {
  if (!metaConfigurada()) return { ok: false, error: 'não configurado', status: 503 };
  const res = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = data?.error?.code;
    // 131047 / 131026: fora da janela de 24h → precisa a pessoa falar primeiro.
    const foraDaJanela = code === 131047 || code === 131026;
    return {
      ok: false,
      error: data?.error?.message || 'Falha no envio.',
      code,
      foraDaJanela,
      status: 502,
    };
  }
  return { ok: true, id: data?.messages?.[0]?.id || null };
}

export function enviarTexto(to: string, body: string): Promise<EnvioResultado> {
  return enviarPayload({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { preview_url: false, body },
  });
}

export function enviarDocumento(
  to: string,
  mediaId: string,
  filename: string,
  caption: string,
): Promise<EnvioResultado> {
  return enviarPayload({
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: { id: mediaId, filename, caption },
  });
}
