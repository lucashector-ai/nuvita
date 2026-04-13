// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  userId: string | null;
  semanas: number;
  onNavigate: (s: string) => void;
}

export default function ScoreConsistencia({ userId, semanas, onNavigate }: Props) {
  const [score, setScore]     = useState<number | null>(null);
  const [streak, setStreak]   = useState(0);
  const [total, setTotal]     = useState(0);
  const [marco, setMarco]     = useState<string | null>(null);
  const [showCelebra, setShowCelebra] = useState(false);

  useEffect(() => {
    if (!userId) return;
    calcularScore();
  }, [userId]);

  async function calcularScore() {
    // Busca check-ins dos últimos 30 dias
    const limite = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: checkins } = await supabase
      .from('check_ins')
      .select('created_at, humor')
      .eq('user_id', userId)
      .gte('created_at', limite)
      .order('created_at', { ascending: false });

    if (!checkins) return;

    // Score = % de dias com check-in nos últimos 30 dias
    const diasUnicos = new Set(checkins.map(c => c.created_at.split('T')[0]));
    const scoreCalc = Math.round((diasUnicos.size / 30) * 100);
    setScore(scoreCalc);
    setTotal(diasUnicos.size);

    // Streak — dias consecutivos
    let streakCount = 0;
    const hoje = new Date();
    for (let i = 0; i < 30; i++) {
      const dia = new Date(hoje.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (diasUnicos.has(dia)) streakCount++;
      else break;
    }
    setStreak(streakCount);

    // Verifica marco
    const marcoKey = `nv_marco_${userId}_${semanas}`;
    const marcoVisto = localStorage.getItem(marcoKey);
    if (!marcoVisto) {
      if (semanas === 4) { setMarco('semana4'); setShowCelebra(true); localStorage.setItem(marcoKey, '1'); }
      else if (semanas === 8) { setMarco('semana8'); setShowCelebra(true); localStorage.setItem(marcoKey, '1'); }
      else if (streakCount >= 7 && !localStorage.getItem(`nv_marco_${userId}_streak7`)) {
        setMarco('streak7'); setShowCelebra(true);
        localStorage.setItem(`nv_marco_${userId}_streak7`, '1');
      }
    }
  }

  const getCor = (s: number) => s >= 70 ? '#1D9E75' : s >= 40 ? '#F59E0B' : '#EF4444';
  const getLabel = (s: number) => s >= 70 ? 'Excelente' : s >= 40 ? 'Regular' : 'Baixa';

  const MARCOS: Record<string, { emoji: string; titulo: string; desc: string }> = {
    semana4: { emoji: '🏆', titulo: 'Marco: 4 semanas!', desc: 'Você chegou na fase de primeiros resultados. O corpo está respondendo ao protocolo.' },
    semana8: { emoji: '⭐', titulo: 'Marco: 8 semanas!', desc: 'Ciclo completo! Você teve resultados consistentes. Hora de avaliar e planejar o próximo.' },
    streak7: { emoji: '🔥', titulo: '7 dias seguidos!', desc: 'Streak de 7 dias de check-in. Consistência é o segredo dos resultados.' },
  };

  return (
    <>
      {/* Card score */}
      <div style={{ background:'white', borderRadius:16, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)', gridColumn:'1/-1' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
          <div style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>
            📊 Score de consistência
          </div>
          <button onClick={() => onNavigate('tracker')}
            style={{ fontSize:11, color:'var(--gm)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
            Ver tracker →
          </button>
        </div>

        {score === null ? (
          <div style={{ height:60, background:'var(--bg2)', borderRadius:10, animation:'pulse 1.5s ease-in-out infinite' }}/>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'1.5rem', alignItems:'center' }}>
            {/* Barra de progresso */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'var(--tm)' }}>{total} check-ins nos últimos 30 dias</span>
                <span style={{ fontSize:13, fontWeight:700, color:getCor(score) }}>{getLabel(score)}</span>
              </div>
              <div style={{ height:10, background:'var(--bg2)', borderRadius:5, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${score}%`, background:getCor(score), borderRadius:5, transition:'width 1s ease' }}/>
              </div>
              <div style={{ fontSize:10, color:'var(--ts)', marginTop:4 }}>
                Meta: check-in diário = 100% de consistência
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, fontWeight:700, color:getCor(score), letterSpacing:'-.04em', lineHeight:1 }}>{score}%</div>
              <div style={{ fontSize:10, color:'var(--ts)', marginTop:2 }}>score</div>
            </div>

            {/* Streak */}
            <div style={{ textAlign:'center', padding:'10px 16px', background:streak >= 3 ? '#FEF3C7' : 'var(--bg2)', borderRadius:12 }}>
              <div style={{ fontSize:20 }}>{streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '💤'}</div>
              <div style={{ fontSize:20, fontWeight:700, color:streak >= 3 ? '#D97706' : 'var(--ts)', letterSpacing:'-.03em', lineHeight:1 }}>{streak}</div>
              <div style={{ fontSize:10, color:'var(--ts)', marginTop:2 }}>dias seguidos</div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de celebração */}
      {showCelebra && marco && MARCOS[marco] && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
          onClick={() => setShowCelebra(false)}>
          <div style={{ background:'white', borderRadius:20, padding:'2rem', maxWidth:380, width:'100%', textAlign:'center', animation:'slideUp .3s ease' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>{MARCOS[marco].emoji}</div>
            <div style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--tx)', marginBottom:'.5rem', letterSpacing:'-.03em' }}>
              {MARCOS[marco].titulo}
            </div>
            <p style={{ fontSize:14, color:'var(--tm)', lineHeight:1.65, marginBottom:'1.5rem' }}>
              {MARCOS[marco].desc}
            </p>
            <button onClick={() => setShowCelebra(false)}
              style={{ width:'100%', padding:'13px', background:'#111827', border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              Continuar o protocolo 💪
            </button>
          </div>
        </div>
      )}
    </>
  );
}
