export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';

const PRICES: Record<string, string> = {
  'essencial-mensal': 'price_1TJf9LAjeISNfZNYvZhPqjo2',
  'essencial-anual':  'price_1TJf9LAjeISNfZNY5bhTxTbR',
  'pro-mensal':       'price_1TJf9MAjeISNfZNYS5npvEBN',
  'pro-anual':        'price_1TJf9NAjeISNfZNYfSKvUERV',
};

export async function POST(req: NextRequest) {
  try {
    const { plano, userId, email, anual } = await req.json();

    const priceKey = `${plano}-${anual ? 'anual' : 'mensal'}`;
    const priceId = PRICES[priceKey];
    if (!priceId) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/pagamento/sucesso?plano=${plano}&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/planos`,
      customer_email: email || undefined,
      metadata: { userId, plano, anual: String(!!anual) },
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
