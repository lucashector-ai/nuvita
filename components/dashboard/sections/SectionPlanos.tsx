// @ts-nocheck
'use client';
import { useState } from 'react';

const PLANOS = [
  {
    id:'free', nome:'Free', preco:'Grátis', periodo:'',
    cor:'#6B7280', bg:'#F9FAFB',
    desc:'Para começar sua jornada',
    features:[
      '✓ Diagnóstico por IA',
      '✓ Protocolo personalizado',
      '✓ Biblioteca de peptídeos',
      '✓ Calendário básico',
      '✗ Coach IA',
      '✗ Ajuste automático',
      '✗ Detector de sintomas',
      '✗ Exportar PDF',
    ]
  },
  {
    id:'essencial', nome:'Essencial', preco:'R$ 47', periodo:'/mês',
    cor:'#0F6E56', bg:'#F0FDF4',
    destaque:true,
    desc:'O mais popular — tudo que você precisa',
    features:[
      '✓ Tudo do Free',
      '✓ Coach IA (perguntas ilimitadas)',
      '✓ Ajuste automático do protocolo',
      '✓ Detector de sintomas',
      '✓ Exportar PDF para médico',
      '✓ Consistência e análises',
      '✓ Rotina personalizada',
      '✗ Médico parceiro',
    ]
  },
  {
    id:'pro', nome:'Pro', preco:'R$ 97', periodo:'/mês',
    cor:'#7C3AED', bg:'#F5F3FF',
    desc:'Para quem leva a sério',
    features:[
      '✓ Tudo do Essencial',
      '✓ Conexão com médico parceiro',
      '✓ Relatórios avançados',
      '✓ Simulador de ciclos',
      '✓ Mapa de aplicação',
      '✓ Suporte prioritário',
      '✓ Acesso antecipado a novidades',
      '✓ Desconto em peptídeos parceiros',
    ]
  },
];

export default function SectionPlanos({ planoAtual, userId, onPlanChange, onNavigate }: any) {
  const [anual, setAnual] = useState(false);

  return (
    <div>
      <div style={{ marginBottom:'2rem', textAlign:'center' }}>
        <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.5rem' }}>Escolha seu plano</h2>
        <p style={{ fontSize:13, color:'var(--ts)', marginBottom:'1.25rem' }}>Comece grátis, evolua quando quiser</p>
        {/* Toggle anual/mensal */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#FFFFFF', borderRadius:100, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'4px 4px 4px 12px', border:'none' }}>
          <span style={{ fontSize:12, color:'var(--tm)' }}>Mensal</span>
          <div onClick={()=>setAnual(!anual)}
            style={{ width:36, height:20, borderRadius:100, background:anual?'var(--dark)':'var(--border)', cursor:'pointer', position:'relative', transition:'background .2s' }}>
            <div style={{ position:'absolute', top:2, left:anual?'calc(100% - 18px)':2, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s' , boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}/>
          </div>
          <span style={{ fontSize:12, color:'var(--tm)', paddingRight:8 }}>Anual <span style={{ color:'var(--gm)', fontWeight:600 }}>-20%</span></span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        {PLANOS.map(p => {
          const atual = planoAtual === p.id;
          const preco = anual && p.preco !== 'Grátis'
            ? `R$ ${Math.round(parseInt(p.preco.replace('R$ ',''))*0.8)}`
            : p.preco;
          return (
            <div key={p.id} style={{
              borderRadius:16, padding:'1.5rem',
              background: p.destaque ? 'var(--dark)' : 'var(--bg)',
              border: atual ? `2px solid ${p.cor}` : p.destaque ? 'none' : '1px solid var(--border)',
              position:'relative', transition:'transform .15s',
            }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
              {p.destaque && (
                <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:'var(--green)', color:'white', fontSize:10, fontWeight:700, padding:'2px 12px', borderRadius:100, whiteSpace:'nowrap' }}>
                  MAIS POPULAR
                </div>
              )}
              {atual && (
                <div style={{ position:'absolute', top:12, right:12, background:p.cor, color:'white', fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:100 }}>
                  ATUAL
                </div>
              )}
              <div style={{ fontSize:13, fontWeight:600, color:p.destaque?'rgba(255,255,255,.7)':'var(--ts)', marginBottom:4 }}>{p.nome}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:2, marginBottom:4 }}>
                <span style={{ fontSize:28, fontWeight:800, color:p.destaque?'white':'var(--tx)' }}>{preco}</span>
                <span style={{ fontSize:12, color:p.destaque?'rgba(255,255,255,.5)':'var(--ts)' }}>{p.periodo}{anual&&p.preco!=='Grátis'?' /mês':''}</span>
              </div>
              {anual && p.preco !== 'Grátis' && (
                <div style={{ fontSize:11, color:p.destaque?'rgba(255,255,255,.5)':'var(--ts)', marginBottom:8 }}>
                  Cobrado anualmente
                </div>
              )}
              <div style={{ fontSize:12, color:p.destaque?'rgba(255,255,255,.6)':'var(--ts)', marginBottom:'1.25rem' }}>{p.desc}</div>
              <button style={{
                width:'100%', padding:'10px', borderRadius:10, border:'none',
                background:p.destaque?'white':p.cor, color:p.destaque?'var(--dark)':'white',
                fontSize:13, fontWeight:600, cursor:atual?'default':'pointer', fontFamily:'inherit',
                opacity:atual?0.6:1,
              }}
              onClick={async () => {
                if (atual || !userId) return;
                if (p.id === 'free') {
                  if (onPlanChange) onPlanChange('free');
                  return;
                }
                // Chama AbacatePay
                const { supabase } = await import('@/lib/supabase');
                const { data: { user } } = await supabase.auth.getUser();
                const { data: perfil } = await supabase.from('usuarios').select('diagnostico').eq('id', userId).single();
                const res = await fetch('/api/pagamento', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ plano: p.id, userId, nome: perfil?.diagnostico?.nome || '', email: user?.email || '' }),
                });
                const data = await res.json();
                if (data.url) { window.location.href = data.url; } else { alert('Erro ao iniciar pagamento.'); }
                return;
                // Demonstração: muda o plano localmente e no banco
                const { supabase } = await import('@/lib/supabase');
                await supabase.from('usuarios').update({ plano: p.id }).eq('id', userId);
                if (onPlanChange) onPlanChange(p.id);
                alert('Plano ' + p.nome + ' ativado! Em produção, aqui entraria o checkout.');
              }}>
              {atual ? 'Plano atual' : p.id==='free' ? 'Começar grátis' : 'Assinar'}
              </button>
              <div style={{ marginTop:'1.25rem', display:'flex', flexDirection:'column', gap:6 }}>
                {p.features.map((f:string)=>(
                  <div key={f} style={{ fontSize:12, color:p.destaque ? (f.startsWith('✓')?'rgba(255,255,255,.85)':'rgba(255,255,255,.35)') : (f.startsWith('✓')?'var(--tx)':'var(--ts)') }}>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign:'center', marginTop:'2rem', fontSize:12, color:'var(--ts)' }}>
        Todos os planos incluem 7 dias de garantia · Cancele quando quiser · Sem taxa de cancelamento
      </div>
    </div>
  );
}
