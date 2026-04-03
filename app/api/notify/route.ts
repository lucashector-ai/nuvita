import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  try {
    const { email, nome, tipo, dados } = await req.json();
    if (!email || !tipo) return NextResponse.json({ error: 'missing' }, { status: 400 });
    const BASE = 'https://nuvita-l1wk.vercel.app';
    const btn = (url: string, txt: string) => `<a href="${url}" style="display:inline-block;margin-top:1rem;padding:12px 24px;background:#1D9E75;color:white;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px">${txt}</a>`;
    const footer = `<p style="margin-top:2rem;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:1rem">Nuvita · <a href="${BASE}/dashboard" style="color:#999">Gerenciar notificações</a></p>`;
    const wrap = (body: string) => `<div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:2rem;background:#fff">${body}${footer}</div>`;

    const TEMPLATES: Record<string, { subject: string; html: string }> = {
      checkin_lembrete: {
        subject: `⏰ Check-in pendente hoje, ${nome}`,
        html: wrap(`<h2 style="font-size:1.1rem;font-weight:500;color:#111;margin-bottom:.5rem">Olá, ${nome}!</h2><p style="color:#555;line-height:1.7">Você ainda não fez seu check-in hoje. Registrar como você está se sentindo ajuda a identificar padrões no seu protocolo.</p>${btn(BASE+'/dashboard','Fazer check-in agora →')}`),
      },
      protocolo_lembrete: {
        subject: `💊 Lembrete do protocolo, ${nome}`,
        html: wrap(`<h2 style="font-size:1.1rem;font-weight:500;color:#111;margin-bottom:.5rem">Não esqueça seu protocolo!</h2><p style="color:#555;line-height:1.7">Faz 2+ dias sem registrar adesão. A consistência é o fator mais importante para resultados com peptídeos.</p>${btn(BASE+'/dashboard','Acessar dashboard →')}`),
      },
      estoque_critico: {
        subject: `🚨 Estoque crítico — ${dados?.peptideo || 'peptídeo'} acabando`,
        html: wrap(`<h2 style="font-size:1.1rem;font-weight:500;color:#D85A30;margin-bottom:.5rem">⚠️ Estoque crítico</h2><p style="color:#555;line-height:1.7">Seu estoque de <strong>${dados?.peptideo}</strong> vai acabar em aproximadamente <strong>${dados?.dias} dias</strong>. Providencie a reposição para não interromper o protocolo.</p>${btn(BASE+'/dashboard','Ver estoque →')}`),
      },
      boas_vindas: {
        subject: `🎉 Seu protocolo está pronto, ${nome}!`,
        html: wrap(`<h2 style="font-size:1.1rem;font-weight:500;color:#111;margin-bottom:.5rem">Bem-vindo à Nuvita!</h2><p style="color:#555;line-height:1.7">Seu protocolo personalizado foi gerado. Acesse o dashboard para ver cada peptídeo, as doses e o cronograma do seu ciclo.</p>${btn(BASE+'/dashboard','Ver meu protocolo →')}`),
      },
    };
    const t = TEMPLATES[tipo];
    if (!t) return NextResponse.json({ error: 'template not found' }, { status: 400 });
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Nuvita <noreply@nuvita.app>', to: [email], subject: t.subject, html: t.html }),
    });
    return NextResponse.json(await res.json());
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
