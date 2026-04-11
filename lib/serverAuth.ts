// ════════════════════════════════════════════════
//  NUVITA — lib/serverAuth.ts
//  Helpers de autenticação/autorização para API routes
//  - Valida o usuário a partir do token Bearer (access_token Supabase)
//  - Fornece cliente admin Supabase (service role)
//  - Comparação constant-time para segredos
// ════════════════════════════════════════════════

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) não configuradas');
  }
  if (_adminClient) return _adminClient;
  _adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminClient;
}

/** Extrai o access_token Bearer do header Authorization. */
export function extractBearer(req: Request): string | null {
  const h = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  if (!h.toLowerCase().startsWith('bearer ')) return null;
  const token = h.slice(7).trim();
  return token || null;
}

/** Valida o token Bearer e retorna o user autenticado, ou null. */
export async function getUserFromRequest(req: Request): Promise<User | null> {
  const token = extractBearer(req);
  if (!token) return null;
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/** Resposta padronizada para 401. */
export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

/** Resposta padronizada para 403. */
export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** Comparação constant-time de strings (evita timing attacks em segredos). */
export function safeCompare(a: string | undefined | null, b: string | undefined | null): boolean {
  if (!a || !b) return false;
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

/** Verifica se o request veio de um caller interno (webhook/cron) com segredo válido. */
export function isInternalCaller(req: Request): boolean {
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) return false;
  const got = req.headers.get('x-internal-secret') || '';
  return safeCompare(expected, got);
}

/** Verifica se o user autenticado é admin (allowlist por email). */
export async function isAdminUser(user: User | null): Promise<boolean> {
  if (!user?.email) return false;
  const list = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length) return false;
  return list.includes(user.email.toLowerCase());
}

/**
 * Valida segredo de admin enviado via header `x-admin-token`.
 * Use APENAS server-side. Nunca exponha esse token via NEXT_PUBLIC_*.
 */
export function hasValidAdminToken(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const got = req.headers.get('x-admin-token') || '';
  return safeCompare(expected, got);
}
