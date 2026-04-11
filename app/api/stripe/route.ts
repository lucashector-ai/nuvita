export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, unauthorized } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`stripe-portal:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
    }

    // Autorização: usuário precisa estar autenticado e só pode abrir o portal da PRÓPRIA conta.
    // Não confiamos em userId vindo do body — derivamos do token.
    const user = await getUserFromRequest(req);
    if (!user) return unauthorized();
    if (!user.email) return NextResponse.json({ error: 'Email não disponível' }, { status: 400 });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 });

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' as any });

    // Busca/cria customer pelo email do user autenticado
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
      customerId = customer.id;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/configuracoes`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error:', err.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
