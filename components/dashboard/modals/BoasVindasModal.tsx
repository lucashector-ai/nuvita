// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

interface Props {
  nome: string;
  userId?: string;
  onClose: (temPeptideo: boolean) => void;
}

const FONTES = [
  { ico:'🌎', titulo:'Importação direta', desc:'A maioria dos peptídeos vem dos EUA, China ou Europa. Sites como Peptide Sciences, Limitless Life e Blue Sky Peptide são os mais usados pela comunidade.' },
  { ico:'🇧🇷', titulo:'Revendedores nacionais', desc:'Alguns revendedores no Brasil já importam legalmente. Busque grupos de biohacking no WhatsApp ou Telegram — a comunidade indica fontes confiáveis.' },
  { ico:'👨‍⚕️', titulo:'Via médico', desc:'Médicos de medicina integrativa podem prescrever e indicar farmácias de manipulação ou importadoras.' },
];

export default function BoasVindasModal({ nome, userId, onClose }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shown = localStorage.getItem('nv_bv_shown');
    if (shown === '1') {
      if (typeof onClose === 'function') (() => { try { localStorage.setItem('nv_bv_shown','1'); } catch {} onClose(); })();
    }
  }, []);

  const [step, setStep] = useState<'welcome'|'nao_tem'>('welcome');

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose(false)}>
      <div style={{ background:'#F7F7F7', borderRadius:20, padding:'1.5rem', maxWidth:520, width:'calc(100% - 1.5rem)', maxHeight:'85vh', overflowY:'auto', WebkitOverflowScrolling:'touch' }}>

        {step === 'welcome' && (
          <>
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'var(--gp)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 1rem' }}>🧬</div>
              <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.5rem' }}>
                Bem-vindo{nome ? `, ${nome.split(' ')[0]}` : '!'}!
              </h2>
              <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7 }}>
                Seu protocolo personalizado está pronto. Antes de começar, precisamos de uma informação.
              </p>
            </div>

            <div style={{ background:'#FFFFFF', borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'1.5rem', marginBottom:'1.5rem' }}>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:'1.25rem', textAlign:'center' }}>
                Você já tem os peptídeos em mãos?
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <button onClick={() => {
                  if (userId) localStorage.setItem('nv_boas_vindas_' + userId, '1');
                  onClose(true);
                }}
                  style={{ padding:'12px 16px', borderRadius:12, border:'2px solid var(--green)', background:'var(--gp)', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:500, color:'var(--gm)', display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:'1.3rem' }}>✅</span>
                  <div style={{ textAlign:'left' }}>
                    <div>Sim, já tenho os peptídeos</div>
                    <div style={{ fontSize:11, opacity:.75, fontWeight:400, marginTop:1 }}>Vou iniciar o protocolo agora</div>
                  </div>
                </button>
                <button onClick={() => setStep('nao_tem')}
                  style={{ padding:'12px 16px', borderRadius:12, border:'none', background:'#F7F7F7', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:500, color:'var(--tx)', display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:'1.3rem' }}>⏳</span>
                  <div style={{ textAlign:'left' }}>
                    <div>Ainda não tenho</div>
                    <div style={{ fontSize:11, color:'var(--ts)', fontWeight:400, marginTop:1 }}>Quero saber onde encontrar</div>
                  </div>
                </button>
              </div>
            </div>
            <div style={{ fontSize:11, color:'var(--ts)', textAlign:'center' }}>
              Você pode iniciar o protocolo a qualquer momento quando os peptídeos chegarem.
            </div>
          </>
        )}

        {step === 'nao_tem' && (
          <>
            <button onClick={() => setStep('welcome')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ts)', fontSize:13, fontFamily:'inherit', marginBottom:'1rem' }}>← Voltar</button>
            <div style={{ marginBottom:'1.5rem' }}>
              <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.375rem' }}>Onde encontrar peptídeos</h2>
              <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.65 }}>A maioria precisa ser importada. Aqui estão as principais fontes usadas no Brasil.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:'1.5rem' }}>
              {FONTES.map(f => (
                <div key={f.titulo} style={{ background:'#FFFFFF', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'1rem 1.25rem', display:'flex', gap:12 }}>
                  <span style={{ fontSize:'1.5rem', flexShrink:0 }}>{f.ico}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:4 }}>{f.titulo}</div>
                    <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.6 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:12, padding:'1rem 1.25rem', marginBottom:'1.5rem', fontSize:12, color:'var(--gm)', lineHeight:1.65 }}>
              💡 Entre na comunidade do WhatsApp da Nuvita para receber indicações de fornecedores confiáveis.
            </div>
            <button onClick={() => onClose(false)} className="btn btn-d fw" style={{ fontSize:14, padding:'13px' }} onClick={() => {
              if (userId) localStorage.setItem('nv_boas_vindas_' + userId, '1');
            }}>
              Entendi — vou acessar a plataforma
            </button>
          </>
        )}
      </div>
    </div>
  );
}
