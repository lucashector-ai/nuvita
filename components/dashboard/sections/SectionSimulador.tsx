// @ts-nocheck
'use client';

import { useState } from 'react';

const PEPTIDEOS_OPCOES = [
  { id:'semaglutide', nome:'Semaglutide', emoji:'🔥', resultadoBase:{ peso:-8, energia:+1, gordura:-12 } },
  { id:'aod9604',     nome:'AOD-9604',    emoji:'🏃', resultadoBase:{ peso:-4, energia:+1, gordura:-6  } },
  { id:'ipamorelin',  nome:'Ipamorelin',  emoji:'🌙', resultadoBase:{ peso:-2, energia:+2, gordura:-3  } },
  { id:'bpc157',      nome:'BPC-157',     emoji:'🔄', resultadoBase:{ peso:0,  energia:+1, gordura:0   } },
  { id:'mk677',       nome:'MK-677',      emoji:'💊', resultadoBase:{ peso:+3, energia:+2, gordura:-2  } },
  { id:'semax',       nome:'Semax',       emoji:'🧠', resultadoBase:{ peso:0,  energia:+2, gordura:0   } },
];

const DURACOES = [
  { val:'4sem',  label:'4 semanas',  semanas:4  },
  { val:'8sem',  label:'8 semanas',  semanas:8  },
  { val:'12sem', label:'12 semanas', semanas:12 },
  { val:'6m',    label:'6 meses',    semanas:24 },
];

const EXEMPLOS = [
  { label:'Emagrecimento rápido',   peptideos:['semaglutide','aod9604'],   dur:'8sem',  adesao:80, cor:'#1D9E75' },
  { label:'Performance e sono',     peptideos:['ipamorelin','mk677'],       dur:'12sem', adesao:85, cor:'#7F77DD' },
  { label:'Recuperação + gordura',  peptideos:['bpc157','aod9604'],         dur:'8sem',  adesao:75, cor:'#EF9F27' },
];

