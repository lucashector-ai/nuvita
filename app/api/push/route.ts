import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getUserFromRequest, unauthorized } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`push:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Autorização: derivamos userId do token, ignoramos qualquer userId vindo do body.
    const user = await getUserFromRequest(req);
    if (!user) return unauthorized();

    const { subscription } = await req.json();

    const supabase = getSupabaseAdmin();
    await supabase.from('notificacoes_config').upsert(
      {
        user_id: user.id,
        push_subscription: subscription || { registered: true },
        push_ativo: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Push error:', e?.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
