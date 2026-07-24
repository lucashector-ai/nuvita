export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Captura de lead do balcão de farmácia.
// Público (o tablet não tem usuário logado), porém rate-limited por IP.
// Best-effort: se a tabela não existir ou o Supabase não estiver configurado,
// responde 200 mesmo assim para não travar o atendimento.
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`farmacia-lead:${ip}`, 40, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const nome = String(body?.nome || '').slice(0, 120).trim();
    const telefone = String(body?.telefone || '').replace(/\D/g, '').slice(0, 15);

    if (!nome || telefone.length < 10) {
      return NextResponse.json({ ok: false, error: 'Dados inválidos' }, { status: 400 });
    }

    const numOrNull = (v: any, min: number, max: number) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : null;
    };

    const lead = {
      nome,
      telefone,
      sexo: body?.sexo ? String(body.sexo).slice(0, 20) : null,
      objetivos: Array.isArray(body?.objetivos) ? body.objetivos.slice(0, 8) : [],
      nivel: body?.nivel ? String(body.nivel).slice(0, 20) : null,
      condicoes: Array.isArray(body?.condicoes) ? body.condicoes.slice(0, 8) : [],
      peso: numOrNull(body?.peso, 30, 300),
      altura: numOrNull(body?.altura, 120, 230),
      idade: numOrNull(body?.idade, 16, 100),
      atividade: body?.atividade ? String(body.atividade).slice(0, 20) : null,
      sono: body?.sono ? String(body.sono).slice(0, 20) : null,
      peptideos: Array.isArray(body?.peptideos) ? body.peptideos.slice(0, 10) : [],
      origem: 'farmacia',
      user_agent: (req.headers.get('user-agent') || '').slice(0, 255),
    };

    try {
      const admin = getSupabaseAdmin();
      const { error } = await admin.from('farmacia_leads').insert(lead);
      if (error) {
        // Tabela ausente ou RLS — loga mas não falha o balcão.
        console.warn('farmacia_leads insert:', error.message);
        return NextResponse.json({ ok: true, persisted: false });
      }
    } catch (e: any) {
      console.warn('farmacia lead (supabase indisponível):', e?.message);
      return NextResponse.json({ ok: true, persisted: false });
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch (e: any) {
    console.error('Farmacia lead error:', e?.message);
    return NextResponse.json({ ok: true, persisted: false });
  }
}
