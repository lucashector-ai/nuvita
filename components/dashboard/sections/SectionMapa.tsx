// @ts-nocheck
'use client';

import { useState } from 'react';

// ─── Locais de injeção SubQ ───────────────────────────────────────
const LOCAIS = [
  {
    id:'abd_dir_sup', label:'Abdômen direito superior',
    x:58, y:38, grupo:'abdomen',
    tecnica:{ angulo:'45°', profundidade:'6–13 mm', agulha:'4–8 mm (31G)', passos:['Limpe com álcool e aguarde secar','Faça uma prega de pele com dois dedos','Insira a agulha no ângulo de 45°','Injete lentamente (10 seg por 0.1 ml)','Solte a prega, retire e pressione levemente'] }
  },
  {
    id:'abd_esq_sup', label:'Abdômen esquerdo superior',
    x:42, y:38, grupo:'abdomen',
    tecnica:{ angulo:'45°', profundidade:'6–13 mm', agulha:'4–8 mm (31G)', passos:['Limpe com álcool e aguarde secar','Faça uma prega de pele com dois dedos','Insira a agulha no ângulo de 45°','Injete lentamente','Solte a prega, retire e pressione'] }
  },
  {
    id:'abd_dir_inf', label:'Abdômen direito inferior',
    x:58, y:47, grupo:'abdomen',
    tecnica:{ angulo:'45°', profundidade:'6–13 mm', agulha:'4–8 mm (31G)', passos:['Evite 5 cm ao redor do umbigo','Limpe com álcool','Faça uma prega de pele','Insira a 45°','Injete e retire suavemente'] }
  },
  {
    id:'abd_esq_inf', label:'Abdômen esquerdo inferior',
    x:42, y:47, grupo:'abdomen',
    tecnica:{ angulo:'45°', profundidade:'6–13 mm', agulha:'4–8 mm (31G)', passos:['Evite 5 cm ao redor do umbigo','Limpe com álcool','Faça uma prega de pele','Insira a 45°','Injete e retire suavemente'] }
  },
  {
    id:'coxa_dir_ext', label:'Coxa direita externa',
    x:62, y:63, grupo:'coxas',
    tecnica:{ angulo:'90°', profundidade:'8–13 mm', agulha:'6–8 mm (29–31G)', passos:['Use a face externa da coxa (terço médio)','Relaxe o músculo — sente-se','Limpe e aguarde secar','Insira a 90° sem prega','Injete lento e retire'] }
  },
  {
    id:'coxa_esq_ext', label:'Coxa esquerda externa',
    x:38, y:63, grupo:'coxas',
    tecnica:{ angulo:'90°', profundidade:'8–13 mm', agulha:'6–8 mm (29–31G)', passos:['Use a face externa da coxa (terço médio)','Relaxe o músculo — sente-se','Limpe e aguarde secar','Insira a 90° sem prega','Injete lento e retire'] }
  },
  {
    id:'braco_dir', label:'Braço direito (tríceps)',
    x:72, y:33, grupo:'bracos',
    tecnica:{ angulo:'45–90°', profundidade:'6–10 mm', agulha:'4–6 mm (31G)', passos:['Use a face posterior do braço (tríceps)','Peça ajuda ou use espelho','Limpe com álcool','Insira no ângulo correto','Injete e pressione levemente'] }
  },
  {
    id:'braco_esq', label:'Braço esquerdo (tríceps)',
    x:28, y:33, grupo:'bracos',
    tecnica:{ angulo:'45–90°', profundidade:'6–10 mm', agulha:'4–6 mm (31G)', passos:['Use a face posterior do braço (tríceps)','Peça ajuda ou use espelho','Limpe com álcool','Insira no ângulo correto','Injete e pressione levemente'] }
  },
  {
    id:'gluteo_dir', label:'Glúteo direito',
    x:60, y:55, grupo:'gluteos',
    tecnica:{ angulo:'90°', profundidade:'10–15 mm', agulha:'8 mm (29G)', passos:['Use o quadrante superior externo','Deite de lado ou fique em pé','Limpe e aguarde secar','Insira perpendicular à pele','Injete lentamente'] }
  },
  {
    id:'gluteo_esq', label:'Glúteo esquerdo',
    x:40, y:55, grupo:'gluteos',
    tecnica:{ angulo:'90°', profundidade:'10–15 mm', agulha:'8 mm (29G)', passos:['Use o quadrante superior externo','Deite de lado ou fique em pé','Limpe e aguarde secar','Insira perpendicular à pele','Injete lentamente'] }
  },
];

