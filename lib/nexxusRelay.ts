// ════════════════════════════════════════════════
//  NUVITA → NEXXUS (relay do WhatsApp).
//  O número está conectado à Meta pela Nexxus. Em vez de falar direto com a
//  Graph API (o que exigiria o token permanente da Meta aqui), a Nuvita envia o
//  PDF para o endpoint da Nexxus, que faz o envio. O token da Meta fica só na
//  Nexxus; nós autenticamos com um segredo próprio.
//
//  Configure no Vercel:
//    NEXXUS_WHATSAPP_URL  → base da Nexxus (ex.: https://shop.nexxuslabs.de)
//    NEXXUS_RELAY_TOKEN   → o mesmo valor de WHATSAPP_RELAY_TOKEN na Nexxus
// ════════════════════════════════════════════════

const BASE = (process.env.NEXXUS_WHATSAPP_URL || '').replace(/\/+$/, '');
const TOKEN = process.env.NEXXUS_RELAY_TOKEN || '';

export function relayConfigurado(): boolean {
  return Boolean(BASE && TOKEN);
}

// Manda o token em vários formatos comuns — assim funciona seja qual for o
// esquema que o relay da Nexxus espera (Bearer, token cru, x-api-key, etc.).
function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'x-api-key': TOKEN,
    'x-relay-token': TOKEN,
    'x-auth-token': TOKEN,
  };
}

export interface RelayResultado {
  ok: boolean;
  id?: string | null;
  error?: string;
  code?: number;
  foraDaJanela?: boolean;
  status?: number;
}

// 131047 / 131026: fora da janela de 24h → a pessoa precisa falar primeiro.
function foraDaJanela(error?: string): boolean {
  return /\b131047\b|\b131026\b/.test(error || '');
}

// Envia um PDF como documento pelo número da Nexxus. A Nexxus responde HTTP 200
// mesmo quando a Meta recusa (ex.: fora da janela), com { ok:false, error } —
// então checamos o corpo, não só o status.
export async function enviarDocumentoViaNexxus(
  telefone: string,
  bytes: Uint8Array,
  filename: string,
  caption: string,
): Promise<RelayResultado> {
  if (!relayConfigurado()) return { ok: false, error: 'Relay não configurado.', status: 503 };

  const form = new FormData();
  form.append('to', telefone);
  // Cópia para um ArrayBuffer limpo, do tamanho certo, para o Blob.
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  form.append('file', new Blob([ab], { type: 'application/pdf' }), filename);
  form.append('filename', filename);
  if (caption) form.append('caption', caption);

  try {
    const res = await fetch(`${BASE}/api/whatsapp/send-document`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.ok) {
      const error = String(data?.error || `HTTP ${res.status}`);
      return { ok: false, error, foraDaJanela: foraDaJanela(error), status: res.status };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Erro de conexão com a Nexxus.', status: 502 };
  }
}

// Silencia a Emili (IA da Nexxus) no número por um tempo, para que o "oi" de
// abertura da janela e o PDF não recebam resposta automática fora de contexto.
// Best-effort: uma falha aqui nunca deve travar o atendimento.
export async function silenciarEmiliViaNexxus(telefone: string, minutes = 180): Promise<boolean> {
  if (!relayConfigurado()) return false;
  try {
    const res = await fetch(`${BASE}/api/whatsapp/mute`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: telefone, minutes }),
    });
    const data = await res.json().catch(() => ({} as any));
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}
