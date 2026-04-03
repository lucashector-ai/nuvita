// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';

// ─── Dados de protocolos e peptídeos ─────────────────────────────
const PROTOCOLOS = [
  { id:'sema_basico',   label:'Semaglutide — Iniciante',        peptideo:'Semaglutide',      frasco:2,   agua:2, dose:250, unidade:'mcg' },
  { id:'sema_mant',     label:'Semaglutide — Manutenção',       peptideo:'Semaglutide',      frasco:2,   agua:2, dose:500, unidade:'mcg' },
  { id:'tirze_inicio',  label:'Tirzepatide — Início',           peptideo:'Tirzepatide',      frasco:5,   agua:2, dose:2500, unidade:'mcg' },
  { id:'aod_padrao',    label:'AOD-9604 — Padrão',              peptideo:'AOD-9604',         frasco:5,   agua:2, dose:300, unidade:'mcg' },
  { id:'ipa_noite',     label:'Ipamorelin — Dose noturna',      peptideo:'Ipamorelin',       frasco:2,   agua:2, dose:200, unidade:'mcg' },
  { id:'cjc_sem_dac',   label:'CJC-1295 sem DAC — Diário',      peptideo:'CJC-1295',         frasco:2,   agua:2, dose:100, unidade:'mcg' },
  { id:'bpc_sc',        label:'BPC-157 — Subcutâneo',           peptideo:'BPC-157',          frasco:5,   agua:2, dose:250, unidade:'mcg' },
  { id:'tb500_agudo',   label:'TB-500 — Fase aguda',            peptideo:'TB-500',           frasco:5,   agua:2, dose:2500, unidade:'mcg' },
  { id:'mk677_padrao',  label:'MK-677 — Oral padrão',           peptideo:'MK-677 (Ibutamoren)', frasco:0, agua:0, dose:10, unidade:'mg' },
  { id:'ghk_sc',        label:'GHK-Cu — Subcutâneo',            peptideo:'GHK-Cu',           frasco:5,   agua:2, dose:1000, unidade:'mcg' },
  { id:'semax_nasal',   label:'Semax — Intranasal',             peptideo:'Semax',            frasco:5,   agua:5, dose:300, unidade:'mcg' },
  { id:'personalizado', label:'Personalizado',                  peptideo:'Personalizado',    frasco:5,   agua:2, dose:500, unidade:'mcg' },
];

const PEPTIDEOS = ['Semaglutide','Tirzepatide','AOD-9604','Ipamorelin','CJC-1295','BPC-157','TB-500','MK-677 (Ibutamoren)','GHK-Cu','Semax','GHK-Cu','Epitalon','Selank','IGF-1 LR3','Personalizado'];
const FRASCOS_MG = [1, 2, 5, 10, 15, 30];
const AGUAS_ML   = [1, 2, 3, 5, 6, 10];
const DOSES_MCG  = [50, 100, 200, 250, 300, 500, 1000, 2500];
const DOSES_MG   = [5, 10, 15, 20, 25];
const SERINGAS   = [
  { label:'0.3 ml (30 UI)', ml:0.3, ui:30 },
  { label:'0.5 ml (50 UI)', ml:0.5, ui:50 },
  { label:'1.0 ml (100 UI)', ml:1.0, ui:100 },
];

// Tabela de referência rápida
const TABELA_REF = [
  { peptideo:'Semaglutide', frasco:'2 mg', agua:'2 ml', conc:'1 mg/ml', dose:'0.25 mg', ui:'25 UI' },
  { peptideo:'Semaglutide', frasco:'2 mg', agua:'2 ml', conc:'1 mg/ml', dose:'0.5 mg', ui:'50 UI' },
  { peptideo:'AOD-9604',    frasco:'5 mg', agua:'2 ml', conc:'2.5 mg/ml', dose:'300 mcg', ui:'12 UI' },
  { peptideo:'AOD-9604',    frasco:'5 mg', agua:'2 ml', conc:'2.5 mg/ml', dose:'500 mcg', ui:'20 UI' },
  { peptideo:'Ipamorelin',  frasco:'2 mg', agua:'2 ml', conc:'1 mg/ml', dose:'200 mcg', ui:'20 UI' },
  { peptideo:'Ipamorelin',  frasco:'2 mg', agua:'2 ml', conc:'1 mg/ml', dose:'300 mcg', ui:'30 UI' },
  { peptideo:'BPC-157',     frasco:'5 mg', agua:'2 ml', conc:'2.5 mg/ml', dose:'250 mcg', ui:'10 UI' },
  { peptideo:'BPC-157',     frasco:'5 mg', agua:'2 ml', conc:'2.5 mg/ml', dose:'500 mcg', ui:'20 UI' },
  { peptideo:'TB-500',      frasco:'5 mg', agua:'2 ml', conc:'2.5 mg/ml', dose:'2.5 mg', ui:'100 UI' },
  { peptideo:'CJC-1295',    frasco:'2 mg', agua:'2 ml', conc:'1 mg/ml', dose:'100 mcg', ui:'10 UI' },
  { peptideo:'GHK-Cu',      frasco:'5 mg', agua:'5 ml', conc:'1 mg/ml', dose:'1 mg', ui:'100 UI' },
  { peptideo:'Semax',       frasco:'5 mg', agua:'5 ml', conc:'1 mg/ml', dose:'300 mcg', ui:'30 UI' },
];

