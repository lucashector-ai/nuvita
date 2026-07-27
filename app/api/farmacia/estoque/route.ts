export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getSupabaseAdmin } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { ALL_PEPTIDES } from '@/lib/peptides';

// Hash do código de acesso (nunca guardamos o código em texto).
function hashCodigo(codigo: string): string {
  const pepper = process.env.FARMACIA_ESTOQUE_SECRET || 'nuvita-estoque-pepper';
  return createHmac('sha256', pepper).update(codigo.trim().toLowerCase()).digest('hex');
}

const NOMES_VALIDOS = new Set(ALL_PEPTIDES.map((p) => p.n));

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`farmacia-estoque:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Muitas requisições — aguarde' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || 'get');
    const codigo = String(body?.codigo || '').trim();

    // Código de acesso: mínimo 6 caracteres (reduz colisão/typo).
    if (codigo.length < 6 || codigo.length > 64) {
      return NextResponse.json({ error: 'O acesso precisa ter ao menos 6 caracteres.' }, { status: 400 });
    }

    let admin;
    try {
      admin = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ error: 'Estoque indisponível (Supabase não configurado).' }, { status: 503 });
    }

    const codigo_hash = hashCodigo(codigo);

    if (action === 'save') {
      const nome = body?.nome ? String(body.nome).slice(0, 120) : null;
      const peptideos = Array.isArray(body?.peptideos)
        ? body.peptideos.map((p: any) => String(p)).filter((p: string) => NOMES_VALIDOS.has(p)).slice(0, 200)
        : [];
      const { error } = await admin
        .from('farmacia_estoque')
        .upsert(
          { codigo_hash, nome, peptideos, updated_at: new Date().toISOString() },
          { onConflict: 'codigo_hash' },
        );
      if (error) {
        console.warn('estoque save:', error.message);
        return NextResponse.json({ error: 'Não foi possível salvar.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, peptideos, nome });
    }

    // action === 'get'
    const { data } = await admin
      .from('farmacia_estoque')
      .select('nome, peptideos')
      .eq('codigo_hash', codigo_hash)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ ok: true, found: false });
    }
    return NextResponse.json({ ok: true, found: true, nome: data.nome, peptideos: data.peptideos || [] });
  } catch (e: any) {
    console.error('Estoque error:', e?.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
