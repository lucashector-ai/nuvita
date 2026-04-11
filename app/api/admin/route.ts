export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import {
  getSupabaseAdmin,
  getUserFromRequest,
  isAdminUser,
  hasValidAdminToken,
  unauthorized,
  forbidden,
} from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Autorização: aceita DOIS modos —
// 1) Sessão Supabase do usuário cujo email está em ADMIN_EMAILS
// 2) Header `x-admin-token` cujo valor bate com ADMIN_TOKEN (server-only)
// Nunca mais ler token via body / query / NEXT_PUBLIC_*.
async function authorize(req: NextRequest): Promise<{ ok: true } | { ok: false; res: NextResponse }> {
  // Tenta sessão Supabase + allowlist de email
  const user = await getUserFromRequest(req);
  if (user && (await isAdminUser(user))) return { ok: true };

  // Fallback: header server-only
  if (hasValidAdminToken(req)) return { ok: true };

  return { ok: false, res: unauthorized() };
}

export async function POST(req: NextRequest) {
  // Rate limit por IP (defesa contra brute-force do token)
  const ip = getClientIp(req);
  const rl = rateLimit(`admin:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  const auth = await authorize(req);
  if (!auth.ok) return auth.res;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { action, payload } = body || {};
  if (!action || typeof action !== 'string') {
    return NextResponse.json({ error: 'action obrigatória' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  try {
    switch (action) {
      case 'list_users': {
        const { data: { users }, error } = await admin.auth.admin.listUsers();
        if (error) throw error;
        const { data: perfis } = await admin
          .from('usuarios')
          .select('id, diagnostico, plano, created_at');
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
        const userId = String(payload?.userId || '');
        if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
        await Promise.all([
          admin.from('usuarios').delete().eq('id', userId),
          admin.from('agendamentos').delete().eq('user_id', userId),
          admin.from('notificacoes').delete().eq('user_id', userId),
          admin.from('diario_entries').delete().eq('user_id', userId),
          admin.from('estoque_usuario').delete().eq('user_id', userId),
          admin.from('rotina_personalizada').delete().eq('user_id', userId),
          admin.from('check_ins').delete().eq('user_id', userId),
          admin.from('adesao_diaria').delete().eq('user_id', userId),
        ]);
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      case 'change_plan': {
        const userId = String(payload?.userId || '');
        const plano = String(payload?.plano || '');
        const PLANOS_VALIDOS = ['free', 'essencial', 'pro'];
        if (!userId || !PLANOS_VALIDOS.includes(plano)) {
          return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
        }
        const { data: perfil } = await admin
          .from('usuarios')
          .select('diagnostico')
          .eq('id', userId)
          .single();
        await admin
          .from('usuarios')
          .update({
            plano,
            diagnostico: { ...perfil?.diagnostico, _activePlan: plano },
          })
          .eq('id', userId);
        return NextResponse.json({ ok: true });
      }

      case 'stats': {
        const { data: { users } } = await admin.auth.admin.listUsers();
        const { data: perfis } = await admin.from('usuarios').select('plano');
        const { data: agendamentos } = await admin.from('agendamentos').select('id, status');
        const { data: notifs } = await admin.from('notificacoes').select('id');

        const planos = { free: 0, essencial: 0, pro: 0 };
        (perfis || []).forEach((p: any) => {
          const k = p.plano as keyof typeof planos;
          if (k in planos) planos[k]++;
        });

        return NextResponse.json({
          totalUsuarios: users.length,
          planos,
          totalConsultas: agendamentos?.length || 0,
          consultasPendentes: agendamentos?.filter(a => a.status === 'pendente').length || 0,
          totalNotificacoes: notifs?.length || 0,
        });
      }

      case 'send_notification': {
        const { userId, titulo, texto, icon, todos } = payload || {};
        if (!titulo || !texto) {
          return NextResponse.json({ error: 'titulo e texto obrigatórios' }, { status: 400 });
        }
        if (todos) {
          const { data: { users } } = await admin.auth.admin.listUsers();
          await Promise.all(
            users.map(u =>
              admin.from('notificacoes').insert({
                user_id: u.id,
                icon: icon || '📢',
                titulo,
                texto,
                action: 'inicio',
              }),
            ),
          );
        } else {
          if (!userId) {
            return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
          }
          await admin.from('notificacoes').insert({
            user_id: userId,
            icon: icon || '📢',
            titulo,
            texto,
            action: 'inicio',
          });
        }
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
