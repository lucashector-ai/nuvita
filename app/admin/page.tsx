// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

// IMPORTANTE: o token de admin é digitado pelo usuário no login e mantido
// SOMENTE em sessionStorage. Nunca mais é exposto via NEXT_PUBLIC_* no bundle.
// O servidor (rota /api/admin) compara contra ADMIN_TOKEN (env server-only)
// usando timingSafeEqual.
const SS_KEY = 'nv_admin_token';

const PLAN_COLOR = { free:'#6B7280', essencial:'#0F6E56', pro:'#7C3AED' };
const PLAN_BG    = { free:'#F3F4F6', essencial:'#DCFCE7', pro:'#F5F3FF' };

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(SS_KEY) || '';
}

async function api(action: string, payload?: any) {
  const token = getStoredToken();
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-admin-token': token } : {}),
    },
    body: JSON.stringify({ action, payload }),
  });
  if (res.status === 401) {
    sessionStorage.removeItem(SS_KEY);
    sessionStorage.removeItem('nv_admin');
    if (typeof window !== 'undefined') window.location.reload();
  }
  return res.json();
}

export default function AdminPanel() {
  const [auth, setAuth]         = useState(false);
  const [senha, setSenha]       = useState('');
  const [senhaErro, setSenhaErro] = useState(false);
  const [aba, setAba]           = useState<'usuarios'|'stats'|'notif'>('stats');
  const [stats, setStats]       = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [busca, setBusca]       = useState('');
  const [confirmDel, setConfirmDel] = useState<string|null>(null);
  const [deletando, setDeletando] = useState(false);
  const [changePlan, setChangePlan] = useState<{id:string,plano:string}|null>(null);
  const [notif, setNotif]       = useState({ todos:true, userId:'', titulo:'', texto:'', icon:'📢' });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado]   = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('nv_admin') === '1') {
      setAuth(true);
    }
  }, []);

  useEffect(() => {
    if (auth) { carregarStats(); carregarUsuarios(); }
  }, [auth]);

  const login = async () => {
    // Valida o token contra o servidor (constant-time) ANTES de aceitar.
    // O token nunca é exposto via NEXT_PUBLIC_*; só vive em sessionStorage
    // depois que o servidor confirmou que é válido.
    if (!senha) { setSenhaErro(true); return; }
    sessionStorage.setItem(SS_KEY, senha);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': senha },
        body: JSON.stringify({ action: 'stats' }),
      });
      if (res.ok) {
        setAuth(true);
        sessionStorage.setItem('nv_admin', '1');
      } else {
        sessionStorage.removeItem(SS_KEY);
        setSenhaErro(true);
        setTimeout(() => setSenhaErro(false), 2000);
      }
    } catch {
      sessionStorage.removeItem(SS_KEY);
      setSenhaErro(true);
      setTimeout(() => setSenhaErro(false), 2000);
    }
  };

  const carregarStats = async () => {
    const data = await api('stats');
    setStats(data);
  };

  const carregarUsuarios = async () => {
    setLoading(true);
    const data = await api('list_users');
    setUsuarios(data.users || []);
    setLoading(false);
  };

  const deletarUsuario = async (userId: string) => {
    setDeletando(true);
    await api('delete_user', { userId });
    setConfirmDel(null);
    setDeletando(false);
    carregarUsuarios();
    carregarStats();
  };

  const alterarPlano = async () => {
    if (!changePlan) return;
    await api('change_plan', { userId: changePlan.id, plano: changePlan.plano });
    setChangePlan(null);
    carregarUsuarios();
    carregarStats();
  };

  const enviarNotif = async () => {
    if (!notif.titulo || !notif.texto) return;
    setEnviando(true);
    await api('send_notification', notif);
    setEnviado(true);
    setEnviando(false);
    setNotif(p => ({ ...p, titulo:'', texto:'' }));
    setTimeout(() => setEnviado(false), 3000);
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.email?.toLowerCase().includes(busca.toLowerCase()) ||
    u.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const CARD = { background:'#FFFFFF', borderRadius:14, padding:'1.25rem',
    boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', marginBottom:12 };

  if (!auth) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F7F7' }}>
      <div style={{ background:'white', borderRadius:20, padding:'2.5rem', width:360, boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2rem', marginBottom:8 }}>⚙️</div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500 }}>Admin Nuvita</h2>
          <p style={{ fontSize:13, color:'#6B7280', marginTop:4 }}>Acesso restrito</p>
        </div>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key==='Enter' && login()}
          style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1.5px solid ${senhaErro?'#FECACA':'#E5E7EB'}`, fontSize:14, fontFamily:'inherit', outline:'none', marginBottom:12, boxSizing:'border-box' }}
          placeholder="Senha admin"/>
        {senhaErro && <div style={{ fontSize:12, color:'#D85A30', marginBottom:8, textAlign:'center' }}>Senha incorreta</div>}
        <button onClick={login}
          style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background:'#111827', color:'white', fontFamily:'inherit', fontSize:14, fontWeight:500, cursor:'pointer' }}>
          Entrar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F7F7F7' }}>
      {/* Nav */}
      <div style={{ background:'white', borderBottom:'1px solid #E5E7EB', padding:'0 2rem', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'1.1rem' }}>⚙️</span>
          <span style={{ fontSize:14, fontWeight:600 }}>Nuvita Admin</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {(['stats','usuarios','notif'] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              style={{ padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500,
                background: aba===a ? '#111827' : '#F3F4F6', color: aba===a ? 'white' : '#374151' }}>
              {a==='stats' ? '📊 Resumo' : a==='usuarios' ? '👤 Usuários' : '📢 Notificações'}
            </button>
          ))}
          <button onClick={() => { sessionStorage.removeItem('nv_admin'); setAuth(false); }}
            style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, color:'#6B7280' }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'2rem' }}>

        {/* ══ STATS ══ */}
        {aba === 'stats' && stats && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:'1.5rem' }}>
              {[
                { l:'Total de usuários', v:stats.totalUsuarios, ico:'👤', col:'#374151', bg:'white' },
                { l:'Plano Free',        v:stats.planos?.free || 0, ico:'🆓', col:'#6B7280', bg:'#F9FAFB' },
                { l:'Plano Essencial',   v:stats.planos?.essencial || 0, ico:'⭐', col:'#0F6E56', bg:'#F0FDF4' },
                { l:'Plano Pro',         v:stats.planos?.pro || 0, ico:'💎', col:'#7C3AED', bg:'#F5F3FF' },
                { l:'Consultas totais',  v:stats.totalConsultas, ico:'📅', col:'#0369A1', bg:'#F0F9FF' },
                { l:'Consultas pendentes', v:stats.consultasPendentes, ico:'⏳', col:'#C2410C', bg:'#FFF7ED' },
              ].map(s => (
                <div key={s.l} style={{ ...CARD, background:s.bg, marginBottom:0, padding:'1.25rem' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{s.ico}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:s.col }}>{s.v}</div>
                  <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={carregarStats}
                style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>
                🔄 Atualizar
              </button>
              <button onClick={() => setAba('usuarios')}
                style={{ padding:'8px 16px', borderRadius:8, border:'none', background:'#111827', color:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>
                Ver usuários →
              </button>
            </div>
          </>
        )}

        {/* ══ USUÁRIOS ══ */}
        {aba === 'usuarios' && (
          <>
            <div style={{ display:'flex', gap:10, marginBottom:'1.25rem', alignItems:'center' }}>
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por e-mail ou nome..."
                style={{ flex:1, padding:'9px 14px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none' }}/>
              <button onClick={carregarUsuarios}
                style={{ padding:'9px 16px', borderRadius:10, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>
                🔄
              </button>
              <div style={{ fontSize:13, color:'#6B7280', whiteSpace:'nowrap' }}>
                {usuariosFiltrados.length} usuários
              </div>
            </div>

            {loading && <div style={{ textAlign:'center', padding:'3rem', color:'#6B7280' }}>Carregando...</div>}

            {usuariosFiltrados.map(u => (
              <div key={u.id} style={CARD}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  {/* Avatar */}
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'#111827', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:14, fontWeight:600, flexShrink:0 }}>
                    {u.nome?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      <span style={{ fontSize:14, fontWeight:500, color:'#111827' }}>{u.nome || '—'}</span>
                      <span style={{ fontSize:11, fontWeight:500, padding:'2px 10px', borderRadius:100,
                        background: PLAN_BG[u.plano] || '#F3F4F6', color: PLAN_COLOR[u.plano] || '#6B7280' }}>
                        {u.plano || 'free'}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:'#6B7280' }}>{u.email}</div>
                    <div style={{ fontSize:11, color:'#9CA3AF', marginTop:1 }}>
                      Entrou em {new Date(u.created_at).toLocaleDateString('pt-BR')}
                      {u.last_sign_in && ` · Último acesso: ${new Date(u.last_sign_in).toLocaleDateString('pt-BR')}`}
                      {u.objetivo !== '—' && ` · ${u.objetivo}`}
                    </div>
                  </div>
                  {/* Ações */}
                  <div style={{ display:'flex', gap:6, flexShrink:0, alignItems:'center' }}>
                    <select value={u.plano || 'free'}
                      onChange={e => setChangePlan({ id: u.id, plano: e.target.value })}
                      style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #E5E7EB', fontSize:12, fontFamily:'inherit', background:'white', cursor:'pointer' }}>
                      <option value="free">Free</option>
                      <option value="essencial">Essencial</option>
                      <option value="pro">Pro</option>
                    </select>
                    {confirmDel === u.id ? (
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => deletarUsuario(u.id)} disabled={deletando}
                          style={{ fontSize:12, fontWeight:500, padding:'6px 12px', borderRadius:8, border:'none', background:'#D85A30', color:'white', cursor:'pointer', fontFamily:'inherit' }}>
                          {deletando ? '...' : 'Confirmar'}
                        </button>
                        <button onClick={() => setConfirmDel(null)}
                          style={{ fontSize:12, padding:'6px 10px', borderRadius:8, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', color:'#6B7280' }}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(u.id)}
                        style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'1px solid #FECACA', background:'#FFF5F5', cursor:'pointer', fontFamily:'inherit', color:'#D85A30', fontWeight:500 }}>
                        🗑 Deletar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ══ NOTIFICAÇÕES ══ */}
        {aba === 'notif' && (
          <div style={{ maxWidth:560 }}>
            <div style={CARD}>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:'1.25rem' }}>Enviar notificação</div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:'#6B7280', display:'block', marginBottom:4 }}>Destinatário</label>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setNotif(p=>({...p,todos:true,userId:''}))}
                    style={{ flex:1, padding:'8px', borderRadius:8, border:`2px solid ${notif.todos?'#111827':'#E5E7EB'}`, background:notif.todos?'#111827':'white', color:notif.todos?'white':'#374151', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500 }}>
                    Todos os usuários
                  </button>
                  <button onClick={() => setNotif(p=>({...p,todos:false}))}
                    style={{ flex:1, padding:'8px', borderRadius:8, border:`2px solid ${!notif.todos?'#111827':'#E5E7EB'}`, background:!notif.todos?'#111827':'white', color:!notif.todos?'white':'#374151', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500 }}>
                    Usuário específico
                  </button>
                </div>
              </div>
              {!notif.todos && (
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, color:'#6B7280', display:'block', marginBottom:4 }}>User ID</label>
                  <input value={notif.userId} onChange={e => setNotif(p=>({...p,userId:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}
                    placeholder="ID do usuário..."/>
                </div>
              )}
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, color:'#6B7280', display:'block', marginBottom:4 }}>Ícone & Título</label>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={notif.icon} onChange={e => setNotif(p=>({...p,icon:e.target.value}))}
                    style={{ width:56, padding:'9px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:18, textAlign:'center', outline:'none' }}/>
                  <input value={notif.titulo} onChange={e => setNotif(p=>({...p,titulo:e.target.value}))}
                    style={{ flex:1, padding:'9px 12px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none' }}
                    placeholder="Título da notificação..."/>
                </div>
              </div>
              <div style={{ marginBottom:'1.25rem' }}>
                <label style={{ fontSize:12, color:'#6B7280', display:'block', marginBottom:4 }}>Mensagem</label>
                <textarea value={notif.texto} onChange={e => setNotif(p=>({...p,texto:e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid #E5E7EB', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:80, boxSizing:'border-box' }}
                  placeholder="Texto da notificação..."/>
              </div>
              <button onClick={enviarNotif} disabled={enviando || !notif.titulo || !notif.texto}
                style={{ width:'100%', padding:'11px', borderRadius:10, border:'none',
                  background: enviado ? '#0F6E56' : '#111827',
                  color:'white', fontFamily:'inherit', fontSize:14, fontWeight:500, cursor:'pointer' }}>
                {enviado ? '✓ Enviado!' : enviando ? 'Enviando...' : `📢 Enviar para ${notif.todos ? 'todos' : 'usuário'}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal alterar plano */}
      {changePlan && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}
          onClick={e => { if(e.target===e.currentTarget) setChangePlan(null); }}>
          <div style={{ background:'white', borderRadius:16, padding:'1.5rem', maxWidth:360, width:'100%', boxShadow:'0 8px 32px rgba(0,0,0,.15)' }}>
            <h3 style={{ fontSize:14, fontWeight:600, marginBottom:'1rem' }}>Alterar plano</h3>
            <p style={{ fontSize:13, color:'#6B7280', marginBottom:'1rem' }}>
              Mudar para <strong>{changePlan.plano}</strong>?
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={alterarPlano}
                style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background:'#111827', color:'white', fontFamily:'inherit', fontSize:13, fontWeight:500, cursor:'pointer' }}>
                Confirmar
              </button>
              <button onClick={() => setChangePlan(null)}
                style={{ padding:'10px 16px', borderRadius:10, border:'1px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
