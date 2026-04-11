export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, unauthorized } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`stripe-faturas:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
    }

    // Autorização — só listamos faturas do user autenticado.
    const user = await getUserFromRequest(req);
    if (!user) return unauthorized();
    if (!user.email) return NextResponse.json({ faturas: [] });

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-04-10' as any });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (!customers.data.length) return NextResponse.json({ faturas: [] });

    const invoices = await stripe.invoices.list({ customer: customers.data[0].id, limit: 24 });

    const faturas = invoices.data.map(inv => ({
      id: inv.id,
      descricao: inv.lines?.data?.[0]?.description || 'Assinatura Nuvita',
      valor: inv.amount_paid,
      status: inv.status === 'paid' ? 'paid' : inv.status === 'void' ? 'failed' : 'pending',
      created_at: new Date((inv.created as number) * 1000).toISOString(),
      pdf: inv.invoice_pdf,
      periodo: inv.period_end ? new Date((inv.period_end as number) * 1000).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : null,
    }));

    return NextResponse.json({ faturas });
  } catch (err: any) {
    console.error('Faturas error:', err.message);
    return NextResponse.json({ faturas: [] });
  }
}
