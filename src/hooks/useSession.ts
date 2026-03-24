"use client";

import { useState, useCallback } from "react";
import type { Session, DiagnosticoData, Plano } from "@/types";

const KEY = "nv_session";

function read(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(data: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

function clear() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("nv_"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export function useSession() {
  const [session, setSessionState] = useState<Session | null>(() => read());

  const setSession = useCallback((data: Session) => {
    write(data);
    setSessionState(data);
  }, []);

  const updateSession = useCallback(
    (partial: Partial<Session>) => {
const merged: Session = {
  ...current,
  ...diag,
  q3: diag.q3
write(merged);
      setSessionState(merged);
    },
    []
  );

  const saveDiagnostico = useCallback((diag: DiagnosticoData) => {
    const current = read() || {};
    const merged: Session = {
      ...current,
      ...diag,
      _diagTimestamp: Date.now(),
      _savedAt: Date.now(),
    };
    write(merged);
    setSessionState(merged);
  }, []);

  const setPlano = useCallback(
    (plano: Plano) => {
      updateSession({ plano, _activePlan: plano });
    },
    [updateSession]
  );

  const logout = useCallback(() => {
    clear();
    setSessionState(null);
  }, []);

  const hasCompletedDiag = useCallback(() => {
    const s = read();
    return !!(s?.email && s?.q3?.length);
  }, []);

  return {
    session,
    setSession,
    updateSession,
    saveDiagnostico,
    setPlano,
    logout,
    hasCompletedDiag,
  };
}
