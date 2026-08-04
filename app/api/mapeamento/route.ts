export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/serverAuth';

// ════════════════════════════════════════════════
//  NUVITA — Mapeamento de farmácias (CRUD simples)
//
//  Cadastro leve feito em campo pelo celular: nome, foto e localização (GPS).
//  A foto chega já comprimida do cliente como data URL (base64) e fica na
//  própria linha — sem bucket de Storage, para manter simples.
//
//  Tabela (rode no SQL do Supabase):
//   create table if not exists public.mapeamento_farmacias (
//     id uuid primary key default gen_random_uuid(),
//     nome text not null,
//     foto text,
//     lat double precision,
//     lng double precision,
//     criado_em timestamptz default now()
//   );
// ════════════════════════════════════════════════

const TABELA = 'mapeamento_farmacias';

function limparCoord(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// GET → lista as farmácias (mais recentes primeiro).
export async function GET(req: NextRequest) {
  try {
    const rl = rateLimit(`mapa-get:${getClientIp(req)}`, 60, 60_000);
    if (!rl.allowed) return NextResponse.json({ ok: false, error: 'Muitas requisições.' }, { status: 429 });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from(TABELA)
      .select('id, nome, foto, lat, lng, criado_em')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, farmacias: data || [] });
  } catch (e: any) {
    console.error('mapeamento GET:', e?.message);
    return NextResponse.json({ ok: false, error: 'Não foi possível carregar a lista.' }, { status: 500 });
  }
}

// POST → cadastra uma farmácia.
export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`mapa-post:${getClientIp(req)}`, 40, 60_000);
    if (!rl.allowed) return NextResponse.json({ ok: false, error: 'Muitas requisições — aguarde.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const nome = String(body?.nome || '').trim().slice(0, 160);
    const foto = typeof body?.foto === 'string' && body.foto.startsWith('data:image') ? body.foto.slice(0, 3_500_000) : null;
    const lat = limparCoord(body?.lat);
    const lng = limparCoord(body?.lng);
    if (!nome) return NextResponse.json({ ok: false, error: 'Informe o nome da farmácia.' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from(TABELA)
      .insert({ nome, foto, lat, lng })
      .select('id, nome, foto, lat, lng, criado_em')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, farmacia: data });
  } catch (e: any) {
    console.error('mapeamento POST:', e?.message);
    return NextResponse.json({ ok: false, error: 'Não foi possível salvar.' }, { status: 500 });
  }
}

// PATCH → edita uma farmácia (nome / foto / localização).
export async function PATCH(req: NextRequest) {
  try {
    const rl = rateLimit(`mapa-patch:${getClientIp(req)}`, 40, 60_000);
    if (!rl.allowed) return NextResponse.json({ ok: false, error: 'Muitas requisições — aguarde.' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const id = String(body?.id || '').trim();
    if (!id) return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (typeof body?.nome === 'string') {
      const nome = body.nome.trim().slice(0, 160);
      if (!nome) return NextResponse.json({ ok: false, error: 'Nome não pode ficar vazio.' }, { status: 400 });
      patch.nome = nome;
    }
    if (typeof body?.foto === 'string' && body.foto.startsWith('data:image')) patch.foto = body.foto.slice(0, 3_500_000);
    if (body?.lat !== undefined) patch.lat = limparCoord(body.lat);
    if (body?.lng !== undefined) patch.lng = limparCoord(body.lng);
    if (Object.keys(patch).length === 0) return NextResponse.json({ ok: false, error: 'Nada para atualizar.' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from(TABELA)
      .update(patch)
      .eq('id', id)
      .select('id, nome, foto, lat, lng, criado_em')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, farmacia: data });
  } catch (e: any) {
    console.error('mapeamento PATCH:', e?.message);
    return NextResponse.json({ ok: false, error: 'Não foi possível atualizar.' }, { status: 500 });
  }
}

// DELETE → remove uma farmácia (?id=... ou { id } no corpo).
export async function DELETE(req: NextRequest) {
  try {
    const rl = rateLimit(`mapa-del:${getClientIp(req)}`, 40, 60_000);
    if (!rl.allowed) return NextResponse.json({ ok: false, error: 'Muitas requisições — aguarde.' }, { status: 429 });

    let id = req.nextUrl.searchParams.get('id') || '';
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = String(body?.id || '');
    }
    id = id.trim();
    if (!id) return NextResponse.json({ ok: false, error: 'ID ausente.' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const { error } = await admin.from(TABELA).delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('mapeamento DELETE:', e?.message);
    return NextResponse.json({ ok: false, error: 'Não foi possível excluir.' }, { status: 500 });
  }
}