const DILUENTES = [
  { nome:'Água bacteriostática', desc:'Padrão para a maioria dos peptídeos. Contém álcool benzílico como conservante — permite múltiplos usos do frasco (até 28 dias).', ideal:['Ipamorelin','CJC-1295','BPC-157','TB-500','AOD-9604','GHK-Cu','Semax'], cor:'#1D9E75', bg:'#E1F5EE' },
  { nome:'Água para injeção (API)', desc:'Estéril e sem conservantes. Adequada para peptídeos sensíveis. Frasco deve ser usado em dose única ou descartado em 24h após abertura.', ideal:['Semaglutide','Tirzepatide','Epitalon'], cor:'#378ADD', bg:'#E6F1FB' },
  { nome:'Solução salina (NaCl 0.9%)', desc:'Isotônica e bem tolerada. Opção quando a água bacteriostática não está disponível. Sem conservante — usar em 24h.', ideal:['BPC-157 (oral)','IGF-1 LR3'], cor:'#7F77DD', bg:'#EEEDFE' },
  { nome:'Ácido acético 0.6%', desc:'Necessário para peptídeos que precipitam em água neutra. Raramente usado em protocolos domésticos.', ideal:['IGF-1','HGH'], cor:'#EF9F27', bg:'#FAEEDA' },
];

