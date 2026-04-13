// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const DIAS = [
  {
    dia: 1,
    titulo: 'Dia 1 — Preparação',
    icon: '🎯',
    cor: '#1D9E75',
    tarefas: [
      'Leia as instruções do seu peptídeo principal',
      'Separe os materiais: seringa, álcool, algodão',
      'Escolha o horário fixo de aplicação',
      'Registre seu peso inicial no Tracker',
    ],
    dica: 'Consistência é mais importante que perfeição. Aplique sempre no mesmo horário.',
  },
  {
    dia: 2,
    titulo: 'Dia 2 — Primeira aplicação',
    icon: '💉',
    cor: '#1D9E75',
    tarefas: [
      'Realize sua primeira aplicação conforme o protocolo',
      'Registre como se sentiu no check-in',
      'Anote qualquer sensação diferente',
      'Hidrate-se bem (2L+ de água)',
    ],
    dica: 'Leve desconforto no local da aplicação é normal. Alterne os pontos de aplicação.',
  },
  {
    dia: 3,
    titulo: 'Dia 3 — Adaptação',
    icon: '⚡',
    cor: '#F59E0B',
    tarefas: [
      'Continue com o protocolo normalmente',
      'Registre energia e sono no Tracker',
      'Pergunte à IA se tiver dúvidas',
      'Mantenha alimentação com proteína adequada',
    ],
    dica: 'Os primeiros 3 dias são de adaptação. É normal sentir pequenas variações de energia.',
  },
  {
    dia: 4,
    titulo: 'Dia 4 — Rotina',
    icon: '🔄',
    cor: '#7F77DD',
    tarefas: [
      'Aplique conforme o cronograma',
      'Faça check-in diário',
      'Ajuste a alimentação se necessário',
      'Descanse bem — sono é essencial para resultados',
    ],
    dica: 'Seu corpo está começando a responder. O sono profundo é quando 70% do GH é liberado.',
  },
  {
    dia: 5,
    titulo: 'Dia 5 — Avaliação',
    icon: '📊',
    cor: '#0EA5E9',
    tarefas: [
      'Registre peso no Tracker',
      'Avalie como está a energia vs dia 1',
      'Veja sua evolução na seção Tracker',
      'Continue o protocolo sem interrupções',
    ],
    dica: 'Resultados iniciais são sutis. Não mude o protocolo antes de 4 semanas.',
  },
  {
    dia: 6,
    titulo: 'Dia 6 — Consistência',
    icon: '🏆',
    cor: '#EC4899',
    tarefas: [
      'Aplique normalmente',
      'Registre no check-in',
      'Leia sobre seu peptídeo na Biblioteca',
      'Planeje a semana 2',
    ],
    dica: 'Você está quase completando a primeira semana. A consistência é o diferencial.',
  },
  {
    dia: 7,
    titulo: 'Dia 7 — Semana 1 completa!',
    icon: '🎉',
    cor: '#1D9E75',
    tarefas: [
      'Registre peso e medidas',
      'Faça check-in completo de como se sentiu',
      'Revise o protocolo com a IA',
      'Planeje as próximas semanas',
    ],
    dica: 'Parabéns! Você completou a semana mais difícil. O corpo agora está adaptado.',
  },
];

interface Props {
  dataInicio: string;
  userId: string | null;
  onNavigate: (s: string) => void;
}

export default function OnboardingSemana1({ dataInicio, userId, onNavigate }: Props) {
  const [concluidos, setConcluidos] = useState<Record<string, boolean>>({});
  const [diaAtivo, setDiaAtivo] = useState(0);

  const inicio = new Date(dataInicio);
  const hoje = new Date();
  const diasDesde = Math.floor((hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  const diaAtual = Math.min(diasDesde, 6); // 0-6

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`nv_onb_${userId}`);
      if (saved) setConcluidos(JSON.parse(saved));
    } catch {}
    setDiaAtivo(diaAtual);
  }, []);

  const toggleTarefa = (key: string) => {
    const novo = { ...concluidos, [key]: !concluidos[key] };
    setConcluidos(novo);
    try { localStorage.setItem(`nv_onb_${userId}`, JSON.stringify(novo)); } catch {}
  };

  if (diasDesde >= 7) return null; // Sumiu após 7 dias

  const diaInfo = DIAS[diaAtivo];
  const pct = Math.round((diasDesde / 7) * 100);

  return (
    <div style={{ background: 'white', borderRadius: 18, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)', marginBottom: '1rem', gridColumn: '1/-1' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#1D9E75', marginBottom: 4 }}>
            🚀 Onboarding — Primeiros 7 dias
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)' }}>
            {diaInfo.icon} {diaInfo.titulo}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75' }}>{pct}%</div>
          <div style={{ fontSize: 11, color: 'var(--ts)' }}>concluído</div>
        </div>
      </div>

      {/* Barra de progresso dos dias */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem' }}>
        {DIAS.map((d, i) => (
          <button key={i} onClick={() => setDiaAtivo(i)}
            style={{ flex: 1, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer',
              background: i < diasDesde ? '#1D9E75' : i === diasDesde ? '#86EFAC' : 'var(--border)',
              transition: 'all .2s' }}
            title={`Dia ${i + 1}`}
          />
        ))}
      </div>

      {/* Seletor de dia */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', overflowX: 'auto' }}>
        {DIAS.map((d, i) => (
          <button key={i} onClick={() => setDiaAtivo(i)}
            style={{ padding: '4px 12px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
              background: diaAtivo === i ? diaInfo.cor : 'var(--bg2)',
              color: diaAtivo === i ? 'white' : 'var(--ts)',
              transition: 'all .15s' }}>
            Dia {i + 1}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Tarefas */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--ts)', marginBottom: '.75rem' }}>
            Tarefas do dia
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {diaInfo.tarefas.map((t, i) => {
              const key = `d${diaAtivo}_t${i}`;
              const feito = concluidos[key];
              return (
                <button key={i} onClick={() => toggleTarefa(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 10, border: `1.5px solid ${feito ? diaInfo.cor : 'var(--border)'}`,
                    background: feito ? `${diaInfo.cor}10` : 'white',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${feito ? diaInfo.cor : 'var(--border)'}`,
                    background: feito ? diaInfo.cor : 'white', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {feito && <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                  </div>
                  <span style={{ fontSize: 13, color: feito ? 'var(--ts)' : 'var(--tx)', textDecoration: feito ? 'line-through' : 'none' }}>
                    {t}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dica + ações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: `${diaInfo.cor}10`, border: `1px solid ${diaInfo.cor}30`, borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: diaInfo.cor, marginBottom: '.5rem' }}>
              💡 Dica do dia
            </div>
            <p style={{ fontSize: 13, color: 'var(--tx)', lineHeight: 1.65, margin: 0 }}>{diaInfo.dica}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => onNavigate('tracker')}
              style={{ padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'white',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: 'var(--tx)' }}>
              📊 Registrar no Tracker
            </button>
            <button onClick={() => onNavigate('ia')}
              style={{ padding: '10px', borderRadius: 10, border: 'none', background: '#111827',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: 'white' }}>
              🧬 Perguntar à IA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
