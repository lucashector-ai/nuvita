import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export async function POST(req: Request) {
  try {
    const { userId, subscription } = await req.json();
    if (!userId || !subscription) return NextResponse.json({ error: 'missing' }, { status: 400 });
    await sb.from('notificacoes_config').upsert({ user_id: userId, push_subscription: subscription, push_ativo: true, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
