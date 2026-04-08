// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const PEPTIDEOS_EDUCATIVOS = [
  { nome:'BPC-157', emoji:'🔵', categoria:'Recuperação', mecanismo:'Peptídeo de proteção corporal que acelera regeneração tecidual, proteção gástrica e síntese de colágeno. Age ativando o fator de crescimento VEGF e estimulando receptores de sinalização celular.', usos:'Recuperação de lesões, saúde intestinal, anti-inflamatório', dose:'250–500mcg/dia', via:'SC ou oral', ciclo:'4–12 semanas', curiosidade:'Descoberto inicialmente no suco gástrico — daí o nome "Body Protection Compound".' },
  { nome:'TB-500', emoji:'🟣', categoria:'Recuperação', mecanismo:'Fração sintética da Timosina Beta-4. Promove migração e diferenciação celular, angiogênese e redução de fibrose. Essencial para reparo de tecidos após lesões.', usos:'Tendinites, lesões musculares, recuperação cirúrgica', dose:'2–2.5mg 2x/semana', via:'SC', ciclo:'4–6 semanas', curiosidade:'Presente naturalmente em todas as células do corpo — é um dos peptídeos mais abundantes em humanos.' },
  { nome:'GHK-Cu', emoji:'🟤', categoria:'Anti-aging', mecanismo:'Tripeptídeo de cobre que estimula colágeno, elastina e reparo do DNA. Age como sinalizador celular, ativando genes de reparo e suprimindo genes inflamatórios.', usos:'Pele, cabelo, anti-envelhecimento, cicatrização', dose:'1–2mg/dia', via:'SC ou tópico', ciclo:'8–12 semanas', curiosidade:'Diminui naturalmente com a idade — aos 60 anos, temos apenas 1/6 dos níveis que tínhamos aos 20.' },
  { nome:'Semaglutida', emoji:'🔴', categoria:'Emagrecimento', mecanismo:'Análogo do GLP-1 que atua em receptores hipotalâmicos reduzindo apetite, retardando esvaziamento gástrico e melhorando sensibilidade à insulina.', usos:'Perda de gordura, controle glicêmico, saciedade', dose:'0.25–2.4mg/semana', via:'SC', ciclo:'Contínuo', curiosidade:'Foi originalmente desenvolvida para diabetes tipo 2 antes de ser aprovada para emagrecimento.' },
  { nome:'CJC-1295', emoji:'🟡', categoria:'GH/Composição', mecanismo:'Análogo do GHRH que estimula a liberação pulsátil de GH pela hipófise. Liga-se à albumina plasmática (DAC), aumentando meia-vida para dias.', usos:'Ganho de massa magra, redução de gordura, recuperação', dose:'1–2mg 1–2x/semana', via:'SC', ciclo:'8–12 semanas', curiosidade:'A versão com DAC (Drug Affinity Complex) tem meia-vida de 8 dias — muito maior que o GHRH natural de 7 minutos.' },
  { nome:'Ipamorelin', emoji:'🟢', categoria:'GH/Composição', mecanismo:'Secretagogo seletivo de GH que imita a grelina, estimulando a liberação de GH sem aumentar cortisol, prolactina ou ACTH — tornando-o um dos mais seletivos disponíveis.', usos:'GH pulsátil, composição corporal, sono, recuperação', dose:'200–300mcg 2–3x/dia', via:'SC', ciclo:'8–16 semanas', curiosidade:'É frequentemente combinado com CJC-1295 pois os dois atuam em receptores diferentes, gerando efeito sinérgico.' },
  { nome:'AOD-9604', emoji:'🔥', categoria:'Emagrecimento', mecanismo:'Fragmento C-terminal do HGH que estimula lipólise (quebra de gordura) e inibe lipogênese sem afetar crescimento ou insulina. Age especificamente em tecido adiposo.', usos:'Queima de gordura localizada, metabolismo', dose:'250–300mcg/dia', via:'SC', ciclo:'3–6 meses', curiosidade:'Originalmente patenteado como droga antiobesidade, mas não chegou ao mercado farmacêutico por isso.' },
  { nome:'Melanotan II', emoji:'⚫', categoria:'Sexual', mecanismo:'Análogo sintético do α-MSH que ativa receptores melanocortina, estimulando melanogênese, libido e função erétil via ativação do sistema dopaminérgico.', usos:'Bronzeamento, libido, função sexual', dose:'0.5–1mg/dia (fase de carga)', via:'SC', ciclo:'2–4 semanas (carga), manutenção variável', curiosidade:'Foi desenvolvido originalmente como protetor solar — o efeito sexual foi descoberto acidentalmente nos estudos.' },
  { nome:'Tirzepatida', emoji:'🎯', categoria:'Emagrecimento', mecanismo:'Primeiro agonista duplo GLP-1/GIP — age em dois receptores simultâneos, potencializando saciedade, redução de apetite e melhora metabólica além do que GLP-1 sozinho faz.', usos:'Emagrecimento avançado, diabetes tipo 2, metabolismo', dose:'2.5–15mg/semana', via:'SC', ciclo:'Contínuo', curiosidade:'Em estudos clínicos, produziu até 22.5% de redução de peso corporal — o maior já registrado para um medicamento.' },
];

