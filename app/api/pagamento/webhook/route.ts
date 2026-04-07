export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' });

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, plano } = session.metadata || {};
    if (userId && plano) {
      await supabase.from('usuarios').update({ plano }).eq('id', userId);
      await supabase.from('notificacoes').insert({
        user_id: userId,
        icon: '✅',
        titulo: `Plano ${plano === 'essencial' ? 'Essencial' : 'Pro'} ativado!`,
        texto: 'Seu pagamento foi confirmado. Aproveite todos os recursos.',
        action: 'planos',
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    // Busca o usuário pelo stripe_customer_id se existir, ou pelo metadata
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .limit(1);
    if (usuarios && usuarios.length > 0) {
      await supabase.from('usuarios').update({ plano: 'free' }).eq('id', usuarios[0].id);
    }
  }

  return NextResponse.json({ received: true });
}
