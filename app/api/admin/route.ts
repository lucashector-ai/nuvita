export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'nuvita_admin_2026';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );
}

export async function POST(req: NextRequest) {
  const { token, action, payload } = await req.json();

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    switch (action) {

      case 'list_users': {
        const { data: { users }, error } = await getSupabaseAdmin().auth.admin.listUsers();
        if (error) throw error;
        // Enriquece com dados do banco
        const { data: perfis } = await getSupabaseAdmin()
          .from('usuarios').select('id, diagnostico, plano, created_at');
        const mapa = Object.fromEntries((perfis || []).map(p => [p.id, p]));
        const enriched = users.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in: u.last_sign_in_at,
          nome: mapa[u.id]?.diagnostico?.nome || '—',
          plano: mapa[u.id]?.plano || 'free',
          objetivo: (mapa[u.id]?.diagnostico?.q3 || []).join(', ') || '—',
        }));
        return NextResponse.json({ users: enriched });
      }

      case 'delete_user': {
        const { userId } = payload;
        // Apaga todos os dados do usuário
        await Promise.all([
          getSupabaseAdmin().from('usuarios').delete().eq('id', userId),
          getSupabaseAdmin().from('agendamentos').delete().eq('user_id', userId),
          getSupabaseAdmin().from('notificacoes').delete().eq('user_id', userId),
          getSupabaseAdmin().from('diario_entries').delete().eq('user_id', userId),
          getSupabaseAdmin().from('estoque_usuario').delete().eq('user_id', userId),
          getSupabaseAdmin().from('rotina_personalizada').delete().eq('user_id', userId),
          getSupabaseAdmin().from('check_ins').delete().eq('user_id', userId),
          getSupabaseAdmin().from('adesao_diaria').delete().eq('user_id', userId),
        ]);
        // Deleta da autenticação
        const { error } = await getSupabaseAdmin().auth.admin.deleteUser(userId);
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case 'change_plan': {
        const { userId, plano } = payload;
        const { data: perfil } = await getSupabaseAdmin()
          .from('usuarios').select('diagnostico').eq('id', userId).single();
        await getSupabaseAdmin().from('usuarios').update({
          plano,
          diagnostico: { ...perfil?.diagnostico, _activePlan: plano }
        }).eq('id', userId);
        return NextResponse.json({ ok: true });
      }

      case 'stats': {
        const { data: { users } } = await getSupabaseAdmin().auth.admin.listUsers();
        const { data: perfis } = await getSupabaseAdmin().from('usuarios').select('plano');
        const { data: agendamentos } = await getSupabaseAdmin().from('agendamentos').select('id, status');
        const { data: notifs } = await getSupabaseAdmin().from('notificacoes').select('id');

        const planos = { free: 0, essencial: 0, pro: 0 };
        (perfis || []).forEach((p: any) => { const k = p.plano as keyof typeof planos; if (k in planos) planos[k]++; });

        return NextResponse.json({
          totalUsuarios: users.length,
          planos,
          totalConsultas: agendamentos?.length || 0,
          consultasPendentes: agendamentos?.filter(a => a.status === 'pendente').length || 0,
          totalNotificacoes: notifs?.length || 0,
        });
      }

      case 'send_notification': {
        const { userId, titulo, texto, icon, todos } = payload;
        if (todos) {
          const { data: { users } } = await getSupabaseAdmin().auth.admin.listUsers();
          await Promise.all(users.map(u =>
            getSupabaseAdmin().from('notificacoes').insert({
              user_id: u.id, icon: icon || '📢', titulo, texto, action: 'inicio'
            })
          ));
        } else {
          await getSupabaseAdmin().from('notificacoes').insert({
            user_id: userId, icon: icon || '📢', titulo, texto, action: 'inicio'
          });
        }
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