export default function SectionEducacao({ answers, onNavigate }: any) {
  const [peptideoHoje, setPeptideoHoje] = useState<any>(null);
  const [glossarioAberto, setGlossarioAberto] = useState<string|null>(null);

  useEffect(() => {
    // Peptídeo do dia baseado no dia do ano (rotação diária)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setPeptideoHoje(PEPTIDEOS_EDUCATIVOS[dayOfYear % PEPTIDEOS_EDUCATIVOS.length]);
  }, []);

  const objs = answers?.q3 || [];

  return (
    <div style={{ maxWidth:800 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:600, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Educação</h2>
        <p style={{ fontSize:13, color:'#6B7280' }}>Aprenda sobre peptídeos e otimize seu protocolo</p>
      </div>

      {/* Peptídeo do dia */}
      {peptideoHoje && (
        <div style={{ background:'linear-gradient(135deg, #0F6E56 0%, #0a4f3e 100%)', borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', color:'white', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-20, right:-20, fontSize:80, opacity:.15 }}>{peptideoHoje.emoji}</div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.6)', marginBottom:8 }}>
            💡 Peptídeo do dia
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1rem' }}>
            <span style={{ fontSize:32 }}>{peptideoHoje.emoji}</span>
            <div>
              <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-.02em' }}>{peptideoHoje.nome}</div>
              <span style={{ fontSize:11, fontWeight:600, padding:'2px 10px', borderRadius:100, background:'rgba(255,255,255,.15)', color:'white' }}>
                {peptideoHoje.categoria}
              </span>
            </div>
          </div>
          <p style={{ fontSize:13, lineHeight:1.7, color:'rgba(255,255,255,.85)', marginBottom:'1rem' }}>
            {peptideoHoje.mecanismo}
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:'1rem' }}>
            {[['💊 Dose', peptideoHoje.dose], ['💉 Via', peptideoHoje.via], ['📅 Ciclo', peptideoHoje.ciclo]].map(([lbl, val]) => (
              <div key={lbl} style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'8px 10px' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', marginBottom:2 }}>{lbl}</div>
                <div style={{ fontSize:12, fontWeight:600 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(255,255,255,.08)', borderRadius:8, padding:'10px 12px', fontSize:12, color:'rgba(255,255,255,.75)', lineHeight:1.6 }}>
            🧠 <strong style={{ color:'white' }}>Curiosidade:</strong> {peptideoHoje.curiosidade}
          </div>
        </div>
      )}

      {/* Glossário de peptídeos */}
      <div style={{ background:'white', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', marginBottom:'1rem' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>
          📚 Glossário de peptídeos
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {PEPTIDEOS_EDUCATIVOS.map(p => (
            <div key={p.nome}>
              <div onClick={() => setGlossarioAberto(glossarioAberto === p.nome ? null : p.nome)}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:10, cursor:'pointer', background: glossarioAberto === p.nome ? '#F0FDF4' : '#F9FAFB', transition:'background .1s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:18 }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{p.nome}</div>
                    <div style={{ fontSize:11, color:'#9CA3AF' }}>{p.categoria} · {p.usos.split(',')[0]}</div>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ transform: glossarioAberto === p.nome ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
              {glossarioAberto === p.nome && (
                <div style={{ padding:'12px 16px', background:'#F0FDF4', borderRadius:'0 0 10px 10px', marginTop:-4 }}>
                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.65, marginBottom:10 }}>{p.mecanismo}</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                    {[['Dose', p.dose], ['Via', p.via], ['Ciclo', p.ciclo], ['Usos', p.usos]].map(([lbl, val]) => (
                      <div key={lbl} style={{ background:'white', borderRadius:8, padding:'6px 10px' }}>
                        <div style={{ fontSize:10, color:'#9CA3AF', marginBottom:2 }}>{lbl}</div>
                        <div style={{ fontSize:12, fontWeight:500, color:'#111827' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Links úteis */}
      <div style={{ background:'white', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>
          🔗 Aprofunde seu conhecimento
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { label:'Sua Biblioteca de peptídeos', desc:'Explore todos os peptídeos com dados completos', action:'lib' },
            { label:'Coach IA', desc:'Tire dúvidas específicas sobre seu protocolo com IA', action:'coach' },
            { label:'Simulador de ciclos', desc:'Simule diferentes combinações antes de iniciar', action:'simulador' },
            { label:'Calculadora de doses', desc:'Calcule doses com base no seu peso e objetivo', action:'calc' },
          ].map(item => (
            <button key={item.label} onClick={() => onNavigate && onNavigate(item.action)}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:10, border:'1px solid #E5E7EB', background:'#F9FAFB', cursor:'pointer', textAlign:'left', fontFamily:'inherit' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'#111827' }}>{item.label}</div>
                <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{item.desc}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
