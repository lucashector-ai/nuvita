// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  nome: string;
  emoji?: string;
  children?: React.ReactNode;
}

const PEPTIDE_EDU = {
  'Semaglutide':    { desc: 'Análogo do GLP-1 que reduz apetite e regula glicemia.', beneficio: 'Perda de gordura, controle glicêmico', via: 'SC semanal' },
  'BPC-157':        { desc: 'Peptídeo do suco gástrico com potente ação regenerativa.', beneficio: 'Recuperação de lesões, saúde intestinal', via: 'SC ou oral' },
  'TB-500':         { desc: 'Fragmento da Timosina Beta-4 com ação anti-inflamatória.', beneficio: 'Reparo muscular, recuperação rápida', via: 'SC' },
  'GHK-Cu':         { desc: 'Peptídeo cobre com ação antioxidante e regeneradora.', beneficio: 'Pele, cabelo, cicatrização', via: 'Tópico ou SC' },
  'Ipamorelin':     { desc: 'Secretagogo seletivo de GH sem elevar cortisol.', beneficio: 'Sono, recuperação, composição corporal', via: 'SC' },
  'CJC-1295':       { desc: 'Análogo do GHRH que aumenta pulsos de GH.', beneficio: 'Massa muscular, queima de gordura', via: 'SC' },
  'AOD-9604':       { desc: 'Fragmento do HGH que estimula lipólise sem efeitos do GH.', beneficio: 'Queima de gordura localizada', via: 'SC' },
  'Epithalon':      { desc: 'Tetrapeptídeo pineal com ação antienvelhecimento.', beneficio: 'Longevidade, sono, antioxidante', via: 'SC ou nasal' },
  'Sermorelin':     { desc: 'Fragmento do GHRH estimulante natural de GH.', beneficio: 'GH natural, músculo, gordura', via: 'SC' },
  'Hexarelin':      { desc: 'Secretagogo potente de GH com ação cardioprotetora.', beneficio: 'GH, proteção cardíaca', via: 'SC' },
  'GHRP-2':         { desc: 'Secretagogo de GH de segunda geração, potente.', beneficio: 'GH, apetite, recuperação', via: 'SC' },
  'GHRP-6':         { desc: 'Secretagogo de GH que também estimula apetite.', beneficio: 'GH, massa muscular', via: 'SC' },
  'PT-141':         { desc: 'Agonista de melanocortina com ação na libido.', beneficio: 'Função sexual, libido', via: 'SC ou nasal' },
  'Melanotan II':   { desc: 'Agonista de MC com ação bronzeadora e na libido.', beneficio: 'Bronzeamento, libido', via: 'SC' },
  'Thymosin Alpha 1': { desc: 'Imunomodulador derivado do timo.', beneficio: 'Imunidade, inflamação', via: 'SC' },
  'KPV':            { desc: 'Tripeptídeo anti-inflamatório derivado do MSH.', beneficio: 'Inflamação, intestino', via: 'Oral ou SC' },
};

export default function PeptideTooltip({ nome, emoji, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const edu = PEPTIDE_EDU[nome];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open]);

  return (
    <span ref={ref} style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      {children || <span>{emoji && <span style={{ marginRight:4 }}>{emoji}</span>}{nome}</span>}
      {edu && (
        <span
          onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
          style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:16, height:16, borderRadius:'50%', background:open?'var(--green)':'var(--bg2)', color:open?'white':'var(--ts)', fontSize:10, fontWeight:700, cursor:'pointer', flexShrink:0, border:'1px solid', borderColor:open?'var(--green)':'var(--border)', transition:'all .15s', userSelect:'none' }}>
          i
        </span>
      )}
      {open && edu && (
        <span style={{ position:'absolute', zIndex:999, background:'var(--dark)', borderRadius:12, padding:'12px 14px', width:220, boxShadow:'0 8px 24px rgba(0,0,0,.25)', marginTop:4, display:'block' }}>
          <span style={{ display:'block', fontSize:12, fontWeight:500, color:'white', marginBottom:4 }}>{emoji && emoji+' '}{nome}</span>
          <span style={{ display:'block', fontSize:11, color:'rgba(255,255,255,.75)', lineHeight:1.6, marginBottom:8 }}>{edu.desc}</span>
          <span style={{ display:'inline-block', fontSize:10, background:'rgba(29,158,117,.3)', color:'#5DCAA5', borderRadius:100, padding:'2px 8px', marginRight:4 }}>✓ {edu.beneficio}</span>
          <span style={{ display:'inline-block', fontSize:10, background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', borderRadius:100, padding:'2px 8px' }}>💉 {edu.via}</span>
        </span>
      )}
    </span>
  );
}
