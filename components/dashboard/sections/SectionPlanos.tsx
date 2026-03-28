// @ts-nocheck
'use client';

import { useState } from 'react';
import { trocarPlano } from '@/lib/auth';

interface Props {
  planoAtual: string;
  userId?: string | null;
  onPlanChange?: (p: string) => void;
  onNavigate?: (s: any) => void;
}

const PLANOS = [
  {
    id: 'free',
    nome: 'Gratuito',
    preco: 'R$0',
    periodo: 'para sempre',
    cor: '#888780',
    bg: 'var(--bg2)',
    border: 'var(--border)',
    descricao: 'Diagnóstico e protocolo básico para começar',
    features: [
      { label:'Diagnóstico completo por IA',         ok:true  },
      { label:'Protocolo personalizado (básico)',     ok:true  },
      { label:'Calculadora de doses',                ok:true  },
      { label:'Biblioteca (5 peptídeos)',             ok:true  },
      { label:'Tracker de evolução',                  ok:false },
      { label:'Diário de sintomas',                   ok:false },
      { label:'Coach IA',                             ok:false },
      { label:'Controle de estoque',                  ok:false },
      { label:'Consulta médica',                      ok:false },
    ],
    cta: 'Plano atual',
    destaque: false,
  },
  {
    id: 'essencial',
    nome: 'Essencial',
    preco: 'R$39',
    periodo: '/mês',
    cor: '#1D9E75',
    bg: '#E1F5EE',
    border: 'rgba(29,158,117,.3)',
    descricao: 'Acompanhamento completo do protocolo',
    features: [
      { label:'Tudo do plano Gratuito',              ok:true  },
      { label:'Tracker ilimitado',                    ok:true  },
      { label:'Diário de sintomas',                   ok:true  },
      { label:'Consistência e análise',               ok:true  },
      { label:'Coach IA (30 mensagens/mês)',          ok:true  },
      { label:'Detector de inconsistência',           ok:true  },
      { label:'Rotina complementar',                  ok:true  },
      { label:'Controle de estoque',                  ok:true  },
      { label:'Biblioteca completa (25+ peptídeos)', ok:true  },
      { label:'Consulta médica',                      ok:false },
    ],
    cta: 'Assinar Essencial',
    destaque: false,
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 'R$79',
    periodo: '/mês',
    cor: '#7F77DD',
    bg: '#EEEDFE',
    border: 'rgba(127,119,221,.3)',
    descricao: 'Acompanhamento médico especializado',
    features: [
      { label:'Tudo do plano Essencial',              ok:true  },
      { label:'Consulta médica especializada',        ok:true  },
      { label:'Revisão do protocolo por médico',      ok:true  },
      { label:'Ajustes personalizados',               ok:true  },
      { label:'Coach IA ilimitado',                   ok:true  },
      { label:'Suporte prioritário',                  ok:true  },
      { label:'Acesso antecipado a novidades',        ok:true  },
    ],
    cta: 'Assinar Pro',
    destaque: true,
  },
];

const PLANO_ORDEM: Record<string,number> = { free:0, essencial:1, pro:2 };

