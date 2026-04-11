export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getUserFromRequest, unauthorized } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`share:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Autorização: usuário só pode gerar link de compartilhamento do próprio protocolo.
    // userId é derivado do token, não do body.
    const user = await getUserFromRequest(req);
    if (!user) return unauthorized();
    const userId = user.id;

    const supabaseAdmin = getSupabaseAdmin();

    // Token aleatório criptograficamente seguro (não derivado de userId/timestamp).
    const token = randomBytes(24).toString('base64url');

    const { data: perfil } = await supabaseAdmin
      .from('usuarios')
      .select('diagnostico')
      .eq('id', userId)
      .maybeSingle();
    await supabaseAdmin
      .from('usuarios')
      .update({
        diagnostico: {
          ...(perfil?.diagnostico || {}),
          _shareToken: token,
          _shareAtivoEm: new Date().toISOString(),
        },
      })
      .eq('id', userId);

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/protocolo/${token}`;
    return NextResponse.json({ url, token });
  } catch (err: any) {
    console.error('Compartilhar POST error:', err?.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`share-get:${ip}`, 60, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const token = req.nextUrl.searchParams.get('token');
    if (!token || token.length < 16 || token.length > 64 || !/^[A-Za-z0-9_-]+$/.test(token)) {
      return NextResponse.json({ error: 'token inválido' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from('usuarios')
      .select('nome, diagnostico, plano')
      .contains('diagnostico', { _shareToken: token })
      .maybeSingle();

    if (!data) return NextResponse.json({ error: 'Protocolo não encontrado' }, { status: 404 });

    // Devolve apenas campos não-sensíveis. Nunca expor email, telefone, etc.
    return NextResponse.json({
      nome: data.nome,
      objetivos: data.diagnostico?.q3 || [],
      plano: data.plano,
      peso: data.diagnostico?.peso,
      aceitosRevisao: data.diagnostico?._aceitosRevisao,
      removidos: data.diagnostico?._removidos,
    });
  } catch (err: any) {
    console.error('Compartilhar GET error:', err?.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
