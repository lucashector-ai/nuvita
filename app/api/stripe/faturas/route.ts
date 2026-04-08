export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      return NextResponse.json({ faturas: [] });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-04-10' as any });
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!userData?.user?.email) return NextResponse.json({ faturas: [] });

    const customers = await stripe.customers.list({ email: userData.user.email, limit: 1 });
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