export default function SectionSimulador({ answers }) {
  const [selecionados, setSelecionados] = useState(['semaglutide','aod9604']);
  const [duracao,      setDuracao]      = useState('8sem');
  const [adesao,       setAdesao]       = useState(80);
  const [peso,         setPeso]         = useState(Number(answers?.peso) || 80);
  const [simulado,     setSimulado]     = useState(false);
  const [adicionado,   setAdicionado]   = useState(false);

  const toggle = (id: string) =>
    setSelecionados(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  const aplicarExemplo = (ex: any) => {
    setSelecionados(ex.peptideos);
    setDuracao(ex.dur);
    setAdesao(ex.adesao);
    setSimulado(false);
  };

  const dur = DURACOES.find(d=>d.val===duracao)!;
  const fatorAdesao  = adesao / 100;
  const fatorSemanas = dur.semanas / 8;
  const peptideosSel = PEPTIDEOS_OPCOES.filter(p=>selecionados.includes(p.id));
  const resultado = peptideosSel.reduce((acc, p) => ({
    peso:    acc.peso    + p.resultadoBase.peso    * fatorAdesao * fatorSemanas,
    energia: acc.energia + p.resultadoBase.energia * fatorAdesao,
    gordura: acc.gordura + p.resultadoBase.gordura * fatorAdesao * fatorSemanas,
  }), { peso:0, energia:0, gordura:0 });

  const pesoFinal    = Math.max(45, peso + resultado.peso).toFixed(1);
  const energiaFinal = Math.min(10, Math.max(1, 6 + resultado.energia)).toFixed(1);
  const dataFim = new Date();
  dataFim.setDate(dataFim.getDate() + dur.semanas * 7);

  return (
    <div style={{ maxWidth:700, gridColumn:'1/-1' }}>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Simulador de ciclo</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Veja a expectativa de resultado antes de começar</p>
      </div>

      {/* Exemplos rápidos */}
      <div style={{ marginBottom:'1rem' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:8 }}>Exemplos rápidos</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {EXEMPLOS.map(ex => (
            <div key={ex.label} onClick={() => aplicarExemplo(ex)}
              style={{ padding:'7px 14px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', border:`1px solid ${ex.cor}22`, background:`${ex.cor}11`, color:ex.cor, transition:'all .13s' }}
              onMouseEnter={e=>{e.currentTarget.style.background=`${ex.cor}22`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${ex.cor}11`;}}>
              {ex.label}
            </div>
          ))}
        </div>
      </div>

      {/* Configuração */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Configure o ciclo</div>

        <div style={{ marginBottom:'1.25rem' }}>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--tm)', marginBottom:8 }}>Peptídeos</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {PEPTIDEOS_OPCOES.map(p => (
              <div key={p.id} onClick={() => toggle(p.id)}
                style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .13s', background:selecionados.includes(p.id)?'var(--gp)':'var(--bg2)', color:selecionados.includes(p.id)?'var(--gm)':'var(--tm)', border:`1px solid ${selecionados.includes(p.id)?'var(--green)':'var(--border)'}` }}>
                {p.emoji} {p.nome}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:'1.25rem' }}>
          <div>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--tm)', marginBottom:8 }}>Duração</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {DURACOES.map(d => (
                <div key={d.val} onClick={() => setDuracao(d.val)}
                  style={{ padding:'5px 11px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', border:`1px solid ${duracao===d.val?'var(--green)':'var(--border)'}`, background:duracao===d.val?'#F2FCF7':'var(--bg2)', color:duracao===d.val?'var(--gm)':'var(--tm)' }}>
                  {d.label}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--tm)', marginBottom:5 }}>Peso atual — {peso} kg</div>
            <input type="range" min={40} max={200} step={1} value={peso} onChange={e=>setPeso(Number(e.target.value))} style={{ width:'100%' }}/>
          </div>
        </div>

        <div style={{ marginBottom:'1.25rem' }}>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--tm)', marginBottom:5 }}>Adesão esperada — {adesao}%</div>
          <input type="range" min={30} max={100} step={5} value={adesao} onChange={e=>setAdesao(Number(e.target.value))} style={{ width:'100%' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--ts)', marginTop:3 }}>
            <span>30% baixa</span><span>65% média</span><span>100% perfeita</span>
          </div>
        </div>

        <button className="btn btn-d fw" onClick={() => { setSimulado(true); setAdicionado(false); }}>
          🔮 Simular resultados
        </button>
      </div>

      {/* Resultado */}
      {simulado && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:'1rem' }}>
            {[
              { label:'Peso estimado final', val:`${pesoFinal} kg`, sub:`${resultado.peso<0?'':'+'}${resultado.peso.toFixed(1)} kg`, cor:resultado.peso<0?'var(--gm)':'var(--am)' },
              { label:'Gordura corporal',    val:`${resultado.gordura<0?resultado.gordura.toFixed(0):'0'}%`, sub:'variação estimada', cor:'var(--gm)' },
              { label:'Energia média',       val:`${energiaFinal}/10`, sub:'vs. baseline atual', cor:'var(--tx)' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem' }}>
                <div style={{ fontSize:10, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:'1.3rem', fontWeight:500, color:s.cor, letterSpacing:'-.04em', marginBottom:2 }}>{s.val}</div>
                <div style={{ fontSize:11, color:'var(--ts)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.875rem' }}>Fases estimadas</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:'1rem' }}>
              {[
                { fase:'Adaptação', sem:`Sem 1–${Math.round(dur.semanas*.25)}`, cor:'#EF9F27', desc:'Resultados iniciais leves' },
                { fase:'Pico',      sem:`Sem ${Math.round(dur.semanas*.25)+1}–${Math.round(dur.semanas*.75)}`, cor:'var(--green)', desc:'Maior variação de peso' },
                { fase:'Saída',     sem:`Sem ${Math.round(dur.semanas*.75)+1}–${dur.semanas}`, cor:'#7F77DD', desc:'Estabilização' },
              ].map(f => (
                <div key={f.fase} style={{ background:'var(--bg2)', borderRadius:10, padding:'10px 12px', borderLeft:`3px solid ${f.cor}` }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', marginBottom:1 }}>{f.fase}</div>
                  <div style={{ fontSize:10, color:'var(--ts)', marginBottom:4 }}>{f.sem}</div>
                  <div style={{ fontSize:11, color:'var(--tm)' }}>{f.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
              <div style={{ fontSize:12, color:'var(--ts)' }}>
                Previsão de conclusão: <strong>{dataFim.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}</strong>
              </div>
              <button className="btn btn-d" disabled={adicionado} onClick={() => setAdicionado(true)}
                style={{ fontSize:12, flexShrink:0 }}>
                {adicionado ? '✓ Adicionado ao planejamento' : '+ Adicionar ao planejamento'}
              </button>
            </div>
          </div>

          <div style={{ fontSize:11, color:'var(--ts)', background:'var(--bg2)', borderRadius:10, padding:'8px 12px' }}>
            ⚠️ Simulação baseada em dados médios. Resultados individuais variam. Fins educacionais.
          </div>
        </>
      )}
    </div>
  );
}
