// ════════════════════════════════════════════════
//  NUVITA — lib/apiClient.ts
//  Wrapper de fetch que injeta automaticamente o
//  Authorization: Bearer <access_token> da sessão Supabase.
//  Use em todas as chamadas client→/api/* que exigem auth.
// ════════════════════════════════════════════════

'use client';
import { supabase } from './supabase';

async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Fetch autenticado: anexa Bearer token, força JSON e propaga erros.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

/** Versão conveniente para POST JSON. */
export async function apiPost<T = any>(url: string, body?: any): Promise<T> {
  const res = await apiFetch(url, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

/** Versão conveniente para GET. */
export async function apiGet<T = any>(url: string): Promise<T> {
  const res = await apiFetch(url, { method: 'GET' });
  return res.json();
}
