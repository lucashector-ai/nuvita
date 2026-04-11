'use client';
import { useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { apiFetch } from './apiClient';

interface Opts { userId: string|null; email: string; nome: string; emailAtivo: boolean; pushAtivo: boolean; }

// Doses médias diárias em mg para cálculo automático de estoque
const DOSES_AUTO: Record<string, number> = {
  'semaglutide': 0.071, // 0.5mg/semana
  'tirzepatide': 0.714, // 5mg/semana
  'aod9604': 0.214,     // 300mcg x 5d/semana
  'ipamorelin': 0.25,   // 250mcg/dia
  'cjc1295': 0.1,       // 100mcg/dia
  'bpc157': 0.25,       // 250mcg/dia
  'tb500': 0.714,       // 2.5mg x 2d/semana
  'mk677': 0.015,       // 15mg/dia (oral)
  'ghkcu': 1.0,         // 1mg/dia
  'semax': 0.214,       // 300mcg x 5d/semana
  'epitalon': 5.0,      // 5mg/dia em ciclo
};

function getDoseDia(nome: string): number|null {
  const key = nome.toLowerCase().replace(/[^a-z0-9]/g, '');
  const match = Object.entries(DOSES_AUTO).find(([k]) => key.includes(k) || k.includes(key.substring(0,5)));
  return match ? match[1] : null;
}

export function useNotificacoes({ userId, email, nome, emailAtivo, pushAtivo }: Opts) {

  const registrarPush = useCallback(async () => {
    if (!pushAtivo || !userId || typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      // Sem VAPID key por enquanto — apenas registra o SW
      await apiFetch('/api/push', {
        method: 'POST',
        body: JSON.stringify({ subscription: { registered: true } }),
      });
    } catch (e) { console.warn('[Push]', e); }
  }, [userId, pushAtivo]);

  const verificarNotificacoes = useCallback(async () => {
    if (!userId || !email) return;
    const hoje = new Date().toISOString().split('T')[0];
    const hora = new Date().getHours();

    try {
      // 1. Check-in pendente
      const { data: ci } = await supabase.from('check_ins').select('id').eq('user_id', userId).eq('data', hoje).maybeSingle();
      if (!ci && emailAtivo && hora >= 14 && hora <= 20) {
        const k = `nv_ne_ci_${hoje}`;
        if (!localStorage.getItem(k)) {
          apiFetch('/api/notify', { method:'POST', body: JSON.stringify({ email, nome, tipo:'checkin_lembrete' }) });
          localStorage.setItem(k, '1');
        }
      }

      // 2. Protocolo sem adesão há 2+ dias
      const d2 = new Date(); d2.setDate(d2.getDate()-2);
      const { data: ades } = await supabase.from('adesao_diaria').select('id').eq('user_id', userId).eq('aplicado', true).gte('data', d2.toISOString().split('T')[0]);
      if ((!ades || ades.length === 0) && emailAtivo) {
        const k = `nv_ne_pt_${hoje}`;
        if (!localStorage.getItem(k)) {
          apiFetch('/api/notify', { method:'POST', body: JSON.stringify({ email, nome, tipo:'protocolo_lembrete' }) });
          localStorage.setItem(k, '1');
        }
      }

      // 3. Estoque crítico — calcula consumo pelo protocolo
      const { data: est } = await supabase.from('estoque_items').select('*').eq('user_id', userId);
      if (est) {
        for (const item of est) {
          const doseDia = item.dose_dia_mg || getDoseDia(item.nome);
          if (!doseDia) continue;
          const inicio = item.inicio_uso ? new Date(item.inicio_uso) : new Date(item.data_compra);
          const diasUsados = Math.floor((Date.now() - inicio.getTime()) / 86400000);
          const restante = item.quantidade_mg - (doseDia * diasUsados);
          const diasRestantes = Math.max(0, Math.floor(restante / doseDia));

          // Atualiza dose_dia_mg no banco se ainda não tem
          if (!item.dose_dia_mg && doseDia) {
            supabase.from('estoque_items').update({ dose_dia_mg: doseDia, inicio_uso: inicio.toISOString().split('T')[0] }).eq('id', item.id);
          }

          if (diasRestantes <= 10 && emailAtivo) {
            const k = `nv_ne_est_${item.nome}_${hoje}`;
            if (!localStorage.getItem(k)) {
              apiFetch('/api/notify', { method:'POST', body: JSON.stringify({ email, nome, tipo:'estoque_critico', dados:{ peptideo:item.nome, dias:diasRestantes } }) });
              localStorage.setItem(k, '1');
            }
          }
        }
      }
    } catch(e) { console.warn('[Notif]', e); }
  }, [userId, email, nome, emailAtivo, pushAtivo]);

  useEffect(() => {
    if (!userId) return;
    registrarPush();
    verificarNotificacoes();
    const t = setInterval(verificarNotificacoes, 2 * 60 * 60 * 1000);
    return () => clearInterval(t);
  }, [userId, registrarPush, verificarNotificacoes]);

  return { verificarNotificacoes };
}
