export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ABACATE_API = 'https://api.abacatepay.com/v2';
const ABACATE_KEY = process.env.ABACATEPAY_API_KEY || 'placeholder';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';

const PRODUTOS: Record<string, string> = {
  'essencial-mensal': 'prod_NQCFL6zrBbYRJUr1HyqGUgSt',
  'essencial-anual':  'prod_CSRakGYYPQLX6GMqQNtQyZgJ',
  'pro-mensal':       'prod_uLGQeSRQTJQcUSdxJE6HzaNN',
  'pro-anual':        'prod_JTtjajCQFbDJ2eXHMY0b4GPc',
};

export async function POST(req: NextRequest) {
  try {
    const { plano, userId, nome, email, anual, taxId } = await req.json();

    if (!plano || !PRODUTOS[`${plano}-${anual ? 'anual' : 'mensal'}`]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const produtoId = PRODUTOS[`${plano}-${anual ? 'anual' : 'mensal'}`];

    const body = {
      items: [{ id: produtoId, quantity: 1 }],
      methods: ['CARD'],
      returnUrl: `${APP_URL}/planos`,
      completionUrl: `${APP_URL}/pagamento/sucesso?plano=${plano}&userId=${userId}`,
      customer: {
        name: nome || 'Cliente',
        email: email || '',
        cellphone: '',
        taxId: taxId || '111.444.777-35',
      },
      metadata: { userId, plano, anual: String(anual) },
    };

    const res = await fetch(`${ABACATE_API}/subscriptions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error('AbacatePay error:', JSON.stringify(data));
      return NextResponse.json({ error: data.error || 'Erro ao criar assinatura' }, { status: 500 });
    }

    return NextResponse.json({ url: data.data?.url, id: data.data?.id });
  } catch (err) {
    console.error('Pagamento error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
