export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/serverAuth';
import { gerarPdfProtocolo } from '@/lib/gerarPdfProtocolo';

// ════════════════════════════════════════════════
//  Balcão → E-mail (via Resend)
//
//  Alternativa ao WhatsApp: gera o protocolo em PDF e o envia como anexo por
//  e-mail. O Resend já está conectado no projeto.
//
//  Configure no Vercel:
//   RESEND_API_KEY → chave da conta Resend
// ════════════════════════════════════════════════

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'Nuvita <onboarding@resend.dev>';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corpoHtml(primeiroNome: string): string {
  const ola = primeiroNome ? `Olá, ${primeiroNome}!` : 'Olá!';
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;color:#0D1712">
    <div style="background:#16A34A;border-radius:14px 14px 0 0;padding:22px 26px">
      <div style="color:#fff;font-size:22px;font-weight:700;letter-spacing:.5px">Nuvita</div>
      <div style="color:#DCFCE7;font-size:13px;margin-top:2px">Protocolo personalizado de peptídeos</div>
    </div>
    <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 14px 14px;padding:26px">
      <p style="font-size:15px;margin:0 0 14px">${ola}</p>
      <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 18px">
        Segue em anexo o seu <strong>protocolo Nuvita</strong>, montado especialmente para você.
        Guarde este PDF — ele traz os peptídeos recomendados, dosagens e orientações. 💚
      </p>
      <p style="font-size:12px;line-height:1.6;color:#94A3B8;margin:22px 0 0">
        Este material é uma orientação inicial e não substitui a avaliação de um profissional de saúde.
      </p>
    </div>
  </div>`;
}

async function enviarEmail(to: string, subject: string, html: string, pdfBase64: string) {
  if (!RESEND_KEY) {
    console.log('RESEND não configurado — simulando envio de protocolo:', { to, subject });
    return { ok: true, simulado: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
      attachments: [{ filename: 'Protocolo Nuvita.pdf', content: pdfBase64 }],
    }),
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(data?.message || 'Resend error');
  return { ok: true, id: data?.id };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`email-send:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, error: 'Muitas requisições — aguarde.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const mensagem = String(body?.mensagem || '').slice(0, 6000);
    const nome = String(body?.nome || '').slice(0, 120).trim() || null;

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'E-mail inválido.' }, { status: 400 });
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
    const pdfBase64 = Buffer.from(pdf).toString('base64');

    // 2) Envia por e-mail com o PDF anexado.
    const primeiroNome = (nome || '').split(' ')[0];
    const subject = primeiroNome
      ? `${primeiroNome}, seu protocolo Nuvita chegou 💚`
      : 'Seu protocolo Nuvita 💚';
    try {
      const envio = await enviarEmail(email, subject, corpoHtml(primeiroNome), pdfBase64);
      // 3) Registro best-effort (não bloqueia o envio já feito).
      try {
        const admin = getSupabaseAdmin();
        await admin.from('farmacia_protocolos').insert({
          email,
          nome,
          mensagem,
          entregue: true,
          canal: 'email',
          entregue_at: new Date().toISOString(),
        });
      } catch {
        /* sem persistência não atrapalha o atendimento */
      }
      return NextResponse.json(envio);
    } catch (e: any) {
      console.error('Email send error:', e?.message);
      return NextResponse.json({ ok: false, error: e?.message || 'Falha ao enviar o e-mail.' }, { status: 502 });
    }
  } catch (e: any) {
    console.error('Email send exception:', e?.message);
    return NextResponse.json({ ok: false, error: 'Erro ao enviar.' }, { status: 500 });
  }
}
