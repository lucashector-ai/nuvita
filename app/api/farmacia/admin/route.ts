export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getSupabaseAdmin, safeCompare } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { ALL_PEPTIDES } from '@/lib/peptides';

// Painel administrativo do estoque das farmácias — SOMENTE o dono.
// Protegido por FARMACIA_ADMIN_SECRET (troque no Vercel).
const ADMIN_SECRET = process.env.FARMACIA_ADMIN_SECRET || 'nuvita-admin-2026';
const NOMES_VALIDOS = new Set(ALL_PEPTIDES.map((p) => p.n));

function hashCodigo(codigo: string): string {
  const pepper = process.env.FARMACIA_ESTOQUE_SECRET || 'nuvita-estoque-pepper';
  return createHmac('sha256', pepper).update(codigo.trim().toLowerCase()).digest('hex');
}

function autorizado(req: NextRequest, body: any): boolean {
  const got = req.headers.get('x-admin-secret') || body?.secret || '';
  return safeCompare(String(got), ADMIN_SECRET);
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`farmacia-admin:${ip}`, 40, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    if (!autorizado(req, body)) {
      return NextResponse.json({ error: 'Senha de admin inválida.' }, { status: 401 });
    }

    let admin;
    try {
      admin = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ error: 'Supabase não configurado.' }, { status: 503 });
    }

    const action = String(body?.action || 'list');

    if (action === 'list') {
      const { data, error } = await admin
        .from('farmacia_estoque')
        .select('id, nome, peptideos, updated_at')
        .order('nome', { ascending: true });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const farmacias = (data || []).map((f: any) => ({
        id: f.id,
        nome: f.nome || '(sem nome)',
        total: Array.isArray(f.peptideos) ? f.peptideos.length : 0,
        updated_at: f.updated_at,
      }));
      return NextResponse.json({ ok: true, farmacias });
    }

    if (action === 'get') {
      const id = String(body?.id || '');
      if (!id) return NextResponse.json({ error: 'id ausente' }, { status: 400 });
      const { data } = await admin
        .from('farmacia_estoque')
        .select('nome, peptideos')
        .eq('id', id)
        .maybeSingle();
      if (!data) return NextResponse.json({ error: 'Farmácia não encontrada' }, { status: 404 });
      return NextResponse.json({ ok: true, nome: data.nome, peptideos: data.peptideos || [] });
    }

    if (action === 'save') {
      const id = String(body?.id || '');
      if (!id) return NextResponse.json({ error: 'id ausente' }, { status: 400 });
      const peptideos = Array.isArray(body?.peptideos)
        ? body.peptideos.map((p: any) => String(p)).filter((p: string) => NOMES_VALIDOS.has(p)).slice(0, 200)
        : [];
      const patch: any = { peptideos, updated_at: new Date().toISOString() };
      if (typeof body?.nome === 'string') patch.nome = body.nome.slice(0, 120);
      const { error } = await admin.from('farmacia_estoque').update(patch).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, peptideos });
    }

    // Criar uma nova farmácia com senha numérica.
    if (action === 'create') {
      const nome = String(body?.nome || '').slice(0, 120).trim();
      const pin = String(body?.pin || '').replace(/\D/g, '');
      if (!nome) return NextResponse.json({ error: 'Informe um nome.' }, { status: 400 });
      if (pin.length < 6) return NextResponse.json({ error: 'A senha precisa ter 6 dígitos.' }, { status: 400 });
      const peptideos = ALL_PEPTIDES.map((p) => p.n); // começa com tudo
      const { error } = await admin.from('farmacia_estoque').insert({
        codigo_hash: hashCodigo(pin),
        nome,
        peptideos,
      });
      if (error) {
        const dup = /duplicate|unique/i.test(error.message);
        return NextResponse.json({ error: dup ? 'Essa senha já está em uso.' : error.message }, { status: dup ? 409 : 500 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'ação inválida' }, { status: 400 });
  } catch (e: any) {
    console.error('Admin estoque error:', e?.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
