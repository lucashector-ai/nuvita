// @ts-nocheck
'use client';

import { useState } from 'react';
import type { QuizAnswers } from '@/types';
import { OBJECTIVE_LABELS, DURACAO_LABELS, NIVEL_LABELS } from '@/types';

interface Props { answers: QuizAnswers; items: any[]; plan: string; }

const SECOES = [
  { id:'protocolo',   label:'Protocolo completo',       desc:'Peptídeos, doses e timings',        sel:true  },
  { id:'orientacoes', label:'Orientações gerais',        desc:'Reconstituição, armazenamento',     sel:true  },
  { id:'calendario',  label:'Calendário do ciclo',       desc:'Cronograma semanal',                sel:true  },
  { id:'tracker',     label:'Tabela de acompanhamento',  desc:'Espaços para registrar evolução',   sel:false },
  { id:'disclaimer',  label:'Aviso médico',              desc:'Disclaimer educacional',            sel:true  },
];

export default function SectionExportacao({ answers, items, plan }: Props) {
  const [secoes,   setSecoes]   = useState(SECOES);
  const [formato,  setFormato]  = useState<'resumido'|'completo'>('resumido');
  const [gerado,   setGerado]   = useState(false);
  const [copiado,  setCopiado]  = useState(false);

  const nome  = answers.nome?.toString() || 'Usuário';
  const objs  = answers.q3 ?? [];
  const dur   = answers.q9 ?? '8sem';
  const nivel = answers.q4 ?? 'iniciante';
  const peso  = answers.peso ?? 75;

  const toggle = (id: string) => setSecoes(p => p.map(s => s.id===id ? {...s,sel:!s.sel} : s));

  const gerarTexto = () => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const sels = secoes.filter(s=>s.sel);
    let txt = `PROTOCOLO NUVITA — ${nome.toUpperCase()}\nGerado em ${hoje}\n${'─'.repeat(40)}\n\n`;

    if (sels.find(s=>s.id==='protocolo')) {
      txt += `OBJETIVOS\n${objs.map(o=>OBJECTIVE_LABELS[o]).join(', ')}\n\n`;
      txt += `CONFIGURAÇÃO\nDuração: ${DURACAO_LABELS[dur]||dur} | Nível: ${NIVEL_LABELS[nivel]||nivel} | Peso: ${peso}kg\n\n`;
      txt += `PEPTÍDEOS E DOSES\n`;
      items.forEach(item => {
        txt += `\n• ${item.n}\n  Dose: ${item.doseStr(Number(peso))}\n  Timing: ${item.timing}\n  Frequência: ${item.freq}\n  Via: ${item.route}\n`;
        if (formato==='completo' && item.why) txt += `  Motivo: ${item.why}\n`;
      });
      txt += '\n';
    }

    if (sels.find(s=>s.id==='orientacoes')) {
      txt += `ORIENTAÇÕES GERAIS\n`;
      txt += `• Reconstituição: água bacteriostática fria, injete pela lateral\n`;
      txt += `• Armazenamento: geladeira 2–8°C, proteger da luz\n`;
      txt += `• Aplicação SC: abdômen ou coxa, rodizar locais\n\n`;
    }

    if (sels.find(s=>s.id==='tracker')) {
      txt += `TABELA DE ACOMPANHAMENTO\n`;
      txt += `Semana | Peso | Cintura | Energia | Sono | Notas\n`;
      txt += Array.from({length:8},(_,i)=>`Sem ${i+1} |       |         |         |      |      `).join('\n');
      txt += '\n\n';
    }

    if (sels.find(s=>s.id==='disclaimer')) {
      txt += `${'─'.repeat(40)}\n⚠ AVISO: Este protocolo tem fins EDUCACIONAIS.\nNão substitui avaliação médica profissional.\n`;
    }

    return txt;
  };

  const copiar = () => {
    navigator.clipboard.writeText(gerarTexto()).then(() => {
      setCopiado(true); setTimeout(()=>setCopiado(false), 2000);
    });
  };

  const compartilharWhatsApp = () => {
    const txt = encodeURIComponent(gerarTexto().slice(0, 1000) + '\n\n[Ver protocolo completo na Nuvita]');
    window.open(`https://wa.me/?text=${txt}`, '_blank');
  };

  return (
    <div style={{ maxWidth:800, gridColumn:'1/-1' }}>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Exportação do protocolo</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Versão formatada para consulta fora da plataforma</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1rem' }}>
        {/* Config */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Seções</div>
            {secoes.map(s => (
              <div key={s.id} onClick={() => toggle(s.id)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }}>
                <div style={{ width:18, height:18, borderRadius:5, border:s.sel?'none':'1.5px solid var(--border)', background:s.sel?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {s.sel && <svg width="10" height="10" fill="none" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{s.label}</div>
                  <div style={{ fontSize:10, color:'var(--ts)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Formato</div>
            {[['resumido','Resumido','Doses e timings'],['completo','Completo','Com motivos detalhados']].map(([v,l,d]) => (
              <div key={v} onClick={() => setFormato(v as any)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, cursor:'pointer', background:formato===v?'var(--gp)':'transparent', marginBottom:4 }}>
                <div style={{ width:14, height:14, borderRadius:'50%', border:`2px solid ${formato===v?'var(--green)':'var(--border)'}`, background:formato===v?'var(--green)':'transparent', flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:12, fontWeight:500, color:formato===v?'var(--gm)':'var(--tx)' }}>{l}</div>
                  <div style={{ fontSize:10, color:formato===v?'var(--gm)':'var(--ts)' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Ações */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button className="btn btn-d fw" onClick={() => setGerado(true)}>👁 Visualizar</button>
            <button className="btn btn-o fw" onClick={copiar}>{copiado?'✓ Copiado!':'📋 Copiar texto'}</button>
            <button className="btn btn-o fw" onClick={compartilharWhatsApp}
              style={{ color:'#25D366', borderColor:'rgba(37,211,102,.3)' }}>
              📱 Compartilhar WhatsApp
            </button>
          </div>
        </div>

        {/* Preview maior */}
        <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Preview</div>
            {gerado && <div style={{ fontSize:10, color:'var(--ts)' }}>{gerarTexto().split('\n').length} linhas</div>}
          </div>
          <div style={{ flex:1, padding:'1.25rem', overflowY:'auto', minHeight:500 }}>
            {gerado ? (
              <pre style={{ fontSize:12, color:'var(--tx)', fontFamily:'monospace', lineHeight:1.8, whiteSpace:'pre-wrap', margin:0 }}>
                {gerarTexto()}
              </pre>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:400, gap:'1rem', color:'var(--ts)' }}>
                <div style={{ fontSize:'3rem' }}>📄</div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--tm)' }}>Protocolo pronto para exportar</div>
                <div style={{ fontSize:12, textAlign:'center', maxWidth:260, lineHeight:1.6 }}>
                  Selecione as seções e clique em "Visualizar" para ver o protocolo formatado
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
