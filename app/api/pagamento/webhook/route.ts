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
      console.log('Stripe webhook: checkout.session.completed', { userId, plano, sub: session.subscription });
      if (userId && plano) {
        // Pega o intervalo (mensal/anual) da subscription
        let intervalo = 'mensal';
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            const interval = sub.items?.data?.[0]?.plan?.interval;
            intervalo = interval === 'year' ? 'anual' : 'mensal';
          } catch(e) { console.error('Erro ao buscar subscription:', e); }
        }

        const { data: perfil } = await supabaseAdmin
          .from('usuarios').select('diagnostico').eq('id', userId).maybeSingle();
        const diagAtualizado = {
          ...(perfil?.diagnostico || {}),
          plano,
          _activePlan: plano,
          _planoIntervalo: intervalo,
          _planoAssinaturaId: session.subscription || null,
          _planoAtualizadoEm: new Date().toISOString(),
        };
        await supabaseAdmin.from('usuarios').update({
          plano,
          diagnostico: diagAtualizado,
        }).eq('id', userId);
        console.log('Plano atualizado:', { plano, intervalo, userId });
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const { userId, plano } = sub.metadata || {};
        if (userId && plano) {
          await supabaseAdmin.from('usuarios').update({ plano }).eq('id', userId);
        }
      }
    }
    
    if (event.type === 'customer.subscription.deleted') {
      // Assinatura cancelada — volta para free
      const sub = event.data.object as any;
      const { userId } = sub.metadata || {};
      if (userId) {
        const { data: perfil } = await supabaseAdmin
          .from('usuarios').select('diagnostico').eq('id', userId).maybeSingle();
        await supabaseAdmin.from('usuarios').update({
          plano: 'free',
          diagnostico: { ...(perfil?.diagnostico || {}), plano: 'free', _activePlan: 'free' }
        }).eq('id', userId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
