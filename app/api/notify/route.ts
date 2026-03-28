import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, nome, tipo } = await req.json();
    if (!email || !tipo) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

    const TEMPLATES: Record<string, { subject: string; html: string }> = {
      checkin_lembrete: {
        subject: '⏰ Não esqueça seu check-in hoje, ' + nome,
        html: `<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:2rem">
          <h2 style="font-size:1.3rem;font-weight:500;color:#111">Olá, ${nome}!</h2>
          <p style="color:#555;line-height:1.7">Você ainda não fez seu check-in hoje. Manter o registro diário ajuda a identificar padrões e melhorar seu protocolo.</p>
          <a href="https://nuvita-l1wk.vercel.app/dashboard" style="display:inline-block;margin-top:1rem;padding:12px 24px;background:#1D9E75;color:white;border-radius:8px;text-decoration:none;font-weight:500">Fazer check-in agora →</a>
          <p style="margin-top:2rem;font-size:12px;color:#999">Nuvita · Sua plataforma de peptídeos</p>
        </div>`
      },
      protocolo_lembrete: {
        subject: '💊 Lembrete do seu protocolo, ' + nome,
        html: `<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:2rem">
          <h2 style="font-size:1.3rem;font-weight:500;color:#111">Não esqueça seu protocolo hoje!</h2>
          <p style="color:#555;line-height:1.7">Faz 2+ dias que você não registra adesão ao protocolo. A consistência é o fator mais importante para resultados.</p>
          <a href="https://nuvita-l1wk.vercel.app/dashboard" style="display:inline-block;margin-top:1rem;padding:12px 24px;background:#1D9E75;color:white;border-radius:8px;text-decoration:none;font-weight:500">Acessar dashboard →</a>
        </div>`
      },
    };

    const template = TEMPLATES[tipo];
    if (!template) return NextResponse.json({ error: 'template not found' }, { status: 400 });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nuvita <noreply@nuvita.app>',
        to: [email],
        subject: template.subject,
        html: template.html,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
