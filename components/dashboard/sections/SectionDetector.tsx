// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SectionDetector({ userId, answers }: any) {
  const [alertas,   setAlertas]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [analisando, setAnalisando] = useState(false);
  const [ultimaVerif, setUltimaVerif] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    detectarInconsistencias();
  }, [userId]);

  const detectarInconsistencias = async () => {
    setLoading(true);
    const hoje = new Date().toISOString().split('T')[0];
    const d7 = new Date(); d7.setDate(d7.getDate() - 7);
    const d7str = d7.toISOString().split('T')[0];

    const [{ data: ad }, { data: tr }, { data: ci }] = await Promise.all([
      supabase.from('adesao_diaria').select('*').eq('user_id', userId).gte('data', d7str).order('data', { ascending: false }),
      supabase.from('tracker_entries').select('*').eq('user_id', userId).gte('data', d7str),
      supabase.from('check_ins').select('*').eq('user_id', userId).gte('data', d7str),
    ]);

    const novosAlertas: any[] = [];

    // Detecta: sem adesão há 2+ dias
    const diasSemAdesao = (ad || []).filter(a => !a.aplicado).length;
    if (diasSemAdesao >= 2) {
      novosAlertas.push({
        tipo: 'adesao',
        severidade: diasSemAdesao >= 4 ? 'alta' : 'media',
        titulo: `${diasSemAdesao} dias sem registrar aplicações`,
        desc: 'A consistência é o fator mais importante nos resultados com peptídeos.',
        acao: 'Registrar aplicação',
        nav: 'tracker',
      });
    }

    // Detecta: energia baixa por 3+ dias consecutivos
    const enBaixa = (tr || []).filter(t => t.energia && t.energia < 5);
    if (enBaixa.length >= 3) {
      novosAlertas.push({
        tipo: 'energia',
        severidade: 'media',
        titulo: 'Energia baixa nos últimos registros',
        desc: `Energia média de ${(enBaixa.reduce((s,e)=>s+e.energia,0)/enBaixa.length).toFixed(1)}/10. Pode indicar necessidade de ajuste de dose ou sono insuficiente.`,
        acao: 'Ver análise',
        nav: 'analise',
      });
    }

    // Detecta: sem check-in há 2+ dias
    const ultimoCI = ci && ci.length > 0 ? new Date(ci[0].data) : null;
    const diasSemCI = ultimoCI ? Math.floor((Date.now() - ultimoCI.getTime()) / 86400000) : 7;
    if (diasSemCI >= 2) {
      novosAlertas.push({
        tipo: 'checkin',
        severidade: 'baixa',
        titulo: `${diasSemCI} dias sem check-in diário`,
        desc: 'O check-in diário ajuda a detectar padrões e ajustar o protocolo.',
        acao: 'Fazer check-in',
        nav: 'inicio',
      });
    }

    // Detecta: sono ruim consistente
    const sonoRuim = (tr || []).filter(t => t.sono && t.sono < 5);
    if (sonoRuim.length >= 3) {
      novosAlertas.push({
        tipo: 'sono',
        severidade: 'media',
        titulo: 'Qualidade do sono abaixo do ideal',
        desc: 'Sono ruim reduz a eficácia dos peptídeos, especialmente os secretagogos de GH.',
        acao: 'Ver protocolo',
        nav: 'protocolo',
      });
    }

    setAlertas(novosAlertas);
    setUltimaVerif(new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }));

    // Se tem alertas, gera análise IA
    if (novosAlertas.length > 0 && (ad||[]).length > 0) {
      gerarAnaliseIA(novosAlertas, ad || [], tr || []);
    }

    setLoading(false);
  };

  const [analiseIA, setAnaliseIA] = useState('');
  const gerarAnaliseIA = async (alertas: any[], ad: any[], tr: any[]) => {
    setAnalisando(true);
    try {
      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'Você está no Detector de Inconsistência. Analise os padrões do usuário e identifique falhas, sintomas fora do esperado ou comportamentos que possam comprometer o protocolo.',
          system: 'Você é o Detector IA da Nuvita. Analise as inconsistências e dê recomendações práticas e diretas em 2-3 frases. Foque no que o usuário deve fazer AGORA.',
          messages: [{ role: 'user', content: `Inconsistências detectadas: ${alertas.map(a=>a.titulo).join('; ')}. Adesão nos últimos 7 dias: ${ad.filter(a=>a.aplicado).length}/${ad.length} dias. Dê uma recomendação acionável.` }],
        }),
      });
      const data = await res.json();
      if (data.text) setAnaliseIA(data.text);
    } catch(e) {}
    setAnalisando(false);
  };

  const SEV_STYLE: any = {
    alta:  { bg:'#FAECE7', cor:'#D85A30', label:'Alta prioridade', icon:'🚨' },
    media: { bg:'#FAEEDA', cor:'#EF9F27', label:'Atenção',         icon:'⚠️' },
    baixa: { bg:'#E6F1FB', cor:'#378ADD', label:'Informação',      icon:'ℹ️' },
  };

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Analisando protocolo...</div>;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Detector de inconsistência</h2>
          <p style={{ fontSize:13, color:'var(--ts)' }}>
            Monitorando automaticamente · Última verificação: {ultimaVerif || 'agora'}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background: alertas.length > 0 ? '#FAECE7' : 'var(--gp)', borderRadius:100, padding:'5px 12px' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background: alertas.length > 0 ? '#D85A30' : 'var(--green)' }}/>
          <span style={{ fontSize:11, fontWeight:500, color: alertas.length > 0 ? '#D85A30' : 'var(--gm)' }}>
            {alertas.length > 0 ? `${alertas.length} inconsistência${alertas.length > 1 ? 's' : ''}` : 'Tudo em ordem'}
          </span>
        </div>
      </div>

      {alertas.length === 0 ? (
        <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:16, padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>✅</div>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--gm)', marginBottom:'.375rem' }}>Protocolo em dia!</div>
          <div style={{ fontSize:13, color:'var(--gm)', opacity:.8 }}>Nenhuma inconsistência detectada nos últimos 7 dias.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Análise IA */}
          {(analiseIA || analisando) && (
            <div className="dc" style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', marginBottom:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'.625rem' }}>
                <span>🤖</span>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--gm)', textTransform:'uppercase', letterSpacing:'.07em' }}>
                  {analisando ? 'IA analisando...' : 'Recomendação da IA'}
                </span>
              </div>
              <div style={{ fontSize:13, color:'var(--tx)', lineHeight:1.75 }}>{analiseIA}</div>
            </div>
          )}

          {/* Alertas */}
          {alertas.map((a, i) => {
            const sty = SEV_STYLE[a.severidade];
            return (
              <div key={i} style={{ background:sty.bg, border:`1px solid ${sty.cor}30`, borderRadius:14, padding:'1.25rem', borderLeft:`3px solid ${sty.cor}` }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <span style={{ fontSize:'1.2rem', flexShrink:0 }}>{sty.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:sty.cor, marginBottom:4 }}>{a.titulo}</div>
                    <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.6 }}>{a.desc}</div>
                  </div>
                  <span style={{ fontSize:9, padding:'2px 7px', borderRadius:100, background:sty.cor, color:'white', fontWeight:600, flexShrink:0 }}>{sty.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
