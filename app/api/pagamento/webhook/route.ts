export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('AbacatePay webhook:', JSON.stringify(body));

    const { event, data } = body;

    // Confirma pagamento
    if (event === 'billing.paid' || event === 'billing.completed') {
      const metadata = data?.metadata || {};
      const { userId, plano } = metadata;

      if (userId && plano) {
        // Atualiza o plano no Supabase
        await getSupabaseAdmin()
          .from('usuarios')
          .update({ plano })
          .eq('id', userId);

        // Cria notificação para o usuário
        await getSupabaseAdmin().from('notificacoes').insert({
          user_id: userId,
          icon: '✅',
          titulo: `Plano ${plano === 'essencial' ? 'Essencial' : 'Pro'} ativado!`,
          texto: 'Seu pagamento foi confirmado. Aproveite todos os recursos.',
          action: 'planos',
        });

        console.log(`Plano ${plano} ativado para usuário ${userId}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