// ─── Componente principal ─────────────────────────────────────────
export default function SectionCalc() {
  const [aba,       setAba]       = useState('calc');
  const [proto,     setProto]     = useState('');
  const [peptideo,  setPeptideo]  = useState('Semaglutide');
  const [frascoMg,  setFrascoMg]  = useState(2);
  const [aguaMl,    setAguaMl]    = useState(2);
  const [doseMcg,   setDoseMcg]   = useState(500);
  const [unidade,   setUnidade]   = useState('mcg');
  const [seringa,   setSeringa]   = useState(1); // index do SERINGAS
  const [doseCustom, setDoseCustom] = useState('');
  const [tabelaFiltro, setTabelaFiltro] = useState('Todos');

  // Aplica protocolo
  const aplicarProtocolo = (id) => {
    setProto(id);
    const p = PROTOCOLOS.find(x => x.id === id);
    if (!p) return;
    setPeptideo(p.peptideo);
    if (p.frasco) setFrascoMg(p.frasco);
    if (p.agua)   setAguaMl(p.agua);
    setUnidade(p.unidade);
    if (p.unidade === 'mcg') setDoseMcg(p.dose);
    setDoseCustom('');
  };

  // Cálculo principal
  const calc = useMemo(() => {
    const frascoMcg = frascoMg * 1000;
    const concMcgMl = frascoMcg / aguaMl;        // mcg/ml
    const doseVal   = doseCustom ? Number(doseCustom) : doseMcg;
    const doseEmMcg = unidade === 'mg' ? doseVal * 1000 : doseVal;
    const volMl     = doseEmMcg / concMcgMl;      // ml por dose
    const ser       = SERINGAS[seringa];
    const mcgPerUi  = concMcgMl / (ser.ui / ser.ml); // mcg por UI
    const uiDose    = doseEmMcg / mcgPerUi;           // UI na seringa
    const doses     = frascoMcg / doseEmMcg;

    return {
      volMl:     volMl.toFixed(3),
      uiDose:    Math.round(uiDose * 10) / 10,
      concMgMl:  (concMcgMl / 1000).toFixed(2),
      doses:     Math.floor(doses),
      pct:       Math.min(100, (uiDose / ser.ui) * 100),
      frascoMcg,
      doseEmMcg,
      ser,
    };
  }, [frascoMg, aguaMl, doseMcg, doseCustom, unidade, seringa]);

  const doseAtual = doseCustom ? Number(doseCustom) : doseMcg;

  const tabelaPeptideos = ['Todos', ...Array.from(new Set(TABELA_REF.map(r => r.peptideo)))];

  return (
    <div style={{ maxWidth:860 }}>
      {/* Header */}
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Calculadora de Peptídeos</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Calcule a dosagem exata para reconstituição e aplicação</p>
      </div>

      {/* Abas */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.5rem' }}>
        {[['calc','🧮 Calculadora'],['tabelas','📋 Tabelas'],['diluentes','💧 Diluentes']].map(([v,l])=>(
          <button key={v} onClick={()=>setAba(v)}
            style={{ padding:'10px 18px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:aba===v?'var(--tx)':'var(--ts)', borderBottom:aba===v?'2px solid var(--green)':'2px solid transparent', flexShrink:0 }}>
            {l}
          </button>
        ))}
      </div>

      {/* ─── ABA CALCULADORA ─────────────────────────── */}
      {aba==='calc' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1.25rem', alignItems:'start' }}>
          {/* Coluna esquerda — inputs */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Seletor de protocolo */}
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.75rem' }}>Selecionar protocolo <span style={{ fontWeight:400, color:'var(--ts)' }}>(opcional)</span></div>
              <select value={proto} onChange={e=>aplicarProtocolo(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg2)', color:'var(--tx)', fontSize:13, fontFamily:'inherit', cursor:'pointer', outline:'none' }}>
                <option value="">Escolha um protocolo para pré-preencher...</option>
                {PROTOCOLOS.map(p=>(
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Volume da seringa */}
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.75rem' }}>💉 Volume total da seringa</div>
              <div style={{ display:'flex', gap:8 }}>
                {SERINGAS.map((s,i)=>(
                  <button key={i} onClick={()=>setSeringa(i)}
                    style={{ flex:1, padding:'10px 8px', borderRadius:10, border:`1.5px solid ${seringa===i?'var(--green)':'var(--border)'}`, background:seringa===i?'var(--gp)':'var(--bg2)', color:seringa===i?'var(--gm)':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade do peptídeo no vial */}
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.75rem' }}>🧪 Quantidade do peptídeo no vial</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {FRASCOS_MG.map(v=>(
                  <button key={v} onClick={()=>setFrascoMg(v)}
                    style={{ padding:'8px 16px', borderRadius:100, border:`1.5px solid ${frascoMg===v?'var(--green)':'var(--border)'}`, background:frascoMg===v?'var(--gp)':'var(--bg2)', color:frascoMg===v?'var(--gm)':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                    {v} mg
                  </button>
                ))}
                <button onClick={()=>setFrascoMg(null)}
                  style={{ padding:'8px 16px', borderRadius:100, border:`1.5px solid ${!FRASCOS_MG.includes(frascoMg)?'var(--green)':'var(--border)'}`, background:!FRASCOS_MG.includes(frascoMg)?'var(--gp)':'var(--bg2)', color:!FRASCOS_MG.includes(frascoMg)?'var(--gm)':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                  Outro
                </button>
              </div>
              {!FRASCOS_MG.includes(frascoMg) && (
                <input type="number" placeholder="Ex: 25" value={frascoMg||''} onChange={e=>setFrascoMg(Number(e.target.value))}
                  style={{ marginTop:8, width:120, padding:'8px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--tx)', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
              )}
              <div style={{ fontSize:11, color:'var(--ts)', marginTop:6 }}>≈ {(frascoMg*1000).toLocaleString()} mcg total no vial</div>
            </div>

            {/* Água bacteriostática */}
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.75rem' }}>💧 Água bacteriostática para reconstituição</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {AGUAS_ML.map(v=>(
                  <button key={v} onClick={()=>setAguaMl(v)}
                    style={{ padding:'8px 16px', borderRadius:100, border:`1.5px solid ${aguaMl===v?'var(--green)':'var(--border)'}`, background:aguaMl===v?'var(--gp)':'var(--bg2)', color:aguaMl===v?'var(--gm)':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                    {v} ml
                  </button>
                ))}
              </div>
              <div style={{ fontSize:11, color:'var(--ts)', marginTop:6 }}>Concentração resultante: {calc.concMgMl} mg/ml</div>
            </div>

            {/* Dose desejada */}
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.75rem' }}>
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>🎯 Dose desejada por aplicação</div>
                <div style={{ display:'flex', gap:4 }}>
                  {['mcg','mg'].map(u=>(
                    <button key={u} onClick={()=>setUnidade(u)}
                      style={{ padding:'4px 10px', borderRadius:100, border:`1px solid ${unidade===u?'var(--green)':'var(--border)'}`, background:unidade===u?'var(--green)':'var(--bg2)', color:unidade===u?'white':'var(--tm)', fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              {unidade==='mcg' ? (
                <>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {DOSES_MCG.map(v=>(
                      <button key={v} onClick={()=>{ setDoseMcg(v); setDoseCustom(''); }}
                        style={{ padding:'8px 14px', borderRadius:100, border:`1.5px solid ${doseMcg===v && !doseCustom?'var(--green)':'var(--border)'}`, background:doseMcg===v && !doseCustom?'var(--gp)':'var(--bg2)', color:doseMcg===v && !doseCustom?'var(--gm)':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                        {v} mcg
                      </button>
                    ))}
                    <button onClick={()=>setDoseCustom('x')}
                      style={{ padding:'8px 14px', borderRadius:100, border:`1.5px solid ${doseCustom?'var(--green)':'var(--border)'}`, background:doseCustom?'var(--gp)':'var(--bg2)', color:doseCustom?'var(--gm)':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                      Outro
                    </button>
                  </div>
                  {doseCustom && (
                    <input type="number" placeholder="Digite a dose em mcg" value={doseCustom==='x'?'':doseCustom} onChange={e=>setDoseCustom(e.target.value)} autoFocus
                      style={{ marginTop:8, width:160, padding:'8px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--tx)', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {DOSES_MG.map(v=>(
                      <button key={v} onClick={()=>{ setDoseMcg(v*1000); setDoseCustom(''); }}
                        style={{ padding:'8px 14px', borderRadius:100, border:`1.5px solid ${doseMcg===v*1000 && !doseCustom?'var(--green)':'var(--border)'}`, background:doseMcg===v*1000 && !doseCustom?'var(--gp)':'var(--bg2)', color:doseMcg===v*1000 && !doseCustom?'var(--gm)':'var(--tm)', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                        {v} mg
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Coluna direita — resultado */}
          <div style={{ position:'sticky', top:'1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* Resultado principal */}
            <div style={{ background:'var(--dark)', borderRadius:16, padding:'1.5rem', color:'white' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', opacity:.6, marginBottom:'1rem' }}>Resultado</div>
              <div style={{ textAlign:'center', marginBottom:'1.25rem' }}>
                <div style={{ fontSize:'3rem', fontWeight:500, letterSpacing:'-.04em', lineHeight:1 }}>{calc.uiDose}</div>
                <div style={{ fontSize:14, opacity:.75, marginTop:4 }}>UI (unidades de insulina)</div>
              </div>

              {/* Grid de métricas */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1.25rem' }}>
                {[
                  ['Volume em ml', calc.volMl+' ml'],
                  ['Volume em µl', (parseFloat(calc.volMl)*1000).toFixed(0)+' µl'],
                  ['Concentração', calc.concMgMl+' mg/ml'],
                  ['Doses no vial', calc.doses+' doses'],
                ].map(([l,v])=>(
                  <div key={l} style={{ background:'rgba(255,255,255,.08)', borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ fontSize:9, textTransform:'uppercase', letterSpacing:'.07em', opacity:.6, marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Visualização da seringa */}
              <div style={{ marginBottom:'1rem' }}>
                <div style={{ fontSize:11, opacity:.7, marginBottom:6 }}>Seringa {SERINGAS[seringa].label}</div>
                <div style={{ position:'relative', height:28, background:'rgba(255,255,255,.12)', borderRadius:100, overflow:'hidden' }}>
                  <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${calc.pct}%`, background:'var(--green)', borderRadius:100, transition:'width .4s cubic-bezier(.4,0,.2,1)' }}/>
                  {[25,50,75].map(p=>(
                    <div key={p} style={{ position:'absolute', left:`${p}%`, top:4, bottom:4, width:1, background:'rgba(255,255,255,.2)' }}/>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, opacity:.5, marginTop:4 }}>
                  <span>0 UI</span><span>{SERINGAS[seringa].ui/4} UI</span><span>{SERINGAS[seringa].ui/2} UI</span><span>{SERINGAS[seringa].ui*3/4} UI</span><span>{SERINGAS[seringa].ui} UI</span>
                </div>
              </div>

              {/* Instrução */}
              <div style={{ background:'rgba(29,158,117,.2)', borderRadius:10, padding:'10px 12px', fontSize:12, color:'#5DCAA5', lineHeight:1.6, textAlign:'center' }}>
                Encha a seringa até a marca de <strong>{calc.uiDose} UI</strong>
              </div>
            </div>

            {/* Explicação didática */}
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.75rem' }}>Como foi calculado</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  [`${frascoMg} mg × 1000 = ${frascoMg*1000} mcg no vial`],
                  [`${frascoMg*1000} mcg ÷ ${aguaMl} ml = ${calc.concMgMl} mg/ml`],
                  [`${doseAtual} ${unidade} ÷ ${calc.concMgMl} mg/ml = ${calc.volMl} ml`],
                  [`${calc.volMl} ml = ${calc.uiDose} UI na seringa ${SERINGAS[seringa].label}`],
                ].map(([t],i)=>(
                  <div key={i} style={{ display:'flex', gap:8, fontSize:12, color:'var(--tm)', padding:'6px 10px', background:'var(--bg2)', borderRadius:8 }}>
                    <span style={{ color:'var(--green)', fontWeight:600, flexShrink:0 }}>{i+1}.</span>{t}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, fontSize:11, color:'var(--ts)', lineHeight:1.6 }}>
                ⚠️ Fins educacionais. Consulte um médico antes de iniciar qualquer protocolo.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ABA TABELAS ─────────────────────────────── */}
      {aba==='tabelas' && (
        <div>
          <div style={{ marginBottom:'1rem' }}>
            <div style={{ fontSize:13, color:'var(--tm)', marginBottom:'1rem' }}>Referência rápida de reconstituição e dose por peptídeo.</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {tabelaPeptideos.map(p=>(
                <button key={p} onClick={()=>setTabelaFiltro(p)}
                  style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', border:`1px solid ${tabelaFiltro===p?'var(--green)':'var(--border)'}`, background:tabelaFiltro===p?'var(--gp)':'var(--bg2)', color:tabelaFiltro===p?'var(--gm)':'var(--tm)', fontFamily:'inherit', transition:'all .13s' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="dc" style={{ marginBottom:0, padding:0 }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Peptídeo','Frasco','Água bact.','Concentração','Dose','UI na seringa'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABELA_REF.filter(r=>tabelaFiltro==='Todos'||r.peptideo===tabelaFiltro).map((r,i)=>(
                  <tr key={i} style={{ borderBottom:'0.5px solid var(--border)', transition:'background .12s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg2)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    {[r.peptideo,r.frasco,r.agua,r.conc,r.dose,r.ui].map((v,j)=>(
                      <td key={j} style={{ padding:'10px 14px', fontSize:13, color:j===5?'var(--green)':j===0?'var(--tx)':'var(--tm)', fontWeight:j===5?600:400 }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ABA DILUENTES ───────────────────────────── */}
      {aba==='diluentes' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ fontSize:13, color:'var(--tm)', marginBottom:'.25rem' }}>Guia de diluentes para reconstituição segura de peptídeos.</div>
          {DILUENTES.map((d,i)=>(
            <div key={i} className="dc" style={{ borderLeft:`3px solid ${d.cor}`, paddingLeft:'1.25rem', marginBottom:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'.75rem' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:d.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>💧</div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)' }}>{d.nome}</div>
              </div>
              <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7, margin:'0 0 .75rem' }}>{d.desc}</p>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Indicado para</div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {d.ideal.map(p=>(
                    <span key={p} style={{ fontSize:11, padding:'2px 9px', borderRadius:100, background:d.bg, color:d.cor, fontWeight:500 }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div style={{ padding:'1rem 1.25rem', background:'var(--ab)', borderRadius:12, fontSize:12, color:'var(--am)', lineHeight:1.65 }}>
            ⚠️ Use sempre materiais estéreis. Nunca misture diluentes diferentes no mesmo vial. Descarte o frasco se houver turvação ou partículas visíveis.
          </div>
        </div>
      )}
    </div>
  );
}
