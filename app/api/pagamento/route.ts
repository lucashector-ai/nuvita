import { NextRequest, NextResponse } from 'next/server';

const ABACATE_API = 'https://api.abacatepay.com/v1';
const ABACATE_KEY = process.env.ABACATEPAY_API_KEY!;

const PLANOS = {
  essencial: {
    nome: 'Nuvita Essencial',
    valor: 4700, // R$ 47,00 em centavos
    externalId: 'nuvita-essencial',
  },
  pro: {
    nome: 'Nuvita Pro',
    valor: 9700, // R$ 97,00 em centavos
    externalId: 'nuvita-pro',
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plano, userId, nome, email, telefone } = await req.json();

    if (!plano || !PLANOS[plano as keyof typeof PLANOS]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const p = PLANOS[plano as keyof typeof PLANOS];

    // Cria cobrança na AbacatePay
    const res = await fetch(`${ABACATE_API}/billing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATE_KEY}`,
      },
      body: JSON.stringify({
        frequency: 'MONTHLY',
        methods: ['PIX', 'CREDIT_CARD'],
        products: [{
          externalId: p.externalId,
          name: p.nome,
          quantity: 1,
          price: p.valor,
        }],
        customer: {
          name: nome,
          email: email,
          cellphone: telefone || '',
        },
        metadata: {
          userId,
          plano,
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          completionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso?plano=${plano}&userId=${userId}`,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error('AbacatePay error:', data);
      return NextResponse.json({ error: data.error || 'Erro ao criar cobrança' }, { status: 500 });
    }

    return NextResponse.json({ url: data.data.url, id: data.data.id });
  } catch (err) {
    console.error('Pagamento error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
