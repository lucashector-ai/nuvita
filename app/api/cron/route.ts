export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { isInternalCaller } from '@/lib/serverAuth';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';
const INTERNAL = process.env.INTERNAL_API_SECRET || '';

async function callEmail(tipo: string, email: string, nome: string, dados?: any) {
  return fetch(`${APP_URL}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-secret': INTERNAL },
    body: JSON.stringify({ tipo, email, nome, dados }),
  });
}

async function callIA(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${APP_URL}/api/ia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'Você é a IA Nuvita. Gere um insight de acompanhamento semanal sobre peptídeos em 2-3 frases, em português, direto e encorajador.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const d = await res.json();
    return d.text || 'Continue com seu protocolo e registre seus check-ins para resultados melhores.';
  } catch {
    return 'Continue com seu protocolo. A consistência é o fator mais importante para resultados.';
  }
}

export async function POST(req: NextRequest) {
  if (!isInternalCaller(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { job } = await req.json();
  const supabase = getAdmin();
  const logs: string[] = [];

  // ══ boas_vindas — usuários criados nas últimas 24h ══
  if (job === 'sequencia_boas_vindas' || job === 'all') {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const novos = users.filter(u => u.created_at > ontem);

    for (const u of novos) {
      if (!u.email) continue;
      const { data: perfil } = await supabase.from('usuarios').select('diagnostico').eq('id', u.id).single();
      const nome = perfil?.diagnostico?.nome || u.email.split('@')[0];
      const peptideos = perfil?.diagnostico?._protocoloIA
        ? (() => { try { return JSON.parse(perfil.diagnostico._protocoloIA).peptideos?.map((p: any) => p.nome) || []; } catch { return []; } })()
        : [];

      await callEmail('boas_vindas', u.email, nome, { peptideos });
      logs.push(`boas_vindas → ${u.email}`);

      // Agenda dia3 e semana1
      const now = Date.now();
      await supabase.from('email_queue').upsert([
        { user_id: u.id, email: u.email, nome, tipo: 'dia3', enviar_em: new Date(now + 3*24*60*60*1000).toISOString(), dados: JSON.stringify({ peptideoMain: peptideos[0] || 'seu peptídeo' }) },
        { user_id: u.id, email: u.email, nome, tipo: 'semana1', enviar_em: new Date(now + 7*24*60*60*1000).toISOString(), dados: JSON.stringify({ objetivo: perfil?.diagnostico?.q3?.[0] || 'seus objetivos' }) },
      ], { onConflict: 'user_id,tipo' });
    }
  }

  // ══ processar_fila — emails agendados ══
  if (job === 'processar_fila' || job === 'all') {
    const { data: fila } = await supabase
      .from('email_queue').select('*')
      .lte('enviar_em', new Date().toISOString())
      .eq('enviado', false).limit(20);

    for (const item of fila || []) {
      const dados = item.dados ? JSON.parse(item.dados) : {};
      await callEmail(item.tipo, item.email, item.nome, dados);
      await supabase.from('email_queue').update({ enviado: true, enviado_em: new Date().toISOString() }).eq('id', item.id);
      logs.push(`fila → ${item.tipo} para ${item.email}`);
    }
  }

  // ══ acompanhamento_semanal — análise IA por email ══
  if (job === 'acompanhamento_semanal' || job === 'all') {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const ativos = users.filter(u => {
      const dias = (Date.now() - new Date(u.created_at).getTime()) / (1000*60*60*24);
      return dias >= 7;
    }).slice(0, 10);

    for (const u of ativos) {
      if (!u.email) continue;
      const { data: perfil } = await supabase.from('usuarios').select('diagnostico').eq('id', u.id).single();
      const nome = perfil?.diagnostico?.nome || u.email.split('@')[0];
      const objs = perfil?.diagnostico?.q3?.join(', ') || 'seus objetivos';
      const semana = Math.max(1, Math.floor((Date.now() - new Date(u.created_at).getTime()) / (1000*60*60*24*7)));
      const insights = await callIA(`Usuário na semana ${semana} do protocolo. Objetivos: ${objs}. Gere insight motivador e prático.`);
      await callEmail('acompanhamento_semanal', u.email, nome, { semana, insights });
      logs.push(`semanal → ${u.email} semana ${semana}`);
    }
  }

  // ══ reengajamento — inativos 5-14 dias ══
  if (job === 'reengajamento' || job === 'all') {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const inativos = users.filter(u => {
      if (!u.last_sign_in_at) return false;
      const dias = (Date.now() - new Date(u.last_sign_in_at).getTime()) / (1000*60*60*24);
      return dias >= 5 && dias <= 14;
    }).slice(0, 5);

    for (const u of inativos) {
      if (!u.email) continue;
      const { data: perfil } = await supabase.from('usuarios').select('diagnostico').eq('id', u.id).single();
      const nome = perfil?.diagnostico?.nome || u.email.split('@')[0];
      const diasSem = Math.floor((Date.now() - new Date(u.last_sign_in_at!).getTime()) / (1000*60*60*24));
      await callEmail('reengajamento', u.email, nome, { diasSem });
      logs.push(`reengajamento → ${u.email} (${diasSem} dias)`);
    }
  }

  return NextResponse.json({ ok: true, logs, total: logs.length });
}
