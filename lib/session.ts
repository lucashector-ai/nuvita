// ════════════════════════════════════════════════
//  NUVITA — lib/session.ts
//  Persistência da sessão no localStorage
// ════════════════════════════════════════════════

import type { NuvitaSession } from '@/types';

const KEY_SESSION     = 'nv_session';
const KEY_QUIZ        = 'nv_quiz_partial';

/** Salva um valor serializado no localStorage */
export function nvSave<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignora erros de quota
  }
}

/** Lê e desserializa um valor do localStorage */
export function nvLoad<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Remove um valor do localStorage */
export function nvDelete(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {/* noop */}
}

/** Limpa toda a sessão Nuvita */
export function nvClear(): void {
  [KEY_SESSION, KEY_QUIZ].forEach(nvDelete);
}

// ── Atalhos de sessão ────────────────────────────
export function saveSession(answers: NuvitaSession): void {
  nvSave(KEY_SESSION, answers);
}

export function loadSession(): NuvitaSession | null {
  return nvLoad<NuvitaSession | null>(KEY_SESSION, null);
}

export function saveQuizPartial(answers: NuvitaSession): void {
  nvSave(KEY_QUIZ, answers);
}

export function loadQuizPartial(): NuvitaSession | null {
  return nvLoad<NuvitaSession | null>(KEY_QUIZ, null);
}

/** Verifica se há sessão completa (email + diagnóstico + plano) */
export function hasCompleteSession(): boolean {
  const s = loadSession();
  return !!(s && s.email && s.q3 && s.q3.length && s._activePlan);
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('nv_quiz');
  sessionStorage.removeItem('nv_welcome_seen');
  try { localStorage.removeItem('nv_quiz'); } catch {}
}
