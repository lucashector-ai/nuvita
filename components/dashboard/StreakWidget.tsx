// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StreakWidget({ userId }: { userId: string }) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from('adesao_diaria')
        .select('data, completo')
        .eq('user_id', userId)
        .eq('completo', true)
        .order('data', { ascending: false })
        .limit(60);
      
      if (!data?.length) { setLoading(false); return; }
      
      // Calcula streak consecutivo
      let s = 0;
      const hoje = new Date();
      for (let i = 0; i < data.length; i++) {
        const esperado = new Date(hoje);
        esperado.setDate(hoje.getDate() - i);
        const esperadoStr = esperado.toISOString().split('T')[0];
        if (data[i].data === esperadoStr) s++;
        else break;
      }
      setStreak(s);
      setLoading(false);
    })();
  }, [userId]);

  if (loading || streak === 0) return null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: streak >= 7 ? '#FEF3C7' : '#F0FDF4',
      color: streak >= 7 ? '#B45309' : '#15803D',
      padding: '4px 12px', borderRadius: 100,
      fontSize: 12, fontWeight: 700,
    }}>
      {streak >= 7 ? '🔥' : '✅'} {streak} {streak === 1 ? 'dia' : 'dias'} seguidos
    </div>
  );
}
