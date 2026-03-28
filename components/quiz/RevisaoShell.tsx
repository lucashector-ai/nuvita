// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveSession } from '@/lib/session';
import { buildProtocol } from '@/lib/peptides';
import type { Peptide, QuizAnswers } from '@/types';

interface PeptideoRevisao {
  n: string; e: string; m: string; why?: string;
  doseStr: (p: number) => string; timing: string;
  freq: string; route: string; cycle: string;
}

export default function RevisaoShell() {
  const router = useRouter();
  const [ready,     setReady]     = useState(false);
  const [answers,   setAnswers]   = useState<QuizAnswers>({});
  const [items,     setItems]     = useState<PeptideoRevisao[]>([]);
  const [idx,       setIdx]       = useState(0);
  const [removed,   setRemoved]   = useState<string[]>([]);
  const [aiText,    setAiText]    = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s || !s.q3) { router.replace('/diagnostico'); return; }
    setAnswers(s);

    // Se tem protocolo gerado pela IA, usa ele; senão usa buildProtocol
    if (s._protocoloIA) {
      try {
        const protIA = JSON.parse(s._protocoloIA);
        const itemsIA = protIA.peptideos.map((p: any) => ({
          n: p.nome, e: p.emoji, m: p.motivo, why: p.motivo,
          doseStr: () => p.dose, timing: p.timing,
          freq: p.frequencia, route: p.via, cycle: p.ciclo,
        }));
        setItems(itemsIA);
      } catch {
        const { items: proto } = buildProtocol(s.q3 ?? ['gordura'], Number(s.peso ?? 75), 1, false);
        setItems(proto);
      }
    } else {
      const { items: proto } = buildProtocol(s.q3 ?? ['gordura'], Number(s.peso ?? 75), 1, false);
      setItems(proto);
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const peso = Number(answers.peso ?? 75);
  const item = items[idx];

  const accept = () => { setIdx(i => i + 1); setAiText(''); };

  const remove = () => {
    if (item) setRemoved(p => [...p, item.n]);
    setIdx(i => i + 1); setAiText('');
  };

  const justificarIA = async () => {
    if (!item || aiText) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'Você é especialista em peptídeos da plataforma Nuvita. Responda em português brasileiro, tom empático e objetivo.',
          messages: [{
            role: 'user',
            content: `Em 2-3 frases diretas, explique para um leigo por que ${item.n} foi incluído neste protocolo para os objetivos: ${answers.q3?.join(', ')}. Mencione o que a pessoa perderia ao remover.`,
          }],
        }),
      });
      const data = await res.json();
      setAiText(data.text || 'Não foi possível gerar justificativa.');
    } catch {
      setAiText('Erro ao consultar a IA. Tente novamente.');
    } finally { setAiLoading(false); }
  };

  // Fim da revisão
  if (idx >= items.length) {
    const aceitos = items.filter(i => !removed.includes(i.n));
    saveSession({ ...answers, _removidos: removed, _aceitosRevisao: aceitos.map(i => i.n) });
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'2rem' }}>
        <div style={{ maxWidth:480, textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
          <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.75rem' }}>Revisão concluída!</h2>
          <p style={{ fontSize:14, color:'var(--tm)', lineHeight:1.65, marginBottom:'1.5rem' }}>
            {aceitos.length} peptídeo{aceitos.length !== 1 ? 's' : ''} aceito{aceitos.length !== 1 ? 's' : ''} no seu protocolo final.
            {removed.length > 0 && ` ${removed.length} removido${removed.length !== 1 ? 's' : ''}.`}
          </p>
          {aceitos.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:'1.5rem' }}>
              {aceitos.map(p => (
                <div key={p.n} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--gp)', borderRadius:100, padding:'5px 12px', fontSize:13, fontWeight:500, color:'var(--gm)' }}>
                  <span>{p.e}</span> {p.n}
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-d fw" style={{ fontSize:15 }} onClick={() => router.push('/dashboard')}>
            Entrar na plataforma →
          </button>
        </div>
      </div>
    );
  }

  const progresso = Math.round((idx / items.length) * 100);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg2)', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)', padding:'1rem 2rem' }}>
        <div style={{ maxWidth:640, margin:'0 auto', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--ts)', marginBottom:6 }}>
              <span>Revisando peptídeos</span>
              <span>{idx + 1} de {items.length}</span>
            </div>
            <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progresso}%`, background:'var(--green)', borderRadius:3, transition:'width .3s' }}/>
            </div>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ fontSize:12, color:'var(--ts)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
            Pular revisão →
          </button>
        </div>
      </div>

      {/* Card do peptídeo */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
        <div style={{ maxWidth:560, width:'100%' }}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:20, padding:'2rem', marginBottom:'1rem' }}>
            {/* Emoji e nome */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:'1.25rem' }}>
              <div style={{ width:64, height:64, background:'var(--gp)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0 }}>
                {item.e}
              </div>
              <div>
                <div style={{ fontSize:'1.2rem', fontWeight:500, color:'var(--tx)', marginBottom:3 }}>{item.n}</div>
                <div style={{ fontSize:13, color:'var(--tm)' }}>{item.m}</div>
              </div>
            </div>

            {/* Motivo */}
            {item.why && (
              <div style={{ background:'var(--gp)', borderRadius:10, padding:'.875rem 1rem', marginBottom:'1.25rem' }}>
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--gm)', marginBottom:'.375rem' }}>Por que está no seu protocolo</div>
                <p style={{ fontSize:13, color:'var(--gm)', lineHeight:1.65, margin:0 }}>{item.why}</p>
              </div>
            )}

            {/* Detalhes */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1.25rem' }}>
              {[['Dose', item.doseStr(peso)], ['Timing', item.timing], ['Frequência', item.freq], ['Via', item.route], ['Ciclo', item.cycle]].map(([l, v]) => (
                <div key={l} style={{ background:'var(--bg2)', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:9, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', lineHeight:1.3 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Justificativa IA */}
            {!aiText && (
              <button onClick={justificarIA} disabled={aiLoading}
                style={{ width:'100%', padding:'9px', background:'none', border:'1px dashed var(--border)', borderRadius:9, fontSize:12, color:'var(--ts)', cursor:'pointer', fontFamily:'inherit', marginBottom:'.75rem' }}>
                {aiLoading ? '⏳ Consultando IA...' : '🤖 Por que devo aceitar este peptídeo?'}
              </button>
            )}
            {aiText && (
              <div style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 12px', marginBottom:'.75rem', fontSize:13, color:'var(--tm)', lineHeight:1.6, fontStyle:'italic' }}>
                {aiText}
              </div>
            )}
          </div>

          {/* Ações */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <button onClick={remove}
              style={{ padding:'14px', borderRadius:12, border:'2px solid var(--border)', background:'var(--bg)', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:500, color:'var(--ts)', transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#D85A30';e.currentTarget.style.color='#D85A30';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--ts)';}}>
              ✕ Remover
            </button>
            <button onClick={accept}
              style={{ padding:'14px', borderRadius:12, border:'2px solid var(--green)', background:'var(--gp)', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:500, color:'var(--gm)', transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--green)';e.currentTarget.style.color='white';}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--gp)';e.currentTarget.style.color='var(--gm)';}}>
              ✓ Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
