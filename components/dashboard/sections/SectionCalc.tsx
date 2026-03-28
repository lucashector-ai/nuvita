// @ts-nocheck
'use client';

import { useState } from 'react';

interface Peptideo {
  nome: string;
  doseComum: number;
  unidade: 'mcg'|'mg';
  via: string;
  freq: string;
}

const PEPTIDEOS_LISTA: Peptideo[] = [
  { nome:'Semaglutide',   doseComum:500,  unidade:'mcg', via:'SC', freq:'1x/semana'  },
  { nome:'AOD-9604',      doseComum:300,  unidade:'mcg', via:'SC', freq:'Diário'      },
  { nome:'Ipamorelin',    doseComum:300,  unidade:'mcg', via:'SC', freq:'1–2x/dia'   },
  { nome:'BPC-157',       doseComum:500,  unidade:'mcg', via:'SC', freq:'1–2x/dia'   },
  { nome:'CJC-1295',      doseComum:200,  unidade:'mcg', via:'SC', freq:'1–3x/semana'},
  { nome:'MK-677',        doseComum:25,   unidade:'mg',  via:'Oral','freq':'1x/dia'  },
  { nome:'TB-500',        doseComum:2,    unidade:'mg',  via:'SC/IM','freq':'2x/semana'},
  { nome:'Epitalon',      doseComum:10,   unidade:'mg',  via:'SC', freq:'1x/dia'     },
  { nome:'Semax',         doseComum:600,  unidade:'mcg', via:'Intranasal', freq:'1x/dia' },
  { nome:'GHK-Cu',        doseComum:1,    unidade:'mg',  via:'SC', freq:'1x/dia'     },
  { nome:'IGF-1 LR3',     doseComum:100,  unidade:'mcg', via:'SC', freq:'Pós-treino' },
  { nome:'Personalizado', doseComum:0,    unidade:'mcg', via:'SC', freq:''           },
];

