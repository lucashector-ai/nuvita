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
  const { error } = await supabase
    .from('usuarios')
    .update({ diagnostico, nome: diagnostico.nome || null, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

// Carrega diagnóstico do banco
export async function carregarDiagnostico(userId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('diagnostico, nome, plano')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function trocarPlano(userId: string, novoPlano: string) {
  const { error } = await supabase
    .from('usuarios')
    .update({ plano: novoPlano })
    .eq('id', userId)
  if (error) throw error
}
