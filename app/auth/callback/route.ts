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
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('diagnostico')
        .eq('id', data.user.id)
        .maybeSingle();

      // Veio do quiz (revisao=1) → vai para revisão
      if (searchParams.get('revisao') === '1') {
        await supabase.from('usuarios').upsert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        return NextResponse.redirect(`${origin}/revisao`);
      }

      // Usuário novo sem diagnóstico → cadastro
      if (!usuario?.diagnostico) {
        await supabase.from('usuarios').upsert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        return NextResponse.redirect(`${origin}/cadastro`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