export default function SectionCalc({ peso: pesoProp }: { peso: number }) {
  const [peptideo, setPeptideo] = useState(PEPTIDEOS_LISTA[0]);
  const [frascoMg, setFrascoMg] = useState(5);
  const [aguaMl,   setAguaMl]   = useState(2);
  const [doseMcg,  setDoseMcg]  = useState(PEPTIDEOS_LISTA[0].doseComum);
  const [doseUnidade, setDoseUnidade] = useState<'mcg'|'mg'>(PEPTIDEOS_LISTA[0].unidade);
  const [peso,     setPeso]     = useState(pesoProp || 75);
  const [salvos,   setSalvos]   = useState<Array<{nome:string;config:string}>>([]);

  const selecionarPeptideo = (nome: string) => {
    const p = PEPTIDEOS_LISTA.find(x=>x.nome===nome) || PEPTIDEOS_LISTA[0];
    setPeptideo(p);
    if (p.doseComum > 0) setDoseMcg(p.doseComum);
    setDoseUnidade(p.unidade);
  };

  // Cálculos principais
  const frascoEmMcg    = frascoMg * 1000;
  const concentracaoMcgMl = frascoEmMcg / aguaMl;
  const doseEmMcg      = doseUnidade === 'mg' ? doseMcg * 1000 : doseMcg;
  const volumeUl       = doseEmMcg / concentracaoMcgMl * 1000;
  const volumeMl       = doseEmMcg / concentracaoMcgMl;
  const unidadesSer    = volumeUl / 10;
  const dosesTotal     = Math.floor(frascoEmMcg / doseEmMcg);

  const formatarValor = (v: number, dec=1) => isNaN(v)||!isFinite(v)?'—':v.toFixed(dec);

  const salvarConfig = () => {
    const config = `${frascoMg}mg em ${aguaMl}ml → ${formatarValor(volumeUl,0)}UI (${formatarValor(doseEmMcg/1000,2)}mg/dose)`;
    setSalvos(p => [{ nome:peptideo.nome, config }, ...p.slice(0,4)]);
  };

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Calculadora de doses</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Calcule o volume correto de injeção com base no frasco e dose desejada</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', alignItems:'start' }}>

        {/* Configuração */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Selecionar peptídeo */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Peptídeo</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {PEPTIDEOS_LISTA.map(p => (
                <div key={p.nome} onClick={() => selecionarPeptideo(p.nome)}
                  style={{ padding:'5px 11px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .13s', background:peptideo.nome===p.nome?'var(--dark)':'var(--bg2)', color:peptideo.nome===p.nome?'white':'var(--tm)', border:`1px solid ${peptideo.nome===p.nome?'var(--dark)':'var(--border)'}` }}>
                  {p.nome}
                </div>
              ))}
            </div>
          </div>

          {/* Frasco */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Frasco</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>Quantidade do frasco (mg)</label>
                <input className="inp" type="number" step="0.5" min="0.5" value={frascoMg} onChange={e=>setFrascoMg(Number(e.target.value))} style={{ marginBottom:0 }}/>
                <div style={{ fontSize:10, color:'var(--ts)', marginTop:3 }}>= {frascoMg*1000} mcg total</div>
              </div>
              <div>
                <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>Água bacteriostática (ml)</label>
                <input className="inp" type="number" step="0.5" min="0.5" value={aguaMl} onChange={e=>setAguaMl(Number(e.target.value))} style={{ marginBottom:0 }}/>
                <div style={{ fontSize:10, color:'var(--ts)', marginTop:3 }}>= {formatarValor(concentracaoMcgMl,0)} mcg/ml</div>
              </div>
            </div>
          </div>

          {/* Dose desejada */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Dose por aplicação</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'end' }}>
              <div>
                <label style={{ fontSize:12, color:'var(--tm)', display:'block', marginBottom:4 }}>Dose desejada</label>
                <input className="inp" type="number" step={doseUnidade==='mg'?0.1:25} min="0" value={doseMcg} onChange={e=>setDoseMcg(Number(e.target.value))} style={{ marginBottom:0 }}/>
              </div>
              <div style={{ display:'flex', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--border)', overflow:'hidden', marginBottom:0 }}>
                {(['mcg','mg'] as const).map(u=>(
                  <button key={u} onClick={()=>setDoseUnidade(u)}
                    style={{ padding:'8px 12px', background:doseUnidade===u?'var(--dark)':'transparent', color:doseUnidade===u?'white':'var(--tm)', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:500 }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            {peptideo.doseComum > 0 && (
              <div style={{ fontSize:11, color:'var(--ts)', marginTop:6 }}>
                Dose comum: {peptideo.doseComum} {peptideo.unidade} · {peptideo.freq}
              </div>
            )}
          </div>
        </div>

        {/* Resultado */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Resultado principal */}
          <div style={{ background:'var(--dark)', borderRadius:14, padding:'1.5rem', color:'white' }}>
            <div style={{ fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'.1em', opacity:.6, marginBottom:'1rem' }}>Resultado</div>

            <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'3.5rem', fontWeight:500, letterSpacing:'-.06em', lineHeight:1 }}>
                {formatarValor(volumeUl, 0)}
              </div>
              <div style={{ fontSize:16, opacity:.7, marginTop:4 }}>UI (unidades de insulina)</div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Volume em ml',      val:`${formatarValor(volumeMl, 3)} ml` },
                { label:'Volume em µl',      val:`${formatarValor(volumeUl, 1)} µl` },
                { label:'Concentração',      val:`${formatarValor(concentracaoMcgMl, 0)} mcg/ml` },
                { label:'Doses no frasco',   val:`${dosesTotal} doses` },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,.1)', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, opacity:.6, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:14, fontWeight:500 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Seringa visual */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Seringa de insulina (100UI)</div>
            <div style={{ position:'relative', height:40, background:'var(--bg2)', borderRadius:100, overflow:'hidden', marginBottom:8 }}>
              <div style={{ position:'absolute', top:0, left:0, height:'100%', width:`${Math.min(100,(volumeUl))}%`, background:'var(--green)', borderRadius:100, transition:'width .3s' }}/>
              {[10,20,30,40,50,60,70,80,90].map(t=>(
                <div key={t} style={{ position:'absolute', top:0, left:`${t}%`, width:1, height:'50%', background:'rgba(0,0,0,.1)' }}/>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--ts)' }}>
              <span>0 UI</span><span>25 UI</span><span>50 UI</span><span>75 UI</span><span>100 UI</span>
            </div>
            <div style={{ marginTop:12, fontSize:13, color:'var(--tx)', textAlign:'center', fontWeight:500 }}>
              Encha a seringa até a marca de <span style={{ color:'var(--gm)' }}>{formatarValor(volumeUl,0)} UI</span>
            </div>
          </div>

          {/* Informações do peptídeo */}
          {peptideo.doseComum > 0 && (
            <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:12, padding:'1rem 1.25rem', fontSize:12, color:'var(--gm)', lineHeight:1.65 }}>
              <div style={{ fontWeight:500, marginBottom:4 }}>{peptideo.nome}</div>
              Via: {peptideo.via} · Frequência: {peptideo.freq}
            </div>
          )}

          {/* Salvar configuração */}
          <button className="btn btn-o fw" onClick={salvarConfig} style={{ fontSize:12 }}>
            💾 Salvar esta configuração
          </button>

          {/* Configurações salvas */}
          {salvos.length > 0 && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Configurações salvas</div>
              </div>
              {salvos.map((s,i) => (
                <div key={i} style={{ padding:'10px 1.25rem', borderBottom:i<salvos.length-1?'1px solid var(--border)':'none' }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>{s.nome}</div>
                  <div style={{ fontSize:11, color:'var(--ts)' }}>{s.config}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aviso */}
      <div style={{ marginTop:'1.25rem', display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color:'var(--ts)', padding:'10px 14px', background:'var(--bg2)', borderRadius:10 }}>
        <span style={{ flexShrink:0 }}>ℹ️</span>
        <span>Use sempre seringa de insulina (100UI/ml). Use água bacteriostática estéril. Guarde o frasco reconstituído na geladeira (2–8°C). Esta calculadora tem fins educacionais.</span>
      </div>
    </div>
  );
}
