// @ts-nocheck
'use client';

import { useState, useRef } from 'react';

interface Props {
  nome: string;
  emoji?: string;
  descricao?: string;
  beneficio?: string;
  children?: React.ReactNode;
}

// Base de dados de educação dos peptídeos
const PEPTIDE_EDU: Record<string, { desc: string; beneficio: string; via: string }> = {
  'Semaglutide':    { desc: 'Análogo do GLP-1 que reduz apetite e regula glicemia.', beneficio: 'Perda de gordura, controle glicêmico', via: 'SC semanal' },
  'BPC-157':        { desc: 'Peptídeo do suco gástrico com potente ação regenerativa.', beneficio: 'Recuperação de lesões, saúde intestinal', via: 'SC ou oral' },
  'TB-500':         { desc: 'Fragmento da Timosina Beta-4 com ação anti-inflamatória.', beneficio: 'Reparo muscular, recuperação rápida', via: 'SC' },
  'GHK-Cu':         { desc: 'Peptídeo cobre com ação antioxidante e regeneradora.', beneficio: 'Pele, cabelo, cicatrização', via: 'Tópico ou SC' },
  'Ipamorelin':     { desc: 'Secretagogo seletivo de GH sem elevar cortisol.', beneficio: 'Qualidade do sono, recuperação, composição corporal', via: 'SC' },
  'CJC-1295':       { desc: 'Análogo do GHRH que aumenta pulsos de GH.', beneficio: 'Massa muscular, queima de gordura', via: 'SC' },
  'AOD-9604':       { desc: 'Fragmento do HGH que estimula lipólise sem efeitos do GH.', beneficio: 'Queima de gordura localizada', via: 'SC' },
  'Epithalon':      { desc: 'Tetrapeptídeo pineal com ação antienvelhecimento.', beneficio: 'Longevidade, sono, antioxidante', via: 'SC ou nasal' },
  'Sermorelin':     { desc: 'Fragmento do GHRH estimulante natural de GH.', beneficio: 'GH natural, músculo, gordura', via: 'SC' },
  'Hexarelin':      { desc: 'Secretagogo potente de GH com ação cardioprotetora.', beneficio: 'GH, proteção cardíaca', via: 'SC' },
  'GHRP-2':         { desc: 'Secretagogo de GH de segunda geração, potente.', beneficio: 'GH, apetite, recuperação', via: 'SC' },
  'GHRP-6':         { desc: 'Secretagogo de GH que também estimula apetite.', beneficio: 'GH, massa muscular', via: 'SC' },
  'MGF':            { desc: 'Fator de crescimento mecânico, estimula células satélite.', beneficio: 'Hipertrofia, recuperação muscular', via: 'SC' },
  'IGF-1 LR3':      { desc: 'Fator de crescimento insulínico de longa ação.', beneficio: 'Músculo, recuperação, composição', via: 'SC' },
  'PT-141':         { desc: 'Agonista de melanocortina com ação na libido.', beneficio: 'Função sexual, libido', via: 'SC ou nasal' },
  'Melanotan II':   { desc: 'Agonista de MC com ação bronzeadora e na libido.', beneficio: 'Bronzeamento, libido', via: 'SC' },
  'SS-31':          { desc: 'Peptídeo mitocondrial com ação antioxidante.', beneficio: 'Energia celular, longevidade', via: 'SC' },
  'Thymosin Alpha 1': { desc: 'Imunomodulador derivado do timo.', beneficio: 'Imunidade, inflamação', via: 'SC' },
  'LL-37':          { desc: 'Peptídeo antimicrobiano humano catelicidina.', beneficio: 'Imunidade, cicatrização', via: 'SC ou tópico' },
  'KPV':            { desc: 'Tripeptídeo anti-inflamatório derivado do MSH.', beneficio: 'Inflamação, intestino', via: 'Oral ou SC' },
};

export default function PeptideTooltip({ nome, emoji, children }: Props) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<any>(null);
  const edu = PEPTIDE_EDU[nome];
  if (!edu) return <>{children || <span>{nome}</span>}</>;

  const show = () => { clearTimeout(timerRef.current); setVisible(true); };
  const hide = () => { timerRef.current = setTimeout(() => setVisible(false), 200); };

  return (
    <span style={{ position:'relative', display:'inline-block' }}
      onMouseEnter={show} onMouseLeave={hide}
      onTouchStart={e => { e.stopPropagation(); setVisible(v => !v); }}>
      {children || (
        <span style={{ borderBottom:'1px dashed var(--green)', cursor:'help', color:'var(--tx)' }}>
          {emoji && <span style={{ marginRight:4 }}>{emoji}</span>}{nome}
        </span>
      )}
      {visible && (
        <div onMouseEnter={show} onMouseLeave={hide}
          style={{ position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)', width:220, background:'var(--dark)', borderRadius:12, padding:'12px 14px', zIndex:999, boxShadow:'0 8px 32px rgba(0,0,0,.25)', pointerEvents:'auto' }}>
          <div style={{ fontSize:12, fontWeight:500, color:'white', marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
            {emoji && <span>{emoji}</span>}{nome}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.75)', lineHeight:1.6, marginBottom:6 }}>{edu.desc}</div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, background:'rgba(29,158,117,.3)', color:'#5DCAA5', borderRadius:100, padding:'2px 7px' }}>✓ {edu.beneficio}</span>
            <span style={{ fontSize:10, background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', borderRadius:100, padding:'2px 7px' }}>💉 {edu.via}</span>
          </div>
          {/* Seta */}
          <div style={{ position:'absolute', bottom:-5, left:'50%', transform:'translateX(-50%)', width:10, height:10, background:'var(--dark)', clipPath:'polygon(0 0,100% 0,50% 100%)' }}/>
        </div>
      )}
    </span>
  );
}
