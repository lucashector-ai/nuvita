// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OBJECTIVE_LABELS, DURACAO_LABELS, NIVEL_LABELS } from '@/types';

// ─── Ícones SVG inline ───────────────────────────────────
const IcoGeral = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IcoConta = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><line x1="12" y1="12" x2="12" y2="16"/><circle cx="12" cy="12" r="1"/>
  </svg>
);
const IcoPriv = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcoBill = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────
const CARD: any = {
  background:'white', borderRadius:14, padding:'1.5rem',
  boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', marginBottom:'1rem',
};
const DIV = { borderTop:'1px solid #F3F4F6', margin:'1rem 0' };
const PLAN_COR: Record<string,string> = { free:'#6B7280', essencial:'#0F6E56', pro:'#7C3AED' };
const PLAN_LABEL: Record<string,string> = { free:'Gratuito', essencial:'Essencial', pro:'Pro ✦' };

function Toggle({ value, onChange }: any) {
  return (
    <div onClick={() => onChange(!value)}
      style={{ width:40, height:22, borderRadius:100, background:value?'#0F6E56':'#D1D5DB',
        cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:value?'calc(100% - 19px)':3,
        width:16, height:16, borderRadius:'50%', background:'white',
        transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
    </div>
  );
}

function Row({ label, desc, children }: any) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, padding:'10px 0' }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:500, color:'#111827' }}>{label}</div>
        {desc && <div style={{ fontSize:12, color:'#9CA3AF', marginTop:2, lineHeight:1.4 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function SectionConfig({ answers, plan, userId, onNavigate }: any) {
  const [aba, setAba] = useState<'geral'|'conta'|'privacidade'|'cobranca'>('geral');

  // Estado geral
  const [nome, setNome]           = useState('');
  const [nomeEdit, setNomeEdit]   = useState('');
  const [editNome, setEditNome]   = useState(false);
  const [email, setEmail]         = useState('');
  const [userId_, setUserId_]     = useState('');
  const [membro, setMembro]       = useState('');
  const [notifEmail, setNotifEmail]   = useState(true);
  const [notifPush, setNotifPush]     = useState(true);
  const [notifSemanal, setNotifSemanal] = useState(true);
  const [salvando, setSalvando]   = useState(false);
  const [salvo, setSalvo]         = useState(false);

  // Estado conta
  const [excluindo, setExcluindo]   = useState(false);
  const [confirmEx, setConfirmEx]   = useState('');

  // Estado cobrança
  const [faturas, setFaturas]         = useState<any[]>([]);
  const [loadFaturas, setLoadFaturas] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // ─ Carrega dados do usuário ─
  useEffect(() => {
    (async () => {
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');
      setUserId_(user.id);
      const d = new Date(user.created_at);
      setMembro(d.toLocaleDateString('pt-BR', { month:'long', year:'numeric' }));
      const { data: perfil } = await supabase.from('usuarios').select('nome, diagnostico').eq('id', user.id).maybeSingle();
      const n = perfil?.nome || answers?.nome || '';
      setNome(n); setNomeEdit(n);
      const prefs = perfil?.diagnostico?._preferencias || {};
      setNotifEmail(prefs.notifEmail !== false);
      setNotifPush(prefs.notifPush !== false);
      setNotifSemanal(prefs.notifSemanal !== false);
    })();
  }, []);

  // ─ Carrega faturas quando entra na aba ─
  useEffect(() => {
    if (aba !== 'cobranca' || !userId_) return;
    (async () => {
      setLoadFaturas(true);
      const { data } = await supabase.from('pagamentos').select('*').eq('user_id', userId_).order('created_at', { ascending:false }).limit(12);
      setFaturas(data || []);
      setLoadFaturas(false);
    })();
  }, [aba, userId_]);

  // ─ Salva preferências gerais ─
  const salvarGeral = async () => {
    setSalvando(true);
    const updates: any = {};
    if (editNome && nomeEdit.trim() && nomeEdit !== nome) {
      updates.nome = nomeEdit.trim();
      setNome(nomeEdit.trim());
    }
    const { data: perfil } = await supabase.from('usuarios').select('diagnostico').eq('id', userId_).maybeSingle();
    const diagAtual = perfil?.diagnostico || {};
    await supabase.from('usuarios').update({
      ...updates,
      diagnostico: { ...diagAtual, _preferencias: { notifEmail, notifPush, notifSemanal } }
    }).eq('id', userId_);
    setSalvando(false); setSalvo(true); setEditNome(false);
    setTimeout(() => setSalvo(false), 2500);
  };

  // ─ Portal Stripe ─
  const abrirPortal = async () => {
    setPortalLoading(true);
    const res = await fetch('/api/stripe', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ userId:userId_ }) });
    const data = await res.json();
    setPortalLoading(false);
    if (data.url) window.location.href = data.url;
    else alert('Erro ao abrir portal: ' + (data.error || 'tente novamente'));
  };

  // ─ Logout ─
  const logout = async () => { await supabase.auth.signOut(); window.location.href = '/cadastro'; };

  // ─ Excluir conta ─
  const excluirConta = async () => {
    if (confirmEx !== 'EXCLUIR') return;
    const { error } = await supabase.rpc('delete_own_account');
    if (error) { alert('Erro: ' + error.message); return; }
    await supabase.auth.signOut();
    window.location.href = '/cadastro';
  };

  // ─ Dados do protocolo ─
  const objs = answers?.q3 || [];
  const objLabel = objs.map((o: string) => OBJECTIVE_LABELS?.[o] || o).join(', ') || '—';
  const nivelLabel = NIVEL_LABELS?.[answers?.q4] || answers?.q4 || '—';
  const duracaoLabel = DURACAO_LABELS?.[answers?.q9] || answers?.q9 || '—';
  const inicial = nome?.charAt(0)?.toUpperCase() || '?';

  // ─ Aba styles ─
  const tabStyle = (ativo: boolean): any => ({
    display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
    borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
    fontSize:13, fontWeight:ativo?600:400, transition:'all .15s',
    background:ativo?'#111827':'transparent',
    color:ativo?'white':'#6B7280',
  });

  return (
    <div style={{ maxWidth:640 }}>
      {/* Header */}
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:600, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Configurações</h2>
        <p style={{ fontSize:13, color:'#6B7280' }}>Gerencie sua conta e preferências</p>
      </div>

      {/* Abas com SVG */}
      <div style={{ display:'flex', gap:4, background:'#F3F4F6', borderRadius:10, padding:4, marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {([
          { id:'geral',       label:'Geral',      Icon:IcoGeral },
          { id:'conta',       label:'Conta',      Icon:IcoConta },
          { id:'privacidade', label:'Privacidade', Icon:IcoPriv },
          { id:'cobranca',    label:'Cobrança',   Icon:IcoBill },
        ] as const).map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setAba(id)} style={tabStyle(aba===id)}>
            <Icon />{label}
          </button>
        ))}
      </div>

      {/* ══════ ABA GERAL ══════ */}
      {aba==='geral' && <>
        {/* Avatar + Nome (igual SectionPerfil) */}
        <div style={{ ...CARD, display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ width:68, height:68, borderRadius:'50%', background:'#111827', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontSize:26, fontWeight:700, color:'white' }}>{inicial}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
              {editNome ? (
                <input value={nomeEdit} onChange={e => setNomeEdit(e.target.value)}
                  autoFocus onKeyDown={e => e.key==='Enter' && salvarGeral()}
                  style={{ fontSize:15, fontWeight:500, padding:'6px 10px', borderRadius:8, border:'1.5px solid #E5E7EB', fontFamily:'inherit', outline:'none', width:200 }}/>
              ) : (
                <span style={{ fontSize:16, fontWeight:600, color:'#111827' }}>{nome || '—'}</span>
              )}
              <span style={{ fontSize:11, fontWeight:600, padding:'2px 10px', borderRadius:100,
                background:plan==='pro'?'#F5F3FF':plan==='essencial'?'#F0FDF4':'#F3F4F6',
                color:PLAN_COR[plan]||'#6B7280' }}>{PLAN_LABEL[plan]||'Gratuito'}</span>
            </div>
            <div style={{ fontSize:13, color:'#6B7280' }}>{email}</div>
            {membro && <div style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>Membro desde {membro}</div>}
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            {editNome ? (
              <>
                <button onClick={salvarGeral} style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'none', background:'#111827', color:'white', cursor:'pointer', fontFamily:'inherit' }}>
                  {salvando?'...':'Salvar'}
                </button>
                <button onClick={() => { setEditNome(false); setNomeEdit(nome); }} style={{ fontSize:12, padding:'6px 10px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#6B7280' }}>✕</button>
              </>
            ) : (
              <button onClick={() => setEditNome(true)} style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>
                ✎ Editar
              </button>
            )}
          </div>
        </div>

        {/* Stats do protocolo (igual SectionPerfil) */}
        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Protocolo atual</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              { ico:'🎯', lbl:'Objetivo',     val:objLabel },
              { ico:'📊', lbl:'Nível',        val:nivelLabel },
              { ico:'⚖️', lbl:'Peso',         val:answers?.peso ? answers.peso+' kg' : '—' },
              { ico:'📅', lbl:'Duração',      val:duracaoLabel },
              { ico:'🧬', lbl:'Sexo',         val:answers?.sexo==='M'?'Masculino':answers?.sexo==='F'?'Feminino':'—' },
              { ico:'📏', lbl:'Altura',       val:answers?.altura ? answers.altura+' cm' : '—' },
            ].map(({ ico, lbl, val }) => (
              <div key={lbl} style={{ background:'#F9FAFB', borderRadius:10, padding:'10px 12px' }}>
                <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:3 }}>{ico} {lbl}</div>
                <div style={{ fontSize:13, fontWeight:500, color:'#111827' }}>{val}</div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate && onNavigate('protocolo')} style={{ marginTop:'1rem', width:'100%', padding:'9px', borderRadius:10, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'#374151' }}>
            Ver protocolo completo →
          </button>
          <button onClick={() => window.location.href='/diagnostico'} style={{ marginTop:8, width:'100%', padding:'9px', borderRadius:10, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'#374151' }}>
            🔄 Refazer diagnóstico →
          </button>
        </div>

        {/* Notificações */}
        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Notificações</div>
          <Row label="E-mails de protocolo" desc="Lembretes e dicas por email"><Toggle value={notifEmail} onChange={setNotifEmail}/></Row>
          <div style={DIV}/>
          <Row label="Notificações no app" desc="Alertas dentro da plataforma"><Toggle value={notifPush} onChange={setNotifPush}/></Row>
          <div style={DIV}/>
          <Row label="Resumo semanal" desc="Relatório de progresso toda segunda"><Toggle value={notifSemanal} onChange={setNotifSemanal}/></Row>
        </div>

        <button onClick={salvarGeral} disabled={salvando} style={{ width:'100%', padding:'12px', borderRadius:12, border:'none', background:salvo?'#0F6E56':'#111827', color:'white', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'background .2s' }}>
          {salvando?'Salvando...':salvo?'✓ Salvo com sucesso':'Salvar preferências'}
        </button>
      </>}

      {/* ══════ ABA CONTA ══════ */}
      {aba==='conta' && <>
        {/* Info (igual SectionConta) */}
        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Informações da conta</div>
          <Row label="E-mail" desc="Usado para login e notificações"><span style={{ fontSize:13, fontWeight:500, color:'#111827' }}>{email}</span></Row>
          <div style={DIV}/>
          <Row label="ID da conta"><code style={{ fontSize:11, color:'#9CA3AF', background:'#F3F4F6', padding:'3px 8px', borderRadius:6 }}>{userId_?.substring(0,20)}...</code></Row>
          <div style={DIV}/>
          <Row label="Membro desde"><span style={{ fontSize:13, color:'#6B7280' }}>{membro}</span></Row>
          <div style={DIV}/>
          <Row label="Método de login"><span style={{ fontSize:13, color:'#6B7280' }}>Google / E-mail</span></Row>
          <div style={DIV}/>
          <Row label="Plano"><span style={{ fontSize:13, fontWeight:600, color:PLAN_COR[plan]||'#6B7280' }}>{PLAN_LABEL[plan]||'Gratuito'}</span></Row>
        </div>

        {/* Sessão */}
        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Sessão</div>
          <Row label="Dispositivo atual" desc="Sessão ativa neste navegador">
            <button onClick={logout} style={{ fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>
              Sair
            </button>
          </Row>
        </div>

        {/* Zona de perigo */}
        <div style={{ ...CARD, border:'1.5px solid #FECACA', background:'#FFF5F5' }}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#D85A30', marginBottom:'1rem' }}>Zona de perigo</div>
          <Row label="Excluir conta" desc="Remove todos os seus dados permanentemente. Irreversível.">
            {!excluindo ? (
              <button onClick={() => setExcluindo(true)} style={{ fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:8, border:'1.5px solid #FECACA', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#D85A30', whiteSpace:'nowrap' }}>
                Excluir conta
              </button>
            ) : (
              <div style={{ display:'flex', gap:6 }}>
                <button disabled={confirmEx!=='EXCLUIR'} onClick={excluirConta} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'none', background:confirmEx==='EXCLUIR'?'#D85A30':'#FECACA', color:'white', cursor:confirmEx==='EXCLUIR'?'pointer':'default', fontFamily:'inherit' }}>
                  Confirmar
                </button>
                <button onClick={() => { setExcluindo(false); setConfirmEx(''); }} style={{ fontSize:12, padding:'6px 10px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#6B7280' }}>✕</button>
              </div>
            )}
          </Row>
          {excluindo && (
            <div style={{ marginTop:'1rem' }}>
              <p style={{ fontSize:12, color:'#D85A30', marginBottom:8 }}>Digite <strong>EXCLUIR</strong> para confirmar:</p>
              <input value={confirmEx} onChange={e => setConfirmEx(e.target.value)} placeholder="EXCLUIR"
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid #FECACA', background:'white', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
            </div>
          )}
        </div>
      </>}

      {/* ══════ ABA PRIVACIDADE ══════ */}
      {aba==='privacidade' && <>
        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Seus dados</div>
          <Row label="Dados coletados" desc="Respostas do diagnóstico, check-ins, diário e histórico de uso"><span/></Row>
          <div style={DIV}/>
          <Row label="Finalidade" desc="Seus dados são usados exclusivamente para personalizar seu protocolo. Nunca são vendidos ou compartilhados."><span/></Row>
          <div style={DIV}/>
          <Row label="Compartilhamento anônimo" desc="Contribui para melhorar protocolos (sem identificação pessoal)">
            <Toggle value={true} onChange={() => {}}/>
          </Row>
        </div>

        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Exportar meus dados</div>
          <Row label="Exportar protocolo em PDF" desc="Peptídeos, doses e recomendações">
            <button onClick={() => onNavigate && onNavigate('exportacao')} style={{ fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151', whiteSpace:'nowrap' }}>
              Exportar →
            </button>
          </Row>
        </div>

        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Política de privacidade</div>
          <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.75, margin:0 }}>
            A Nuvita coleta apenas os dados necessários para personalizar seu protocolo de peptídeos. Não vendemos, compartilhamos ou monetizamos suas informações pessoais.<br/><br/>
            Seus dados de saúde são armazenados com criptografia e só você tem acesso ao seu protocolo completo. Você pode excluir sua conta e todos os dados associados a qualquer momento na aba <strong>Conta</strong>.
          </p>
        </div>
      </>}

      {/* ══════ ABA COBRANÇA ══════ */}
      {aba==='cobranca' && <>
        {/* Plano atual */}
        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Plano atual</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:20, fontWeight:700, color:PLAN_COR[plan]||'#111827' }}>{PLAN_LABEL[plan]||'Gratuito'}</div>
              <div style={{ fontSize:13, color:'#6B7280', marginTop:2 }}>{plan==='free'?'Sem cobrança':'Assinatura ativa · Gerenciada via Stripe'}</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {plan!=='pro' && (
                <button onClick={() => onNavigate && onNavigate('planos')} style={{ fontSize:13, fontWeight:600, padding:'8px 16px', borderRadius:10, border:'none', background:'#111827', color:'white', cursor:'pointer', fontFamily:'inherit' }}>
                  Fazer upgrade →
                </button>
              )}
              {plan!=='free' && (
                <button onClick={abrirPortal} disabled={portalLoading} style={{ fontSize:13, padding:'8px 14px', borderRadius:10, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151' }}>
                  {portalLoading?'Aguarde...':'Gerenciar'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Método de pagamento */}
        {plan!=='free' && (
          <div style={CARD}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Método de pagamento</div>
            <Row label="Cartão de crédito" desc="Gerenciado com segurança via Stripe">
              <button onClick={abrirPortal} disabled={portalLoading} style={{ fontSize:12, fontWeight:500, padding:'6px 14px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#374151', whiteSpace:'nowrap' }}>
                {portalLoading?'...':'Atualizar cartão →'}
              </button>
            </Row>
          </div>
        )}

        {/* Histórico de faturas */}
        <div style={CARD}>
          <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Histórico de pagamentos</div>
          {loadFaturas ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'#9CA3AF', fontSize:13 }}>Carregando...</div>
          ) : faturas.length===0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'#9CA3AF', fontSize:13 }}>
              {plan==='free' ? 'Nenhum pagamento — você está no plano gratuito.' : 'Nenhum pagamento registrado ainda.'}
            </div>
          ) : faturas.map((f, i) => (
            <div key={f.id}>
              {i>0 && <div style={DIV}/>}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'#111827' }}>{f.descricao||'Assinatura Nuvita'}</div>
                  <div style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>{new Date(f.created_at).toLocaleDateString('pt-BR',{ day:'2-digit', month:'short', year:'numeric' })}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:'#111827' }}>R$ {((f.valor||0)/100).toFixed(2)}</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100,
                    background:f.status==='paid'?'#DCFCE7':f.status==='failed'?'#FEE2E2':'#FEF3C7',
                    color:f.status==='paid'?'#15803D':f.status==='failed'?'#D85A30':'#B45309' }}>
                    {f.status==='paid'?'Pago':f.status==='failed'?'Recusado':'Pendente'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cancelar assinatura */}
        {plan!=='free' && (
          <div style={{ ...CARD, border:'1.5px solid #FECACA', background:'#FFF5F5' }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#D85A30', marginBottom:'1rem' }}>Cancelar assinatura</div>
            <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.65, marginBottom:'1rem' }}>
              Ao cancelar, você mantém o acesso até o fim do período atual. Após isso, sua conta volta para o plano gratuito.
            </p>
            <button onClick={abrirPortal} disabled={portalLoading} style={{ fontSize:13, fontWeight:500, padding:'8px 16px', borderRadius:10, border:'1.5px solid #FECACA', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#D85A30' }}>
              {portalLoading?'Aguarde...':'Cancelar assinatura via Stripe →'}
            </button>
          </div>
        )}
      </>}
    </div>
  );
}
