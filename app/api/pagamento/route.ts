export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';

// Price IDs do Stripe — configure no painel Stripe e adicione no Vercel
const PRICES: Record<string, string> = {
  'essencial-mensal': process.env.STRIPE_PRICE_ESSENCIAL_MENSAL || '',
  'essencial-anual':  process.env.STRIPE_PRICE_ESSENCIAL_ANUAL  || '',
  'pro-mensal':       process.env.STRIPE_PRICE_PRO_MENSAL       || '',
  'pro-anual':        process.env.STRIPE_PRICE_PRO_ANUAL        || '',
};

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 });

    const { Stripe } = await import('stripe');
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });

    const { plano, userId, email, anual } = await req.json();

    const chave = `${plano}-${anual ? 'anual' : 'mensal'}`;
    const priceId = PRICES[chave];
    if (!priceId) return NextResponse.json({ error: 'Plano ou price ID inválido' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${APP_URL}/pagamento/sucesso?plano=${plano}&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/planos?origem=diagnostico`,
      metadata: { userId, plano },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
