import { supabase } from './supabase'

export async function signInWithOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })
  if (error) throw error
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  if (error) throw error
  return data
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('nv_quiz')
    sessionStorage.removeItem('nv_welcome_seen')
    localStorage.removeItem('nv_quiz')
  }
}

export async function updateEmail(novoEmail: string) {
  const { error } = await supabase.auth.updateUser({ email: novoEmail })
  if (error) throw error
}

// Cria ou atualiza perfil do usuário após login
export async function upsertUsuario(userId: string, email: string, nome?: string) {
  const { error } = await supabase
    .from('usuarios')
    .upsert({ id: userId, email, nome: nome || null }, { onConflict: 'id' })
  if (error) throw error
}

// Salva diagnóstico no banco
//
// SEGURANÇA: a coluna `plano` NUNCA é escrita aqui. O plano é
// authoritativamente controlado pelo webhook do Stripe (server-side com
// service_role). Qualquer tentativa de escrever `plano` pelo cliente é
// adicionalmente bloqueada por trigger no Postgres (ver supabase_security_rls.sql).
//
// Os campos `plano`/`_activePlan` são REMOVIDOS do diagnóstico antes de salvar
// para evitar que o cliente se auto-upgrade alterando o JSON.
export async function salvarDiagnostico(userId: string, diagnostico: any) {
  // Lê o nome atual do banco antes de salvar (para não sobrescrever com vazio)
  const { data: atual } = await supabase
    .from('usuarios').select('nome').eq('id', userId).maybeSingle();

  const nomeParaSalvar = (diagnostico.nome && diagnostico.nome.trim())
    ? diagnostico.nome.trim()
    : (atual?.nome || null);

  // Strip de campos sensíveis vindos do cliente — nunca confiar no plano vindo do JSON
  const { plano: _ignorePlano, _activePlan: _ignoreActive, ...diagnosticoSeguro } = diagnostico;

  const { error } = await supabase
    .from('usuarios')
    .upsert({
      id: userId,
      diagnostico: diagnosticoSeguro,
      nome: nomeParaSalvar,
    }, { onConflict: 'id' })
  if (error) throw error
}

// Carrega diagnóstico do banco
export async function carregarDiagnostico(userId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('diagnostico, nome, plano')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  // Garante que diagnostico.nome nunca fica vazio se a coluna nome tem valor
  if (data.nome && data.diagnostico && !data.diagnostico.nome) {
    data.diagnostico = { ...data.diagnostico, nome: data.nome };
  }
  return data
}

// REMOVIDO: trocarPlano() era inseguro — permitia ao próprio cliente
// alterar a coluna `plano`. Qualquer mudança de plano agora passa por:
//   1. Stripe Checkout via /api/pagamento (cria sessão)
//   2. Webhook em /api/pagamento/webhook (atualiza com service_role)
//   3. Painel admin via /api/admin (ação change_plan, autenticado)
