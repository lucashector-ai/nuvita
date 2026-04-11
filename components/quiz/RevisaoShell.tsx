// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, saveSession } from '@/lib/session';
import { buildProtocol } from '@/lib/peptides';
import { apiFetch } from '@/lib/apiClient';

interface PeptideoRevisao {
  n: string; e: string; m: string; why?: string;
  doseStr: (p: number) => string; timing: string;
  freq: string; route: string; cycle: string;
}

export default function RevisaoShell() {
  const router = useRouter();
  const [ready,     setReady]     = useState(false);
  const [answers,   setAnswers]   = useState<any>({});
  const [items,     setItems]     = useState<PeptideoRevisao[]>([]);
  const [idx,       setIdx]       = useState(0);
  const [removed,   setRemoved]   = useState<string[]>([]);
  const [aiText,    setAiText]    = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { getSession, carregarDiagnostico } = await import('@/lib/auth');
      const session = await getSession();
      let s: any = loadSession();

      if (session) {
        const perfil = await carregarDiagnostico(session.user.id);
        if (perfil?.diagnostico) {
          s = { ...perfil.diagnostico, ...(s || {}) };
          // Salva no sessionStorage para ter disponível
          if (!loadSession()) saveSession(s);
        }
      }

      // Se não tem sessão → precisa criar conta primeiro
      if (!session) {
        // Salva o quiz atual antes de redirecionar
        if (s) saveSession(s);
        router.replace('/cadastro?origem=diagnostico');
        return;
      }

      // Tem sessão mas sem dados de protocolo
      if (!s || !s.q3) {
        router.replace('/dashboard');
        return;
      }

      setAnswers(s);

      if (s._protocoloIA) {
        try {
          const protIA = JSON.parse(s._protocoloIA);
          setItems(protIA.peptideos.map((p: any) => ({
            n: p.nome, e: p.emoji, m: p.motivo, why: p.motivo,
            doseStr: () => p.dose, timing: p.timing,
            freq: p.frequencia, route: p.via, cycle: p.ciclo,
          })));
        } catch {
          const { items: proto } = buildProtocol(s.q3 ?? ['gordura'], Number(s.peso ?? 75), 1, false);
          setItems(proto);
        }
      } else {
        const { items: proto } = buildProtocol(s.q3 ?? ['gordura'], Number(s.peso ?? 75), 1, false);
        setItems(proto);
      }
      setReady(true);
    })();
  }, [router]);

  const salvarEIr = async () => {
    const aceitos = items.filter(i => !removed.includes(i.n));
    const aceitosNomes = aceitos.map(i => String(i.n));
    const removidosNomes = removed.map(String);
    const updated = { 
      ...answers, 
      _removidos: removidosNomes, 
      _aceitosRevisao: aceitosNomes,
      _revisaoFeita: true,
    };
    console.log('Revisão finalizada:', { aceitos: aceitosNomes, removidos: removidosNomes });
    saveSession(updated);

    const { getSession, salvarDiagnostico } = await import('@/lib/auth');
    const session = await getSession();

    if (session) {
      const diagFinal = {
        ...updated,
        _protocoloAtivo: true,
        _dataInicioProtocolo: new Date().toISOString().split('T')[0],
      };
      // Usa UPSERT para garantir que o registro existe.
      // SEGURANÇA: NÃO escrever `plano` aqui — coluna controlada pelo webhook.
      // Strip de plano/_activePlan do JSON do diagnóstico para não dar
      // ao cliente a sensação de que pode auto-upgrade.
      const { plano: _p, _activePlan: _ap, ...diagSeguro } = diagFinal as any;
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('usuarios').upsert({
        id: session.user.id,
        email: session.user.email || updated.email || '',
        nome: updated.nome || '',
        diagnostico: diagSeguro,
      }, { onConflict: 'id' });
      // Mantém nv_quiz no sessionStorage para o DashboardShell
      sessionStorage.setItem('nv_quiz', JSON.stringify(diagFinal));
      sessionStorage.setItem('nv_diagnostico_atualizado', '1');
      sessionStorage.setItem('nv_revisao_concluida', '1');

      // Envia email de boas-vindas na primeira vez (se não tiver histórico)
      const jaEnviou = localStorage.getItem('nv_bv_email');
      if (!jaEnviou && session.user.email) {
        localStorage.setItem('nv_bv_email', '1');
        apiFetch('/api/email', {
          method: 'POST',
          body: JSON.stringify({
            tipo: 'boas-vindas',
            email: session.user.email,
            dados: { nome: diagFinal.nome || '' },
          }),
        }).catch(() => {});
      }
    } else {
      // Sem sessão — vai para cadastro com dados salvos
      sessionStorage.setItem('nv_quiz', JSON.stringify(updated));
      router.push('/cadastro?origem=diagnostico');
      return;
    }
    router.push('/dashboard');
  };

  if (!ready) return null;

  const peso = Number(answers.peso ?? 75);
  const item = items[idx];
  const progresso = Math.round(((idx) / items.length) * 100);
  const nome = answers.nome?.split(' ')[0] || '';

  const accept = () => { setIdx(i => i + 1); setAiText(''); };
  const remove = () => {
    if (item) setRemoved(p => [...p, item.n]);
    setIdx(i => i + 1); setAiText('');
  };

  const justificarIA = async () => {
    if (!item || aiText) return;
    setAiLoading(true);
    try {
      const res = await apiFetch('/api/ia', {
        method: 'POST',
        body: JSON.stringify({
          system: 'Especialista em peptídeos. Responda em português, direto e empático.',
          messages: [{ role: 'user', content: `Em 2 frases, por que ${item.n} foi incluído para: ${answers.q3?.join(', ')}?` }],
        }),
      });
      const data = await res.json();
      setAiText(data.text || 'Não foi possível gerar justificativa.');
    } catch { setAiText('Erro ao consultar a IA.'); }
    finally { setAiLoading(false); }
  };

  // ══ TELA FINAL ══
  if (idx >= items.length) {
    const aceitos = items.filter(i => !removed.includes(i.n));
    return (
      <div style={{ minHeight:'100vh', background:'#F7F7F7', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div style={{ background:'white', borderRadius:24, padding:'3rem 2.5rem', maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 4px 32px rgba(0,0,0,.08)' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 1.5rem' }}>✅</div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.75rem' }}>
            Protocolo confirmado{nome ? `, ${nome}` : ''}!
          </h2>
          <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.7, marginBottom:'1.5rem' }}>
            {aceitos.length} peptídeo{aceitos.length !== 1 ? 's' : ''} no seu protocolo.
            {removed.length > 0 && ` ${removed.length} removido${removed.length !== 1 ? 's' : ''}.`}
          </p>
          {aceitos.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:'2rem' }}>
              {aceitos.map(p => (
                <div key={p.n} style={{ display:'flex', alignItems:'center', gap:6, background:'#F0FDF4', borderRadius:100, padding:'6px 14px', fontSize:13, fontWeight:500, color:'#0F6E56', border:'1px solid #BBF7D0' }}>
                  <span>{p.e}</span> {p.n}
                </div>
              ))}
            </div>
          )}
          <button onClick={salvarEIr}
            style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', background:'#111827', color:'white', fontFamily:'inherit', fontSize:15, fontWeight:600, cursor:'pointer', transition:'opacity .15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='.88'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            Entrar na plataforma →
          </button>
        </div>
      </div>
    );
  }

  // ══ TELA DE REVISÃO DE PEPTÍDEO ══
  return (
    <div style={{ minHeight:'100vh', background:'#F7F7F7', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ background:'white', borderBottom:'1px solid #E5E7EB', padding:'0 2rem', height:56, display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:10 }}>
        <div style={{ fontSize:16, fontWeight:700, letterSpacing:'-.04em' }}>nuvita</div>
        <div style={{ flex:1, height:4, background:'#F3F4F6', borderRadius:100, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progresso}%`, background:'#22C55E', borderRadius:100, transition:'width .4s' }}/>
        </div>
        <div style={{ fontSize:12, color:'#9CA3AF', whiteSpace:'nowrap' }}>{idx + 1} de {items.length}</div>
        <button onClick={() => { setIdx(items.length); }}
          style={{ fontSize:12, color:'#9CA3AF', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
          Pular →
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
        <div style={{ maxWidth:560, width:'100%' }}>

          {/* Label do passo */}
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:6 }}>
              Revise seu protocolo
            </div>
            <h1 style={{ fontSize:'1.3rem', fontWeight:500, letterSpacing:'-.04em', color:'#111827' }}>
              Você quer incluir este peptídeo?
            </h1>
          </div>

          {/* Card do peptídeo */}
          <div style={{ background:'white', borderRadius:20, padding:'1.75rem', boxShadow:'0 2px 16px rgba(0,0,0,.06)', marginBottom:'1rem' }}>

            {/* Cabeçalho do peptídeo */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'1.25rem', paddingBottom:'1.25rem', borderBottom:'1px solid #F3F4F6' }}>
              <div style={{ width:60, height:60, background:'#F0FDF4', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', flexShrink:0 }}>
                {item.e}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'1.15rem', fontWeight:600, color:'#111827', marginBottom:4 }}>{item.n}</div>
                <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.5 }}>{item.m}</div>
              </div>
            </div>

            {/* Motivo IA */}
            {item.why && (
              <div style={{ background:'#F0FDF4', borderRadius:12, padding:'12px 16px', marginBottom:'1.25rem', borderLeft:'3px solid #22C55E' }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'#0F6E56', marginBottom:6 }}>
                  Por que está no seu protocolo
                </div>
                <p style={{ fontSize:13, color:'#065F46', lineHeight:1.65, margin:0 }}>{item.why}</p>
              </div>
            )}

            {/* Grid de detalhes */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1.25rem' }}>
              {[
                ['💊 Dose', item.doseStr(peso)],
                ['⏰ Timing', item.timing],
                ['📅 Frequência', item.freq],
                ['💉 Via', item.route],
                ['🔄 Ciclo', item.cycle],
              ].map(([l, v]) => (
                <div key={l} style={{ background:'#F9FAFB', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, color:'#9CA3AF', marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'#111827', lineHeight:1.3 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Botão IA */}
            {!aiText ? (
              <button onClick={justificarIA} disabled={aiLoading}
                style={{ width:'100%', padding:'10px', background:'none', border:'1.5px dashed #D1D5DB', borderRadius:10, fontSize:13, color:'#6B7280', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#0F6E56'; e.currentTarget.style.color='#0F6E56'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#D1D5DB'; e.currentTarget.style.color='#6B7280'; }}>
                {aiLoading ? '⏳ Consultando IA...' : '🤖 Por que devo aceitar este peptídeo?'}
              </button>
            ) : (
              <div style={{ background:'#F8FAFC', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#374151', lineHeight:1.65, fontStyle:'italic', borderLeft:'3px solid #94A3B8' }}>
                {aiText}
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <button onClick={remove}
              style={{ padding:'16px', borderRadius:14, border:'2px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600, color:'#6B7280', transition:'all .15s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#FECACA'; e.currentTarget.style.color='#D85A30'; e.currentTarget.style.background='#FFF5F5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.color='#6B7280'; e.currentTarget.style.background='white'; }}>
              <span style={{ fontSize:16 }}>✕</span> Remover
            </button>
            <button onClick={accept}
              style={{ padding:'16px', borderRadius:14, border:'2px solid #22C55E', background:'#F0FDF4', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600, color:'#0F6E56', transition:'all .15s', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
              onMouseEnter={e => { e.currentTarget.style.background='#22C55E'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#22C55E'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#F0FDF4'; e.currentTarget.style.color='#0F6E56'; e.currentTarget.style.borderColor='#22C55E'; }}>
              <span style={{ fontSize:16 }}>✓</span> Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
