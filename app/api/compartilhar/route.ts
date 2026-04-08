export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Gera token único de compartilhamento
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64url').substring(0, 16);

    // Salva token no diagnóstico do usuário
    const { data: perfil } = await supabaseAdmin.from('usuarios').select('diagnostico').eq('id', userId).maybeSingle();
    await supabaseAdmin.from('usuarios').update({
      diagnostico: { ...(perfil?.diagnostico || {}), _shareToken: token, _shareAtivoEm: new Date().toISOString() }
    }).eq('id', userId);

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/protocolo/${token}`;
    return NextResponse.json({ url, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'token obrigatório' }, { status: 400 });

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Busca usuário pelo token de compartilhamento
    const { data } = await supabaseAdmin.from('usuarios')
      .select('nome, diagnostico, plano')
      .contains('diagnostico', { _shareToken: token })
      .maybeSingle();

    if (!data) return NextResponse.json({ error: 'Protocolo não encontrado' }, { status: 404 });

    return NextResponse.json({
      nome: data.nome,
      objetivos: data.diagnostico?.q3 || [],
      plano: data.plano,
      peso: data.diagnostico?.peso,
      aceitosRevisao: data.diagnostico?._aceitosRevisao,
      removidos: data.diagnostico?._removidos,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
