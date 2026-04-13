export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { isInternalCaller, getUserFromRequest, unauthorized, forbidden } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
  templateBoasVindas, templateDia3, templateSemana1,
  templateAcompanhamentoSemanal, templateReengajamento, templateFimCiclo
} from './templates';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'Nuvita <onboarding@resend.dev>';

async function enviar(to: string, subject: string, html: string) {
  if (!RESEND_KEY) {
    console.log('RESEND não configurado — simulando:', { to, subject });
    return { ok: true, simulado: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Resend error');
  return { ok: true, id: data.id };
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`email:${ip}`, 10, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const internal = isInternalCaller(req);
    if (!internal) {
      const user = await getUserFromRequest(req);
      if (!user) return unauthorized();
    }

    const body = await req.json();
    const { tipo, email, nome, dados } = body;

    if (!tipo || !email) return NextResponse.json({ error: 'missing tipo/email' }, { status: 400 });

    let template: { subject: string; html: string };

    switch (tipo) {
      case 'boas_vindas':
        template = templateBoasVindas(nome || 'você', dados?.peptideos || []);
        break;
      case 'dia3':
        template = templateDia3(nome || 'você', dados?.peptideoMain || 'seu peptídeo');
        break;
      case 'semana1':
        template = templateSemana1(nome || 'você', dados?.objetivo || 'seus objetivos');
        break;
      case 'acompanhamento_semanal':
        template = templateAcompanhamentoSemanal(nome || 'você', dados?.semana || 2, dados?.insights || 'Continue com o protocolo e registre seus check-ins diários para análises mais precisas.');
        break;
      case 'reengajamento':
        template = templateReengajamento(nome || 'você', dados?.diasSem || 5);
        break;
      case 'fim_ciclo':
        template = templateFimCiclo(nome || 'você', dados?.peptideos || [], dados?.diasPausa || 30);
        break;
      default:
        return NextResponse.json({ error: 'tipo inválido' }, { status: 400 });
    }

    const result = await enviar(email, template.subject, template.html);
    return NextResponse.json(result);

  } catch (e: any) {
    console.error('Email error:', e?.message);
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}
