export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, unauthorized } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';

const PRICES: Record<string, string> = {
  'essencial-mensal': 'price_1TJf9LAjeISNfZNYvZhPqjo2',
  'essencial-anual':  'price_1TJf9LAjeISNfZNY5bhTxTbR',
  'pro-mensal':       'price_1TJf9MAjeISNfZNYS5npvEBN',
  'pro-anual':        'price_1TJf9NAjeISNfZNYfSKvUERV',
};

const PLANOS_VALIDOS = new Set(['essencial', 'pro']);

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`pagamento:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Autorização: usuário precisa estar autenticado.
    // userId/email são derivados da sessão, NÃO do body — assim ninguém
    // consegue criar checkout em nome de outro usuário.
    const user = await getUserFromRequest(req);
    if (!user) return unauthorized();
    if (!user.email) return NextResponse.json({ error: 'Email não disponível' }, { status: 400 });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 });

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' as any });

    const body = await req.json();
    const plano = String(body?.plano || '');
    const anual = !!body?.anual;
    if (!PLANOS_VALIDOS.has(plano)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const chave = `${plano}-${anual ? 'anual' : 'mensal'}`;
    const priceId = PRICES[chave];
    if (!priceId) return NextResponse.json({ error: 'Plano ou price ID inválido' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: `${APP_URL}/pagamento/sucesso?plano=${plano}&userId=${user.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/planos?origem=diagnostico`,
      metadata: { userId: user.id, plano },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
