import { NextResponse } from 'next/server';
import { getSupabaseAdmin, getUserFromRequest, unauthorized } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function DELETE(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`delete-acct:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Autorização real via Bearer token (NÃO confiar em getUser sem token).
    const user = await getUserFromRequest(request);
    if (!user) return unauthorized();

    const adminClient = getSupabaseAdmin();

    // Apaga dados em todas as tabelas conhecidas. Idealmente isso é feito por
    // ON DELETE CASCADE no SQL — ver supabase_security_rls.sql.
    await Promise.all([
      adminClient.from('usuarios').delete().eq('id', user.id),
      adminClient.from('agendamentos').delete().eq('user_id', user.id),
      adminClient.from('notificacoes').delete().eq('user_id', user.id),
      adminClient.from('notificacoes_config').delete().eq('user_id', user.id),
      adminClient.from('diario_entries').delete().eq('user_id', user.id),
      adminClient.from('estoque_usuario').delete().eq('user_id', user.id),
      adminClient.from('estoque_items').delete().eq('user_id', user.id),
      adminClient.from('rotina_personalizada').delete().eq('user_id', user.id),
      adminClient.from('check_ins').delete().eq('user_id', user.id),
      adminClient.from('adesao_diaria').delete().eq('user_id', user.id),
      adminClient.from('pagamentos').delete().eq('user_id', user.id),
      adminClient.from('tracker_entries').delete().eq('user_id', user.id),
    ]);

    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Delete account error:', e?.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