const GRUPO_COR = {
  abdomen: '#1D9E75',
  coxas:   '#378ADD',
  bracos:  '#7F77DD',
  gluteos: '#EF9F27',
};
const GRUPO_LABEL = {
  abdomen:'Abdômen',
  coxas:'Coxas',
  bracos:'Braços',
  gluteos:'Glúteos',
};

const DIAS_SEMANA = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

// Sugestão de rotação automática
function sugerirProximo(historico) {
  const contagem = {};
  LOCAIS.forEach(l => { contagem[l.id] = 0; });
  historico.forEach(h => { if (contagem[h.local] !== undefined) contagem[h.local]++; });
  return LOCAIS.sort((a,b) => contagem[a.id] - contagem[b.id])[0];
}

export default function SectionMapa() {
  const [localAtivo,  setLocalAtivo]  = useState(null);
  const [historico,   setHistorico]   = useState([]);
  const [semana,      setSemana]      = useState(0); // índice do dia desta semana
  const [grupoFiltro, setGrupoFiltro] = useState('todos');
  const [aba,         setAba]         = useState('mapa');

  const local = LOCAIS.find(l => l.id === localAtivo);
  const proximo = sugerirProximo(historico);

  const registrarAplicacao = (localId) => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    setHistorico(h => [...h, { local: localId, data: hoje, dia: semana }]);
  };

  const filtrados = grupoFiltro === 'todos' ? LOCAIS : LOCAIS.filter(l => l.grupo === grupoFiltro);

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Mapa de Aplicação</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Locais de injeção subcutânea com técnica detalhada e diário de rotação semanal</p>
      </div>

      {/* Abas */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.5rem' }}>
        {[['mapa','🗺️ Mapa corporal'],['rotacao','📅 Rotação semanal'],['tecnica','💉 Técnica']].map(([v,l])=>(
          <button key={v} onClick={()=>setAba(v)}
            style={{ padding:'10px 18px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:aba===v?'var(--tx)':'var(--ts)', borderBottom:aba===v?'2px solid var(--green)':'2px solid transparent', flexShrink:0 }}>
            {l}
          </button>
        ))}
      </div>

      {/* ─── ABA MAPA ─────────────────────────────────── */}
      {aba==='mapa' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.25rem', alignItems:'start' }}>
          {/* Silhueta */}
          <div>
            {/* Filtro por grupo */}
            <div style={{ display:'flex', gap:6, marginBottom:'1rem', flexWrap:'wrap' }}>
              {[['todos','Todos'],['abdomen','Abdômen'],['coxas','Coxas'],['bracos','Braços'],['gluteos','Glúteos']].map(([v,l])=>(
                <button key={v} onClick={()=>setGrupoFiltro(v)}
                  style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', border:`1px solid ${grupoFiltro===v?'var(--green)':'var(--border)'}`, background:grupoFiltro===v?'var(--gp)':'var(--bg2)', color:grupoFiltro===v?'var(--gm)':'var(--tm)', fontFamily:'inherit', transition:'all .13s' }}>
                  {l}
                </button>
              ))}
            </div>

            {/* SVG do corpo */}
            <div className="dc" style={{ padding:'1.5rem', display:'flex', justifyContent:'center' }}>
              <svg viewBox="0 0 100 100" style={{ width:'100%', maxWidth:320, userSelect:'none' }}>
                {/* Silhueta — forma simplificada do corpo */}
                {/* Cabeça */}
                <ellipse cx="50" cy="10" rx="7" ry="8" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>
                {/* Pescoço */}
                <rect x="47" y="17" width="6" height="4" rx="1" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>
                {/* Torso */}
                <rect x="33" y="21" width="34" height="28" rx="4" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>
                {/* Braço direito */}
                <rect x="67" y="22" width="10" height="24" rx="4" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>
                {/* Braço esquerdo */}
                <rect x="23" y="22" width="10" height="24" rx="4" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>
                {/* Cintura/quadril */}
                <rect x="36" y="47" width="28" height="10" rx="3" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>
                {/* Perna direita */}
                <rect x="51" y="55" width="12" height="30" rx="4" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>
                {/* Perna esquerda */}
                <rect x="37" y="55" width="12" height="30" rx="4" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>

                {/* Pés */}
                <ellipse cx="57" cy="86" rx="6" ry="3" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>
                <ellipse cx="43" cy="86" rx="6" ry="3" fill="var(--bg2)" stroke="var(--border)" strokeWidth="0.5"/>

                {/* Pontos de injeção */}
                {LOCAIS.filter(l => grupoFiltro==='todos' || l.grupo===grupoFiltro).map(l => {
                  const cor = GRUPO_COR[l.grupo];
                  const ativo = localAtivo === l.id;
                  const usadoHoje = historico.some(h => h.local === l.id && h.dia === semana);
                  const eProximo = proximo?.id === l.id;
                  return (
                    <g key={l.id} onClick={() => setLocalAtivo(ativo ? null : l.id)} style={{ cursor:'pointer' }}>
                      {/* Anel pulsante para próximo sugerido */}
                      {eProximo && !usadoHoje && (
                        <circle cx={l.x} cy={l.y} r="4.5" fill="none" stroke={cor} strokeWidth="1" opacity="0.4">
                          <animate attributeName="r" values="4.5;6.5;4.5" dur="2s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
                        </circle>
                      )}
                      <circle
                        cx={l.x} cy={l.y} r={ativo?4:3}
                        fill={usadoHoje?'var(--border)':ativo?cor:`${cor}CC`}
                        stroke={ativo?cor:usadoHoje?'var(--ts)':'white'}
                        strokeWidth={ativo?1.5:0.8}
                        style={{ transition:'all .2s' }}
                      />
                      {usadoHoje && (
                        <text x={l.x} y={l.y+0.5} textAnchor="middle" dominantBaseline="middle" fontSize="3" fill="var(--ts)">✓</text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legenda */}
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginTop:'1rem' }}>
              {Object.entries(GRUPO_COR).map(([g,c])=>(
                <div key={g} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--tm)' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:c }}/>
                  {GRUPO_LABEL[g]}
                </div>
              ))}
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--tm)' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--border)', border:'1px solid var(--ts)' }}/>
                Já aplicado hoje
              </div>
            </div>
          </div>

          {/* Painel lateral */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* Próxima sugestão */}
            {proximo && (
              <div className="dc" style={{ borderLeft:`3px solid ${GRUPO_COR[proximo.grupo]}`, marginBottom:0 }}>
                <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.5rem' }}>Próxima sugestão</div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:4 }}>{proximo.label}</div>
                <div style={{ fontSize:11, color:'var(--ts)', marginBottom:'.75rem' }}>Menos usado recentemente</div>
                <button onClick={()=>{ setLocalAtivo(proximo.id); registrarAplicacao(proximo.id); }}
                  style={{ width:'100%', padding:'8px', background:`${GRUPO_COR[proximo.grupo]}`, color:'white', border:'none', borderRadius:9, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
                  ✓ Registrar aplicação aqui
                </button>
              </div>
            )}

            {/* Detalhe do local selecionado */}
            {local ? (
              <div className="dc" style={{ marginBottom:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background:GRUPO_COR[local.grupo], flexShrink:0 }}/>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{local.label}</div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:'1rem' }}>
                  {[
                    ['Ângulo', local.tecnica.angulo],
                    ['Profundidade', local.tecnica.profundidade],
                    ['Agulha', local.tecnica.agulha],
                    ['Grupo', GRUPO_LABEL[local.grupo]],
                  ].map(([l,v])=>(
                    <div key={l} style={{ background:'#FFFFFF', borderRadius:9, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'8px 10px' }}>
                      <div style={{ fontSize:9, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                <button onClick={()=>registrarAplicacao(local.id)}
                  style={{ width:'100%', padding:'9px', background:'var(--green)', color:'white', border:'none', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', marginBottom:'1rem' }}>
                  ✓ Marcar como aplicado hoje
                </button>

                <div style={{ fontSize:11, fontWeight:600, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>Passos</div>
                {local.tecnica.passos.map((p,i)=>(
                  <div key={i} style={{ display:'flex', gap:8, fontSize:12, color:'var(--tm)', marginBottom:6, lineHeight:1.5 }}>
                    <span style={{ color:'var(--green)', fontWeight:600, flexShrink:0 }}>{i+1}.</span>{p}
                  </div>
                ))}
              </div>
            ) : (
              <div className="dc" style={{ marginBottom:0 }}>
                <div style={{ fontSize:13, color:'var(--ts)', textAlign:'center', padding:'1rem 0', lineHeight:1.7 }}>
                  Toque em um ponto do corpo para ver a técnica detalhada e registrar a aplicação.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ABA ROTAÇÃO SEMANAL ─────────────────────── */}
      {aba==='rotacao' && (
        <div>
          <div style={{ fontSize:13, color:'var(--tm)', marginBottom:'1.25rem' }}>
            Rotacionar os locais de injeção previne lipodistrofia e melhora a absorção. Idealmente espaçar pelo menos 2–3 cm entre aplicações consecutivas na mesma região.
          </div>

          {/* Grade semanal */}
          <div className="dc" style={{ marginBottom:'1rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Esta semana</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
              {DIAS_SEMANA.map((d,i)=>{
                const appsHoje = historico.filter(h => h.dia === i);
                const ehHoje = i === semana;
                return (
                  <div key={d} onClick={()=>setSemana(i)}
                    style={{ borderRadius:10, padding:'8px 4px', textAlign:'center', cursor:'pointer', border:`1px solid ${ehHoje?'var(--green)':'var(--border)'}`, background:ehHoje?'var(--gp)':'var(--bg2)', transition:'all .15s' }}>
                    <div style={{ fontSize:10, fontWeight:600, color:ehHoje?'var(--gm)':'var(--ts)', marginBottom:4 }}>{d}</div>
                    {appsHoje.length > 0 ? (
                      appsHoje.map((a,j)=>(
                        <div key={j} style={{ width:8, height:8, borderRadius:'50%', background:GRUPO_COR[LOCAIS.find(l=>l.id===a.local)?.grupo]||'var(--green)', margin:'2px auto' }}/>
                      ))
                    ) : (
                      <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--border)', margin:'2px auto' }}/>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Histórico */}
          {historico.length > 0 ? (
            <div className="dc" style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Histórico de aplicações</div>
              {historico.slice().reverse().map((h,i)=>{
                const loc = LOCAIS.find(l=>l.id===h.local);
                if (!loc) return null;
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'0.5px solid var(--border)' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:GRUPO_COR[loc.grupo], flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{loc.label}</div>
                      <div style={{ fontSize:11, color:'var(--ts)' }}>{DIAS_SEMANA[h.dia]} · {h.data}</div>
                    </div>
                    <span style={{ fontSize:10, padding:'2px 7px', borderRadius:100, background:`${GRUPO_COR[loc.grupo]}20`, color:GRUPO_COR[loc.grupo], fontWeight:500 }}>{GRUPO_LABEL[loc.grupo]}</span>
                  </div>
                );
              })}
              <button onClick={()=>setHistorico([])}
                style={{ marginTop:'1rem', padding:'7px 14px', background:'none', border:'none', borderRadius:8, fontSize:12, color:'var(--ts)', cursor:'pointer', fontFamily:'inherit' }}>
                Limpar histórico
              </button>
            </div>
          ) : (
            <div className="dc" style={{ textAlign:'center', padding:'2rem', color:'var(--ts)', fontSize:13 }}>
              Nenhuma aplicação registrada ainda. Vá ao mapa e marque os locais usados.
            </div>
          )}

          {/* Regras de rotação */}
          <div className="dc" style={{ marginBottom:0 }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Regras de rotação</div>
            {[
              ['Espaçamento mínimo', 'Ao menos 2–3 cm entre aplicações na mesma região'],
              ['Rotação de grupos', 'Alterne abdômen → coxas → braços → glúteos sistematicamente'],
              ['Intervalo mínimo', 'Espere 7 dias antes de voltar ao mesmo ponto exato'],
              ['Sinais de alerta', 'Nódulos, vermelhidão persistente ou lipohipertrofia: pule o local'],
              ['Temperatura', 'Peptídeos frios causam mais desconforto — deixe atingir temperatura ambiente'],
            ].map(([t,d],i)=>(
              <div key={i} style={{ display:'flex', gap:10, marginBottom:10, lineHeight:1.5 }}>
                <span style={{ color:'var(--green)', fontWeight:600, flexShrink:0, fontSize:13 }}>✓</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{t}</div>
                  <div style={{ fontSize:11, color:'var(--ts)' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ABA TÉCNICA ─────────────────────────────── */}
      {aba==='tecnica' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Passo a passo geral */}
          <div className="dc" style={{ marginBottom:0 }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Técnica geral de injeção SubQ</div>
            {[
              { n:'01', t:'Prepare o material', d:'Seringa, agulha nova, álcool 70%, algodão ou gaze. Lave as mãos por 20 segundos.' },
              { n:'02', t:'Reconstitua o peptídeo', d:'Adicione a água bacteriostática devagar pela parede do vial. Não agite — gire suavemente.' },
              { n:'03', t:'Aspire a dose', d:'Inverta o vial, insira a agulha e aspire a quantidade calculada. Remova bolhas.' },
              { n:'04', t:'Escolha o local', d:'Siga a rotação semanal. Evite locais com hematomas, nódulos ou irritação.' },
              { n:'05', t:'Limpe a pele', d:'Álcool 70% em movimento circular. Aguarde 30 segundos secar completamente.' },
              { n:'06', t:'Injete', d:'Faça uma prega (abdômen/braços) ou aplique sem prega (coxas). Insira no ângulo correto. Injete lentamente — 10 segundos por 0.1 ml.' },
              { n:'07', t:'Finalize', d:'Retire a agulha no mesmo ângulo. Pressione com algodão por 30 segundos. Não esfregue.' },
              { n:'08', t:'Descarte corretamente', d:'Agulhas em coletor perfurocortante. Nunca reutilize agulhas.' },
            ].map((s,i)=>(
              <div key={i} style={{ display:'flex', gap:12, marginBottom:'1rem', paddingBottom:'1rem', borderBottom: i<7?'0.5px solid var(--border)':'none' }}>
                <div style={{ width:32, height:32, borderRadius:10, background:'var(--gp)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--gm)', flexShrink:0 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:3 }}>{s.t}</div>
                  <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.65 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Erros comuns */}
          <div className="dc" style={{ marginBottom:0 }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'#D85A30', marginBottom:'1rem' }}>Erros mais comuns</div>
            {[
              ['Injetar frio', 'O peptídeo saiu direto da geladeira — causa mais dor e pode afetar absorção'],
              ['Ângulo incorreto', 'Muito vertical no abdômen com pouco tecido adiposo pode atingir músculo'],
              ['Agulha reutilizada', 'A ponta fica danificada após 1 uso — causa mais dor e risco de infecção'],
              ['Álcool ainda úmido', 'Injeta antes de o álcool secar — pode causar ardência e contaminar'],
              ['Sem rotação', 'Aplicar sempre no mesmo ponto causa lipodistrofia e reduz absorção'],
            ].map(([t,d],i)=>(
              <div key={i} style={{ display:'flex', gap:10, marginBottom:10 }}>
                <span style={{ color:'#D85A30', fontWeight:700, flexShrink:0, fontSize:13 }}>×</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)' }}>{t}</div>
                  <div style={{ fontSize:11, color:'var(--ts)', lineHeight:1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
