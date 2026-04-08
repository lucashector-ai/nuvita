// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const ABA_STYLE = (ativo: boolean) => ({
  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13, fontWeight: ativo ? 600 : 400,
  background: ativo ? '#111827' : 'transparent',
  color: ativo ? 'white' : '#6B7280', transition: 'all .15s',
});

const CARD = {
  background: 'white', borderRadius: 14, padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)',
  marginBottom: '1rem',
};

const DIVIDER = { borderTop: '1px solid #F3F4F6', margin: '1rem 0' };

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{ width: 40, height: 22, borderRadius: 100, background: value ? '#0F6E56' : '#D1D5DB', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 'calc(100% - 19px)' : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </div>
  );
}

function Row({ label, desc, children }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '12px 0' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SectionConfig({ answers, plan, userId, onNavigate }: any) {
  const [aba, setAba] = useState<'geral'|'conta'|'privacidade'|'cobranca'>('geral');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [userId_, setUserId_] = useState('');
  const [membroDesde, setMembroDesde] = useState('');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSemanal, setNotifSemanal] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmExcluir, setConfirmExcluir] = useState('');
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [faturas, setFaturas] = useState<any[]>([]);
  const [loadingFaturas, setLoadingFaturas] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [editandoNome, setEditandoNome] = useState(false);
  const [nomeEdit, setNomeEdit] = useState('');

  useEffect(() => {
    const carregar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');
      setUserId_(user.id);
      const d = new Date(user.created_at);
      setMembroDesde(d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
      // Carrega preferências
      const { data: perfil } = await supabase.from('usuarios').select('nome, diagnostico').eq('id', user.id).maybeSingle();
      setNome(perfil?.nome || answers?.nome || '');
      setNomeEdit(perfil?.nome || answers?.nome || '');
      const prefs = perfil?.diagnostico?._preferencias || {};
      setNotifEmail(prefs.notifEmail !== false);
      setNotifPush(prefs.notifPush !== false);
      setNotifSemanal(prefs.notifSemanal !== false);
    };
    carregar();
  }, []);

  useEffect(() => {
    if (aba === 'cobranca') carregarFaturas();
  }, [aba]);

  const carregarFaturas = async () => {
    setLoadingFaturas(true);
    const { data } = await supabase.from('pagamentos').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(12);
    setFaturas(data || []);
    setLoadingFaturas(false);
  };

  const salvarGeral = async () => {
    setSalvando(true);
    // Salva nome
    if (nomeEdit && nomeEdit !== nome) {
      await supabase.from('usuarios').update({ nome: nomeEdit }).eq('id', userId_);
      setNome(nomeEdit);
    }
    // Salva preferências de notificação no diagnóstico
    const { data: perfil } = await supabase.from('usuarios').select('diagnostico').eq('id', userId_).maybeSingle();
    const diagAtual = perfil?.diagnostico || {};
    await supabase.from('usuarios').update({
      diagnostico: { ...diagAtual, _preferencias: { notifEmail, notifPush, notifSemanal } }
    }).eq('id', userId_);
    setSalvando(false);
    setSalvo(true);
    setEditandoNome(false);
    setTimeout(() => setSalvo(false), 2500);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/cadastro';
  };

  const excluirConta = async () => {
    if (confirmExcluir !== 'EXCLUIR') return;
    const { error } = await supabase.rpc('delete_own_account');
    if (error) { alert('Erro: ' + error.message); return; }
    await supabase.auth.signOut();
    window.location.href = '/cadastro';
  };

  const abrirPortalStripe = async () => {
    // Abre o portal de billing do Stripe
    const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: userId_ }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert('Erro ao abrir portal de pagamento.');
  };

  const PLANO_LABEL: Record<string, string> = { free: 'Gratuito', essencial: 'Essencial', pro: 'Pro ✦' };
  const PLANO_COR: Record<string, string> = { free: '#6B7280', essencial: '#0F6E56', pro: '#7C3AED' };

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, letterSpacing: '-.04em', marginBottom: '.25rem' }}>Configurações</h2>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Gerencie sua conta e preferências</p>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
        {(['geral', 'conta', 'privacidade', 'cobranca'] as const).map(a => (
          <button key={a} onClick={() => setAba(a)} style={ABA_STYLE(aba === a)}>
            {a === 'geral' ? '⚙️ Geral' : a === 'conta' ? '👤 Conta' : a === 'privacidade' ? '🔒 Privacidade' : '💳 Cobrança'}
          </button>
        ))}
      </div>

      {/* ══ GERAL ══ */}
      {aba === 'geral' && (
        <>
          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Perfil</div>
            
            {/* Avatar + Nome */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#111827', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
                {nome?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                {editandoNome ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={nomeEdit} onChange={e => setNomeEdit(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                      autoFocus />
                    <button onClick={salvarGeral} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#111827', color: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Salvar</button>
                    <button onClick={() => { setEditandoNome(false); setNomeEdit(nome); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280' }}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{nome || '—'}</span>
                    <button onClick={() => setEditandoNome(true)} style={{ fontSize: 12, color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Editar</button>
                  </div>
                )}
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{email}</div>
              </div>
            </div>

            <div style={DIVIDER} />

            <Row label="Plano atual" desc="Gerencie na aba Cobrança">
              <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 100, background: plan === 'pro' ? '#F5F3FF' : plan === 'essencial' ? '#F0FDF4' : '#F3F4F6', color: PLANO_COR[plan] || '#6B7280' }}>
                {PLANO_LABEL[plan] || 'Gratuito'}
              </span>
            </Row>
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Notificações</div>
            
            <Row label="E-mails de protocolo" desc="Lembretes e dicas por email">
              <Toggle value={notifEmail} onChange={setNotifEmail} />
            </Row>
            <div style={DIVIDER} />
            <Row label="Notificações no app" desc="Alertas dentro da plataforma">
              <Toggle value={notifPush} onChange={setNotifPush} />
            </Row>
            <div style={DIVIDER} />
            <Row label="Resumo semanal" desc="Relatório de progresso toda segunda">
              <Toggle value={notifSemanal} onChange={setNotifSemanal} />
            </Row>
          </div>

          <button onClick={salvarGeral} disabled={salvando}
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: salvo ? '#0F6E56' : '#111827', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .2s' }}>
            {salvando ? 'Salvando...' : salvo ? '✓ Salvo com sucesso' : 'Salvar preferências'}
          </button>
        </>
      )}

      {/* ══ CONTA ══ */}
      {aba === 'conta' && (
        <>
          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Informações da conta</div>
            <Row label="E-mail" desc="Usado para login e comunicações"><span style={{ fontSize: 13, fontWeight: 500 }}>{email}</span></Row>
            <div style={DIVIDER} />
            <Row label="ID da conta" desc="Identificador único"><span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6B7280', background: '#F3F4F6', padding: '3px 8px', borderRadius: 6 }}>{userId_?.substring(0, 16)}...</span></Row>
            <div style={DIVIDER} />
            <Row label="Membro desde"><span style={{ fontSize: 13, color: '#6B7280' }}>{membroDesde}</span></Row>
            <div style={DIVIDER} />
            <Row label="Plano"><span style={{ fontSize: 13, fontWeight: 600, color: PLANO_COR[plan] || '#6B7280' }}>{PLANO_LABEL[plan] || 'Gratuito'}</span></Row>
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Sessão</div>
            <Row label="Dispositivo atual" desc="Sessão ativa neste navegador">
              <button onClick={logout} style={{ fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                Sair
              </button>
            </Row>
          </div>

          <div style={{ ...CARD, border: '1.5px solid #FECACA', background: '#FFF5F5' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#D85A30', marginBottom: '1rem' }}>Zona de perigo</div>
            <Row label="Excluir conta" desc="Remove todos os seus dados permanentemente">
              {!excluindo ? (
                <button onClick={() => setExcluindo(true)} style={{ fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: '1.5px solid #FECACA', background: 'white', cursor: 'pointer', fontFamily: 'inherit', color: '#D85A30' }}>
                  Excluir
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={confirmExcluir !== 'EXCLUIR'} onClick={excluirConta}
                    style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: 'none', background: confirmExcluir === 'EXCLUIR' ? '#D85A30' : '#FECACA', color: 'white', cursor: confirmExcluir === 'EXCLUIR' ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                    Confirmar
                  </button>
                  <button onClick={() => { setExcluindo(false); setConfirmExcluir(''); }} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontFamily: 'inherit', color: '#6B7280' }}>✕</button>
                </div>
              )}
            </Row>
            {excluindo && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: 12, color: '#D85A30', marginBottom: 8 }}>Digite <strong>EXCLUIR</strong> para confirmar. Esta ação é irreversível.</p>
                <input value={confirmExcluir} onChange={e => setConfirmExcluir(e.target.value)}
                  placeholder="EXCLUIR"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid #FECACA', background: 'white', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ PRIVACIDADE ══ */}
      {aba === 'privacidade' && (
        <>
          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Seus dados</div>
            <Row label="Dados coletados" desc="Respostas do diagnóstico, check-ins, diário e histórico de uso"><span /></Row>
            <div style={DIVIDER} />
            <Row label="Uso dos dados" desc="Seus dados são usados exclusivamente para personalizar seu protocolo. Nunca são vendidos."><span /></Row>
            <div style={DIVIDER} />
            <Row label="Compartilhamento anônimo" desc="Contribui para melhorar os protocolos de todos os usuários (sem identificação)">
              <Toggle value={true} onChange={() => {}} />
            </Row>
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Exportar meus dados</div>
            <Row label="Exportar protocolo em PDF" desc="Inclui peptídeos, doses e recomendações">
              <button onClick={() => onNavigate('exportacao')} style={{ fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                Exportar →
              </button>
            </Row>
          </div>

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Política de privacidade</div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: 0 }}>
              A Nuvita coleta apenas os dados necessários para personalizar seu protocolo de peptídeos. Não vendemos, compartilhamos ou monetizamos suas informações pessoais.
              Seus dados de saúde são armazenados com criptografia e só você tem acesso ao seu protocolo completo.
              Você pode excluir sua conta e todos os dados associados a qualquer momento na aba <strong>Conta</strong>.
            </p>
          </div>
        </>
      )}

      {/* ══ COBRANÇA ══ */}
      {aba === 'cobranca' && (
        <>
          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Plano atual</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: PLANO_COR[plan] || '#111827' }}>{PLANO_LABEL[plan] || 'Gratuito'}</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                  {plan === 'free' ? 'Sem cobrança' : 'Assinatura ativa'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {plan !== 'pro' && (
                  <button onClick={() => onNavigate('planos')} style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 10, border: 'none', background: '#111827', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Fazer upgrade →
                  </button>
                )}
                {plan !== 'free' && (
                  <button onClick={abrirPortalStripe} style={{ fontSize: 13, padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                    Gerenciar
                  </button>
                )}
              </div>
            </div>
          </div>

          {plan !== 'free' && (
            <div style={CARD}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Método de pagamento</div>
              <Row label="Cartão de crédito" desc="Gerenciado com segurança via Stripe">
                <button onClick={abrirPortalStripe} style={{ fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>
                  Atualizar cartão →
                </button>
              </Row>
            </div>
          )}

          <div style={CARD}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: '1rem' }}>Histórico de pagamentos</div>
            {loadingFaturas ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: 13 }}>Carregando...</div>
            ) : faturas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: 13 }}>Nenhum pagamento registrado</div>
            ) : faturas.map((f, i) => (
              <div key={f.id}>
                {i > 0 && <div style={DIVIDER} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{f.descricao || 'Assinatura Nuvita'}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{new Date(f.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>R$ {((f.valor || 0) / 100).toFixed(2)}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 10px', borderRadius: 100, background: f.status === 'paid' ? '#DCFCE7' : f.status === 'failed' ? '#FEE2E2' : '#FEF3C7', color: f.status === 'paid' ? '#15803D' : f.status === 'failed' ? '#D85A30' : '#B45309' }}>
                      {f.status === 'paid' ? 'Pago' : f.status === 'failed' ? 'Recusado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {plan !== 'free' && (
            <div style={{ ...CARD, border: '1.5px solid #FECACA', background: '#FFF5F5' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#D85A30', marginBottom: '1rem' }}>Cancelar assinatura</div>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: '1rem' }}>
                Ao cancelar, você mantém o acesso até o fim do período atual. Após isso, sua conta volta para o plano gratuito.
              </p>
              <button onClick={abrirPortalStripe} style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 10, border: '1.5px solid #FECACA', background: 'white', cursor: 'pointer', fontFamily: 'inherit', color: '#D85A30' }}>
                Cancelar assinatura →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
