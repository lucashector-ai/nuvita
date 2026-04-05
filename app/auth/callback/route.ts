import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data?.user) {
      // Verifica se o usuário já tem diagnóstico no banco
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('diagnostico')
        .eq('id', data.user.id)
        .maybeSingle();

      // Usuário novo sem diagnóstico → vai para o cadastro
      if (!usuario?.diagnostico) {
        // Garante que o usuário existe na tabela
        await supabase.from('usuarios').upsert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        return NextResponse.redirect(`${origin}/cadastro`);
      }
    }
  }

  // Usuário existente → vai direto pro dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
