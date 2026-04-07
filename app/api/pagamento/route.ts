export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';
const ABACATE_API_KEY = process.env.ABACATEPAY_API_KEY || '';

const PRECOS: Record<string, number> = {
  'essencial-mensal': 4700,
  'essencial-anual':  45600,
  'pro-mensal':       9700,
  'pro-anual':        93600,
};

export async function POST(req: NextRequest) {
  try {
    const { plano, userId, nome, email, anual } = await req.json();

    const chave = `${plano}-${anual ? 'anual' : 'mensal'}`;
    const valor = PRECOS[chave];
    if (!valor) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });

    const res = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATE_API_KEY}`,
      },
      body: JSON.stringify({
        frequency: anual ? 'YEARLY' : 'MONTHLY',
        methods: ['PIX'],
        products: [{
          externalId: `${plano}-${anual ? 'anual' : 'mensal'}`,
          name: `Nuvita ${plano.charAt(0).toUpperCase() + plano.slice(1)} ${anual ? 'Anual' : 'Mensal'}`,
          description: `Assinatura ${anual ? 'anual' : 'mensal'} do plano ${plano}`,
          quantity: 1,
          price: valor,
        }],
        returnUrl: `${APP_URL}/pagamento/sucesso?plano=${plano}&userId=${userId}`,
        completionUrl: `${APP_URL}/pagamento/sucesso?plano=${plano}&userId=${userId}`,
        customer: { name: nome || email, email, cellphone: '', taxId: { type: 'CPF', number: '' } },
        metadata: { userId, plano },
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });
    return NextResponse.json({ url: data.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