export default function SectionPlanos({ planoAtual, userId, onPlanChange, onNavigate }: Props) {
  const [trocando,  setTrocando]  = useState('');
  const [toast,     setToast]     = useState('');

  const handleTrocar = async (novoPlano: string) => {
    if (novoPlano === planoAtual || !userId) return;
    setTrocando(novoPlano);
    try {
      await trocarPlano(userId, novoPlano);
      onPlanChange?.(novoPlano);
      setToast(`✅ Plano alterado para ${PLANOS.find(p=>p.id===novoPlano)?.nome}!`);
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Erro ao alterar plano. Tente novamente.');
      setTimeout(() => setToast(''), 3000);
    } finally { setTrocando(''); }
  };

  const ordemAtual = PLANO_ORDEM[planoAtual] ?? 0;

  return (
    <div style={{ gridColumn:'1/-1' }}>
      <div style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.375rem' }}>Planos</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Escolha o plano ideal para seu protocolo · Cancele a qualquer momento</p>
      </div>

      {toast && (
        <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:10, padding:'10px 14px', marginBottom:'1.25rem', fontSize:13, color:'var(--gm)' }}>
          {toast}
        </div>
      )}

      {/* Cards de planos */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.25rem', marginBottom:'2rem' }}>
        {PLANOS.map(p => {
          const isAtual   = p.id === planoAtual;
          const isAbaixo  = PLANO_ORDEM[p.id] < ordemAtual;
          const carregando = trocando === p.id;

          return (
            <div key={p.id} style={{ background:'var(--bg)', border:`2px solid ${isAtual ? p.cor : 'var(--border)'}`, borderRadius:18, overflow:'hidden', display:'flex', flexDirection:'column', position:'relative', transition:'border-color .2s' }}>
              {p.destaque && (
                <div style={{ position:'absolute', top:-1, left:'50%', transform:'translateX(-50%)', background:p.cor, color:'white', fontSize:10, fontWeight:600, padding:'3px 14px', borderRadius:'0 0 8px 8px', letterSpacing:'.04em' }}>
                  MAIS POPULAR
                </div>
              )}
              {isAtual && (
                <div style={{ position:'absolute', top:12, right:12, background:p.bg, color:p.cor, fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:100, border:`1px solid ${p.border}` }}>
                  Plano atual
                </div>
              )}

              <div style={{ padding:'1.75rem 1.5rem 1.25rem' }}>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'.25rem' }}>{p.nome}</div>
                <div style={{ fontSize:12, color:'var(--ts)', marginBottom:'1rem' }}>{p.descricao}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:3, marginBottom:'1.25rem' }}>
                  <span style={{ fontSize:'2.2rem', fontWeight:500, letterSpacing:'-.06em', color:'var(--tx)' }}>{p.preco}</span>
                  <span style={{ fontSize:12, color:'var(--ts)' }}>{p.periodo}</span>
                </div>

                <button
                  disabled={isAtual || !!trocando}
                  onClick={() => handleTrocar(p.id)}
                  style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', cursor:isAtual||trocando?'default':'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, transition:'all .15s', background:isAtual?p.bg:isAbaixo?'var(--bg2)':p.cor, color:isAtual?p.cor:isAbaixo?'var(--ts)':'white', opacity:trocando&&!carregando?.5:1 }}>
                  {carregando ? '⏳ Alterando...' : isAtual ? '✓ Plano atual' : isAbaixo ? `Voltar para ${p.nome}` : p.cta}
                </button>
              </div>

              <div style={{ flex:1, padding:'0 1.5rem 1.5rem', borderTop:'1px solid var(--border)', paddingTop:'1rem', marginTop:0 }}>
                {p.features.map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color:f.ok?'var(--tm)':'var(--ts)', marginBottom:8, opacity:f.ok?1:.6 }}>
                    <span style={{ color:f.ok?p.cor:'var(--border)', fontWeight:600, flexShrink:0, fontSize:13, marginTop:-1 }}>
                      {f.ok?'✓':'—'}
                    </span>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparativo detalhado */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', marginBottom:'1.5rem' }}>
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>Comparativo completo de recursos</div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:'var(--bg2)' }}>
                <th style={{ padding:'10px 1.5rem', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', width:'40%' }}>Recurso</th>
                {PLANOS.map(p => (
                  <th key={p.id} style={{ padding:'10px 1rem', textAlign:'center', fontSize:11, fontWeight:600, color:p.id===planoAtual?p.cor:'var(--ts)' }}>
                    {p.nome}{p.id===planoAtual?' ✓':''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { grupo:'Principal', items:[
                  { label:'Diagnóstico por IA',           vals:[true,true,true]   },
                  { label:'Protocolo personalizado',       vals:[true,true,true]   },
                  { label:'Calculadora de doses',          vals:[true,true,true]   },
                  { label:'Biblioteca de peptídeos',       vals:['5','25+','25+']  },
                ]},
                { grupo:'Acompanhamento', items:[
                  { label:'Tracker de evolução',           vals:[false,true,true]  },
                  { label:'Diário de sintomas',            vals:[false,true,true]  },
                  { label:'Consistência e análise',        vals:[false,true,true]  },
                  { label:'Histórico de ciclos',           vals:[false,true,true]  },
                ]},
                { grupo:'Inteligência', items:[
                  { label:'Coach IA',                      vals:[false,'30/mês','Ilimitado'] },
                  { label:'Ajuste automático',             vals:[false,true,true]  },
                  { label:'Detector de inconsistência',    vals:[false,true,true]  },
                ]},
                { grupo:'Logística', items:[
                  { label:'Controle de estoque',           vals:[false,true,true]  },
                  { label:'Rotina complementar',           vals:[false,true,true]  },
                  { label:'Exportar protocolo',            vals:['PDF básico','Completo','Completo'] },
                ]},
                { grupo:'Médico (exclusivo Pro)', items:[
                  { label:'Consulta médica especializada', vals:[false,false,true] },
                  { label:'Revisão por médico',            vals:[false,false,true] },
                  { label:'Ajustes por especialista',      vals:[false,false,true] },
                ]},
              ].map(grupo => (
                <>
                  <tr key={grupo.grupo}>
                    <td colSpan={4} style={{ padding:'10px 1.5rem 4px', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', background:'var(--bg2)' }}>
                      {grupo.grupo}
                    </td>
                  </tr>
                  {grupo.items.map((item,i) => (
                    <tr key={i} style={{ borderBottom:'0.5px solid var(--border)' }}>
                      <td style={{ padding:'10px 1.5rem', color:'var(--tm)' }}>{item.label}</td>
                      {item.vals.map((v,j) => (
                        <td key={j} style={{ padding:'10px 1rem', textAlign:'center', color:PLANOS[j].cor }}>
                          {v === true ? '✓' : v === false ? <span style={{ color:'var(--border)' }}>—</span> : <span style={{ fontSize:11, fontWeight:500 }}>{v}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé */}
      <div style={{ textAlign:'center', fontSize:12, color:'var(--ts)', lineHeight:1.7 }}>
        Pagamento seguro · Cancele a qualquer momento · Dados protegidos pela LGPD<br/>
        Dúvidas? Entre em contato pelo suporte.
      </div>
    </div>
  );
}
