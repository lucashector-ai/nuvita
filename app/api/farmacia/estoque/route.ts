export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getSupabaseAdmin } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Hash do código de acesso (nunca guardamos o código em texto).
function hashCodigo(codigo: string): string {
  const pepper = process.env.FARMACIA_ESTOQUE_SECRET || 'nuvita-estoque-pepper';
  return createHmac('sha256', pepper).update(codigo.trim().toLowerCase()).digest('hex');
}

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

    // Só leitura: a farmácia entra com a senha e o balcão carrega o estoque.
    // A EDIÇÃO é exclusiva do admin (ver /api/farmacia/admin).
    void action;
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
