import { NextRequest, NextResponse } from 'next/server';

const ABACATE_API = 'https://api.abacatepay.com/v1';
const ABACATE_KEY = process.env.ABACATEPAY_API_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';

const PLANOS = {
  essencial: { nome: 'Nuvita Essencial', mensal: 4700, anual: 45600, externalId: 'nuvita-essencial' },
  pro:       { nome: 'Nuvita Pro',       mensal: 9700, anual: 93600, externalId: 'nuvita-pro' },
};

export async function POST(req: NextRequest) {
  try {
    const { plano, userId, nome, email, anual, valorMensal } = await req.json();

    if (!plano || !PLANOS[plano as keyof typeof PLANOS]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const p = PLANOS[plano as keyof typeof PLANOS];

    const body: any = {
      frequency: 'ONE_TIME',
      methods: ['PIX', 'CARD'],
      products: [{
        externalId: p.externalId,
        name: p.nome,
        description: anual ? `Plano anual ${p.nome} — R$ ${valorMensal}/mês por 12 meses` : `Plano mensal ${p.nome}`,
        quantity: 1,
        price: anual ? p.anual : p.mensal,
      }],
      returnUrl: `${APP_URL}/dashboard`,
      completionUrl: `${APP_URL}/pagamento/sucesso?plano=${plano}&userId=${userId}`,
    };

    // Adiciona customer se tiver email
    if (email) {
      body.customer = {
        name: nome || email,
        email: email,
        cellphone: '',
        taxId: '',
      };
    }

    const res = await fetch(`${ABACATE_API}/billing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log('AbacatePay response:', JSON.stringify(data));

    if (!res.ok || data.error) {
      return NextResponse.json({ error: data.error || 'Erro ao criar cobrança' }, { status: 500 });
    }

    return NextResponse.json({ url: data.data.url, id: data.data.id });
  } catch (err: any) {
    console.error('Pagamento error:', err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
