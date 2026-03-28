// @ts-nocheck
'use client';

interface Props {
  planoAtual: string;
  userId?: string | null;
  answers?: any;
  onNavigate?: (s: any) => void;
}

const PLAN_LBL = { free:'Gratuito', essencial:'Essencial', pro:'Pro ✦' };
const PLAN_COR = { free:'#888780', essencial:'#1D9E75', pro:'#7F77DD' };
const PLAN_BG  = { free:'var(--bg2)', essencial:'#E1F5EE', pro:'#EEEDFE' };

export default function SectionConta({ planoAtual, userId, answers, onNavigate }: Props) {
  const email = answers?.email || '—';
  const nome  = answers?.nome  || '—';

  return (
    <div style={{ gridColumn:'1/-1' }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.375rem' }}>Minha conta</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Assinatura, dados e histórico de pagamentos</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.25rem', alignItems:'start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Assinatura atual */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1.25rem' }}>Assinatura</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:PLAN_BG[planoAtual as keyof typeof PLAN_BG]||'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>
                  {planoAtual==='pro'?'✦':planoAtual==='essencial'?'⚡':'🆓'}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:500, color:'var(--tx)' }}>Plano {PLAN_LBL[planoAtual as keyof typeof PLAN_LBL]||planoAtual}</div>
                  <div style={{ fontSize:12, color:'var(--ts)', marginTop:2 }}>
                    {planoAtual==='free' ? 'Gratuito para sempre' : planoAtual==='essencial' ? 'R$39/mês' : 'R$79/mês'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:500, padding:'4px 12px', borderRadius:100, background:PLAN_BG[planoAtual as keyof typeof PLAN_BG]||'var(--bg2)', color:PLAN_COR[planoAtual as keyof typeof PLAN_COR]||'var(--ts)' }}>
                {planoAtual==='free'?'Ativo':planoAtual==='essencial'?'Ativo':'Ativo ✦'}
              </span>
            </div>

            {planoAtual !== 'free' && (
              <div style={{ background:'var(--bg2)', borderRadius:10, padding:'1rem', marginBottom:'1.25rem', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'var(--ts)' }}>Próxima cobrança</span>
                  <span style={{ color:'var(--tx)', fontWeight:500 }}>
                    {new Date(new Date().setMonth(new Date().getMonth()+1)).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'var(--ts)' }}>Método de pagamento</span>
                  <span style={{ color:'var(--tx)', fontWeight:500 }}>•••• 4242</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'var(--ts)' }}>Status</span>
                  <span style={{ color:'var(--gm)', fontWeight:500 }}>Em dia ✓</span>
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {planoAtual !== 'pro' && (
                <button className="btn btn-d" style={{ fontSize:13 }} onClick={() => onNavigate?.('planos')}>
                  ⚡ Ver planos disponíveis
                </button>
              )}
              {planoAtual !== 'free' && (
                <button className="btn btn-o" style={{ fontSize:13, color:'#D85A30', borderColor:'rgba(216,90,48,.2)' }}>
                  Cancelar assinatura
                </button>
              )}
            </div>
          </div>

          {/* Pagamento — Stripe (em breve) */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1.25rem' }}>Método de pagamento</div>
            {planoAtual === 'free' ? (
              <div style={{ textAlign:'center', padding:'1.5rem 0', color:'var(--ts)', fontSize:13 }}>
                Nenhum método de pagamento cadastrado.<br/>
                <span style={{ fontSize:12 }}>Adicione ao assinar um plano pago.</span>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem', background:'var(--bg2)', borderRadius:10, marginBottom:10 }}>
                  <div style={{ width:42, height:28, background:'#1A1F71', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', letterSpacing:'.05em' }}>VISA</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>•••• •••• •••• 4242</div>
                    <div style={{ fontSize:11, color:'var(--ts)' }}>Expira 12/27</div>
                  </div>
                  <span style={{ fontSize:10, background:'var(--gp)', color:'var(--gm)', padding:'2px 8px', borderRadius:100, fontWeight:500 }}>Principal</span>
                </div>
                <button className="btn btn-o" style={{ fontSize:12 }}>+ Adicionar cartão</button>
              </>
            )}
          </div>

          {/* Histórico de faturas */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Histórico de faturas</div>
            </div>
            {planoAtual === 'free' ? (
              <div style={{ padding:'2rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>
                Nenhuma fatura encontrada.
              </div>
            ) : (
              [
                { data:'28/02/2026', plano:'Plano '+PLAN_LBL[planoAtual as keyof typeof PLAN_LBL], valor:planoAtual==='pro'?'R$79,00':'R$39,00', status:'Pago' },
                { data:'28/01/2026', plano:'Plano '+PLAN_LBL[planoAtual as keyof typeof PLAN_LBL], valor:planoAtual==='pro'?'R$79,00':'R$39,00', status:'Pago' },
              ].map((f,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'1rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>{f.plano}</div>
                    <div style={{ fontSize:11, color:'var(--ts)' }}>{f.data}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{f.valor}</div>
                  <span style={{ fontSize:10, background:'var(--gp)', color:'var(--gm)', padding:'2px 8px', borderRadius:100, fontWeight:500 }}>{f.status}</span>
                  <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--ts)', fontFamily:'inherit' }}>PDF</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna lateral */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Dados pessoais */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Dados pessoais</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[['Nome', nome], ['E-mail', email], ['ID', userId?.slice(0,8)+'...'||'—']].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize:10, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:13, color:'var(--tx)', fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-o fw" style={{ marginTop:'1rem', fontSize:12 }} onClick={() => onNavigate?.('config')}>
              Editar dados
            </button>
          </div>

          {/* Aviso Stripe */}
          <div style={{ background:'var(--bg2)', border:'1px dashed var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--tm)', marginBottom:'.5rem' }}>💳 Pagamentos via Stripe</div>
            <div style={{ fontSize:11, color:'var(--ts)', lineHeight:1.65 }}>
              Em breve — integração com Stripe para cobranças automáticas, upgrade/downgrade de planos e portal do cliente.
            </div>
          </div>

          {/* Suporte */}
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
            <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Suporte</div>
            <div style={{ fontSize:12, color:'var(--tm)', lineHeight:1.65, marginBottom:'1rem' }}>Tem alguma dúvida sobre seu plano ou cobrança?</div>
            <button className="btn btn-o fw" style={{ fontSize:12 }}>Entrar em contato</button>
          </div>
        </div>
      </div>
    </div>
  );
}
