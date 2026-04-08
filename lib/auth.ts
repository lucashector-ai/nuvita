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
export async function salvarDiagnostico(userId: string, diagnostico: any) {
  // Lê o plano atual do banco antes de salvar — nunca deixa regredir
  const { data: atual } = await supabase
    .from('usuarios').select('plano').eq('id', userId).maybeSingle();
  
  const planoAtual = atual?.plano || 'free';
  const novoPlano = diagnostico._activePlan || diagnostico.plano || planoAtual;
  
  // Hierarquia: pro > essencial > free
  const RANK: Record<string,number> = { free: 0, essencial: 1, pro: 2 };
  const planoFinal = (RANK[novoPlano] || 0) >= (RANK[planoAtual] || 0) 
    ? novoPlano 
    : planoAtual;

  const { error } = await supabase
    .from('usuarios')
    .upsert({
      id: userId,
      diagnostico: { ...diagnostico, plano: planoFinal, _activePlan: planoFinal },
      nome: diagnostico.nome || null,
      plano: planoFinal,
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
  return data
}

export async function trocarPlano(userId: string, novoPlano: string) {
  const { error } = await supabase
    .from('usuarios')
    .update({ plano: novoPlano })
    .eq('id', userId)
  if (error) throw error
}
