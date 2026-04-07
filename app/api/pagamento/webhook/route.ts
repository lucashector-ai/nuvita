export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { event, data } = body;

    if (event === 'billing.paid') {
      const { metadata, status } = data;
      const { userId, plano } = metadata || {};
      if (userId && plano && status === 'PAID') {
        await supabaseAdmin.from('usuarios').update({ plano }).eq('id', userId);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
