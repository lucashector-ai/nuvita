export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const { userId, plano } = session.metadata || {};
      console.log('Stripe webhook: checkout.session.completed', { userId, plano });
      if (userId && plano) {
        // Atualiza plano na coluna e dentro do diagnóstico
        const { data: perfil } = await supabaseAdmin
          .from('usuarios').select('diagnostico').eq('id', userId).single();
        const diagAtualizado = {
          ...(perfil?.diagnostico || {}),
          plano,
          _activePlan: plano,
        };
        await supabaseAdmin.from('usuarios').update({
          plano,
          diagnostico: diagAtualizado,
        }).eq('id', userId);
        console.log('Plano atualizado para', plano, 'userId', userId);
      }
    }

    // Também escuta renovações de assinatura
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any;
      const sub = invoice.subscription;
      if (sub) {
        // Busca a subscription para pegar metadata
        const subscription = await stripe.subscriptions.retrieve(sub);
        const { userId, plano } = subscription.metadata || {};
        if (userId && plano) {
          await supabaseAdmin.from('usuarios').update({ plano }).eq('id', userId);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
