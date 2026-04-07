export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const ABACATE_API = 'https://api.abacatepay.com/v1';
const ABACATE_KEY = process.env.ABACATEPAY_API_KEY || 'placeholder';

const PLANOS: Record<string, { nome: string; mensal: number; anual: number }> = {
  essencial: { nome: 'Nuvita Essencial', mensal: 4700,  anual: 45120 },
  pro:       { nome: 'Nuvita Pro',       mensal: 9700,  anual: 93120 },
};

export async function POST(req: NextRequest) {
  try {
    const { plano, userId, nome, email, anual, valorCentavos } = await req.json();

    const p = PLANOS[plano as keyof typeof PLANOS];
    if (!p) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });

    const valor = valorCentavos ?? (anual ? p.anual : p.mensal);
    const nomePlano = anual ? `${p.nome} — Anual` : `${p.nome} — Mensal`;
    const externalId = anual ? `nuvita-${plano}-anual` : `nuvita-${plano}-mensal`;

    // Anual = cobrança única (ONE_TIME), mensal = recorrente (MONTHLY)
    const frequency = anual ? 'ONE_TIME' : 'MONTHLY';

    const res = await fetch(`${ABACATE_API}/billing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATE_KEY}`,
      },
      body: JSON.stringify({
        frequency,
        methods: ['PIX'],
        products: [{
          externalId,
          name: nomePlano,
          quantity: 1,
          price: valor,
        }],
        customer: {
          name: nome || 'Cliente',
          email: email || '',
          cellphone: '',
        },
        metadata: {
          userId,
          plano,
          anual: anual ? 'true' : 'false',
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app'}/dashboard`,
          completionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app'}/pagamento/sucesso?plano=${plano}&userId=${userId}`,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.error('AbacatePay error:', data);
      return NextResponse.json({ error: data.error || 'Erro ao criar cobrança' }, { status: 500 });
    }

    return NextResponse.json({ url: data.data?.url, id: data.data?.id });
  } catch (err) {
    console.error('Pagamento error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
